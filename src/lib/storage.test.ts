import { describe, it, expect, beforeEach } from "vitest";
import {
  loadProgress,
  saveProgress,
  clearProgress,
  STORAGE_KEY,
} from "./storage";
import { problems } from "../data/problems";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("空のときは最初の問題を currentProblemId にした初期値を返す", () => {
    const p = loadProgress(problems);
    expect(p.currentProblemId).toBe(problems[0].id);
    expect(p.correctProblemIds).toEqual([]);
    expect(p.correctCount).toBe(0);
  });

  it("save した内容を load で読み戻せる（同じキー・同じ形状）", () => {
    const saved = {
      currentProblemId: problems[1].id,
      correctProblemIds: [problems[0].id],
      answeredProblemIds: [problems[0].id],
      correctCount: 1,
      updatedAt: "2026-06-29T00:00:00.000Z",
    };
    saveProgress(saved);
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).currentProblemId,
    ).toBe(problems[1].id);
    const loaded = loadProgress(problems);
    expect(loaded.correctProblemIds).toEqual([problems[0].id]);
    expect(loaded.correctCount).toBe(1);
  });

  it("不正な problem id は捨てる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        correctProblemIds: [99999],
        answeredProblemIds: [99999],
      }),
    );
    const loaded = loadProgress(problems);
    expect(loaded.correctProblemIds).toEqual([]);
  });

  it("clearProgress でキーが消える", () => {
    saveProgress({
      currentProblemId: problems[0].id,
      correctProblemIds: [],
      answeredProblemIds: [],
      correctCount: 0,
      updatedAt: "2026-06-29T00:00:00.000Z",
    });
    clearProgress();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
