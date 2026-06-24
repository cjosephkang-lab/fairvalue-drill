import { ProblemCard } from "./components/ProblemCard";
import { ProgressBar } from "./components/ProgressBar";
import { problems } from "./data/problems";
import { useProgress } from "./hooks/useProgress";

function App() {
  const {
    progress,
    currentProblem,
    currentProblemIndex,
    correctCount,
    isComplete,
    isCompletionScreen,
    markAnswer,
    goToProblem,
    goToNextProblem,
    goToCompletion,
    resetProgress,
  } = useProgress(problems);

  const handleNext = () => {
    if (isComplete) {
      goToCompletion();
      return;
    }

    goToNextProblem();
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100">
      <ProgressBar
        correctCount={correctCount}
        correctProblemIds={progress.correctProblemIds}
        currentProblemId={progress.currentProblemId}
        onSelectProblem={goToProblem}
        problems={problems}
      />

      <main>
        {isCompletionScreen ? (
          <section className="mx-auto max-w-xl px-4 pb-8 pt-6">
            <div className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 p-5 shadow-2xl shadow-black/25">
              <p className="text-sm font-bold text-emerald-100">
                {problems.length}/{problems.length} 正解済み
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-normal text-white">
                全問クリア
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-100">
                EV、株式価値、マルチプル、DCF、フェアネス判定の基礎を一周しました。
              </p>
              <button
                className="mt-5 min-h-12 w-full rounded-lg bg-white px-4 text-base font-bold text-slate-950 transition hover:bg-slate-200"
                onClick={resetProgress}
                type="button"
              >
                もう一周
              </button>
            </div>
          </section>
        ) : currentProblem ? (
          <ProblemCard
            isRoundComplete={isComplete}
            onAnswer={markAnswer}
            onNext={handleNext}
            problem={currentProblem}
            problemNumber={currentProblemIndex + 1}
            totalProblems={problems.length}
          />
        ) : (
          <section className="mx-auto max-w-xl px-4 py-8">
            <div className="rounded-lg border border-rose-300/40 bg-rose-300/10 p-5">
              <h2 className="text-xl font-bold text-white">
                問題を読み込めませんでした
              </h2>
              <button
                className="mt-5 min-h-12 w-full rounded-lg bg-white px-4 text-base font-bold text-slate-950"
                onClick={resetProgress}
                type="button"
              >
                初期化
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
