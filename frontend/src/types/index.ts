/**
 * Shared type definitions for the ASL Learn frontend.
 *
 * `PredictionResult` mirrors the response shape the real FastAPI recognition
 * backend is expected to return, e.g.:
 *   { "prediction": "B", "confidence": 0.98 }
 *
 * Every component that consumes predictions is typed against this interface
 * so the mock service in `services/recognitionService.ts` can be swapped for
 * a real network call without changing any component code.
 */
export interface PredictionResult {
  prediction: string;
  confidence: number;
}

/** A single supported static alphabet sign. */
export interface AlphabetSign {
  letter: string;
  name: string;
  image: string;
  instructions: string[];
  tip?: string;
}

/** Status of a "Basic Words" vocabulary entry, always upcoming for now. */
export interface UpcomingWord {
  word: string;
  category: string;
}

/** UI states for the practice interface state machine. */
export type PracticeState =
  | "idle" // Ready to practice, no webcam yet
  | "ready" // Webcam on, waiting for user to start
  | "detecting" // Actively sampling frames / awaiting prediction
  | "result-correct" // Prediction matched the target sign
  | "result-incorrect"; // Prediction did not match the target sign

export interface QuizQuestionSignToLetter {
  type: "sign-to-letter";
  id: string;
  letter: string;
  choices: string[];
}

export interface QuizQuestionLetterToSign {
  type: "letter-to-sign";
  id: string;
  letter: string;
  choices: string[];
}

export interface QuizQuestionWebcamPractice {
  type: "webcam-practice";
  id: string;
  letter: string;
}

export type QuizQuestion =
  | QuizQuestionSignToLetter
  | QuizQuestionLetterToSign
  | QuizQuestionWebcamPractice;

export interface QuizAnswerRecord {
  questionId: string;
  correct: boolean;
}

export interface QuizAttempt {
  completedAt: string; // ISO timestamp
  totalQuestions: number;
  correctAnswers: number;
}

export interface PracticeAttempt {
  letter: string;
  correct: boolean;
  timestamp: string; // ISO timestamp
}

export interface ProgressData {
  practiceAttempts: PracticeAttempt[];
  quizAttempts: QuizAttempt[];
  lettersPracticed: Record<string, { attempts: number; correct: number }>;
}
