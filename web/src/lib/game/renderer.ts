import { Enemy } from "./enemy";
import { Goal } from "./goal";
import { MapData } from "./mapData";
import { Player } from "./player";
import { Stamina } from "./stamina";
import {
  COLORS,
  MINIMAP_HEIGHT,
  MINIMAP_MARGIN,
  MINIMAP_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  STAMINA_BAR_HEIGHT,
  STAMINA_BAR_WIDTH,
  STAMINA_BAR_X,
  STAMINA_BAR_Y,
  TILE_FLOOR,
  TILE_SIZE,
  rgb,
} from "./settings";

export function drawMaze(ctx: CanvasRenderingContext2D, mapData: MapData): void {
  for (let gy = 0; gy < mapData.height; gy++) {
    for (let gx = 0; gx < mapData.width; gx++) {
      const x = gx * TILE_SIZE;
      const y = gy * TILE_SIZE;
      if (mapData.grid[gy][gx] === TILE_FLOOR) {
        ctx.fillStyle = rgb(COLORS.floor);
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      } else {
        ctx.fillStyle = rgb(COLORS.wall);
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = rgb([75, 75, 95]);
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }
    }
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  const { rect } = player;
  const color = player.isDashing ? [120, 210, 255] : player.color;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 4, rgb(color));
  const inner = rect.inflate(-8, -8);
  roundRect(ctx, inner.x, inner.y, inner.width, inner.height, 2, rgb([200, 230, 255]));
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  const { rect } = enemy;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 4, rgb(enemy.color));
  const inner = rect.inflate(-10, -10);
  roundRect(ctx, inner.x, inner.y, inner.width, inner.height, 2, rgb(COLORS.shadow));
}

export function drawGoal(ctx: CanvasRenderingContext2D, goal: Goal): void {
  const { rect } = goal;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 6, rgb(goal.color));
  const inner = rect.inflate(-10, -10);
  roundRect(ctx, inner.x, inner.y, inner.width, inner.height, 3, rgb([120, 255, 160]));
}

export function drawStaminaBar(
  ctx: CanvasRenderingContext2D,
  stamina: Stamina,
): void {
  const x = STAMINA_BAR_X;
  const y = STAMINA_BAR_Y;

  roundRect(ctx, x, y, STAMINA_BAR_WIDTH, STAMINA_BAR_HEIGHT, 4, rgb(COLORS.stamina_bg));

  const fillWidth = Math.floor(STAMINA_BAR_WIDTH * stamina.ratio);
  if (fillWidth > 0) {
    const fillColor = stamina.exhausted
      ? COLORS.stamina_exhausted
      : COLORS.stamina_fill;
    roundRect(ctx, x, y, fillWidth, STAMINA_BAR_HEIGHT, 4, rgb(fillColor));
  }

  ctx.strokeStyle = rgb(COLORS.stamina_border);
  ctx.lineWidth = 2;
  roundRectStroke(ctx, x, y, STAMINA_BAR_WIDTH, STAMINA_BAR_HEIGHT, 4);

  ctx.font = "14px sans-serif";
  ctx.fillStyle = rgb(
    stamina.exhausted ? COLORS.stamina_exhausted : COLORS.text_dim,
  );
  const label = stamina.exhausted ? "STAMINA (回復中...)" : "STAMINA";
  ctx.fillText(label, x, y + STAMINA_BAR_HEIGHT + 16);
}

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  mapData: MapData,
  player: Player,
  enemy: Enemy,
  goal: Goal,
): void {
  const panelX = SCREEN_WIDTH - MINIMAP_WIDTH - MINIMAP_MARGIN;
  const panelY = MINIMAP_MARGIN;
  const tileW = MINIMAP_WIDTH / mapData.width;
  const tileH = MINIMAP_HEIGHT / mapData.height;

  ctx.fillStyle = "rgba(10, 10, 20, 0.78)";
  ctx.fillRect(panelX, panelY, MINIMAP_WIDTH, MINIMAP_HEIGHT);

  for (let gy = 0; gy < mapData.height; gy++) {
    for (let gx = 0; gx < mapData.width; gx++) {
      const color =
        mapData.grid[gy][gx] === TILE_FLOOR
          ? COLORS.minimap_floor
          : COLORS.minimap_wall;
      ctx.fillStyle = rgb(color);
      ctx.fillRect(
        panelX + gx * tileW,
        panelY + gy * tileH,
        Math.max(1, tileW),
        Math.max(1, tileH),
      );
    }
  }

  ctx.strokeStyle = rgb(COLORS.minimap_border);
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, MINIMAP_WIDTH, MINIMAP_HEIGHT);

  drawMinimapDot(ctx, mapData, goal.rect.center, COLORS.goal, 4, panelX, panelY, tileW, tileH);
  drawMinimapDot(ctx, mapData, player.rect.center, COLORS.player, 3, panelX, panelY, tileW, tileH);
  drawMinimapDot(ctx, mapData, enemy.rect.center, COLORS.enemy, 3, panelX, panelY, tileW, tileH);
}

function drawMinimapDot(
  ctx: CanvasRenderingContext2D,
  mapData: MapData,
  worldPos: { x: number; y: number },
  color: [number, number, number],
  radius: number,
  panelX: number,
  panelY: number,
  tileW: number,
  tileH: number,
): void {
  const [gx, gy] = mapData.worldToGrid(worldPos);
  const cx = panelX + (gx + 0.5) * tileW;
  const cy = panelY + (gy + 0.5) * tileH;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = rgb(color);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRectStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.stroke();
}

export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  font: string,
  color: [number, number, number],
): void {
  ctx.font = font;
  ctx.fillStyle = rgb(color);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, centerX, centerY);
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color: [number, number, number],
): void {
  ctx.font = font;
  ctx.fillStyle = rgb(color);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}
