"""
maze_renderer.py — 迷路タイルの描画専用モジュール

迷路の見た目だけを担当します。ゲームロジックとは分離しています。
"""

import pygame

from src.map_data import MapData
from src.settings import COLORS, TILE_FLOOR, TILE_SIZE


def draw_maze(surface: pygame.Surface, map_data: MapData) -> None:
    """
    迷路全体を画面に描画する。

    Args:
        surface: 描画先
        map_data: 迷路データ
    """
    for gy in range(map_data.height):
        for gx in range(map_data.width):
            x = gx * TILE_SIZE
            y = gy * TILE_SIZE
            tile_rect = pygame.Rect(x, y, TILE_SIZE, TILE_SIZE)

            if map_data.grid[gy][gx] == TILE_FLOOR:
                pygame.draw.rect(surface, COLORS["floor"], tile_rect)
            else:
                pygame.draw.rect(surface, COLORS["wall"], tile_rect)
                # 壁に軽いハイライトを付けて立体感を出す
                highlight = tile_rect.inflate(-4, -4)
                pygame.draw.rect(surface, (75, 75, 95), highlight, 1)
