import type { PracticeAttempt, ProgressData, QuizAttempt } from "../types";

/**
 * Progress service
 * ---------------------------------------------------------------------
 * Tracks only real, locally-generated activity (practice attempts and
 * quiz results the learner actually completes in this browser). There is
 * no seeded or fabricated data: a new user starts with empty state and
 * every number shown on the Progress page is derived from events this
 * service recorded.
 *
 * This uses localStorage rather than a backend database, consistent with
 * the project not introducing a database at this stage. When a real
 * backend/account system exists, this module is the place to swap
 * localStorage reads/writes for API calls without touching the Progress
 * page's rendering logic.
 */

const STORAGE_KEY = "asl-learn:progress";

function readRaw(): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { practiceAttempts: [], quizAttempts: [], lettersPracticed: {} };
    }
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { practiceAttempts: [], quizAttempts: [], lettersPracticed: {} };
  }
}

function writeRaw(data: ProgressData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private browsing, quota, etc.).
    // Fail silently; progress simply won't persist across sessions.
  }
}

export function getProgress(): ProgressData {
  return readRaw();
}

export function recordPracticeAttempt(attempt: PracticeAttempt): ProgressData {
  const data = readRaw();
  data.practiceAttempts.push(attempt);

  const entry = data.lettersPracticed[attempt.letter] ?? {
    attempts: 0,
    correct: 0,
  };
  entry.attempts += 1;
  if (attempt.correct) entry.correct += 1;
  data.lettersPracticed[attempt.letter] = entry;

  writeRaw(data);
  return data;
}

export function recordQuizAttempt(attempt: QuizAttempt): ProgressData {
  const data = readRaw();
  data.quizAttempts.push(attempt);
  writeRaw(data);
  return data;
}

export function clearProgress(): ProgressData {
  const empty: ProgressData = {
    practiceAttempts: [],
    quizAttempts: [],
    lettersPracticed: {},
  };
  writeRaw(empty);
  return empty;
}
