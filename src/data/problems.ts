export type Problem = {
  id: number;
  level: string;
  tag: string;
  title: string;
  story: string;
  question: string;
  hint: string;
  answer: number;
  answer_min?: number;
  answer_max?: number;
  tolerance?: number;
  unit: string;
  explanation: string;
  concept: string;
};

export const problems: Problem[] = [
  {
    id: 1,
    level: "Lv.1",
    tag: "EV/EBITDA入門",
    title: "工務店のバリュー、いくら？",
    story:
      "地元の工務店オーナーから事業譲渡の相談が来た。\n年間EBITDA（税引前・償却前利益）は2,000万円。\n建設業のM&A相場は「EV/EBITDA = 4〜6倍」と言われている。",
    question:
      "相場の中央値（5倍）で計算した場合、この会社のフェアバリュー（EV）はいくら？",
    hint: "EV = EBITDA × マルチプル",
    answer: 10000,
    unit: "万円",
    explanation:
      "2,000万円 × 5倍 = 10,000万円（1億円）。\nこれがEnterprise Value（事業価値）。M&Aの「値札」の基本単位。",
    concept: "EV（Enterprise Value）= 事業そのものの価値。借金ごと買う値段。",
  },
  {
    id: 2,
    level: "Lv.2",
    tag: "株式価値への変換",
    title: "借金があったら？　株主の手取りはいくら？",
    story:
      "同じ工務店。EV（事業価値）は1億円とわかった。\nただしこの会社には銀行借入が3,000万円残っている。\n現預金は500万円ある。",
    question: "株主が実際に受け取れる株式価値（Equity Value）はいくら？",
    hint: "株式価値 = EV − 有利子負債 + 現預金",
    answer: 7500,
    unit: "万円",
    explanation:
      "10,000 − 3,000 + 500 = 7,500万円。\n借金は買い手が引き継ぐコストなので引く。現金は買い手が受け取る資産なので足す。",
    concept:
      "EV → 株式価値の変換はM&A FAの最重要計算。借金と現金の扱いを間違えると大事故。",
  },
  {
    id: 3,
    level: "Lv.3",
    tag: "マルチプルの読み方",
    title: "「安い」か「高い」か、どう判断する？",
    story:
      "別の工務店が売りに出た。\n・売値（EV）= 8,000万円\n・年間EBITDA = 1,500万円",
    question: "このM&AのEV/EBITDAは何倍？（小数点第1位まで）",
    hint: "マルチプル = EV ÷ EBITDA",
    answer: 5.3,
    tolerance: 0.1,
    unit: "倍",
    explanation:
      "8,000 ÷ 1,500 = 5.33倍 ≈ 5.3倍。\n建設業相場（4〜6倍）の中央値より少し高め。高い理由を調べる必要がある。",
    concept:
      "マルチプルは「相場の何倍割高/割安か」を示す物差し。相場を知らないと使えない。",
  },
  {
    id: 4,
    level: "Lv.4",
    tag: "DCF入門",
    title: "「将来のお金」は今いくら？",
    story:
      "工務店オーナーが「来年1,000万円もらうのと、今すぐ900万円もらうのはどっちがいい？」と聞いてきた。\n割引率（期待収益率）を10%とする。",
    question:
      "「来年の1,000万円」を現在価値に割り引くといくら？（小数点以下切り捨て）",
    hint: "現在価値 = 将来キャッシュフロー ÷ (1 + 割引率)",
    answer: 909,
    unit: "万円",
    explanation:
      "1,000 ÷ 1.10 = 909万円（端数切り捨て）。\n「今すぐ900万円」より来年の1,000万円のほうが価値が高い（909万円 > 900万円）。",
    concept:
      "DCF（割引キャッシュフロー）の核心。お金は「いつもらうか」で価値が変わる。",
  },
  {
    id: 5,
    level: "Lv.5",
    tag: "複数年DCF",
    title: "3年分のキャッシュを今に換算する",
    story:
      "ある電気保安会社のFCF（フリーキャッシュフロー）予測：\n・1年後：500万円\n・2年後：600万円\n・3年後：700万円\n割引率 = 10%",
    question:
      "3年分のFCFの現在価値合計はいくら？（万円単位、小数点以下切り捨て）",
    hint: "各年 ÷ (1.1)^n を合計する",
    answer: 1476,
    answer_min: 1450,
    answer_max: 1480,
    unit: "万円",
    explanation:
      "1年後：500÷1.1 = 454.5\n2年後：600÷1.21 = 495.9\n3年後：700÷1.331 = 526.0\n合計 = 1,476万円\n\n1,450〜1,480万円の範囲を正解とします。",
    concept:
      "実際のDCFはこれを5〜10年分やって、最終年以降の「残存価値」を加える。",
  },
  {
    id: 6,
    level: "Lv.6",
    tag: "FAフェアネス判定",
    title: "FAとして、この価格は「フェア」か？",
    story:
      "買い手から提示された買収価格：9,000万円（EV）\n対象会社のEBITDA：1,600万円\n業界マルチプル相場：4〜6倍\nDCF試算（3年）：8,500万円〜10,500万円",
    question:
      "EV/EBITDAマルチプルを計算し、「相場内か否か」を判定せよ。マルチプルは小数点第2位まで。",
    hint: "9,000 ÷ 1,600 = ?",
    answer: 5.63,
    tolerance: 0.05,
    unit: "倍",
    explanation:
      "9,000 ÷ 1,600 = 5.625 ≈ 5.63倍。\n相場（4〜6倍）の範囲内。DCF試算の中央値（9,500万円）とも近い。\n→ FAとして「概ねフェアな価格」と評価できる根拠がある。",
    concept:
      "FA業務の核心：マルチプルとDCFの2軸でフェアネスを検証し、依頼主に説明責任を果たす。",
  },
];
