import type { Problem } from "../data/problems";

type ProgressBarProps = {
  problems: Problem[];
  currentProblemId: number;
  correctProblemIds: number[];
  correctCount: number;
  onSelectProblem: (problemId: number) => void;
};

export function ProgressBar({
  problems,
  currentProblemId,
  correctProblemIds,
  correctCount,
  onSelectProblem,
}: ProgressBarProps) {
  const completionRate = problems.length
    ? (correctCount / problems.length) * 100
    : 0;

  return (
    <section className="sticky top-0 z-20 border-b border-white/10 bg-[#0F1117]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-cyan-200">
              {correctCount}/{problems.length} 正解済み
            </p>
            <h1 className="text-lg font-bold tracking-normal text-white">
              フェアバリュードリル
            </h1>
          </div>
          <div className="h-11 min-w-11 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 text-center">
            <div className="text-xs leading-5 text-cyan-100">達成</div>
            <div className="text-base font-bold text-cyan-100">
              {Math.round(completionRate)}%
            </div>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-6 gap-2">
          {problems.map((problem) => {
            const isCurrent = problem.id === currentProblemId;
            const isCorrect = correctProblemIds.includes(problem.id);

            return (
              <button
                className={`min-h-11 rounded-lg border text-base font-bold transition ${
                  isCurrent
                    ? "border-cyan-200 bg-cyan-200 text-slate-950"
                    : isCorrect
                      ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100"
                      : "border-white/10 bg-slate-900 text-slate-200"
                }`}
                key={problem.id}
                onClick={() => onSelectProblem(problem.id)}
                type="button"
                aria-label={`${problem.level} ${problem.title}`}
              >
                {problem.id}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
