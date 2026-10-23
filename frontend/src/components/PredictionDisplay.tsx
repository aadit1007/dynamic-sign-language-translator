import type { PredictionResult } from "../types";

interface PredictionDisplayProps {
  prediction: PredictionResult | null;
  detecting: boolean;
}

/**
 * Displays the raw recognition output (letter + confidence). Consumes the
 * same `PredictionResult` shape the future FastAPI backend will return,
 * so this component needs no changes once mock data is replaced.
 */
export default function PredictionDisplay({
  prediction,
  detecting,
}: PredictionDisplayProps) {
  if (detecting) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-line bg-white px-4 py-3">
        <span
          className="h-2.5 w-2.5 animate-pulse rounded-full bg-signal-500"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-ink-soft">Detecting...</span>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="rounded-md border border-dashed border-line px-4 py-3 text-sm text-ink-muted">
        No prediction yet.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-line bg-white px-4 py-3">
      <span className="text-sm text-ink-soft">Detected sign</span>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-2xl font-semibold text-ink">
          {prediction.prediction}
        </span>
        <span className="text-xs text-ink-muted">
          {Math.round(prediction.confidence * 100)}% confidence
        </span>
      </div>
    </div>
  );
}
