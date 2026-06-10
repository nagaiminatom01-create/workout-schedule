const HIGHSCORE_KEY = "kawasaki_highscore";

export function loadHighscore(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { best_time: number | null };
    return data.best_time;
  } catch {
    return null;
  }
}

export function saveHighscore(time: number): number | null {
  if (typeof window === "undefined") return null;
  const current = loadHighscore();
  if (current !== null && time >= current) {
    return current;
  }
  const data = {
    best_time: time,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(data));
  return time;
}
