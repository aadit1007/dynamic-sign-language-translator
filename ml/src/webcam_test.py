from pathlib import Path

import cv2
import mediapipe as mp
import torch
from PIL import Image

from .model import create_model
from .config import ASL_CLASSES
from .transforms import evaluation_transform
from collections import deque


# --------------------------------------------------
# Configuration
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CHECKPOINT_PATH = (
    PROJECT_ROOT
    / "ml"
    / "models"
    / "best_mobilenetv3_small_v1.pth"
)

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

CONFIDENCE_THRESHOLD = 0.60
PADDING = 30
SMOOTHING_FRAMES = 6
NO_HAND_RESET_FRAMES = 8

prediction_history = deque(maxlen=SMOOTHING_FRAMES)

current_text = ""
last_accepted_prediction = None
no_hand_counter = 0


# --------------------------------------------------
# Model
# --------------------------------------------------

checkpoint = torch.load(
    CHECKPOINT_PATH,
    map_location=DEVICE,
    weights_only=False,
)

model = create_model(
    num_classes=len(ASL_CLASSES),
    pretrained=False,
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)
model.eval()


# --------------------------------------------------
# Preprocessing
# Uses the exact evaluation transform from the project
# --------------------------------------------------

transform = evaluation_transform()


# --------------------------------------------------
# MediaPipe
# --------------------------------------------------

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


# --------------------------------------------------
# Webcam
# --------------------------------------------------

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    raise RuntimeError("Could not open webcam.")

print("Webcam started.")
print("Show your hand inside the camera.")
print("Press S to save the clean hand crop.")
print("Press Q to quit.")


while True:

    ret, frame = cap.read()

    if not ret:
        print("Failed to read webcam frame.")
        break

    # --------------------------------------------------
    # Keep webcam unmirrored for now
    # --------------------------------------------------

    # frame = cv2.flip(frame, 1)

    h, w, _ = frame.shape

    # --------------------------------------------------
    # MediaPipe expects RGB
    # --------------------------------------------------

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB,
    )

    results = hands.process(rgb)

    label = "NO HAND"
    confidence = 0.0
    stable_prediction = None

    # Keep this for saving the clean crop
    clean_hand_crop = None

    # --------------------------------------------------
    # Hand detected
    # --------------------------------------------------

    if results.multi_hand_landmarks:

        hand_landmarks = results.multi_hand_landmarks[0]

        # --------------------------------------------------
        # Find bounding box
        # --------------------------------------------------

        x_coords = [
            int(lm.x * w)
            for lm in hand_landmarks.landmark
        ]

        y_coords = [
            int(lm.y * h)
            for lm in hand_landmarks.landmark
        ]

        x_min = max(
            0,
            min(x_coords) - PADDING,
        )

        y_min = max(
            0,
            min(y_coords) - PADDING,
        )

        x_max = min(
            w,
            max(x_coords) + PADDING,
        )

        y_max = min(
            h,
            max(y_coords) + PADDING,
        )

        # --------------------------------------------------
        # Make bounding box square
        # --------------------------------------------------

        box_w = x_max - x_min
        box_h = y_max - y_min

        size = max(box_w, box_h)

        center_x = (x_min + x_max) // 2
        center_y = (y_min + y_max) // 2

        x_min = max(
            0,
            center_x - size // 2,
        )

        x_max = min(
            w,
            center_x + size // 2,
        )

        y_min = max(
            0,
            center_y - size // 2,
        )

        y_max = min(
            h,
            center_y + size // 2,
        )

        # --------------------------------------------------
        # IMPORTANT:
        # Crop BEFORE drawing anything on the frame.
        # The model must receive a completely clean image.
        # --------------------------------------------------

        clean_hand_crop = frame[
            y_min:y_max,
            x_min:x_max,
        ].copy()

        # --------------------------------------------------
        # Model prediction
        # --------------------------------------------------

        if clean_hand_crop.size > 0:

            # BGR -> RGB
            hand_rgb = cv2.cvtColor(
                clean_hand_crop,
                cv2.COLOR_BGR2RGB,
            )

            pil_image = Image.fromarray(
                hand_rgb
            )

            input_tensor = transform(
                pil_image
            )

            input_tensor = input_tensor.unsqueeze(0)
            input_tensor = input_tensor.to(DEVICE)

            with torch.no_grad():

                outputs = model(
                    input_tensor
                )

                probabilities = torch.softmax(
                    outputs,
                    dim=1,
                )

                top_probs, top_indices = torch.topk(
                    probabilities,
                    5,
                )

                confidence = top_probs[0][0].item()
                prediction = top_indices[0][0].item()

            # --------------------------------------------------
            # Prediction label
            # --------------------------------------------------

            if confidence >= CONFIDENCE_THRESHOLD:

                label = ASL_CLASSES[prediction]

                prediction_history.append(label)

                # Only accept a prediction when all smoothing frames
                # agree on the same sign.
                if (
                    len(prediction_history) == SMOOTHING_FRAMES
                    and len(set(prediction_history)) == 1
                ):
                    stable_prediction = prediction_history[0]

            else:

                label = "UNCERTAIN"
                prediction_history.clear()

        # --------------------------------------------------
        # Draw bounding box ONLY on display frame
        # --------------------------------------------------

        cv2.rectangle(
            frame,
            (x_min, y_min),
            (x_max, y_max),
            (255, 255, 255),
            2,
        )

        # --------------------------------------------------
        # Draw MediaPipe landmarks ONLY on display frame
        # --------------------------------------------------

        mp_drawing.draw_landmarks(
            frame,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS,
        )

    else:
        # No hand detected
        label = "NO HAND"
        confidence = 0.0

        prediction_history.clear()
        no_hand_counter += 1

        # After the hand has been gone for several frames,
        # allow the same sign to be accepted again.
        if no_hand_counter >= NO_HAND_RESET_FRAMES:
            last_accepted_prediction = None

    # --------------------------------------------------
    # Accept stable prediction
    # --------------------------------------------------

    if stable_prediction is not None:

        if stable_prediction != last_accepted_prediction:

            if stable_prediction == "SPACE":

                current_text += " "

            elif stable_prediction == "DELETE":

                current_text = current_text[:-1]

            elif stable_prediction == "NOTHING":

                pass

            else:

                current_text += stable_prediction

            last_accepted_prediction = stable_prediction

            print(
                f"Accepted: {stable_prediction} | "
                f"Text: {current_text}"
            )

        no_hand_counter = 0        

    # --------------------------------------------------
    # Display prediction
    # --------------------------------------------------

    cv2.putText(
        frame,
        f"Prediction: {label}",
        (20, 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,
        (0, 255, 0),
        2,
    )

    cv2.putText(
        frame,
        f"Confidence: {confidence * 100:.1f}%",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2,
    )

    # --------------------------------------------------
    # Show webcam
    # --------------------------------------------------

    cv2.imshow(
        "ASL Sign Language Translator - V1",
        frame,
    )

    # --------------------------------------------------
    # Keyboard controls
    # --------------------------------------------------

    key = cv2.waitKey(1) & 0xFF

    # Save CLEAN hand crop
    if key == ord("s"):

        if clean_hand_crop is not None:

            cv2.imwrite(
                str(PROJECT_ROOT / "webcam_hand_crop.jpg"),
                clean_hand_crop,
            )

            print(
                "Saved clean webcam_hand_crop.jpg"
            )

        else:

            print(
                "No hand crop available."
            )

    # Quit
    if key == ord("q"):
        break


# --------------------------------------------------
# Cleanup
# --------------------------------------------------

cap.release()
hands.close()
cv2.destroyAllWindows()