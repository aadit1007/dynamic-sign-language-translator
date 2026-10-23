import { useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "../../types";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  onAnswer: (correct: boolean) => void;
}

/**
 * Renders a single sign-to-letter or letter-to-sign multiple choice
 * question. Webcam-practice questions are handled by
 * QuizWebcamQuestion instead.
 */
export default function QuizQuestionCard({ question, onAnswer }: QuizQuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (question.type === "webcam-practice") return null;

  const prompt =
    question.type === "sign-to-letter"
      ? `Which letter is this sign showing?`
      : `Which handshape forms the letter ${question.letter}?`;

  function handleSelect(choice: string) {
    if (selected) return;
    setSelected(choice);
    onAnswer(choice === question.letter);
  }

  return (
    <div className="card p-6">
      {question.type === "sign-to-letter" ? (
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-white p-2">
            <img
              src={`/signs/${question.letter.toUpperCase()}.png`}
              alt={`ASL hand sign for letter ${question.letter}`}
              className="h-full w-full object-contain"
              onError={(event) => {
                console.error("Failed to load sign image:", event.currentTarget.src);
              }}
            />
          </div>
          <p className="text-ink-soft">{prompt}</p>
        </div>
      ) : (
        <p className="mb-5 text-ink-soft">{prompt}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {question.choices.map((choice) => {
          const isSelected = selected === choice;
          const isCorrectChoice = choice === question.letter;
          const showResult = selected !== null;

          return (
            <button
              key={choice}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={selected !== null}
              aria-pressed={isSelected}
              className={[
                "flex items-center justify-center gap-2 rounded-md border px-4 py-3 font-serif text-xl font-medium transition-colors",
                showResult && isCorrectChoice
                  ? "border-signal-500 bg-signal-50 text-signal-700"
                  : showResult && isSelected
                    ? "border-error bg-[#FBEDEA] text-error"
                    : "border-line bg-white text-ink hover:border-signal-500",
              ].join(" ")}
            >
              {choice}
              {showResult && isCorrectChoice && <Check size={16} aria-hidden="true" />}
              {showResult && isSelected && !isCorrectChoice && (
                <X size={16} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
