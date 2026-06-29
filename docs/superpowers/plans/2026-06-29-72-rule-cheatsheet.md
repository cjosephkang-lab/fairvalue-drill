# 72の法則・買収判断チートシート追加 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** フェアバリューアプリに「72の法則・買収判断」ドリル4問とチート（読み物）タブを追加し、履歴保存を差し替え可能な層に閉じ込め、GitHub Pages に自分用デプロイする。

**Architecture:** 既存の `Problem` 型・ドリルフローを一切変えず、`problems` 配列に Lv.7〜10 を追記。`App.tsx` に「ドリル / チート」のタブ状態(useState)を足し、チートビューは状態なしの `CheatSheet` コンポーネントで表示。localStorage 直アクセスを `src/lib/storage.ts` に抽出し、`useProgress` はそれ経由にする（動作不変）。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind v4 / テストは Vitest（新規導入）/ デプロイは gh-pages（導入済み）。

## Global Constraints

- `Problem` 型（`src/data/problems.ts`）は変更しない。新フィールドを足さない。
- 単位は既存に合わせ「万円」「%」「倍」「年」を流用。新単位を作らない。
- localStorage のキー名 `fairvalue-drill.progress.v1` と JSON 形状を変えない（既存進捗を壊さない）。
- Haiku モデルは使わない（サブエージェント実行時 Sonnet/Opus）。
- デプロイ先は GitHub Pages（`base: "/fairvalue-drill/"` 既設）。URLは自分用、人に配らない。
- スコープ外（実装しない）: 個人プロフィール切替(B)、クラウドログイン/Firestore/顧客配布(C)。
- 既存のダーク配色トークン（`bg-[#0F1117]`, `bg-slate-950`, `border-white/10`, `text-cyan-100` 等）を流用しデザイン統一。

---

## File Structure

- `src/data/problems.ts` — Modify: Lv.7〜10 を `problems` 配列に追記
- `src/lib/storage.ts` — Create: localStorage の load/persist/clear を閉じ込める層 + `StoredProgress` 型
- `src/hooks/useProgress.ts` — Modify: storage.ts 経由に置換（動作不変）
- `src/data/cheatsheet.ts` — Create: チートシート内容を構造化データとして保持
- `src/components/CheatSheet.tsx` — Create: cheatsheet.ts を表示する読み物コンポーネント（状態なし）
- `src/App.tsx` — Modify: ドリル/チートのタブ切替を追加 + 完了画面に72の法則1行追記
- `src/lib/checkAnswer.test.ts` — Create: Lv.7〜10 の判定テスト
- `src/lib/storage.test.ts` — Create: storage 層の回帰テスト
- `vite.config.ts` / `package.json` — Modify: Vitest 設定とテストスクリプト追加
- リポジトリ外: `~/.claude/projects/-Users-changju1109-AICompany/memory/project-ma-valuation-72-rule.md`（AIメモリ）と `MEMORY.md` 1行追記

---

## Task 1: テスト基盤（Vitest）を導入する

**Files:**
- Modify: `package.json`（devDependencies に vitest / jsdom、scripts に test）
- Modify: `vite.config.ts`（test 設定）
- Test: `src/lib/smoke.test.ts`（疎通用・後で削除）

**Interfaces:**
- Produces: `npm test` で Vitest が走る環境。後続タスクのテストはすべてこのコマンドで実行。

- [ ] **Step 1: vitest と jsdom をインストール**

Run:
```bash
cd /Users/changju1109/AICompany/fairvalue-drill && npm install -D vitest jsdom
```
Expected: 追加され `package-lock.json` 更新。

- [ ] **Step 2: package.json に test スクリプト追加**

`scripts` に以下を追加（既存スクリプトは残す）:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: vite.config.ts に test 設定追加**

`defineConfig({ ... })` に `test` を追加:
```ts
export default defineConfig({
  base: "/fairvalue-drill/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```
注: `vitest/config` の型が必要なら import を `import { defineConfig } from "vitest/config";` に変更する。

- [ ] **Step 4: 疎通テストを書く**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test`
Expected: PASS（1 passed）。

- [ ] **Step 6: 疎通テストを削除**

Run: `rm src/lib/smoke.test.ts`

- [ ] **Step 7: コミット**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "test: introduce Vitest test runner"
```

---

## Task 2: ドリル4問（Lv.7〜10）を追加する

**Files:**
- Modify: `src/data/problems.ts`（`problems` 配列末尾に4問追記）
- Test: `src/lib/checkAnswer.test.ts`

**Interfaces:**
- Consumes: 既存 `checkAnswer(problem, inputValue)`（`src/lib/checkAnswer.ts`）と `Problem` 型。
- Produces: id 7〜10 の `Problem`。id は既存 1〜6 に続く連番。

- [ ] **Step 1: 失敗するテストを書く**

Create `src/lib/checkAnswer.test.ts`:
```ts
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test`
Expected: FAIL（problem 7 not found 等）。

- [ ] **Step 3: problems.ts に4問追記**

`src/data/problems.ts` の `problems` 配列の最後の要素（id:6）の後ろ、閉じ括弧 `];` の直前に追加:
```ts
  {
    id: 7,
    level: "Lv.7",
    tag: "利回り入門",
    title: "売り手の言い値を、FCFで割れ",
    story:
      "M&Aの売り手から「3億円で買ってほしい」と言われた。\nこの会社の年間FCF（フリーキャッシュフロー）は1,500万円。",
    question:
      "この買収の「利回り」は何％？（利回り = 年間FCF ÷ 買収金額）",
    hint: "1,500万 ÷ 30,000万 = ?（％で答える）",
    answer: 5,
    unit: "%",
    explanation:
      "1,500 ÷ 30,000 = 0.05 = 5％。\nこれが「買収金額に対して毎年何％戻ってくるか」。\n売り手の言い値をFCFで割る——それが全ての入口。",
    concept:
      "利回り = 年間FCF ÷ 買収金額。値段だけ見ても高い安いは分からない。FCFで割って初めて物差しになる。",
  },
  {
    id: 8,
    level: "Lv.8",
    tag: "72の法則",
    title: "何年で元が取れる？　72で割るだけ",
    story:
      "さきほどの会社、利回りは5％とわかった。\n投資の世界には「72の法則」という暗算ワザがある。\n回収年数 ≈ 72 ÷ 利回り(％)。",
    question:
      "利回り5％のとき、72の法則で回収年数は約何年？",
    hint: "72 ÷ 5 = ?",
    answer: 14.4,
    tolerance: 0.5,
    unit: "年",
    explanation:
      "72 ÷ 5 = 14.4年。\n5％なら元を取るのに約14年。10％なら約7年、2％なら36年（論外）。\n利回りが2倍になると回収年数は半分になる。",
    concept:
      "72の法則：回収年数 ≈ 72 ÷ 利回り(％)。電卓なしで「何年で元が取れるか」を一瞬で出す道具。",
  },
  {
    id: 9,
    level: "Lv.9",
    tag: "割引率と比較",
    title: "買いか、高すぎか。割引率と比べる",
    story:
      "この案件の利回りは5％。\nあなたの要求水準（割引率）は12％とする。\n割引率とは「これ以下なら投資しない」という自分の最低ライン。",
    question:
      "利回り5％ < 割引率12％。この買収は「買い」か「高い」か？\n買いなら 1、高すぎるなら 0 を入力せよ。",
    hint: "利回り ＞ 割引率 → 買い（1） / 利回り ＜ 割引率 → 高い（0）",
    answer: 0,
    unit: "（1=買い / 0=高い）",
    explanation:
      "利回り5％は、自分の要求水準12％に届いていない。\n→ 高すぎる。答えは 0。\nこのまま買うと要求リターンを満たせない。交渉で値段を下げるべき。",
    concept:
      "割引率＝「これ以下なら投資しない」自分の最低ライン。利回りが割引率を超えて初めて「買い」。中小・非上場は10〜15％を要求するのが目安。",
  },
  {
    id: 10,
    level: "Lv.10",
    tag: "商談まるごと",
    title: "では、いくらなら買える？",
    story:
      "言い値3億は高すぎるとわかった。\nFCFは1,500万円、あなたの割引率は12％。\n「割引率12％をちょうど満たす買値」を逆算する。",
    question:
      "あなたが出せる妥当な買値はいくら？（妥当買値 = 年間FCF ÷ 割引率）",
    hint: "1,500万 ÷ 0.12 = ?（万円で答える）",
    answer: 12500,
    answer_min: 12000,
    answer_max: 13000,
    unit: "万円",
    explanation:
      "1,500 ÷ 0.12 = 12,500万円（＝1.25億円）。\nこの値段までなら利回りが12％になり、要求水準を満たす。\n言い値3億との差1.75億が、交渉の幅。\n※成長ゼロ・永続前提の近似。最終判断は必ずExcelで。",
    concept:
      "妥当買値 = 年間FCF ÷ 割引率。割引率から逆算すれば「いくらまでなら出せるか」が一発で出る。これが交渉のアンカー。",
  },
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test`
Expected: PASS（Lv.7〜10 すべて green）。

- [ ] **Step 5: 型・ビルド確認**

Run: `npm run build`
Expected: tsc + vite build 成功（型エラーなし）。

- [ ] **Step 6: コミット**

```bash
git add src/data/problems.ts src/lib/checkAnswer.test.ts
git commit -m "feat: add Lv.7-10 drills (利回り/72の法則/割引率比較/妥当買値)"
```

---

## Task 3: 履歴保存を storage.ts に抽出する（動作不変リファクタ）

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`
- Modify: `src/hooks/useProgress.ts`

**Interfaces:**
- Produces:
  - `type StoredProgress = { currentProblemId: number; correctProblemIds: number[]; answeredProblemIds: number[]; correctCount: number; updatedAt: string }`
  - `loadProgress(problems: Problem[]): StoredProgress` — 既存ロジックを移植（localStorageキー `fairvalue-drill.progress.v1` を読み、バリデーション）
  - `saveProgress(progress: StoredProgress): void` — 既存 persist を移植
  - `clearProgress(): void` — 既存 `removeItem` を移植
  - `STORAGE_KEY` / `COMPLETION_PROBLEM_ID` を export
- Consumes: `useProgress` がこの3関数＋型＋定数を使う。`StoredProgress` 型・キー名・JSON形状は現状と一致させる（変更禁止）。

- [ ] **Step 1: 失敗する回帰テストを書く**

Create `src/lib/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { loadProgress, saveProgress, clearProgress, STORAGE_KEY } from "./storage";
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
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).currentProblemId).toBe(
      problems[1].id,
    );
    const loaded = loadProgress(problems);
    expect(loaded.correctProblemIds).toEqual([problems[0].id]);
    expect(loaded.correctCount).toBe(1);
  });

  it("不正な problem id は捨てる", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ correctProblemIds: [99999], answeredProblemIds: [99999] }),
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test`
Expected: FAIL（`./storage` が無い）。

- [ ] **Step 3: storage.ts を作成（useProgress から移植）**

Create `src/lib/storage.ts`（`useProgress.ts` の load/persist/validate ロジックをそのまま移す）:
```ts
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

export const createInitialProgress = (firstProblemId: number): StoredProgress => ({
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
```

- [ ] **Step 4: useProgress.ts を storage.ts 経由に置換**

`src/hooks/useProgress.ts` を編集:
1. 先頭付近の `STORAGE_KEY` / `COMPLETION_PROBLEM_ID` / `StoredProgress` / `uniqueValidIds` / `createInitialProgress` / `loadProgress` / `persistProgress` のローカル定義を削除。
2. import を追加:
```ts
import {
  loadProgress,
  saveProgress,
  clearProgress,
  createInitialProgress,
  COMPLETION_PROBLEM_ID,
  type StoredProgress,
} from "../lib/storage";
```
3. `updateProgress` 内の `persistProgress(next)` を `saveProgress(next)` に変更。
4. `resetProgress` 内の try/catch + `window.localStorage.removeItem(STORAGE_KEY)` を `clearProgress()` に置換。
5. `useState<StoredProgress>(() => loadProgress(problems))` はそのまま（import 済みの loadProgress を使う）。

最終的に `useProgress.ts` から `window.localStorage` への直接参照が消えていること。

- [ ] **Step 5: 回帰テスト・ビルドが通ることを確認**

Run: `npm test`
Expected: PASS（storage.test.ts 含め全 green）。
Run: `npm run build`
Expected: 成功（未使用 import の型エラーが無いこと）。

- [ ] **Step 6: コミット**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts src/hooks/useProgress.ts
git commit -m "refactor: extract progress persistence into storage layer (behavior unchanged)"
```

---

## Task 4: チートシートのデータを作る

**Files:**
- Create: `src/data/cheatsheet.ts`

**Interfaces:**
- Produces: `cheatSheet` という構造化オブジェクト。`CheatSheet.tsx` が消費。
  ```ts
  export type RateRow = { rate: string; years: string; star?: boolean };
  export type CheatSection = { heading: string; lines: string[] };
  export const cheatSheet: {
    title: string;
    formulas: string[];          // 核心の公式
    steps: { no: string; label: string; detail: string }[]; // 3ステップ
    rateTable: RateRow[];        // 72の法則 早見表
    sections: CheatSection[];    // 商談での動き方 / 割引率の正体 / 注意点
    oneLiner: string;            // 一行で覚える
  };
  ```

- [ ] **Step 1: cheatsheet.ts を作成**

Create `src/data/cheatsheet.ts`:
```ts
export type RateRow = { rate: string; years: string; star?: boolean };
export type CheatSection = { heading: string; lines: string[] };

export const cheatSheet = {
  title: "買収判断 瞬時計算チートシート",
  formulas: [
    "利回り　＝ 年間FCF ÷ 買収金額",
    "回収年数 ≈ 72 ÷ 利回り(%)",
  ],
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
```

- [ ] **Step 2: ビルドで型確認**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 3: コミット**

```bash
git add src/data/cheatsheet.ts
git commit -m "feat: add cheat sheet content data"
```

---

## Task 5: CheatSheet コンポーネントを作る

**Files:**
- Create: `src/components/CheatSheet.tsx`

**Interfaces:**
- Consumes: `cheatSheet`（`src/data/cheatsheet.ts`）。
- Produces: `export function CheatSheet(): JSX.Element`（props なし・状態なし）。`App.tsx` のチートビューで使う。

- [ ] **Step 1: CheatSheet.tsx を作成**

Create `src/components/CheatSheet.tsx`（ProblemCard の配色トークンを流用）:
```tsx
import { cheatSheet } from "../data/cheatsheet";

export function CheatSheet() {
  return (
    <article className="mx-auto max-w-xl px-4 pb-8 pt-5">
      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-2xl shadow-black/25">
        <div className="border-b border-white/10 bg-slate-900 px-5 py-4">
          <h2 className="text-2xl font-bold leading-tight text-white">
            {cheatSheet.title}
          </h2>
        </div>

        <div className="space-y-5 px-5 py-5">
          <section className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-4">
            <h3 className="text-base font-bold text-cyan-100">核心の公式</h3>
            <div className="mt-2 space-y-1">
              {cheatSheet.formulas.map((f) => (
                <p key={f} className="text-base font-bold leading-7 text-white">
                  {f}
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">3ステップ</h3>
            <div className="mt-2 space-y-2">
              {cheatSheet.steps.map((s) => (
                <div
                  key={s.no}
                  className="rounded-lg border border-white/10 bg-[#111827] p-3"
                >
                  <p className="text-base font-bold text-cyan-100">
                    {s.no} {s.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">72の法則 早見表</h3>
            <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-left text-base">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="px-4 py-2 font-bold">利回り</th>
                    <th className="px-4 py-2 font-bold">回収年数</th>
                  </tr>
                </thead>
                <tbody>
                  {cheatSheet.rateTable.map((row) => (
                    <tr
                      key={row.rate}
                      className="border-t border-white/10 text-slate-100"
                    >
                      <td className="px-4 py-2">{row.rate}</td>
                      <td className="px-4 py-2 font-bold">
                        {row.years}
                        {row.star ? (
                          <span className="ml-1 text-amber-200">★</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {cheatSheet.sections.map((sec) => (
            <section
              key={sec.heading}
              className="rounded-lg border border-white/10 bg-slate-900 p-4"
            >
              <h3 className="text-base font-bold text-white">{sec.heading}</h3>
              <ul className="mt-2 space-y-1">
                {sec.lines.map((line) => (
                  <li key={line} className="text-sm leading-6 text-slate-200">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-lg border border-amber-200/30 bg-amber-200/10 p-4">
            <p className="text-center text-base font-bold leading-7 text-amber-100">
              {cheatSheet.oneLiner}
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: ビルド確認**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 3: コミット**

```bash
git add src/components/CheatSheet.tsx
git commit -m "feat: add CheatSheet reference component"
```

---

## Task 6: App にタブ切替を追加する

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `CheatSheet`（`./components/CheatSheet`）、既存の `useProgress` / `ProblemCard` / `ProgressBar`。
- Produces: 画面上部に「ドリル / チート」タブ。`view` 状態は `useState<"drill" | "cheat">("drill")`。

- [ ] **Step 1: App.tsx を編集**

`src/App.tsx`:
1. import 追加:
```tsx
import { useState } from "react";
import { CheatSheet } from "./components/CheatSheet";
```
2. `function App()` 直下に状態追加:
```tsx
const [view, setView] = useState<"drill" | "cheat">("drill");
```
3. `return (` の直下、`<div className="min-h-screen ...">` の中の先頭（`<ProgressBar ...>` の前）にタブを挿入:
```tsx
<nav className="mx-auto flex max-w-xl gap-2 px-4 pt-4">
  <button
    type="button"
    onClick={() => setView("drill")}
    className={`min-h-11 flex-1 rounded-lg px-4 text-base font-bold transition ${
      view === "drill"
        ? "bg-cyan-200 text-slate-950"
        : "border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800"
    }`}
  >
    ドリル
  </button>
  <button
    type="button"
    onClick={() => setView("cheat")}
    className={`min-h-11 flex-1 rounded-lg px-4 text-base font-bold transition ${
      view === "cheat"
        ? "bg-cyan-200 text-slate-950"
        : "border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800"
    }`}
  >
    チート
  </button>
</nav>
```
4. 既存の `<ProgressBar ... />` と `<main>...</main>` を、ドリルビューのときだけ表示するよう条件分岐。チートビューのときは `<CheatSheet />` を表示:
```tsx
{view === "cheat" ? (
  <CheatSheet />
) : (
  <>
    <ProgressBar
      correctCount={correctCount}
      correctProblemIds={progress.correctProblemIds}
      currentProblemId={progress.currentProblemId}
      onSelectProblem={goToProblem}
      problems={problems}
    />
    <main>
      {/* 既存の isCompletionScreen / currentProblem / エラーの三分岐をそのまま中に入れる */}
    </main>
  </>
)}
```
（注: 既存の `<main>` 内のJSXは一切変えず、上記 `<main>` の中にそのまま移動するだけ。）

- [ ] **Step 2: 完了画面に72の法則を1行追記**

App.tsx 完了セクションの説明文:
```tsx
<p className="mt-3 text-base leading-7 text-slate-100">
  EV、株式価値、マルチプル、DCF、フェアネス判定の基礎を一周しました。
</p>
```
を以下に変更:
```tsx
<p className="mt-3 text-base leading-7 text-slate-100">
  EV、株式価値、マルチプル、DCF、フェアネス判定、そして「利回り＝FCF÷買収金額」「回収年数≈72÷利回り」の買収判断まで一周しました。
</p>
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 4: ローカルで目視確認（スクリーンショット）**

Run: `npm run dev`（バックグラウンド）し、`/ui-screenshot` 等で以下を自己確認:
- 「ドリル / チート」タブが表示され切り替わる
- チートタブに公式・3ステップ・早見表・商談の動き方・割引率・注意点・一行が出る
- ドリルで Lv.7〜10 が解け、判定・解説が出る
撮影画像が本当に fairvalue-drill か確認（base 付きURL `http://localhost:xxxx/fairvalue-drill/` を叩く／タイトル確認）。

- [ ] **Step 5: コミット**

```bash
git add src/App.tsx
git commit -m "feat: add ドリル/チート tab switcher and 72-rule line on completion"
```

---

## Task 7: AIメモリに買収判断フレームワークを保存する

**Files:**
- Create: `/Users/changju1109/.claude/projects/-Users-changju1109-AICompany/memory/project-ma-valuation-72-rule.md`
- Modify: `/Users/changju1109/.claude/projects/-Users-changju1109-AICompany/memory/MEMORY.md`（1行追記）

**Interfaces:** （AI長期メモリ。アプリのコードとは独立。）

- [ ] **Step 1: メモリファイルを作成**

Create `project-ma-valuation-72-rule.md`:
```markdown
---
name: project-ma-valuation-72-rule
description: 買収判断の瞬時計算フレームワーク（利回り＝FCF÷買収金額、72の法則、割引率比較、妥当買値＝FCF÷割引率）
metadata:
  type: reference
---

買収・ロールアップの一次スクリーニングで使う暗算フレームワーク。

- **利回り ＝ 年間FCF ÷ 買収金額**（売り手の言い値をFCFで割る＝全ての入口）
- **回収年数 ≈ 72 ÷ 利回り(%)**（72の法則。5%→14年, 10%→7年★, 2%→36年=論外）
- **判定**: 利回り ＞ 割引率 → 買い／利回り ＜ 割引率 → 高すぎる・交渉へ
- **妥当買値 ＝ 年間FCF ÷ 割引率**（割引率から逆算した交渉アンカー。例 FCF1,500万÷0.12＝1.25億）
- **割引率の目安**: リスク高い中小・非上場＝10〜15%要求／安全な大企業＝5〜7%
- 前提: 成長ゼロ・永続の近似。成長企業はもっと高評価可。最終判断は必ずExcel。

フェアバリューアプリ（fairvalue-drill）の Lv.7〜10 とチートタブで練習・参照できる。
M&A・ロールアップ戦略は [[project-ai-keiei-migite-rollup-bdash]] を参照。
```

- [ ] **Step 2: MEMORY.md に1行追記**

`MEMORY.md` の「## 事業戦略」または適切な節に追記:
```markdown
- **買収判断 瞬時計算フレームワーク**: 利回り＝FCF÷買収金額／回収年数≈72÷利回り／妥当買値＝FCF÷割引率。一次スクリーニングの暗算ワザ → [project-ma-valuation-72-rule.md](project-ma-valuation-72-rule.md)
```

- [ ] **Step 3: 確認**

Run: `ls -la "/Users/changju1109/.claude/projects/-Users-changju1109-AICompany/memory/project-ma-valuation-72-rule.md"`
Expected: ファイルが存在。
（メモリはリポジトリ外なので git コミット不要。）

---

## Task 8: GitHub Pages にデプロイする

**Files:** （コード変更なし。既設の deploy スクリプトを使う。）

**Interfaces:** Consumes: `package.json` の `deploy`（`gh-pages -d dist`）、`predeploy`（`npm run build`）。

- [ ] **Step 1: 全テスト・ビルドが通る最終確認**

Run: `npm test && npm run build`
Expected: 両方成功。

- [ ] **Step 2: デプロイ実行**

Run: `npm run deploy`
Expected: build → gh-pages ブランチへ push 成功（"Published" 表示）。
注: gh の認証が必要な場合は CEO に依頼する（丸投げせず手順を提示）。

- [ ] **Step 3: 公開URLで確認**

`https://cjosephkang-lab.github.io/fairvalue-drill/` を開き、ドリル/チートタブと Lv.7〜10 が反映されていることを確認（反映に数分かかる場合あり）。

- [ ] **Step 4: 作業ブランチをコミット（必要なら）**

```bash
git add -A
git commit -m "chore: deploy 72-rule cheatsheet to GitHub Pages" || echo "nothing to commit"
git push origin main
```

---

## Self-Review

**1. Spec coverage:**
- ドリル4問(Lv.7〜10) → Task 2 ✓
- チートタブ（読み物） → Task 4(データ)+Task 5(表示)+Task 6(タブ) ✓
- 履歴保存の土台化（storage.ts 動作不変） → Task 3 ✓
- AIメモリ保存 → Task 7 ✓
- GitHub Pages デプロイ（自分用） → Task 8 ✓
- スコープ外B/C → 各タスクに含めず（Global Constraints に明記） ✓
- テスト方針（checkAnswer / storage 回帰 / build / 目視） → Task 1(基盤)+2+3+6 ✓

**2. Placeholder scan:** コードは全タスクで実物を提示。TBD/TODO なし。Task 6 の `<main>` 内は「既存JSXをそのまま移動」と明示（重複転記を避けるため既存コードを指す。新規生成ではない）。

**3. Type consistency:**
- `StoredProgress` の形状は Task 3 で既存と一致（変更禁止を明記）。
- `loadProgress(problems)` / `saveProgress(progress)` / `clearProgress()` の名前は Task 3 Interfaces と useProgress 改修・storage.test で一致。
- `cheatSheet` の形状（formulas/steps/rateTable/sections/oneLiner）は Task 4 定義と Task 5 消費で一致。
- `view: "drill" | "cheat"` は Task 6 内で一貫。
