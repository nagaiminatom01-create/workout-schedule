import { useState } from "react";
import type {
  AtBatResult,
  GameRecord,
  PitchingStats,
  RoleType,
} from "@/lib/types";
import { AT_BAT_RESULT_LABELS, ROLE_LABELS } from "@/lib/types";

interface GameFormProps {
  editingGame?: GameRecord | null;
  onSave: (game: GameRecord) => void;
  onUpdate: (game: GameRecord) => void;
  onCancelEdit?: () => void;
}

const AT_BAT_OPTIONS = Object.keys(AT_BAT_RESULT_LABELS) as AtBatResult[];

const EMPTY_PITCHING: PitchingStats = {
  innings: 0,
  outs: 0,
  hitsAllowed: 0,
  walksAllowed: 0,
  strikeouts: 0,
  runsAllowed: 0,
  earnedRuns: 0,
};

/** ローカルタイムゾーン基準の当日 YYYY-MM-DD */
function getTodayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function GameForm({
  editingGame = null,
  onSave,
  onUpdate,
  onCancelEdit,
}: GameFormProps) {
  const isEditing = editingGame !== null;

  const [date, setDate] = useState(() => editingGame?.date ?? getTodayLocalDate());
  const [opponent, setOpponent] = useState(() => editingGame?.opponent ?? "");
  const [role, setRole] = useState<RoleType>(() => editingGame?.role ?? "batter");
  const [atBats, setAtBats] = useState<AtBatResult[]>(() =>
    editingGame?.batting?.atBats.length
      ? [...editingGame.batting.atBats]
      : ["out"],
  );
  const [rbi, setRbi] = useState(() => editingGame?.batting?.rbi ?? 0);
  const [pitching, setPitching] = useState<PitchingStats>(() =>
    editingGame?.pitching ? { ...editingGame.pitching } : { ...EMPTY_PITCHING },
  );
  const [message, setMessage] = useState<string | null>(null);

  const showBatting = role === "batter" || role === "both";
  const showPitching = role === "pitcher" || role === "both";

  function addAtBat() {
    setAtBats((prev) => [...prev, "out"]);
  }

  function removeAtBat(index: number) {
    setAtBats((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAtBat(index: number, result: AtBatResult) {
    setAtBats((prev) => prev.map((ab, i) => (i === index ? result : ab)));
  }

  function updatePitching<K extends keyof PitchingStats>(key: K, value: PitchingStats[K]) {
    setPitching((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setDate(getTodayLocalDate());
    setOpponent("");
    setRole("batter");
    setAtBats(["out"]);
    setRbi(0);
    setPitching(EMPTY_PITCHING);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!opponent.trim()) {
      setMessage("対戦相手を入力してください。");
      return;
    }

    if (showBatting && atBats.length === 0) {
      setMessage("打席結果を1つ以上追加してください。");
      return;
    }

    if (showPitching) {
      const totalOuts = pitching.innings * 3 + pitching.outs;
      if (totalOuts === 0) {
        setMessage("投球回数を入力してください。");
        return;
      }
      if (pitching.outs < 0 || pitching.outs > 2) {
        setMessage("アウトカウントは0〜2の範囲で入力してください。");
        return;
      }
    }

    const game: GameRecord = {
      id: isEditing ? editingGame.id : crypto.randomUUID(),
      date,
      opponent: opponent.trim(),
      role,
      ...(showBatting && { batting: { atBats, rbi } }),
      ...(showPitching && { pitching }),
    };

    if (isEditing) {
      onUpdate(game);
      setMessage("試合を更新しました。");
    } else {
      onSave(game);
      resetForm();
      setMessage("試合を保存しました。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isEditing && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-800/40 bg-blue-950/30 px-4 py-3">
          <p className="text-sm text-blue-200">
            編集中: {editingGame.date} vs {editingGame.opponent}
          </p>
          {onCancelEdit && (
            <button
              type="button"
              onClick={() => {
                onCancelEdit();
                setMessage(null);
              }}
              className="shrink-0 text-sm text-zinc-400 transition hover:text-zinc-200"
            >
              編集をキャンセル
            </button>
          )}
        </div>
      )}
      {/* 基本情報 */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">試合の基本情報</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">日付</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-500"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">対戦相手</span>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="例: ○○中学校"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-500"
            />
          </label>
        </div>
      </section>

      {/* 出場形態 */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">出場形態</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {(Object.keys(ROLE_LABELS) as RoleType[]).map((key) => (
            <label
              key={key}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm transition sm:text-left ${
                role === key
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={key}
                checked={role === key}
                onChange={() => setRole(key)}
                className="sr-only"
              />
              {ROLE_LABELS[key]}
            </label>
          ))}
        </div>
      </section>

      {/* 打撃成績 */}
      {showBatting && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">打撃成績</h2>
            <button
              type="button"
              onClick={addAtBat}
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 active:scale-95"
            >
              ＋ 打席を追加
            </button>
          </div>

          <div className="space-y-4">
            {atBats.map((result, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300">
                    {index + 1}打席目
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAtBat(index)}
                    disabled={atBats.length <= 1}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-red-950/50 hover:text-red-400 disabled:opacity-30"
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AT_BAT_OPTIONS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateAtBat(index, key)}
                      className={`min-h-12 rounded-xl px-2 py-3 text-sm font-medium transition active:scale-95 ${
                        result === key
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {AT_BAT_RESULT_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm text-zinc-400">打点</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={rbi}
              onChange={(e) => setRbi(Number(e.target.value))}
              className="w-full max-w-[8rem] rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-500"
            />
          </label>
        </section>
      )}

      {/* 投手成績 */}
      {showPitching && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">投手成績</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-400">投球回（回）</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={pitching.innings}
                onChange={(e) => updatePitching("innings", Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-500"
              />
            </label>

            <div className="block">
              <span className="mb-1.5 block text-sm text-zinc-400">アウトカウント</span>
              <div className="flex rounded-xl border border-zinc-700 bg-zinc-950 p-1">
                {([0, 1, 2] as const).map((out) => (
                  <button
                    key={out}
                    type="button"
                    onClick={() => updatePitching("outs", out)}
                    className={`flex-1 rounded-lg py-3 text-base font-medium transition active:scale-95 ${
                      pitching.outs === out
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {out}
                  </button>
                ))}
              </div>
            </div>

            <NumberField
              label="被安打"
              value={pitching.hitsAllowed}
              onChange={(v) => updatePitching("hitsAllowed", v)}
            />
            <NumberField
              label="与四死球"
              value={pitching.walksAllowed}
              onChange={(v) => updatePitching("walksAllowed", v)}
            />
            <NumberField
              label="奪三振"
              value={pitching.strikeouts}
              onChange={(v) => updatePitching("strikeouts", v)}
            />
            <NumberField
              label="失点"
              value={pitching.runsAllowed}
              onChange={(v) => updatePitching("runsAllowed", v)}
            />
            <NumberField
              label="自責点"
              value={pitching.earnedRuns}
              onChange={(v) => updatePitching("earnedRuns", v)}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            例: 5回 と 1アウト → 5回1/3 として記録されます
          </p>
        </section>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.includes("保存") || message.includes("更新")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-500 py-4 text-base font-bold text-zinc-900 transition hover:bg-emerald-400 active:scale-[0.98]"
      >
        {isEditing ? "試合を更新" : "試合を保存"}
      </button>
    </form>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-400">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-base text-white outline-none focus:border-emerald-500"
      />
    </label>
  );
}
