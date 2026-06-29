import { useCallback, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Problem } from "../data/problems";
import {
  loadProgress,
  saveProgress,
  clearProgress,
  createInitialProgress,
  COMPLETION_PROBLEM_ID,
  type StoredProgress,
} from "../lib/storage";

const updateProgress = (
  setProgress: Dispatch<SetStateAction<StoredProgress>>,
  updater: (previous: StoredProgress) => StoredProgress,
) => {
  setProgress((previous) => {
    const next = updater(previous);
    saveProgress(next);
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

      return (
        problems[(startIndex + 1) % problems.length]?.id ?? currentProblemId
      );
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
    clearProgress();
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
