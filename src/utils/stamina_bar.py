"""
stamina_bar.py — 画面左上のスタミナバー描画

スタミナの残量と枯渇状態を視覚的に表示します。
game_screen.py から呼び出されます。
"""

import pygame

from src.settings import (
    COLORS,
    STAMINA_BAR_HEIGHT,
    STAMINA_BAR_WIDTH,
    STAMINA_BAR_X,
    STAMINA_BAR_Y,
)
from src.stamina import Stamina


def draw_stamina_bar(surface: pygame.Surface, stamina: Stamina, font: pygame.font.Font) -> None:
    """
    画面左上にスタミナバーを描画する。

    Args:
        surface: 描画先
        stamina: スタミナ管理オブジェクト
        font: ラベル表示用フォント
    """
    x, y = STAMINA_BAR_X, STAMINA_BAR_Y
    bar_rect = pygame.Rect(x, y, STAMINA_BAR_WIDTH, STAMINA_BAR_HEIGHT)

    # 背景
    pygame.draw.rect(surface, COLORS["stamina_bg"], bar_rect, border_radius=4)

    # 残量バー
    fill_width = int(STAMINA_BAR_WIDTH * stamina.ratio)
    if fill_width > 0:
        fill_color = COLORS["stamina_exhausted"] if stamina.exhausted else COLORS["stamina_fill"]
        fill_rect = pygame.Rect(x, y, fill_width, STAMINA_BAR_HEIGHT)
        pygame.draw.rect(surface, fill_color, fill_rect, border_radius=4)

    # 枠線
    pygame.draw.rect(surface, COLORS["stamina_border"], bar_rect, 2, border_radius=4)

    # ラベル
    if stamina.exhausted:
        label = "STAMINA (回復中...)"
        label_color = COLORS["stamina_exhausted"]
    else:
        label = "STAMINA"
        label_color = COLORS["text_dim"]

    label_surface = font.render(label, True, label_color)
    surface.blit(label_surface, (x, y + STAMINA_BAR_HEIGHT + 4))
