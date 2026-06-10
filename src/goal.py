"""
goal.py — ゴール地点の描画と到達判定

プレイヤーがゴールに重なったかどうかを判定します。
画像（kouto.png）があれば画像表示、なければ緑の矩形を描画します。
"""

import pygame

from src.map_data import MapData
from src.player import Player
from src.settings import COLORS, IMAGE_PATHS, TILE_SIZE
from src.utils.sprites import load_sprite


class Goal:
    """ゴール地点を管理するクラス"""

    def __init__(self, grid_pos: tuple[int, int], map_data: MapData):
        self.map_data = map_data
        world_pos = map_data.grid_to_world(grid_pos)

        size = TILE_SIZE - 4
        self.rect = pygame.Rect(0, 0, size, size)
        self.rect.center = world_pos
        self.color = COLORS["goal"]

        # 画像読み込み（64x64 に収めて表示。無ければ None → 矩形描画）
        self.image = load_sprite(IMAGE_PATHS["goal"])

    def is_reached(self, player: Player) -> bool:
        """プレイヤーがゴールに到達したか"""
        return self.rect.colliderect(player.rect)

    def draw(self, surface: pygame.Surface) -> None:
        """画面にゴールを描画する"""
        if self.image:
            image_rect = self.image.get_rect(center=self.rect.center)
            surface.blit(self.image, image_rect)
        else:
            pygame.draw.rect(surface, self.color, self.rect, border_radius=6)
            inner = self.rect.inflate(-10, -10)
            pygame.draw.rect(surface, (120, 255, 160), inner, border_radius=3)
