import type { GameRecord } from "./types";

/** ローカルタイムゾーン基準の YYYY-MM-DD */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 動作確認用の3試合分サンプルデータ */
export function createSampleGames(): GameRecord[] {
  return [
    {
      id: crypto.randomUUID(),
      date: daysAgo(2),
      opponent: "青葉中学校",
      role: "batter",
      batting: {
        atBats: ["single", "single", "homeRun", "strikeout"],
        rbi: 3,
      },
    },
    {
      id: crypto.randomUUID(),
      date: daysAgo(1),
      opponent: "緑丘高校",
      role: "pitcher",
      pitching: {
        innings: 5,
        outs: 1,
        hitsAllowed: 3,
        walksAllowed: 2,
        strikeouts: 5,
        runsAllowed: 1,
        earnedRuns: 1,
      },
    },
    {
      id: crypto.randomUUID(),
      date: daysAgo(0),
      opponent: "城南クラブ",
      role: "both",
      batting: {
        atBats: ["double", "walk", "out"],
        rbi: 0,
      },
      pitching: {
        innings: 2,
        outs: 0,
        hitsAllowed: 4,
        walksAllowed: 3,
        strikeouts: 1,
        runsAllowed: 4,
        earnedRuns: 4,
      },
    },
  ];
}
