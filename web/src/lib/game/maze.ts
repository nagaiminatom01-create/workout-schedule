import {
  MAZE_HEIGHT,
  MAZE_WIDTH,
  TILE_FLOOR,
  TILE_WALL,
} from "./settings";

export interface SpawnPositions {
  player: [number, number];
  enemy: [number, number];
  goal: [number, number];
}

export interface MazeResult {
  grid: number[][];
  spawns: SpawnPositions;
}

export function generateMaze(
  width: number = MAZE_WIDTH,
  height: number = MAZE_HEIGHT,
): MazeResult {
  const grid: number[][] = Array.from({ length: height }, () =>
    Array(width).fill(TILE_WALL),
  );

  function neighbors(cx: number, cy: number): [number, number][] {
    const directions: [number, number][] = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ];
    const result: [number, number][] = [];
    for (const [dx, dy] of directions) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (
        nx >= 1 &&
        nx < width - 1 &&
        ny >= 1 &&
        ny < height - 1 &&
        grid[ny][nx] === TILE_WALL
      ) {
        result.push([nx, ny]);
      }
    }
    return result;
  }

  const startX = 1;
  const startY = 1;
  grid[startY][startX] = TILE_FLOOR;
  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const candidates = neighbors(cx, cy);
    if (candidates.length === 0) {
      stack.pop();
      continue;
    }

    const [nx, ny] = candidates[Math.floor(Math.random() * candidates.length)];
    const wallX = cx + (nx - cx) / 2;
    const wallY = cy + (ny - cy) / 2;
    grid[wallY][wallX] = TILE_FLOOR;
    grid[ny][nx] = TILE_FLOOR;
    stack.push([nx, ny]);
  }

  const spawns = pickSpawnPositions(grid, width, height);
  return { grid, spawns };
}

function pickSpawnPositions(
  grid: number[][],
  width: number,
  height: number,
): SpawnPositions {
  const floors: [number, number][] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === TILE_FLOOR) {
        floors.push([x, y]);
      }
    }
  }

  if (floors.length < 3) {
    return {
      player: [1, 1],
      enemy: [width - 2, height - 2],
      goal: [Math.floor(width / 2), Math.floor(height / 2)],
    };
  }

  const playerPos = floors[0];
  const manhattan = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

  const goalPos = floors.reduce((best, p) =>
    manhattan(p, playerPos) > manhattan(best, playerPos) ? p : best,
  );

  const remaining = floors.filter(
    (p) => p[0] !== playerPos[0] || p[1] !== playerPos[1],
  ).filter((p) => p[0] !== goalPos[0] || p[1] !== goalPos[1]);

  const enemyPos =
    remaining.length > 0
      ? remaining.reduce((best, p) =>
          manhattan(p, playerPos) > manhattan(best, playerPos) ? p : best,
        )
      : goalPos;

  return { player: playerPos, enemy: enemyPos, goal: goalPos };
}
