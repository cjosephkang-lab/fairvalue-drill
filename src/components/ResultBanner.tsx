type ResultBannerProps = {
  isCorrect: boolean;
  expectedText: string;
};

export function ResultBanner({ isCorrect, expectedText }: ResultBannerProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isCorrect
          ? "border-emerald-400/40 bg-emerald-400/10"
          : "border-rose-400/40 bg-rose-400/10"
      }`}
      role="status"
    >
      <div
        className={`text-base font-bold ${
          isCorrect ? "text-emerald-200" : "text-rose-200"
        }`}
      >
        {isCorrect ? "正解" : "不正解"}
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-200">
        目安: {expectedText}
      </p>
    </div>
  );
}
