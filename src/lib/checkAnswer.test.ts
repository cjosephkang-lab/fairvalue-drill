import { describe, it, expect } from "vitest";
import { problems } from "../data/problems";
import { checkAnswer } from "./checkAnswer";

const byId = (id: number) => {
  const p = problems.find((problem) => problem.id === id);
  if (!p) throw new Error(`problem ${id} not found`);
  return p;
};

describe("Lv.7 利回り", () => {
  it("5% が正解", () => {
    expect(checkAnswer(byId(7), 5).isCorrect).toBe(true);
  });
  it("4% は不正解", () => {
    expect(checkAnswer(byId(7), 4).isCorrect).toBe(false);
  });
});

describe("Lv.8 72の法則", () => {
  it("14.4年 が正解", () => {
    expect(checkAnswer(byId(8), 14.4).isCorrect).toBe(true);
  });
  it("14年 も許容内", () => {
    expect(checkAnswer(byId(8), 14).isCorrect).toBe(true);
  });
  it("12年 は許容外", () => {
    expect(checkAnswer(byId(8), 12).isCorrect).toBe(false);
  });
});

describe("Lv.9 割引率と比較（高い=0）", () => {
  it("0（高い）が正解", () => {
    expect(checkAnswer(byId(9), 0).isCorrect).toBe(true);
  });
  it("1（買い）は不正解", () => {
    expect(checkAnswer(byId(9), 1).isCorrect).toBe(false);
  });
});

describe("Lv.10 妥当買値（範囲）", () => {
  it("12500 が正解", () => {
    expect(checkAnswer(byId(10), 12500).isCorrect).toBe(true);
  });
  it("12000 / 13000 は境界内", () => {
    expect(checkAnswer(byId(10), 12000).isCorrect).toBe(true);
    expect(checkAnswer(byId(10), 13000).isCorrect).toBe(true);
  });
  it("11000 は範囲外", () => {
    expect(checkAnswer(byId(10), 11000).isCorrect).toBe(false);
  });
});
