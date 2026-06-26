import { useState } from "react";
import { DataManagement } from "@/components/DataManagement";
import { TrendChart } from "@/components/TrendChart";
import type { GameRecord } from "@/lib/types";
import { AT_BAT_RESULT_LABELS, ROLE_LABELS } from "@/lib/types";
import {
  aggregateBattingStats,
  aggregatePitchingStats,
  formatInningsPitched,
  formatRate,
  getBattingAverageTrend,
  getERATrend,
  pitchingStatsToDecimalInnings,
} from "@/lib/stats";
import type { BattingTotals, PitchingTotals } from "@/lib/stats";

interface DashboardProps {
  games: GameRecord[];
  onEdit: (game: GameRecord) => void;
  onDelete: (id: string) => void;
  onAddSampleData?: () => void;
  onReset: () => void;
  onImport: (jsonText: string) => number;
}

type DashboardTab = "batting" | "pitching" | "games";

const TABS: { id: DashboardTab; label: string }[] = [
  { id: "batting", label: "打撃通算" },
  { id: "pitching", label: "投手通算" },
  { id: "games", label: "試合一覧" },
];

export function Dashboard({
  games,
  onEdit,
  onDelete,
  onAddSampleData,
  onReset,
  onImport,
}: DashboardProps) {
  const [tab, setTab] = useState<DashboardTab>("batting");
  const batting = aggregateBattingStats(games);
  const pitching = aggregatePitchingStats(games);
  const battingTrend = getBattingAverageTrend(games);
  const eraTrend = getERATrend(games);

  function handleDelete(id: string) {
    if (!window.confirm("この試合の成績を削除しますか？")) return;
    onDelete(id);
  }

  return (
    <div className="space-y-6">
      {/* タブナビ */}
      <nav className="relative flex rounded-xl border border-slate-700/60 bg-slate-900/80 p-1">
        {TABS.map(({ id, label }) => (
          <TabButton
            key={id}
            active={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </TabButton>
        ))}
        <span
          className="pointer-events-none absolute bottom-1 top-1 rounded-lg bg-gradient-to-r from-emerald-600/90 to-teal-600/90 shadow-lg shadow-emerald-900/40 transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / TABS.length}% - 4px)`,
            left: `calc(${(TABS.findIndex((t) => t.id === tab) * 100) / TABS.length}% + 2px)`,
          }}
        />
      </nav>

      {tab === "batting" && (
        <>
          {batting.games === 0 ? (
            <EmptyCard message="打撃成績の記録がまだありません。" />
          ) : (
            <BattingProfileCard totals={batting} />
          )}
          <TrendChart
            title="試合ごとの打率推移"
            unit="打率 (AVG)"
            points={battingTrend}
            valueRange={{ min: 0, max: 1 }}
            emptyMessage="打率推移を表示する試合がありません"
          />
        </>
      )}

      {tab === "pitching" && (
        <>
          {pitching.games === 0 ? (
            <EmptyCard message="投手成績の記録がまだありません。" />
          ) : (
            <PitchingProfileCard totals={pitching} />
          )}
          <TrendChart
            title="試合ごとの防御率推移"
            unit="防御率 (ERA)"
            points={eraTrend}
            lowerIsBetter
            emptyMessage="防御率推移を表示する試合がありません"
          />
        </>
      )}

      {tab === "games" && (
        <section className="overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 shadow-xl">
          <div className="border-b border-slate-700/50 bg-slate-800/40 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-bold tracking-tight text-white">保存済み試合</h2>
            <p className="mt-0.5 text-xs text-zinc-500">{games.length} 試合</p>
          </div>
          <div className="p-5 sm:p-6">
            {games.length === 0 ? (
              <EmptyState message="保存された試合はありません。" />
            ) : (
              <ul className="space-y-3">
                {games.map((game) => (
                  <li
                    key={game.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-700/40 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {game.date}{" "}
                        <span className="font-normal text-zinc-500">vs</span>{" "}
                        {game.opponent}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-400/80">
                        {ROLE_LABELS[game.role]}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {game.batting && (
                          <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-300/90">
                            打席 {game.batting.atBats.length}　打点 {game.batting.rbi}
                          </span>
                        )}
                        {game.pitching && (
                          <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300">
                            {formatInningsPitched(
                              pitchingStatsToDecimalInnings(game.pitching),
                            )}{" "}
                            被安打 {game.pitching.hitsAllowed}　K{" "}
                            {game.pitching.strikeouts}
                          </span>
                        )}
                      </div>
                      {game.batting && (
                        <p className="mt-1.5 text-xs text-zinc-600">
                          {game.batting.atBats
                            .map((ab) => AT_BAT_RESULT_LABELS[ab])
                            .join(" → ")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => onEdit(game)}
                        className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-4 py-2 text-sm text-emerald-300 transition hover:border-emerald-700 hover:bg-emerald-950/50"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(game.id)}
                        className="rounded-lg border border-slate-600/50 px-4 py-2 text-sm text-zinc-400 transition hover:border-red-800/60 hover:bg-red-950/30 hover:text-red-400"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {onAddSampleData && (
        <div className="border-t border-zinc-800/60 pt-4">
          <button
            type="button"
            onClick={onAddSampleData}
            className="w-full rounded-lg border border-dashed border-zinc-700 px-4 py-2.5 text-xs text-zinc-600 transition hover:border-zinc-600 hover:text-zinc-400"
          >
            サンプルデータを追加（開発用）
          </button>
        </div>
      )}

      <DataManagement games={games} onReset={onReset} onImport={onImport} />
    </div>
  );
}

function BattingProfileCard({ totals }: { totals: BattingTotals }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-emerald-800/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 shadow-2xl shadow-emerald-950/20">
      <header className="border-b border-emerald-800/20 bg-gradient-to-r from-emerald-900/30 to-transparent px-5 py-4 sm:px-6">
        <p className="text-[10px] font-bold tracking-[0.25em] text-emerald-400/70 uppercase">
          Career Batting
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">通算打撃成績</h2>
      </header>

      {/* ヒーロースタッツ */}
      <div className="grid grid-cols-3 divide-x divide-emerald-800/20 border-b border-emerald-800/20">
        <HeroStat label="打率" value={formatRate(totals.battingAverage)} accent />
        <HeroStat label="本塁打" value={String(totals.homeRuns)} accent />
        <HeroStat label="打点" value={String(totals.rbi)} accent />
      </div>

      {/* サブスタッツ */}
      <div className="grid grid-cols-2 gap-px bg-emerald-900/10 sm:grid-cols-3">
        <SubStat label="試合" value={String(totals.games)} />
        <SubStat label="打席" value={String(totals.plateAppearances)} />
        <SubStat label="打数" value={String(totals.atBats)} />
        <SubStat label="安打" value={String(totals.hits)} />
        <SubStat label="四死球" value={String(totals.walks)} />
        <SubStat label="出塁率" value={formatRate(totals.onBasePercentage)} />
      </div>
    </article>
  );
}

function PitchingProfileCard({ totals }: { totals: PitchingTotals }) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-slate-600/40 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-950 shadow-2xl shadow-slate-950/40">
      <header className="border-b border-slate-600/30 bg-gradient-to-r from-indigo-900/25 to-transparent px-5 py-4 sm:px-6">
        <p className="text-[10px] font-bold tracking-[0.25em] text-indigo-300/60 uppercase">
          Career Pitching
        </p>
        <h2 className="mt-1 text-xl font-bold text-white">通算投手成績</h2>
      </header>

      <div className="grid grid-cols-3 divide-x divide-slate-600/25 border-b border-slate-600/25">
        <HeroStat label="防御率" value={formatRate(totals.era, 2)} accent="indigo" />
        <HeroStat label="WHIP" value={formatRate(totals.whip, 2)} accent="indigo" />
        <HeroStat
          label="奪三振率"
          value={formatRate(totals.k9, 2)}
          accent="indigo"
          subLabel="K/9"
        />
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-800/20 sm:grid-cols-3">
        <SubStat label="登板" value={String(totals.games)} />
        <SubStat label="投球回" value={formatInningsPitched(totals.inningsPitched)} />
        <SubStat label="被安打" value={String(totals.hitsAllowed)} />
        <SubStat label="与四死" value={String(totals.walksAllowed)} />
        <SubStat label="奪三振" value={String(totals.strikeouts)} />
        <SubStat label="自責点" value={String(totals.earnedRuns)} />
      </div>
    </article>
  );
}

function HeroStat({
  label,
  value,
  accent = "emerald",
  subLabel,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "indigo";
  subLabel?: string;
}) {
  const valueColor =
    accent === "indigo" ? "text-indigo-200" : "text-emerald-300";

  return (
    <div className="flex flex-col items-center justify-center px-2 py-5 sm:py-6">
      <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
        {label}
        {subLabel && (
          <span className="ml-1 text-[9px] normal-case text-zinc-600">({subLabel})</span>
        )}
      </p>
      <p className={`mt-1 text-3xl font-black tabular-nums sm:text-4xl ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/40 px-4 py-3.5">
      <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-200">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-10 flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors duration-200 ${
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-12 text-center">
      <p className="text-zinc-500">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-zinc-500">{message}</p>;
}
