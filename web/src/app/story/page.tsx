"use client";

import { useState } from "react";

// ── 型定義 ──────────────────────────────────────────
type Item = {
  id: string;
  name: string;
  emoji: string;
};

type ChoiceKind = "normal" | "instantDeath" | "confession" | "sing";

type Choice = {
  action: string;
  dialogue: string;
  pulseDelta?: number;
  pulseSetTo?: number;
  item?: Item;
  kind: ChoiceKind;
  nextStepId: string | null;
};

type StoryStep = {
  id: string;
  stage: number;
  title: string;
  text: string;
  choices: Choice[];
};

type GamePhase = "playing" | "success" | "failure" | "continue";

type PendingResult = {
  choice: Choice;
  newPulse: number;
  gainedItem: Item | null;
};

// ── ストーリーデータ（全4ステージ） ───────────────────
const STORY: Record<string, StoryStep> = {
  stage1: {
    id: "stage1",
    stage: 1,
    title: "始まりはクラスの飲み会",
    text: "すべてはクラスの飲み会から始まった。\nまさかの島田なつきさんの方から好意を寄せられ、北谷晃人の心は完全にメロメロに…！\n\nここで晃人が取るべき、次への完璧な一手は？",
    choices: [
      {
        action: "メロメロな気持ちを抑え、1週間後に男らしくサシ飲みに誘う",
        dialogue: "あきとくん、誘ってくれてありがとう！待ってたよ！",
        pulseDelta: 25,
        item: { id: "promise", name: "1週間後の約束", emoji: "📅" },
        kind: "normal",
        nextStepId: "stage2",
      },
      {
        action: "嬉しすぎてその場でB'zの『ultra soul』を熱唱して荒ぶる",
        dialogue: "あきとくん面白い人だなあ笑！ウルトラソウル最高！",
        pulseDelta: 10,
        kind: "normal",
        nextStepId: "stage2",
      },
      {
        action:
          "照れ隠しで急にクールぶって、平成ヘアーをいじりながらスルーする",
        dialogue: "あれ、あんまり話したくなかったのかな…？（勘違いだったかも）",
        pulseDelta: -15,
        kind: "normal",
        nextStepId: "stage2",
      },
    ],
  },
  stage2: {
    id: "stage2",
    stage: 2,
    title: "運命のサシ飲み、2件目の攻防戦",
    text: "サシ飲み当日。1件目で大盛り上がりし、2件目のBarへ。\nいい雰囲気になった晃人は、男としての勝負（ホテルの提案）に出るが…！？",
    choices: [
      {
        action: "「このあと、ホテル行かない？」とストレートに提案する",
        dialogue: "うーん、まだ2件目だし…3件目以降ならいいよ❤️（焦らし）",
        pulseDelta: 20,
        kind: "normal",
        nextStepId: "stage3",
      },
      {
        action:
          "チキってGLAYの『HOWEVER』の歌詞みたいに「言葉では言えない」と黙り込む",
        dialogue: "急に黙ってどうしたの？笑。なんかシリアスだね…",
        pulseDelta: 5,
        kind: "normal",
        nextStepId: "stage3",
      },
      {
        action: "緊張のあまり、北谷の実家の話を延々とし始めて朝を迎える",
        dialogue:
          "あきとくんの実家の話おもしろかった！けどもう朝だし眠いから帰るね…",
        pulseSetTo: 0,
        kind: "instantDeath",
        nextStepId: null,
      },
    ],
  },
  stage3: {
    id: "stage3",
    stage: 3,
    title: "3件目を経て、ついに…",
    text: "なつきさんの言葉通り、きっちり3件目を回った二人。\nそしてついにホテルへ……！",
    choices: [
      {
        action: "男・北谷晃人、なつきさんの期待に応えて「しっかりする」！！！",
        dialogue: "あきとくん、すっごくかっこよかったよ…❤️",
        pulseDelta: 35,
        item: { id: "memory", name: "しっかりした思い出", emoji: "✨" },
        kind: "normal",
        nextStepId: "stage4",
      },
      {
        action: "ホテルに着いた瞬間、緊張と安心感でベッドで爆睡する",
        dialogue: "え、着いた瞬間寝ちゃうんかい！笑",
        pulseDelta: -20,
        kind: "normal",
        nextStepId: "stage4",
      },
    ],
  },
  stage4: {
    id: "stage4",
    stage: 4,
    title: "北谷の夜風と、Janne Da Arcの奇跡",
    text: "その後、晃人の地元・北谷の静かな海辺へ。\nなつきさんが「そういえば晃人くん、1回目の飲みの時にJanne Da Arc好きって言ってたよねー？」と笑顔で聞いてきた。\n\n最初の飲み会の何気ない一言を覚えていてくれた健気さに、晃人は完全にノックアウト。運命の告白タイム！",
    choices: [
      {
        action:
          "なつきの手を握り、「覚えててくれたんだ…そんな健気ななつきが本当に好きさあ。俺の彼女になってほしい」と真っ直ぐ告白する",
        dialogue: "うん！私もあきとくんが好き。よろしくね！",
        pulseDelta: 40,
        kind: "confession",
        nextStepId: null,
      },
      {
        action:
          "嬉しすぎてJanne Da Arcの『月光花』のサビを夜の海に向かって熱唱する",
        dialogue: "ちょっと！歌ってごまかさないでよ〜！笑",
        pulseDelta: 15,
        kind: "sing",
        nextStepId: null,
      },
    ],
  },
};

const INITIAL_PULSE = 50;
const START_STEP = "stage1";

// ── 脈あり度計算 ────────────────────────────────────
function clampPulse(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function resolvePulse(
  choice: Choice,
  current: number,
  stepId: string,
): number {
  let next =
    choice.pulseSetTo !== undefined
      ? choice.pulseSetTo
      : current + (choice.pulseDelta ?? 0);

  // ステージ1〜3は99%上限。100%はステージ4の告白成功でのみ到達
  if (stepId !== "stage4" && next >= 100) {
    next = 99;
  }

  return clampPulse(next);
}

function buildEffectText(
  choice: Choice,
  before: number,
  after: number,
): string {
  if (choice.kind === "instantDeath") {
    return "脈あり度 0%（即ゲームオーバー）";
  }
  const delta = choice.pulseDelta ?? 0;
  const sign = delta > 0 ? "+" : "";
  let text = `脈あり度 ${sign}${delta}（${before}% → ${after}%）`;
  if (choice.kind === "confession" && after >= 100) {
    text += " ➡️ 100%到達！";
  }
  if (choice.kind === "sing") {
    text += " ➡️ 100%未満";
  }
  return text;
}

// ── メインコンポーネント ──────────────────────────────
export default function StoryPage() {
  const [pulse, setPulse] = useState(INITIAL_PULSE);
  const [currentStepId, setCurrentStepId] = useState(START_STEP);
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [pending, setPending] = useState<PendingResult | null>(null);

  const currentStep = STORY[currentStepId];

  const handleChoice = (choice: Choice) => {
    const newPulse = resolvePulse(choice, pulse, currentStepId);
    const gainedItem =
      choice.item && !items.some((i) => i.id === choice.item!.id)
        ? choice.item
        : null;
    setPending({ choice, newPulse, gainedItem });
  };

  const handleNext = () => {
    if (!pending) return;

    const { choice, newPulse, gainedItem } = pending;
    setPulse(newPulse);
    if (gainedItem) setItems((prev) => [...prev, gainedItem]);
    setPending(null);

    if (newPulse <= 0) {
      setPhase("failure");
      return;
    }

    if (currentStepId === "stage4") {
      setPhase(
        choice.kind === "confession" && newPulse >= 100 ? "success" : "continue",
      );
      return;
    }

    if (choice.nextStepId) {
      setCurrentStepId(choice.nextStepId);
    }
  };

  const handleRestart = () => {
    setPulse(INITIAL_PULSE);
    setCurrentStepId(START_STEP);
    setItems([]);
    setPhase("playing");
    setPending(null);
  };

  const pulseBarColor =
    pulse >= 70
      ? "from-rose-400 to-pink-500"
      : pulse >= 40
        ? "from-pink-300 to-rose-400"
        : "from-slate-300 to-rose-300";

  // ── エンディング ──
  if (phase === "success") {
    return (
      <EndingScreen
        theme="success"
        title="ハッピーエンド！"
        message="おめでとう！なつきさんの好意から始まり、3件目の約束を経て、Janne Da Arcの伏線回収で見事ゴールイン！現実でも早く付き合っちゃえ！"
        pulse={pulse}
        items={items}
        restartLabel="もう一度物語を楽しむ"
        onRestart={handleRestart}
      />
    );
  }

  if (phase === "failure") {
    return (
      <EndingScreen
        theme="failure"
        title="ゲームオーバー"
        message="友達止まり…頭の中でB'zの『LOVE PHANTOM』が切なく流れています（幻の命が弾けた…）。"
        pulse={pulse}
        items={items}
        restartLabel="1回目の飲み会からやり直す"
        onRestart={handleRestart}
      />
    );
  }

  if (phase === "continue") {
    return (
      <EndingScreen
        theme="continue"
        title="惜しいエンド…"
        message="あと一歩！なつきちゃんは告白を待っています！全問正解のルートを見つけて、もう一度北谷の風を起こそう！"
        pulse={pulse}
        items={items}
        restartLabel="リトライ"
        onRestart={handleRestart}
      />
    );
  }

  // ── ゲーム画面 ──
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* ヘッダー */}
        <header className="mb-6 text-center">
          <p className="mb-1 flex items-center justify-center gap-1 text-xs tracking-widest text-rose-400 uppercase">
            <span aria-hidden>💗</span> Love Story Game
          </p>
          <h1 className="text-2xl font-bold text-rose-700">
            北谷晃人 × 島田なつき
          </h1>
          <p className="mt-1 text-xs text-rose-400">完全実話フルコンプリート版</p>
        </header>

        {/* 脈あり度ゲージ */}
        <section className="mb-4 rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
              <span aria-hidden>💗</span> 脈あり度
            </span>
            <span className="text-xl font-bold text-rose-600">{pulse}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-rose-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${pulseBarColor} transition-all duration-700 ease-out`}
              style={{ width: `${pulse}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-rose-400">
            💕 100%でハッピーエンド / 💔 0%で即ゲームオーバー
          </p>
        </section>

        {/* コレクション */}
        <section className="mb-4 rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-rose-600">
            <span aria-hidden>🎁</span> コレクション
          </h2>
          {items.length === 0 ? (
            <p className="text-center text-xs text-rose-300">
              まだアイテムがありません
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ストーリー */}
        <section className="mb-4 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-500">
              STAGE {currentStep.stage}
            </span>
            <span className="text-xs font-medium text-rose-400">
              {currentStep.title}
            </span>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-rose-900">
            {currentStep.text}
          </p>
        </section>

        {/* 選択肢 */}
        <section className="flex flex-col gap-3">
          {currentStep.choices.map((choice, i) => (
            <button
              key={i}
              type="button"
              disabled={!!pending}
              onClick={() => handleChoice(choice)}
              className="rounded-2xl border border-rose-200 bg-white px-5 py-4 text-left text-sm text-rose-800 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <span className="mr-2 font-bold text-rose-400">
                {String.fromCharCode(65 + i)}.
              </span>
              {choice.action}
            </button>
          ))}
        </section>
      </div>

      {/* リアクションダイアログ */}
      {pending && (
        <ReactionDialog
          action={pending.choice.action}
          dialogue={pending.choice.dialogue}
          effectText={buildEffectText(pending.choice, pulse, pending.newPulse)}
          gainedItem={pending.gainedItem}
          isGameOver={pending.newPulse <= 0}
          isHappyEnd={
            pending.choice.kind === "confession" && pending.newPulse >= 100
          }
          isCloseEnd={
            currentStepId === "stage4" &&
            !(pending.choice.kind === "confession" && pending.newPulse >= 100)
          }
          onNext={handleNext}
        />
      )}
    </main>
  );
}

// ── リアクションダイアログ ────────────────────────────
function ReactionDialog({
  action,
  dialogue,
  effectText,
  gainedItem,
  isGameOver,
  isHappyEnd,
  isCloseEnd,
  onNext,
}: {
  action: string;
  dialogue: string;
  effectText: string;
  gainedItem: Item | null;
  isGameOver: boolean;
  isHappyEnd: boolean;
  isCloseEnd: boolean;
  onNext: () => void;
}) {
  const nextLabel = isGameOver
    ? "……（ゲームオーバー）"
    : isHappyEnd
      ? "ハッピーエンドへ！"
      : isCloseEnd
        ? "惜しいエンドへ…"
        : "次へ";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="なつきのリアクション"
        className="w-full max-w-lg animate-[fadeUp_0.3s_ease-out] rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl"
      >
        {/* 晃人の行動 */}
        <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-slate-400">
            💙 晃人の行動
          </p>
          <p className="text-sm leading-relaxed text-slate-700">{action}</p>
        </div>

        {/* なつきのセリフ */}
        <div className="mb-4 flex gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-lg"
            aria-hidden
          >
            🌸
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold text-rose-500">
              💬 なつき
            </p>
            <p className="text-sm leading-relaxed text-rose-800">
              「{dialogue}」
            </p>
          </div>
        </div>

        {/* 効果 */}
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-center text-xs font-medium ${
            isGameOver
              ? "bg-slate-800 text-rose-200"
              : isHappyEnd
                ? "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700"
                : "bg-rose-100/70 text-rose-600"
          }`}
        >
          <p>{effectText}</p>
          {gainedItem && (
            <p className="mt-1.5">
              {gainedItem.emoji} アイテム「{gainedItem.name}」獲得！
            </p>
          )}
          {isHappyEnd && (
            <p className="mt-1.5 font-bold">➡️ ハッピーエンドへ！</p>
          )}
          {isCloseEnd && !isGameOver && (
            <p className="mt-1.5">➡️ 100%未満のため惜しいエンドへ</p>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          className={`w-full rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-95 ${
            isGameOver
              ? "bg-slate-700 hover:bg-slate-800"
              : "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

// ── エンディング画面 ──────────────────────────────────
function EndingScreen({
  theme,
  title,
  message,
  pulse,
  items,
  restartLabel,
  onRestart,
}: {
  theme: "success" | "failure" | "continue";
  title: string;
  message: string;
  pulse: number;
  items: Item[];
  restartLabel: string;
  onRestart: () => void;
}) {
  if (theme === "success") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-200 via-pink-100 to-rose-50 px-4 py-10">
        <HeartRain />
        <div className="relative z-10 w-full max-w-lg rounded-3xl border border-rose-200 bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
          <p className="mb-2 text-6xl" aria-hidden>
            💕
          </p>
          <div className="mb-4 flex justify-center gap-2 text-2xl" aria-hidden>
            <span className="animate-bounce">💖</span>
            <span className="animate-bounce [animation-delay:150ms]">💗</span>
            <span className="animate-bounce [animation-delay:300ms]">💕</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-rose-600">{title}</h2>
          <p className="mb-6 text-base leading-relaxed font-medium text-rose-800">
            {message}
          </p>
          <EndingStats pulse={pulse} items={items} />
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:from-rose-500 hover:to-pink-600 active:scale-95"
          >
            {restartLabel}
          </button>
        </div>
      </main>
    );
  }

  if (theme === "failure") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/95 p-8 text-center shadow-2xl">
          <p className="mb-4 text-5xl" aria-hidden>
            🎵
          </p>
          <h2 className="mb-4 text-2xl font-bold text-slate-300">{title}</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            {message}
          </p>
          <EndingStats pulse={pulse} items={items} dark />
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl border border-slate-600 bg-slate-800 px-8 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700 active:scale-95"
          >
            {restartLabel}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-rose-50 to-white px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-indigo-100 bg-white/90 p-8 text-center shadow-lg backdrop-blur">
        <p className="mb-4 text-5xl" aria-hidden>
          🌙
        </p>
        <h2 className="mb-4 text-2xl font-bold text-indigo-500">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-rose-800">{message}</p>
        <EndingStats pulse={pulse} items={items} />
        <button
          type="button"
          onClick={onRestart}
          className="rounded-2xl bg-gradient-to-r from-indigo-400 to-rose-400 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:from-indigo-500 hover:to-rose-500 active:scale-95"
        >
          {restartLabel}
        </button>
      </div>
    </main>
  );
}

function EndingStats({
  pulse,
  items,
  dark = false,
}: {
  pulse: number;
  items: Item[];
  dark?: boolean;
}) {
  return (
    <>
      <div
        className={`mb-4 rounded-xl px-4 py-3 ${dark ? "bg-slate-800" : "bg-rose-50"}`}
      >
        <p className={`text-xs ${dark ? "text-slate-500" : "text-rose-400"}`}>
          最終脈あり度
        </p>
        <p
          className={`text-2xl font-bold ${dark ? "text-rose-400" : "text-rose-600"}`}
        >
          {pulse}%
        </p>
      </div>
      {items.length > 0 && (
        <div className="mb-6">
          <p
            className={`mb-2 text-xs ${dark ? "text-slate-500" : "text-rose-400"}`}
          >
            獲得アイテム
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`rounded-full border px-3 py-1 text-xs ${
                  dark
                    ? "border-slate-600 bg-slate-800 text-slate-300"
                    : "border-rose-200 bg-white text-rose-700"
                }`}
              >
                {item.emoji} {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function HeartRain() {
  const hearts = ["💕", "💖", "💗", "💓", "💘", "❤️"];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-[fall_4s_linear_infinite] text-xl opacity-60"
          style={{
            left: `${(i * 17 + 5) % 95}%`,
            animationDelay: `${(i * 0.55) % 4}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        >
          {hearts[i % hearts.length]}
        </span>
      ))}
    </div>
  );
}
