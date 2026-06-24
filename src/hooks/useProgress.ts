import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Problem } from "../data/problems";

const STORAGE_KEY = "fairvalue-drill.progress.v1";
const COMPLETION_PROBLEM_ID = 0;

type StoredProgress = {
  currentProblemId: number;
  correctProblemIds: number[];
  answeredProblemIds: number[];
  correctCount: number;
  updatedAt: string;
};

const uniqueValidIds = (ids: unknown, validIds: Set<number>): number[] => {
  if (!Array.isArray(ids)) {
    return [];
  }

  return Array.from(
    new Set(
      ids.filter(
        (id): id is number =>
          typeof id === "number" &&
          Number.isInteger(id) &&
          validIds.has(id),
      ),
    ),
  );
};

const createInitialProgress = (firstProblemId: number): StoredProgress => ({
  currentProblemId: firstProblemId,
  correctProblemIds: [],
  answeredProblemIds: [],
  correctCount: 0,
  updatedAt: new Date().toISOString(),
});

const loadProgress = (problems: Problem[]): StoredProgress => {
  const firstProblemId = problems[0]?.id ?? COMPLETION_PROBLEM_ID;
  const validIds = new Set(problems.map((problem) => problem.id));
  const fallback = createInitialProgress(firstProblemId);

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredProgress>;
    const currentProblemId =
      typeof parsedValue.currentProblemId === "number" &&
      (validIds.has(parsedValue.currentProblemId) ||
        parsedValue.currentProblemId === COMPLETION_PROBLEM_ID)
        ? parsedValue.currentProblemId
        : firstProblemId;
    const correctProblemIds = uniqueValidIds(
      parsedValue.correctProblemIds,
      validIds,
    );
    const answeredProblemIds = uniqueValidIds(
      parsedValue.answeredProblemIds,
      validIds,
    );

    return {
      currentProblemId,
      correctProblemIds,
      answeredProblemIds,
      correctCount: correctProblemIds.length,
      updatedAt:
        typeof parsedValue.updatedAt === "string"
          ? parsedValue.updatedAt
          : new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to load progress from localStorage.", error);
    return fallback;
  }
};

const persistProgress = (progress: StoredProgress) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress to localStorage.", error);
  }
};

const updateProgress = (
  setProgress: Dispatch<SetStateAction<StoredProgress>>,
  updater: (previous: StoredProgress) => StoredProgress,
) => {
  setProgress((previous) => {
    const next = updater(previous);
    persistProgress(next);
    return next;
  });
};

export const useProgress = (problems: Problem[]) => {
  const [progress, setProgress] = useState<StoredProgress>(() =>
    loadProgress(problems),
  );

  const validIds = useMemo(
    () => new Set(problems.map((problem) => problem.id)),
    [problems],
  );

  const currentProblemIndex = useMemo(() => {
    return problems.findIndex(
      (problem) => problem.id === progress.currentProblemId,
    );
  }, [problems, progress.currentProblemId]);

  const currentProblem =
    currentProblemIndex >= 0 ? problems[currentProblemIndex] : undefined;

  const markAnswer = useCallback(
    (problemId: number, isCorrect: boolean) => {
      if (!validIds.has(problemId)) {
        throw new Error(`Unknown problem id: ${problemId}`);
      }

      updateProgress(setProgress, (previous) => {
        const answeredProblemIds = new Set(previous.answeredProblemIds);
        answeredProblemIds.add(problemId);

        const correctProblemIds = new Set(previous.correctProblemIds);

        if (isCorrect) {
          correctProblemIds.add(problemId);
        }

        return {
          ...previous,
          answeredProblemIds: Array.from(answeredProblemIds),
          correctProblemIds: Array.from(correctProblemIds),
          correctCount: correctProblemIds.size,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [validIds],
  );

  const findNextProblemId = useCallback(
    (currentProblemId: number, correctProblemIds: number[]) => {
      if (!problems.length) {
        return COMPLETION_PROBLEM_ID;
      }

      const currentIndex = problems.findIndex(
        (problem) => problem.id === currentProblemId,
      );
      const startIndex = currentIndex >= 0 ? currentIndex : 0;
      const correctIds = new Set(correctProblemIds);

      for (let offset = 1; offset <= problems.length; offset += 1) {
        const candidate = problems[(startIndex + offset) % problems.length];

        if (candidate && !correctIds.has(candidate.id)) {
          return candidate.id;
        }
      }

      return problems[(startIndex + 1) % problems.length]?.id ?? currentProblemId;
    },
    [problems],
  );

  const goToProblem = useCallback(
    (problemId: number) => {
      if (!validIds.has(problemId)) {
        throw new Error(`Unknown problem id: ${problemId}`);
      }

      updateProgress(setProgress, (previous) => ({
        ...previous,
        currentProblemId: problemId,
        updatedAt: new Date().toISOString(),
      }));
    },
    [validIds],
  );

  const goToNextProblem = useCallback(() => {
    if (!currentProblem) {
      return;
    }

    updateProgress(setProgress, (previous) => ({
      ...previous,
      currentProblemId: findNextProblemId(
        previous.currentProblemId,
        previous.correctProblemIds,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, [currentProblem, findNextProblemId]);

  const goToCompletion = useCallback(() => {
    updateProgress(setProgress, (previous) => ({
      ...previous,
      currentProblemId: COMPLETION_PROBLEM_ID,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const initialProgress = createInitialProgress(
      problems[0]?.id ?? COMPLETION_PROBLEM_ID,
    );
    setProgress(initialProgress);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset progress in localStorage.", error);
    }
  }, [problems]);

  return {
    progress,
    currentProblem,
    currentProblemIndex,
    correctCount: progress.correctCount,
    isComplete: progress.correctCount === problems.length,
    isCompletionScreen: progress.currentProblemId === COMPLETION_PROBLEM_ID,
    markAnswer,
    goToProblem,
    goToNextProblem,
    goToCompletion,
    resetProgress,
  };
};
