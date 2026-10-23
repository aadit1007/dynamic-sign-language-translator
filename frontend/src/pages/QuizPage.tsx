import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { generateQuiz } from "../services/quizService";
import { recordQuizAttempt } from "../services/progressService";
import type { QuizAnswerRecord } from "../types";
import QuizQuestionCard from "../components/quiz/QuizQuestionCard";
import QuizWebcamQuestion from "../components/quiz/QuizWebcamQuestion";

const QUESTION_COUNT = 9;

export default function QuizPage() {
  const [questions, setQuestions] = useState(() => generateQuiz(QUESTION_COUNT));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progressLabel = `Question ${currentIndex + 1} of ${questions.length}`;

  function handleAnswer(correct: boolean) {
    const record: QuizAnswerRecord = {
      questionId: currentQuestion.id,
      correct,
    };
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);

    window.setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const correctCount = nextAnswers.filter((a) => a.correct).length;
        recordQuizAttempt({
          completedAt: new Date().toISOString(),
          totalQuestions: questions.length,
          correctAnswers: correctCount,
        });
        setFinished(true);
      }
    }, 700);
  }

  function handleRestart() {
    setQuestions(generateQuiz(QUESTION_COUNT));
    setCurrentIndex(0);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    const correctCount = answers.filter((a) => a.correct).length;
    const pct = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold">Quiz complete</h1>
        <p className="mt-3 text-ink-soft">
          You scored {correctCount} out of {questions.length}.
        </p>
        <div className="mx-auto mt-8 flex h-40 w-40 items-center justify-center rounded-full border-4 border-signal-500">
          <span className="font-serif text-4xl font-semibold text-signal-700">
            {pct}%
          </span>
        </div>
        <button
          type="button"
          onClick={handleRestart}
          className="btn-primary mx-auto mt-8"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Take another quiz
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-ink-muted">
          <h1 className="font-serif text-2xl font-semibold text-ink">Quiz</h1>
          <span>{progressLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
          <div
            className="h-full rounded-full bg-signal-500 transition-all duration-300"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {currentQuestion.type === "webcam-practice" ? (
        <QuizWebcamQuestion
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      ) : (
        <QuizQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
