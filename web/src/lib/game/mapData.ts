import { TILE_FLOOR, TILE_SIZE } from "./settings";
import { Rect } from "./rect";

export class MapData {
  grid: number[][];
  height: number;
  width: number;

  constructor(grid: number[][]) {
    this.grid = grid;
    this.height = grid.length;
    this.width = this.height > 0 ? grid[0].length : 0;
  }

  worldToGrid(worldPos: { x: number; y: number }): [number, number] {
    return [
      Math.floor(worldPos.x / TILE_SIZE),
      Math.floor(worldPos.y / TILE_SIZE),
    ];
  }

  gridToWorld(gridPos: [number, number]): { x: number; y: number } {
    return {
      x: gridPos[0] * TILE_SIZE + TILE_SIZE / 2,
      y: gridPos[1] * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  isWallAtGrid(gx: number, gy: number): boolean {
    if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) {
      return true;
    }
    return this.grid[gy][gx] !== TILE_FLOOR;
  }

  isWall(rect: Rect): boolean {
    const corners: [number, number][] = [
      [rect.left, rect.top],
      [rect.right - 1, rect.top],
      [rect.left, rect.bottom - 1],
      [rect.right - 1, rect.bottom - 1],
    ];
    for (const [x, y] of corners) {
      const [gx, gy] = this.worldToGrid({ x, y });
      if (this.isWallAtGrid(gx, gy)) {
        return true;
      }
    }
    return false;
  }

  findPath(start: [number, number], goal: [number, number]): [number, number][] {
    if (this.isWallAtGrid(...start) || this.isWallAtGrid(...goal)) {
      return [start];
    }
    if (start[0] === goal[0] && start[1] === goal[1]) {
      return [start];
    }

    const heuristic = (a: [number, number], b: [number, number]) =>
      Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

    const openSet: { f: number; counter: number; pos: [number, number] }[] = [];
    let counter = 0;
    openSet.push({ f: 0, counter, pos: start });
    counter++;

    const cameFrom = new Map<string, [number, number] | null>();
    const gScore = new Map<string, number>();
    const key = (p: [number, number]) => `${p[0]},${p[1]}`;
    cameFrom.set(key(start), null);
    gScore.set(key(start), 0);

    const closed = new Set<string>();

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f || a.counter - b.counter);
      const current = openSet.shift()!.pos;
      const currentKey = key(current);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);

      if (current[0] === goal[0] && current[1] === goal[1]) {
        const path: [number, number][] = [];
        let node: [number, number] | null = current;
        while (node !== null) {
          path.push(node);
          node = cameFrom.get(key(node)) ?? null;
        }
        path.reverse();
        return path;
      }

      for (const [dx, dy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ] as [number, number][]) {
        const neighbor: [number, number] = [current[0] + dx, current[1] + dy];
        if (this.isWallAtGrid(...neighbor)) continue;

        const tentative = (gScore.get(key(current)) ?? Infinity) + 1;
        const neighborKey = key(neighbor);
        if (tentative < (gScore.get(neighborKey) ?? Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentative);
          const f = tentative + heuristic(neighbor, goal);
          openSet.push({ f, counter, pos: neighbor });
          counter++;
        }
      }
    }

    return [start];
  }
}
