
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Shuffle } from "lucide-react";

import { alphabetSigns } from "../data/alphabet";
import { pickRandomLetter } from "../services/recognitionService";
import { usePracticeSession } from "../hooks/usePracticeSession";
import WebcamView from "../components/WebcamView";
import PredictionDisplay from "../components/PredictionDisplay";
import FeedbackState from "../components/FeedbackState";

export default function PracticePage() {
  const { letter: routeLetter } = useParams<{ letter?: string }>();

  const [targetLetter, setTargetLetter] = useState(
    () => routeLetter?.toUpperCase() ?? pickRandomLetter(),
  );
  const [cameraOn, setCameraOn] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureFrame, setCaptureFrame] =
    useState<(() => Promise<Blob>) | null>(null);

  const {
    state,
    lastPrediction,
    error,
    setCameraReady,
    detect,
    tryAgain,
    reset,
  } = usePracticeSession(targetLetter);

  const sign = useMemo(
    () => alphabetSigns.find((s) => s.letter === targetLetter),
    [targetLetter],
  );

  const changeSign = useCallback(
    (newLetter: string) => {
      setTargetLetter(newLetter);
      setCaptureError(null);
      reset();
      setCameraOn(true);
    },
    [reset],
  );

  function handleRandomSign() {
    let newLetter = pickRandomLetter();

    while (newLetter === targetLetter) {
      newLetter = pickRandomLetter();
    }

    changeSign(newLetter);
  }

  function handleStartCamera() {
    setCaptureError(null);
    setCameraOn(true);
  }

  async function handleDetect() {
    setCaptureError(null);

    try {
      if (!captureFrame) {
        throw new Error("Camera is not ready yet. Please wait for the preview.");
      }

      const frame = await captureFrame();
      await detect(frame);
    } catch (err) {
      setCaptureError(
        err instanceof Error
          ? err.message
          : "Could not capture a camera frame.",
      );
    }
  }

  const detecting = state === "detecting";
  const showDetectButton =
    state === "ready" || state === "result-incorrect";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Practice</h1>
          <p className="mt-1 text-ink-soft">
            Choose a sign, turn on your camera, and try to match it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="target-select" className="sr-only">
            Target sign
          </label>

          <select
            id="target-select"
            value={targetLetter}
            onChange={(e) => changeSign(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          >
            {alphabetSigns.map((s) => (
              <option key={s.letter} value={s.letter}>
                Letter {s.letter}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleRandomSign}
            className="btn-secondary"
            aria-label="Choose a random sign"
          >
            <Shuffle size={16} aria-hidden="true" />
            Random
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="card flex flex-col items-center justify-center gap-2 p-6">
          <span className="text-xs uppercase tracking-wide text-ink-muted">
            Target sign
          </span>

          <span className="font-serif text-6xl font-semibold text-ink">
            {targetLetter}
          </span>

          {sign?.tip && (
            <p className="text-center text-xs text-ink-muted">{sign.tip}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <WebcamView
            active={cameraOn}
            onReady={setCameraReady}
            onCaptureReady={(capture) => setCaptureFrame(() => capture)}
          />

          <FeedbackState state={state} targetLetter={targetLetter} />

          {(detecting || lastPrediction) && (
            <PredictionDisplay
              prediction={lastPrediction}
              detecting={detecting}
            />
          )}

          {(captureError || error) && (
            <p role="alert" className="text-sm text-red-700">
              {captureError || error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {!cameraOn && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartCamera}
              >
                Turn on camera
              </button>
            )}

            {showDetectButton && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleDetect}
                disabled={detecting}
              >
                {state === "result-incorrect" ? "Try again" : "Detect sign"}
              </button>
            )}

            {state === "result-correct" && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRandomSign}
              >
                Next sign
              </button>
            )}

            {state === "result-incorrect" && (
              <button
                type="button"
                className="btn-secondary"
                onClick={tryAgain}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}