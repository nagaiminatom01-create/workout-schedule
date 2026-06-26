import type { AtBatResult, GameRecord, PitchingStats } from "./types";

/** 打撃通算の集計結果 */
export interface BattingTotals {
  games: number;
  plateAppearances: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  battingAverage: number | null;
  onBasePercentage: number | null;
}

/** 投手通算の集計結果 */
export interface PitchingTotals {
  games: number;
  /** 小数の通算投球回（例: 5.1 = 5回1/3） */
  inningsPitched: number;
  hitsAllowed: number;
  walksAllowed: number;
  strikeouts: number;
  earnedRuns: number;
  era: number | null;
  whip: number | null;
  /** 奪三振率（K/9） */
  k9: number | null;
}

/** グラフ用の1試合分データポイント */
export interface TrendPoint {
  id: string;
  label: string;
  value: number | null;
  displayValue: string;
}

const HIT_RESULTS: AtBatResult[] = ["single", "double", "triple", "homeRun"];

/** 打席結果が安打かどうか */
export function isHit(result: AtBatResult): boolean {
  return HIT_RESULTS.includes(result);
}

/** 打席結果が打数にカウントされるか（四死球は打数に含めない） */
export function countsAsAtBat(result: AtBatResult): boolean {
  return result !== "walk";
}

/**
 * 投球回を小数に変換する。
 * 野球では 1アウト = 1/3回、2アウト = 2/3回 として扱う。
 */
export function pitchingStatsToDecimalInnings(stats: Pick<PitchingStats, "innings" | "outs">): number {
  const safeOuts = Math.min(2, Math.max(0, stats.outs));
  return stats.innings + safeOuts / 3;
}

/**
 * 小数の投球回を「〇回 〇/3」形式の文字列に変換する。
 * 例: 5.333... → "5回 1/3"
 */
export function formatInningsPitched(decimalInnings: number): string {
  const whole = Math.floor(decimalInnings + 1e-9);
  const remainder = Math.round((decimalInnings - whole) * 3);
  if (remainder === 0) {
    return `${whole}回`;
  }
  return `${whole}回 ${remainder}/3`;
}

/** 率系スタッツ用の表示フォーマット（未算出時は "-"） */
export function formatRate(value: number | null, digits = 3): string {
  if (value === null) return "-";
  return value.toFixed(digits);
}

/**
 * 打率 = 安打数 ÷ 打数
 * 打数が0の場合は算出不可（null）
 */
export function calculateBattingAverage(hits: number, atBats: number): number | null {
  if (atBats === 0) return null;
  return hits / atBats;
}

/**
 * 出塁率 = (安打 + 四死球) ÷ (打数 + 四死球)
 * 分母が0の場合は算出不可（null）
 */
export function calculateOnBasePercentage(
  hits: number,
  walks: number,
  atBats: number,
): number | null {
  const denominator = atBats + walks;
  if (denominator === 0) return null;
  return (hits + walks) / denominator;
}

/**
 * 防御率 = (自責点 × 9) ÷ 通算投球回
 * 投球回が0の場合は算出不可（null）
 */
export function calculateERA(earnedRuns: number, inningsPitched: number): number | null {
  if (inningsPitched === 0) return null;
  return (earnedRuns * 9) / inningsPitched;
}

/**
 * WHIP = (被安打 + 与四死球) ÷ 通算投球回
 * 投球回が0の場合は算出不可（null）
 */
export function calculateWHIP(
  hitsAllowed: number,
  walksAllowed: number,
  inningsPitched: number,
): number | null {
  if (inningsPitched === 0) return null;
  return (hitsAllowed + walksAllowed) / inningsPitched;
}

/**
 * 奪三振率（K/9）= (奪三振 × 9) ÷ 通算投球回
 * 投球回が0の場合は算出不可（null）
 */
export function calculateK9(strikeouts: number, inningsPitched: number): number | null {
  if (inningsPitched === 0) return null;
  return (strikeouts * 9) / inningsPitched;
}

/** 1試合分の打撃成績（安打・打数）を集計する */
export function sumGameBatting(game: GameRecord): { hits: number; atBats: number } {
  let hits = 0;
  let atBats = 0;
  if (!game.batting) return { hits, atBats };

  for (const result of game.batting.atBats) {
    if (countsAsAtBat(result)) atBats += 1;
    if (isHit(result)) hits += 1;
  }
  return { hits, atBats };
}

/** 1試合の打率を算出する */
export function getGameBattingAverage(game: GameRecord): number | null {
  const { hits, atBats } = sumGameBatting(game);
  return calculateBattingAverage(hits, atBats);
}

/** 1試合の防御率を算出する */
export function getGameERA(game: GameRecord): number | null {
  if (!game.pitching) return null;
  const ip = pitchingStatsToDecimalInnings(game.pitching);
  return calculateERA(game.pitching.earnedRuns, ip);
}

/** 日付の短縮ラベル（MM/DD） */
function shortDateLabel(date: string): string {
  const [, m, d] = date.split("-");
  return m && d ? `${m}/${d}` : date;
}

/** 打撃成績のある試合を古い順に並べ、試合ごとの打率推移データを返す */
export function getBattingAverageTrend(games: GameRecord[]): TrendPoint[] {
  return games
    .filter((g) => g.batting)
    .slice()
    .reverse()
    .map((game) => {
      const avg = getGameBattingAverage(game);
      return {
        id: game.id,
        label: shortDateLabel(game.date),
        value: avg,
        displayValue: formatRate(avg),
      };
    });
}

/** 投手成績のある試合を古い順に並べ、試合ごとの防御率推移データを返す */
export function getERATrend(games: GameRecord[]): TrendPoint[] {
  return games
    .filter((g) => g.pitching)
    .slice()
    .reverse()
    .map((game) => {
      const era = getGameERA(game);
      return {
        id: game.id,
        label: shortDateLabel(game.date),
        value: era,
        displayValue: formatRate(era, 2),
      };
    });
}

/** 保存済み試合一覧から打撃通算成績を集計する */
export function aggregateBattingStats(games: GameRecord[]): BattingTotals {
  let gamesWithBatting = 0;
  let plateAppearances = 0;
  let atBats = 0;
  let hits = 0;
  let homeRuns = 0;
  let rbi = 0;
  let walks = 0;

  for (const game of games) {
    if (!game.batting) continue;

    gamesWithBatting += 1;
    rbi += game.batting.rbi;

    for (const result of game.batting.atBats) {
      plateAppearances += 1;
      if (countsAsAtBat(result)) {
        atBats += 1;
      }
      if (isHit(result)) {
        hits += 1;
      }
      if (result === "homeRun") {
        homeRuns += 1;
      }
      if (result === "walk") {
        walks += 1;
      }
    }
  }

  return {
    games: gamesWithBatting,
    plateAppearances,
    atBats,
    hits,
    homeRuns,
    rbi,
    walks,
    battingAverage: calculateBattingAverage(hits, atBats),
    onBasePercentage: calculateOnBasePercentage(hits, walks, atBats),
  };
}

/** 保存済み試合一覧から投手通算成績を集計する */
export function aggregatePitchingStats(games: GameRecord[]): PitchingTotals {
  let gamesWithPitching = 0;
  let inningsPitched = 0;
  let hitsAllowed = 0;
  let walksAllowed = 0;
  let strikeouts = 0;
  let earnedRuns = 0;

  for (const game of games) {
    if (!game.pitching) continue;

    gamesWithPitching += 1;
    inningsPitched += pitchingStatsToDecimalInnings(game.pitching);
    hitsAllowed += game.pitching.hitsAllowed;
    walksAllowed += game.pitching.walksAllowed;
    strikeouts += game.pitching.strikeouts;
    earnedRuns += game.pitching.earnedRuns;
  }

  return {
    games: gamesWithPitching,
    inningsPitched,
    hitsAllowed,
    walksAllowed,
    strikeouts,
    earnedRuns,
    era: calculateERA(earnedRuns, inningsPitched),
    whip: calculateWHIP(hitsAllowed, walksAllowed, inningsPitched),
    k9: calculateK9(strikeouts, inningsPitched),
  };
}
