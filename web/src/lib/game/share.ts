import type { GameState } from "./gameEngine";

export function buildClearShareText(state: GameState): string {
  const time = state.lastClearTime?.toFixed(2) ?? "?";
  const record = state.isNewRecord ? " NEW RECORD!" : "";
  return `川崎鬼ごっこ2を${time}秒でクリア！（${state.difficulty}）${record} #川崎鬼ごっこ2`;
}

export function shareClearResult(state: GameState): void {
  const text = buildClearShareText(state);
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function copyClearResult(state: GameState): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildClearShareText(state));
    return true;
  } catch {
    return false;
  }
}
