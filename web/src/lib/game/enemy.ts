import { MapData } from "./mapData";
import { Player } from "./player";
import { Rect } from "./rect";
import {
  COLORS,
  DIFFICULTY_NORMAL,
  DIFFICULTY_SETTINGS,
  Difficulty,
  SPEED_INCREASE_AMOUNT,
  SPEED_INCREASE_INTERVAL,
  TILE_SIZE,
} from "./settings";

export class Enemy {
  rect: Rect;
  mapData: MapData;
  color = COLORS.enemy;
  path: [number, number][] = [];
  baseSpeed: number;
  maxSpeed: number;
  speed: number;
  difficulty: Difficulty;

  constructor(
    startPos: { x: number; y: number },
    mapData: MapData,
    difficulty: Difficulty = DIFFICULTY_NORMAL,
  ) {
    const size = TILE_SIZE - 8;
    this.rect = Rect.fromCenter(startPos.x, startPos.y, size);
    this.mapData = mapData;
    this.difficulty = difficulty;
    const settings =
      DIFFICULTY_SETTINGS[difficulty] ?? DIFFICULTY_SETTINGS[DIFFICULTY_NORMAL];
    this.baseSpeed = settings.base_speed;
    this.maxSpeed = settings.max_speed;
    this.speed = this.baseSpeed;
  }

  update(player: Player, elapsedTime: number): void {
    this.updateSpeed(elapsedTime);

    const startGrid = this.mapData.worldToGrid(this.rect.center);
    const targetGrid = this.mapData.worldToGrid(player.rect.center);
    this.path = this.mapData.findPath(startGrid, targetGrid);

    if (this.path.length >= 2) {
      const nextTile = this.path[1];
      const targetPos = this.mapData.gridToWorld(nextTile);
      const center = this.rect.center;
      let dirX = targetPos.x - center.x;
      let dirY = targetPos.y - center.y;
      const lenSq = dirX * dirX + dirY * dirY;
      if (lenSq > 0) {
        const len = Math.sqrt(lenSq);
        dirX /= len;
        dirY /= len;
        this.moveWithCollision(dirX * this.speed, dirY * this.speed);
      }
    }
  }

  private updateSpeed(elapsedTime: number): void {
    const increments = Math.floor(elapsedTime / SPEED_INCREASE_INTERVAL);
    this.speed = Math.min(
      this.baseSpeed + increments * SPEED_INCREASE_AMOUNT,
      this.maxSpeed,
    );
  }

  private moveWithCollision(dx: number, dy: number): void {
    const newRectX = this.rect.copy();
    newRectX.x += Math.floor(dx);
    if (!this.mapData.isWall(newRectX)) {
      this.rect.x = newRectX.x;
    }

    const newRectY = this.rect.copy();
    newRectY.y += Math.floor(dy);
    if (!this.mapData.isWall(newRectY)) {
      this.rect.y = newRectY.y;
    }
  }
}
