"""
minimap.py — 画面右上に表示するミニマップの描画

迷路全体とプレイヤー・川崎・ゴールの位置を小さく表示します。
ゲーム画面（game_screen.py）から呼び出されます。
"""

import pygame

from src.enemy import Enemy
from src.goal import Goal
from src.map_data import MapData
from src.player import Player
from src.settings import (
    COLORS,
    MINIMAP_HEIGHT,
    MINIMAP_MARGIN,
    MINIMAP_WIDTH,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    TILE_FLOOR,
)


class Minimap:
    """右上ミニマップの描画を担当するクラス"""

    def __init__(self, map_data: MapData):
        self.map_data = map_data
        self.width = MINIMAP_WIDTH
        self.height = MINIMAP_HEIGHT

        # 画面右上の配置座標
        self.x = SCREEN_WIDTH - self.width - MINIMAP_MARGIN
        self.y = MINIMAP_MARGIN

        # タイル1枚あたりのミニマップ上のピクセルサイズ
        self.tile_w = self.width / map_data.width
        self.tile_h = self.height / map_data.height

    def draw(
        self,
        surface: pygame.Surface,
        player: Player,
        enemy: Enemy,
        goal: Goal,
    ) -> None:
        """
        ミニマップを描画する。

        Args:
            surface: 描画先のメイン画面
            player, enemy, goal: 位置表示用のゲームオブジェクト
        """
        # 半透明の背景パネル
        panel = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        panel.fill((*COLORS["minimap_bg"], 200))
        surface.blit(panel, (self.x, self.y))

        # 迷路タイルを描画
        for gy in range(self.map_data.height):
            for gx in range(self.map_data.width):
                color = COLORS["minimap_floor"] if self.map_data.grid[gy][gx] == TILE_FLOOR else COLORS["minimap_wall"]
                tile_rect = pygame.Rect(
                    int(self.x + gx * self.tile_w),
                    int(self.y + gy * self.tile_h),
                    max(1, int(self.tile_w)),
                    max(1, int(self.tile_h)),
                )
                pygame.draw.rect(surface, color, tile_rect)

        # 枠線
        border_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        pygame.draw.rect(surface, COLORS["minimap_border"], border_rect, 2)

        # キャラクター位置をドットで表示
        self._draw_dot(surface, goal.rect.center, COLORS["goal"], radius=4)
        self._draw_dot(surface, player.rect.center, COLORS["player"], radius=3)
        self._draw_dot(surface, enemy.rect.center, COLORS["enemy"], radius=3)

    def _draw_dot(
        self,
        surface: pygame.Surface,
        world_pos: tuple[int, int],
        color: tuple[int, int, int],
        radius: int,
    ) -> None:
        """ワールド座標をミニマップ上のドットに変換して描画"""
        gx, gy = self.map_data.world_to_grid(world_pos)
        cx = int(self.x + (gx + 0.5) * self.tile_w)
        cy = int(self.y + (gy + 0.5) * self.tile_h)
        pygame.draw.circle(surface, color, (cx, cy), radius)
