"""FastAPI inference service for ASL Learn's V1 static-sign classifier."""
from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

import cv2
import mediapipe as mp
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from ml.src.config import ASL_CLASSES, MODEL_ARCHITECTURE
from ml.src.model import create_model
from ml.src.transforms import evaluation_transform

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CHECKPOINT_PATH = PROJECT_ROOT / "ml" / "models" / "best_mobilenetv3_small_v1.pth"
CONFIDENCE_THRESHOLD = 0.60
PADDING = 30
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI(title="ASL Learn API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_transform = evaluation_transform()
_inference_lock = Lock()
_hands = None
_model = None
_model_error: str | None = None


def _load_model() -> None:
    global _model, _model_error
    if not CHECKPOINT_PATH.is_file():
        _model_error = f"Checkpoint not found: {CHECKPOINT_PATH}"
        return
    try:
        checkpoint = torch.load(
            CHECKPOINT_PATH,
            map_location=DEVICE,
            weights_only=False,
        )
        if checkpoint.get("architecture") != MODEL_ARCHITECTURE:
            raise ValueError(
                f"Unsupported architecture: {checkpoint.get('architecture')!r}"
            )
        if checkpoint.get("class_names") != list(ASL_CLASSES):
            raise ValueError("Checkpoint class order does not match ml/src/config.py")
        model = create_model(num_classes=len(ASL_CLASSES), pretrained=False)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.to(DEVICE)
        model.eval()
        _model = model
        _model_error = None
    except Exception as exc:  # Report startup/model problems through /health.
        _model_error = f"{type(exc).__name__}: {exc}"


@app.on_event("startup")
def startup() -> None:
    global _hands
    _load_model()
    _hands = mp.solutions.hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5,
    )


@app.on_event("shutdown")
def shutdown() -> None:
    if _hands is not None:
        _hands.close()


def _hand_crop(frame_bgr: np.ndarray) -> np.ndarray | None:
    """Return the same padded square hand crop used by webcam_test.py."""
    if _hands is None:
        return None
    height, width = frame_bgr.shape[:2]
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    with _inference_lock:
        results = _hands.process(rgb)
    if not results.multi_hand_landmarks:
        return None

    landmarks = results.multi_hand_landmarks[0].landmark
    xs = [int(point.x * width) for point in landmarks]
    ys = [int(point.y * height) for point in landmarks]
    x_min = max(0, min(xs) - PADDING)
    y_min = max(0, min(ys) - PADDING)
    x_max = min(width, max(xs) + PADDING)
    y_max = min(height, max(ys) + PADDING)

    box_width = x_max - x_min
    box_height = y_max - y_min
    size = max(box_width, box_height)
    center_x = (x_min + x_max) // 2
    center_y = (y_min + y_max) // 2
    x_min = max(0, center_x - size // 2)
    x_max = min(width, center_x + size // 2)
    y_min = max(0, center_y - size // 2)
    y_max = min(height, center_y + size // 2)

    crop = frame_bgr[y_min:y_max, x_min:x_max].copy()
    return crop if crop.size else None


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok" if _model is not None and _model_error is None else "error",
        "model_loaded": _model is not None,
        "device": str(DEVICE),
        "classes": list(ASL_CLASSES),
        "checkpoint": str(CHECKPOINT_PATH),
        "error": _model_error,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, Any]:
    if _model is None:
        raise HTTPException(status_code=503, detail=f"Model unavailable: {_model_error}")
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Upload an image file.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    if len(raw) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be 10 MB or smaller.")

    image_array = np.frombuffer(raw, dtype=np.uint8)
    frame_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if frame_bgr is None:
        raise HTTPException(status_code=400, detail="Could not decode the uploaded image.")

    crop = _hand_crop(frame_bgr)
    if crop is None:
        return {
            "hand_detected": False,
            "prediction": None,
            "confidence": 0.0,
            "accepted": False,
            "message": "No hand detected. Keep your hand fully visible in the camera frame.",
        }

    crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(crop_rgb)
    tensor = _transform(pil_image).unsqueeze(0).to(DEVICE)
    with torch.inference_mode():
        with _inference_lock:
            logits = _model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]
            top_values, top_indices = torch.topk(probabilities, k=min(5, len(ASL_CLASSES)))

    confidence = float(top_values[0].item())
    label = ASL_CLASSES[int(top_indices[0].item())]
    accepted = confidence >= CONFIDENCE_THRESHOLD
    return {
        "hand_detected": True,
        "prediction": label if accepted else None,
        "raw_prediction": label,
        "confidence": confidence,
        "accepted": accepted,
        "threshold": CONFIDENCE_THRESHOLD,
        "top_predictions": [
            {"label": ASL_CLASSES[int(index)], "confidence": float(value)}
            for value, index in zip(top_values.tolist(), top_indices.tolist())
        ],
    }
