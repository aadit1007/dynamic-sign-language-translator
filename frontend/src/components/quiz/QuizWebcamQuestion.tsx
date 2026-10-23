
import { useState } from "react";

import type { QuizQuestionWebcamPractice } from "../../types";
import WebcamView from "../../components/WebcamView";
import PredictionDisplay from "../../components/PredictionDisplay";
import { recognizeSign } from "../../services/recognitionService";

interface QuizWebcamQuestionProps {
  question: QuizQuestionWebcamPractice;
  onAnswer: (correct: boolean) => void;
}

type CaptureFrame = () => Promise<Blob>;
type RecognitionResult = Awaited<ReturnType<typeof recognizeSign>>;

export default function QuizWebcamQuestion({
  question,
  onAnswer,
}: QuizWebcamQuestionProps) {
  const [cameraOn, setCameraOn] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [prediction, setPrediction] =
    useState<RecognitionResult | null>(null);
  const [captureFrame, setCaptureFrame] =
    useState<CaptureFrame | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCaptureReady(fn: CaptureFrame) {
    // Store the function itself, not its return value.
    setCaptureFrame(() => fn);
  }

  async function handleDetect() {
    if (typeof captureFrame !== "function") {
      setError("Camera is still starting. Wait a moment and try again.");
      return;
    }

    setDetecting(true);
    setError(null);
    setPrediction(null);

    try {
      const frame = await captureFrame();

      const result = await recognizeSign(frame, {
        targetLetter: question.letter,
      });

      setPrediction(result);
      setAnswered(true);

      onAnswer(
        result.prediction.toUpperCase() === question.letter.toUpperCase(),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign recognition failed.",
      );
    } finally {
      setDetecting(false);
    }
  }

  function handleTryAgain() {
    setPrediction(null);
    setAnswered(false);
    setError(null);
  }

  return (
    <div className="card p-6">
      <p className="mb-4 text-ink-soft">
        Perform the sign for{" "}
        <span className="font-serif text-lg font-semibold text-ink">
          {question.letter}
        </span>{" "}
        on camera.
      </p>

      <div className="mb-4 max-w-sm">
        <WebcamView
          active={cameraOn}
          onReady={() => setError(null)}
          onCaptureReady={handleCaptureReady}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {!cameraOn && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setError(null);
              setCameraOn(true);
            }}
          >
            Turn on camera
          </button>
        )}

        {cameraOn && !answered && (
          <button
            type="button"
            className="btn-primary"
            disabled={detecting || typeof captureFrame !== "function"}
            onClick={handleDetect}
          >
            {detecting ? "Detecting..." : "Capture sign"}
          </button>
        )}

        {answered && (
          <button
            type="button"
            className="btn-secondary"
            onClick={handleTryAgain}
          >
            Try again
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {detecting && (
        <div className="mt-4">
          <PredictionDisplay prediction={null} detecting />
        </div>
      )}

      {prediction && !detecting && (
        <div className="mt-4">
          <PredictionDisplay prediction={prediction} detecting={false} />
        </div>
      )}
    </div>
  );
}