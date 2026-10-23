import { alphabetSigns } from "../data/alphabet";
import type { QuizQuestion } from "../types";

const LETTERS = alphabetSigns.map((sign) => sign.letter);

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function choicesFor(correctLetter: string, count = 4): string[] {
  const distractors = shuffle(LETTERS.filter((letter) => letter !== correctLetter)).slice(
    0,
    count - 1,
  );
  return shuffle([correctLetter, ...distractors]);
}

/**
 * Builds a quiz of mixed question types for the given number of questions.
 * Roughly a third sign-to-letter, a third letter-to-sign, and a third
 * webcam-practice questions (the latter render a future-ready UI backed
 * by the same mock recognition service used on the Practice page).
 */
export function generateQuiz(questionCount = 9): QuizQuestion[] {
  const letters = shuffle(LETTERS).slice(0, questionCount);
  const questions: QuizQuestion[] = letters.map((letter, index) => {
    const variant = index % 3;
    const id = `${letter}-${index}`;
    if (variant === 0) {
      return {
        type: "sign-to-letter",
        id,
        letter,
        choices: choicesFor(letter),
      };
    }
    if (variant === 1) {
      return {
        type: "letter-to-sign",
        id,
        letter,
        choices: choicesFor(letter),
      };
    }
    return {
      type: "webcam-practice",
      id,
      letter,
    };
  });
  return questions;
}
