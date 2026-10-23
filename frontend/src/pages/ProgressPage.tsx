import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, Trash2 } from "lucide-react";
import { alphabetSigns } from "../data/alphabet";
import { clearProgress, getProgress } from "../services/progressService";
import type { ProgressData } from "../types";
import ProgressIndicator from "../components/ProgressIndicator";

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const lettersPracticedCount = Object.keys(progress.lettersPracticed).length;
  const totalPracticeAttempts = progress.practiceAttempts.length;
  const totalQuizzes = progress.quizAttempts.length;
  const lastQuiz = progress.quizAttempts.at(-1);

  const hasAnyActivity = totalPracticeAttempts > 0 || totalQuizzes > 0;

  function handleReset() {
    const empty = clearProgress();
    setProgress(empty);
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Progress</h1>
          <p className="mt-1 text-ink-soft">
            Tracked from your practice sessions and quizzes on this device.
          </p>
        </div>
        {hasAnyActivity && (
          <button type="button" onClick={handleReset} className="btn-secondary">
            <Trash2 size={16} aria-hidden="true" />
            Reset progress
          </button>
        )}
      </div>

      {!hasAnyActivity ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-signal-50 text-signal-600">
            <BookOpen size={22} aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold text-ink">
            No activity yet
          </h2>
          <p className="max-w-sm text-sm text-ink-soft">
            Practice a sign or take a quiz to start building your progress
            here. There's nothing to show yet because you haven't tried
            either.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-ink-muted">
              Alphabet coverage
            </h2>
            <ProgressIndicator
              label="Letters practiced at least once"
              value={lettersPracticedCount}
              total={alphabetSigns.length}
            />
            <p className="mt-4 text-sm text-ink-soft">
              {totalPracticeAttempts} practice attempt
              {totalPracticeAttempts === 1 ? "" : "s"} recorded in total.
            </p>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-ink-muted">
              <ClipboardList size={14} aria-hidden="true" />
              Quiz history
            </h2>
            {totalQuizzes === 0 ? (
              <p className="text-sm text-ink-soft">
                You haven't completed a quiz yet.
              </p>
            ) : (
              <>
                <p className="text-sm text-ink-soft">
                  {totalQuizzes} quiz{totalQuizzes === 1 ? "" : "zes"} completed.
                </p>
                {lastQuiz && (
                  <div className="mt-3">
                    <ProgressIndicator
                      label="Most recent quiz score"
                      value={lastQuiz.correctAnswers}
                      total={lastQuiz.totalQuestions}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card p-6 md:col-span-2">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-ink-muted">
              Per-letter accuracy
            </h2>
            {lettersPracticedCount === 0 ? (
              <p className="text-sm text-ink-soft">
                Practice a sign to see per-letter accuracy here.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {Object.entries(progress.lettersPracticed)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, stats]) => (
                    <div key={letter} className="flex items-center justify-between text-sm">
                      <span className="font-serif font-semibold text-ink">
                        {letter}
                      </span>
                      <span className="text-ink-muted">
                        {stats.correct}/{stats.attempts}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
