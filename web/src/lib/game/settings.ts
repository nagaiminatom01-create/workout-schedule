export type RGB = [number, number, number];
export type Difficulty = "EASY" | "NORMAL" | "HARD";

export const TILE_SIZE = 32;
export const MAZE_WIDTH = 21;
export const MAZE_HEIGHT = 15;
export const SCREEN_WIDTH = MAZE_WIDTH * TILE_SIZE;
export const SCREEN_HEIGHT = MAZE_HEIGHT * TILE_SIZE;
export const FPS = 60;

export const COLORS: Record<string, RGB> = {
  background: [20, 20, 30],
  wall: [60, 60, 80],
  floor: [35, 35, 50],
  player: [80, 180, 255],
  enemy: [255, 80, 80],
  goal: [80, 220, 120],
  shadow: [180, 40, 40],
  text: [240, 240, 240],
  text_dim: [160, 160, 180],
  highlight: [255, 220, 80],
  minimap_bg: [10, 10, 20],
  minimap_wall: [80, 80, 100],
  minimap_floor: [50, 50, 70],
  minimap_border: [200, 200, 220],
  stamina_bg: [40, 40, 55],
  stamina_fill: [80, 200, 255],
  stamina_exhausted: [180, 80, 80],
  stamina_border: [200, 200, 220],
};

export const PLAYER_SPEED = 3;
export const DASH_SPEED_MULTIPLIER = 2.0;

export const STAMINA_MAX = 100.0;
export const STAMINA_DRAIN_PER_SECOND = 45.0;
export const STAMINA_RECOVERY_PER_SECOND = 30.0;

export const STAMINA_BAR_X = 10;
export const STAMINA_BAR_Y = 10;
export const STAMINA_BAR_WIDTH = 160;
export const STAMINA_BAR_HEIGHT = 16;

export const SPEED_INCREASE_INTERVAL = 30;
export const SPEED_INCREASE_AMOUNT = 0.5;

export const DIFFICULTY_EASY: Difficulty = "EASY";
export const DIFFICULTY_NORMAL: Difficulty = "NORMAL";
export const DIFFICULTY_HARD: Difficulty = "HARD";
export const DIFFICULTIES: Difficulty[] = [
  DIFFICULTY_EASY,
  DIFFICULTY_NORMAL,
  DIFFICULTY_HARD,
];

export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { base_speed: number; max_speed: number }
> = {
  EASY: { base_speed: 1.5, max_speed: 3.5 },
  NORMAL: { base_speed: 2.0, max_speed: 5.0 },
  HARD: { base_speed: 3.0, max_speed: 6.5 },
};

export const MINIMAP_WIDTH = 160;
export const MINIMAP_HEIGHT = 110;
export const MINIMAP_MARGIN = 8;

export const TILE_WALL = 1;
export const TILE_FLOOR = 0;

export function rgb(color: RGB): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}
