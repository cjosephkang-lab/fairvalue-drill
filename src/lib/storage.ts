import type { Problem } from "../data/problems";

export const STORAGE_KEY = "fairvalue-drill.progress.v1";
export const COMPLETION_PROBLEM_ID = 0;

export type StoredProgress = {
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
          typeof id === "number" && Number.isInteger(id) && validIds.has(id),
      ),
    ),
  );
};

export const createInitialProgress = (
  firstProblemId: number,
): StoredProgress => ({
  currentProblemId: firstProblemId,
  correctProblemIds: [],
  answeredProblemIds: [],
  correctCount: 0,
  updatedAt: new Date().toISOString(),
});

export const loadProgress = (problems: Problem[]): StoredProgress => {
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

export const saveProgress = (progress: StoredProgress): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save progress to localStorage.", error);
  }
};

export const clearProgress = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset progress in localStorage.", error);
  }
};
