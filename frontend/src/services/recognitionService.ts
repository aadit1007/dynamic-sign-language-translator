
import type { PredictionResult } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface BackendPrediction {
  hand_detected: boolean;
  prediction: string | null;
  raw_prediction: string | null;
  confidence: number;
  accepted: boolean;
  threshold: number;
  top_predictions?: Array<{
    label: string;
    confidence: number;
  }>;
}

export interface RecognitionOptions {
  targetLetter?: string;
}

export async function recognizeSign(
  frame: Blob,
  _options?: RecognitionOptions,
): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", frame, "frame.jpg");

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Cannot connect to the recognition API. Make sure the backend is running.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `Prediction failed (${response.status}). Please try again.`,
    );
  }

  const result = (await response.json()) as BackendPrediction;

  if (!result.hand_detected || !result.accepted || !result.prediction) {
    throw new Error(
      !result.hand_detected
        ? "No hand detected. Keep your hand clearly inside the camera frame."
        : "Sign unclear. Hold your hand steady and try again.",
    );
  }

  return {
    prediction: result.prediction,
    confidence: result.confidence,
  };
}

const SUPPORTED_LETTERS = [
  ..."ABCDEFGHI",
  ..."KLMNOPQRSTUVWXY",
];

export function pickRandomLetter(): string {
  return SUPPORTED_LETTERS[
    Math.floor(Math.random() * SUPPORTED_LETTERS.length)
  ];
}