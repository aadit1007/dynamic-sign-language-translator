import { CheckCircle2, RotateCcw, Target } from "lucide-react";
import type { PracticeState } from "../types";

interface FeedbackStateProps {
  state: PracticeState;
  targetLetter: string;
}

const COPY: Record<PracticeState, { title: string; description: string }> = {
  idle: {
    title: "Ready to practice",
    description: "Turn on your camera when you're ready to begin.",
  },
  ready: {
    title: "Make the sign",
    description: "Hold the handshape steady in view of the camera.",
  },
  detecting: {
    title: "Detecting...",
    description: "Hold the sign steady while we read your handshape.",
  },
  "result-correct": {
    title: "Correct",
    description: "That matched the target sign.",
  },
  "result-incorrect": {
    title: "Try again",
    description: "That didn't match. Check the handshape and try once more.",
  },
};

/**
 * Renders the current practice state as a labeled, icon-backed message.
 * Feedback never relies on color alone: each state has a distinct icon
 * and text label as well as a color treatment.
 */
export default function FeedbackState({ state, targetLetter }: FeedbackStateProps) {
  const copy = COPY[state];
  const title = state === "ready" ? `Make the sign for ${targetLetter}` : copy.title;

  const isCorrect = state === "result-correct";
  const isIncorrect = state === "result-incorrect";

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-md border p-4",
        isCorrect
          ? "border-signal-500 bg-signal-50"
          : isIncorrect
            ? "border-error bg-[#FBEDEA]"
            : "border-line bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5",
          isCorrect ? "text-signal-600" : isIncorrect ? "text-error" : "text-ink-muted",
        ].join(" ")}
      >
        {isCorrect ? (
          <CheckCircle2 size={20} aria-hidden="true" />
        ) : isIncorrect ? (
          <RotateCcw size={20} aria-hidden="true" />
        ) : (
          <Target size={20} aria-hidden="true" />
        )}
      </span>
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-ink-soft">{copy.description}</p>
      </div>
    </div>
  );
}
