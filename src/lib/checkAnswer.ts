import type { Problem } from "../data/problems";

export type AnswerResult = {
  isCorrect: boolean;
  expectedText: string;
};

const hasRange = (
  problem: Problem,
): problem is Problem & { answer_min: number; answer_max: number } => {
  return (
    typeof problem.answer_min === "number" &&
    typeof problem.answer_max === "number"
  );
};

const formatAnswer = (value: number, unit: string) => `${value}${unit}`;

export const getExpectedAnswerText = (problem: Problem): string => {
  if (hasRange(problem)) {
    return `${problem.answer_min}〜${problem.answer_max}${problem.unit}`;
  }

  if (typeof problem.tolerance === "number") {
    return `${problem.answer}${problem.unit} 前後`;
  }

  return formatAnswer(problem.answer, problem.unit);
};

export const checkAnswer = (problem: Problem, inputValue: number): AnswerResult => {
  if (!Number.isFinite(inputValue)) {
    throw new Error("Answer must be a finite number.");
  }

  if (hasRange(problem)) {
    return {
      isCorrect:
        inputValue >= problem.answer_min && inputValue <= problem.answer_max,
      expectedText: getExpectedAnswerText(problem),
    };
  }

  if (typeof problem.tolerance === "number") {
    return {
      isCorrect: Math.abs(inputValue - problem.answer) <= problem.tolerance,
      expectedText: getExpectedAnswerText(problem),
    };
  }

  return {
    isCorrect: inputValue === problem.answer,
    expectedText: getExpectedAnswerText(problem),
  };
};
