import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import type { Problem } from "../data/problems";
import { checkAnswer } from "../lib/checkAnswer";
import { ResultBanner } from "./ResultBanner";

type ProblemCardProps = {
  problem: Problem;
  problemNumber: number;
  totalProblems: number;
  isRoundComplete: boolean;
  onAnswer: (problemId: number, isCorrect: boolean) => void;
  onNext: () => void;
};

type SubmittedResult = {
  isCorrect: boolean;
  expectedText: string;
  submittedValue: number;
};

export function ProblemCard({
  problem,
  problemNumber,
  totalProblems,
  isRoundComplete,
  onAnswer,
  onNext,
}: ProblemCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [submittedResult, setSubmittedResult] =
    useState<SubmittedResult | null>(null);

  useEffect(() => {
    setInputValue("");
    setInputError("");
    setSubmittedResult(null);
  }, [problem.id]);

  const submitLabel = submittedResult ? "判定済み" : "判定";
  const nextLabel = isRoundComplete ? "完了" : "次へ";

  const visualBars = useMemo(() => {
    return [62, 78, 52, 86, 70, 96].map((height, index) => ({
      id: `${problem.id}-${index}`,
      height,
    }));
  }, [problem.id]);

  const submitAnswer = () => {
    const trimmedValue = inputValue.trim();
    const numericValue = Number(trimmedValue);

    if (!trimmedValue || !Number.isFinite(numericValue)) {
      setInputError("数値を入力してください。");
      return;
    }

    try {
      const result = checkAnswer(problem, numericValue);
      setSubmittedResult({
        ...result,
        submittedValue: numericValue,
      });
      setInputError("");
      onAnswer(problem.id, result.isCorrect);
    } catch (error) {
      console.error("Failed to check answer.", error);
      setInputError("判定できませんでした。入力値を確認してください。");
    }
  };

  const resetAttempt = () => {
    setInputValue("");
    setInputError("");
    setSubmittedResult(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!submittedResult) {
      submitAnswer();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!submittedResult) {
        submitAnswer();
      }
    }
  };

  return (
    <article className="mx-auto max-w-xl px-4 pb-8 pt-5">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/25">
        <div className="border-b border-white/10 bg-slate-900 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-sm font-bold text-cyan-100">
                  {problem.level}
                </span>
                <span className="rounded-md border border-amber-200/30 bg-amber-200/10 px-2.5 py-1 text-sm font-medium text-amber-100">
                  {problem.tag}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-normal text-white">
                {problem.title}
              </h2>
            </div>
            <div className="shrink-0 text-right text-sm font-medium text-slate-400">
              {problemNumber}/{totalProblems}
            </div>
          </div>

          <div
            className="mt-4 flex h-20 items-end gap-2 rounded-lg border border-white/10 bg-[#0F1117] px-4 py-3"
            aria-hidden="true"
          >
            {visualBars.map((bar) => (
              <div
                className="flex-1 rounded-t-md bg-cyan-300/70"
                key={bar.id}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section>
            <p className="whitespace-pre-line text-base leading-7 text-slate-200">
              {problem.story}
            </p>
          </section>

          <section className="rounded-lg border border-white/10 bg-[#111827] p-4">
            <p className="text-base font-bold leading-7 text-white">
              {problem.question}
            </p>
          </section>

          <details className="rounded-lg border border-white/10 bg-slate-900">
            <summary className="min-h-11 cursor-pointer px-4 py-3 text-base font-bold text-cyan-100">
              ヒント
            </summary>
            <p className="border-t border-white/10 px-4 py-3 text-base leading-7 text-slate-200">
              {problem.hint}
            </p>
          </details>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label
              className="block text-base font-bold text-slate-100"
              htmlFor={`answer-${problem.id}`}
            >
              あなたの回答
            </label>
            <div className="flex items-stretch gap-2">
              <input
                className="min-h-12 w-full rounded-lg border border-white/10 bg-[#0F1117] px-4 text-[20px] font-bold text-white outline-none transition focus:border-cyan-200"
                id={`answer-${problem.id}`}
                inputMode="decimal"
                min="0"
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="数値"
                step="any"
                type="number"
                value={inputValue}
                disabled={Boolean(submittedResult)}
              />
              <div className="grid min-h-12 min-w-16 place-items-center rounded-lg border border-white/10 bg-slate-900 px-3 text-base font-bold text-slate-200">
                {problem.unit}
              </div>
            </div>
            {inputError ? (
              <p className="text-sm font-medium text-rose-200">{inputError}</p>
            ) : null}
            <button
              className="min-h-12 w-full rounded-lg bg-cyan-200 px-4 text-base font-bold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              disabled={Boolean(submittedResult)}
              type="submit"
            >
              {submitLabel}
            </button>
          </form>

          {submittedResult ? (
            <section className="space-y-4">
              <ResultBanner
                expectedText={submittedResult.expectedText}
                isCorrect={submittedResult.isCorrect}
              />

              <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
                <p className="text-sm font-bold text-slate-400">入力</p>
                <p className="mt-1 text-base font-bold text-white">
                  {submittedResult.submittedValue}
                  {problem.unit}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
                <h3 className="text-base font-bold text-white">解説</h3>
                <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-200">
                  {problem.explanation}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200/30 bg-amber-200/10 p-4">
                <h3 className="text-base font-bold text-amber-100">
                  覚えること
                </h3>
                <p className="mt-2 text-base leading-7 text-slate-100">
                  {problem.concept}
                </p>
              </div>

              <div className="grid gap-3">
                {!submittedResult.isCorrect ? (
                  <button
                    className="min-h-12 w-full rounded-lg border border-white/15 bg-slate-900 px-4 text-base font-bold text-white transition hover:bg-slate-800"
                    onClick={resetAttempt}
                    type="button"
                  >
                    もう一度
                  </button>
                ) : null}
                <button
                  className="min-h-12 w-full rounded-lg bg-white px-4 text-base font-bold text-slate-950 transition hover:bg-slate-200"
                  onClick={onNext}
                  type="button"
                >
                  {nextLabel}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
