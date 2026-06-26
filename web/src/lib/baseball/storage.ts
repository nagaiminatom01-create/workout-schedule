import type { AtBatResult, GameRecord, RoleType } from "./types";

export const STORAGE_KEY = "baseball-stats-games";

export function loadGames(): GameRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGames(games: GameRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function addGame(games: GameRecord[], game: GameRecord): GameRecord[] {
  const next = [game, ...games];
  saveGames(next);
  return next;
}

export function updateGame(games: GameRecord[], updated: GameRecord): GameRecord[] {
  const next = games.map((g) => (g.id === updated.id ? updated : g));
  saveGames(next);
  return next;
}

export function removeGame(games: GameRecord[], id: string): GameRecord[] {
  const next = games.filter((g) => g.id !== id);
  saveGames(next);
  return next;
}

/** 複数試合を先頭に追加して保存する */
export function prependGames(
  games: GameRecord[],
  newGames: GameRecord[],
): GameRecord[] {
  const next = [...newGames, ...games];
  saveGames(next);
  return next;
}

/** 全試合データを置き換えて保存する */
export function replaceGames(games: GameRecord[]): GameRecord[] {
  saveGames(games);
  return games;
}

/** localStorage の試合データをすべて削除する */
export function clearAllGames(): GameRecord[] {
  saveGames([]);
  return [];
}

const AT_BAT_RESULTS: AtBatResult[] = [
  "single",
  "double",
  "triple",
  "homeRun",
  "walk",
  "out",
  "strikeout",
];

const ROLES: RoleType[] = ["batter", "pitcher", "both"];

function isValidGameRecord(value: unknown): value is GameRecord {
  if (!value || typeof value !== "object") return false;
  const g = value as Record<string, unknown>;

  if (typeof g.id !== "string" || !g.id) return false;
  if (typeof g.date !== "string" || !g.date) return false;
  if (typeof g.opponent !== "string") return false;
  if (!ROLES.includes(g.role as RoleType)) return false;

  if (g.batting !== undefined) {
    const b = g.batting as Record<string, unknown>;
    if (!Array.isArray(b.atBats)) return false;
    if (!b.atBats.every((ab) => AT_BAT_RESULTS.includes(ab as AtBatResult))) return false;
    if (typeof b.rbi !== "number") return false;
  }

  if (g.pitching !== undefined) {
    const p = g.pitching as Record<string, unknown>;
    const numKeys = [
      "innings",
      "outs",
      "hitsAllowed",
      "walksAllowed",
      "strikeouts",
      "runsAllowed",
      "earnedRuns",
    ] as const;
    for (const key of numKeys) {
      if (typeof p[key] !== "number") return false;
    }
  }

  if (!g.batting && !g.pitching) return false;

  return true;
}

/** JSON 文字列をパースして試合データ配列として検証する */
export function parseGamesJson(text: string): GameRecord[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("JSONの形式が正しくありません。");
  }

  const arr = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { games?: unknown }).games)
      ? (parsed as { games: unknown[] }).games
      : null;

  if (!arr) {
    throw new Error("試合データの配列が見つかりません。");
  }

  if (arr.length === 0) {
    throw new Error("インポートする試合データが空です。");
  }

  const invalidIndex = arr.findIndex((item) => !isValidGameRecord(item));
  if (invalidIndex !== -1) {
    throw new Error(`データ形式が不正です（${invalidIndex + 1}件目）`);
  }

  return arr as GameRecord[];
}

/** 試合データを整形済み JSON 文字列にシリアライズする */
export function serializeGames(games: GameRecord[]): string {
  return JSON.stringify(games, null, 2);
}

/** JSON ファイルとしてダウンロードする */
export function downloadGamesJson(games: GameRecord[]): void {
  const blob = new Blob([serializeGames(games)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `baseball-stats-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** クリップボードに JSON をコピーする */
export async function copyGamesToClipboard(games: GameRecord[]): Promise<void> {
  await navigator.clipboard.writeText(serializeGames(games));
}
