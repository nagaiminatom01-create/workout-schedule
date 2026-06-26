/** 打席結果 */
export type AtBatResult =
  | "single"
  | "double"
  | "triple"
  | "homeRun"
  | "walk"
  | "out"
  | "strikeout";

/** 出場形態 */
export type RoleType = "batter" | "pitcher" | "both";

/** 1試合分の投手成績 */
export interface PitchingStats {
  /** 完結した回数（整数） */
  innings: number;
  /** 追加アウト数（0〜2） */
  outs: number;
  hitsAllowed: number;
  walksAllowed: number;
  strikeouts: number;
  runsAllowed: number;
  earnedRuns: number;
}

/** 1試合分の打撃成績 */
export interface BattingStats {
  atBats: AtBatResult[];
  /** 打点（試合単位で入力） */
  rbi: number;
}

/** 保存する試合レコード */
export interface GameRecord {
  id: string;
  date: string;
  opponent: string;
  role: RoleType;
  batting?: BattingStats;
  pitching?: PitchingStats;
}

export const AT_BAT_RESULT_LABELS: Record<AtBatResult, string> = {
  single: "単打",
  double: "二塁打",
  triple: "三塁打",
  homeRun: "本塁打",
  walk: "四死球",
  out: "凡退",
  strikeout: "三振",
};

export const ROLE_LABELS: Record<RoleType, string> = {
  batter: "野手として出場",
  pitcher: "投手として出場",
  both: "両方（二刀流）",
};
