import { MapData } from "./mapData";
import { Player } from "./player";
import { Rect } from "./rect";
import { COLORS, TILE_SIZE } from "./settings";

export class Goal {
  rect: Rect;
  mapData: MapData;
  color = COLORS.goal;

  constructor(gridPos: [number, number], mapData: MapData) {
    this.mapData = mapData;
    const worldPos = mapData.gridToWorld(gridPos);
    const size = TILE_SIZE - 4;
    this.rect = Rect.fromCenter(worldPos.x, worldPos.y, size);
  }

  isReached(player: Player): boolean {
    return this.rect.colliderect(player.rect);
  }
}
