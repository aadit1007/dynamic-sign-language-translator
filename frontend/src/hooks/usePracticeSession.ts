
import { useCallback, useState } from "react";

import type { PracticeState, PredictionResult } from "../types";
import { recognizeSign } from "../services/recognitionService";
import { recordPracticeAttempt } from "../services/progressService";

/**
 * Manages the practice session and sends captured webcam frames
 * to the real ASL recognition backend.
 */
export function usePracticeSession(targetLetter: string) {
  const [state, setState] = useState<PracticeState>("idle");
  const [lastPrediction, setLastPrediction] =
    useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setCameraReady = useCallback(() => {
    setError(null);
    setState("ready");
  }, []);

  const reset = useCallback(() => {
    setState("ready");
    setLastPrediction(null);
    setError(null);
  }, []);

  const detect = useCallback(
    async (frame: Blob) => {
      setState("detecting");
      setError(null);

      try {
        const result = await recognizeSign(frame, { targetLetter });

        setLastPrediction(result);

        const isCorrect =
          result.prediction.toUpperCase() === targetLetter.toUpperCase();

        setState(isCorrect ? "result-correct" : "result-incorrect");

        recordPracticeAttempt({
          letter: targetLetter,
          correct: isCorrect,
          timestamp: new Date().toISOString(),
        });

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Prediction failed. Please try again.";

        setError(message);
        setState("ready");
        throw err;
      }
    },
    [targetLetter],
  );

  const tryAgain = useCallback(() => {
    setState("ready");
    setLastPrediction(null);
    setError(null);
  }, []);

  return {
    state,
    lastPrediction,
    error,
    setCameraReady,
    detect,
    tryAgain,
    reset,
  };
}