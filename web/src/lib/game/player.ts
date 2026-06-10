import { MapData } from "./mapData";
import { Rect } from "./rect";
import { Stamina } from "./stamina";
import {
  COLORS,
  DASH_SPEED_MULTIPLIER,
  PLAYER_SPEED,
  TILE_SIZE,
} from "./settings";

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shift: boolean;
}

export class Player {
  rect: Rect;
  mapData: MapData;
  color = COLORS.player;
  stamina = new Stamina();
  isDashing = false;

  constructor(startPos: { x: number; y: number }, mapData: MapData) {
    const size = TILE_SIZE - 8;
    this.rect = Rect.fromCenter(startPos.x, startPos.y, size);
    this.mapData = mapData;
  }

  handleInput(input: InputState, _dt: number): void {
    let dx = 0;
    let dy = 0;
    if (input.up) dy = -1;
    if (input.down) dy = 1;
    if (input.left) dx = -1;
    if (input.right) dx = 1;

    const isMoving = dx !== 0 || dy !== 0;
    const wantsDash = input.shift && isMoving;
    this.isDashing = wantsDash && this.stamina.canDash;

    let speed = PLAYER_SPEED;
    if (this.isDashing) {
      speed = Math.floor(PLAYER_SPEED * DASH_SPEED_MULTIPLIER);
    }

    this.tryMove(dx * speed, 0);
    this.tryMove(0, dy * speed);
    this.stamina.update(_dt, this.isDashing);
  }

  private tryMove(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) return;
    const newRect = this.rect.copy();
    newRect.x += dx;
    newRect.y += dy;
    if (!this.mapData.isWall(newRect)) {
      this.rect = newRect;
    }
  }
}
