export type RateRow = { rate: string; years: string; star?: boolean };
export type CheatSection = { heading: string; lines: string[] };

export const cheatSheet = {
  title: "買収判断 瞬時計算チートシート",
  formulas: ["利回り　＝ 年間FCF ÷ 買収金額", "回収年数 ≈ 72 ÷ 利回り(%)"],
  steps: [
    {
      no: "①",
      label: "利回りを出す",
      detail: "FCF 1,500万 ÷ 3億 ＝ 5%／FCF 3,000万 ÷ 3億 ＝ 10%",
    },
    {
      no: "②",
      label: "72の法則で回収年数",
      detail: "5% → 14年 ／ 10% → 7年 ／ 2% → 36年（論外）",
    },
    {
      no: "③",
      label: "自分の要求水準（割引率）と比較",
      detail: "利回り ＞ 割引率 → 買い／利回り ＜ 割引率 → 高すぎる・交渉へ",
    },
  ] as { no: string; label: string; detail: string }[],
  rateTable: [
    { rate: "預金 0.1%", years: "720年" },
    { rate: "2%", years: "36年" },
    { rate: "5%", years: "14年" },
    { rate: "10%", years: "7年", star: true },
    { rate: "15%", years: "4.8年" },
  ] as RateRow[],
  sections: [
    {
      heading: "商談での動き方",
      lines: [
        "1. 売り手が値段を出す",
        "2. 「年間FCFはいくらですか？」と聞く",
        "3. 頭の中で利回り計算",
        "4. 72で回収年数を出す",
        "5. 割引率と比較",
        "6. 低ければ「私どもの試算では〇〇万円です」と数字で返す",
      ],
    },
    {
      heading: "割引率の正体",
      lines: [
        "「これ以下なら投資しない」自分の最低ライン",
        "リスクが高い中小・非上場 → 10〜15%要求が目安",
        "安全な大企業 → 5〜7%でも買う",
      ],
    },
    {
      heading: "注意点",
      lines: [
        "この計算は成長ゼロ・永続前提の近似値",
        "FCFが成長する会社はもっと高く評価できる",
        "最終判断は必ずExcelで",
      ],
    },
  ] as CheatSection[],
  oneLiner: "売り手の言い値をFCFで割れ。それが全ての入口。",
};
