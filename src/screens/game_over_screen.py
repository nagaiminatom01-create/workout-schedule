"""
game_over_screen.py — ゲームオーバー画面

川崎に捕まったときに表示されます。生存時間を表示します。
"""

import pygame

from src.screens.base_screen import BaseScreen
from src.settings import COLORS, SCREEN_HEIGHT, SCREEN_WIDTH


class GameOverScreen(BaseScreen):
    """ゲームオーバー画面"""

    def __init__(self, survival_time: float, difficulty: str):
        self.survival_time = survival_time
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

        title = self.font_large.render("GAME OVER", True, COLORS["enemy"])
        surface.blit(title, title.get_rect(center=(SCREEN_WIDTH // 2, 120)))

        caught = self.font_medium.render("川崎に捕まった…", True, COLORS["text"])
        surface.blit(caught, caught.get_rect(center=(SCREEN_WIDTH // 2, 190)))

        time_surf = self.font_medium.render(f"生存時間: {self.survival_time:.2f} 秒", True, COLORS["text_dim"])
        surface.blit(time_surf, time_surf.get_rect(center=(SCREEN_WIDTH // 2, 240)))

        diff_surf = self.font_small.render(f"難易度: {self.difficulty}", True, COLORS["text_dim"])
        surface.blit(diff_surf, diff_surf.get_rect(center=(SCREEN_WIDTH // 2, 280)))

        help_lines = [
            "Enter : タイトルへ",
            "R : リトライ",
        ]
        for i, line in enumerate(help_lines):
            help_surf = self.font_small.render(line, True, COLORS["text_dim"])
            surface.blit(help_surf, help_surf.get_rect(center=(SCREEN_WIDTH // 2, 360 + i * 32)))
