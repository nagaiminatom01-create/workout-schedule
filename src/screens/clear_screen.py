"""
clear_screen.py — クリア画面

ゴール到達時に表示されます。クリアタイムとハイスコア更新を表示します。
"""

import pygame

from src.screens.base_screen import BaseScreen
from src.settings import COLORS, SCREEN_HEIGHT, SCREEN_WIDTH


class ClearScreen(BaseScreen):
    """クリア画面"""

    def __init__(self, clear_time: float, is_new_record: bool, difficulty: str):
        self.clear_time = clear_time
        self.is_new_record = is_new_record
        self.difficulty = difficulty
        self.font_large = pygame.font.SysFont("meiryo", 52, bold=True)
        self.font_medium = pygame.font.SysFont("meiryo", 28)
        self.font_small = pygame.font.SysFont("meiryo", 22)

    def handle_event(self, event: pygame.event.Event) -> str | None:
        if event.type == pygame.KEYDOWN:
            if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                return "title"
            if event.key == pygame.K_r:
                return f"playing:{self.difficulty}"
        return None

    def update(self, dt: float) -> str | None:
        return None

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(COLORS["background"])

        title = self.font_large.render("CLEAR!", True, COLORS["goal"])
        surface.blit(title, title.get_rect(center=(SCREEN_WIDTH // 2, 120)))

        time_surf = self.font_medium.render(f"クリアタイム: {self.clear_time:.2f} 秒", True, COLORS["text"])
        surface.blit(time_surf, time_surf.get_rect(center=(SCREEN_WIDTH // 2, 200)))

        diff_surf = self.font_small.render(f"難易度: {self.difficulty}", True, COLORS["text_dim"])
        surface.blit(diff_surf, diff_surf.get_rect(center=(SCREEN_WIDTH // 2, 240)))

        if self.is_new_record:
            record = self.font_medium.render("★ NEW RECORD! ★", True, COLORS["highlight"])
            surface.blit(record, record.get_rect(center=(SCREEN_WIDTH // 2, 290)))

        help_lines = [
            "Enter : タイトルへ",
            "R : リトライ",
        ]
        for i, line in enumerate(help_lines):
            help_surf = self.font_small.render(line, True, COLORS["text_dim"])
            surface.blit(help_surf, help_surf.get_rect(center=(SCREEN_WIDTH // 2, 360 + i * 32)))
