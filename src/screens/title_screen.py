"""
title_screen.py — タイトル画面

ゲーム名・操作説明・ハイスコア表示に加え、
難易度（EASY / NORMAL / HARD）を選択してゲームを開始します。
"""

import pygame

from src.screens.base_screen import BaseScreen
from src.settings import COLORS, DIFFICULTIES, DIFFICULTY_NORMAL, SCREEN_HEIGHT, SCREEN_WIDTH


class TitleScreen(BaseScreen):
    """タイトル画面 — 難易度選択とゲーム開始"""

    def __init__(self, highscore: float | None):
        self.highscore = highscore
        self.selected_index = DIFFICULTIES.index(DIFFICULTY_NORMAL)
        self.font_large = pygame.font.SysFont("meiryo", 48, bold=True)
        self.font_medium = pygame.font.SysFont("meiryo", 28)
        self.font_small = pygame.font.SysFont("meiryo", 22)

    @property
    def selected_difficulty(self) -> str:
        """現在選択中の難易度名"""
        return DIFFICULTIES[self.selected_index]

    def handle_event(self, event: pygame.event.Event) -> str | None:
        if event.type == pygame.KEYDOWN:
            # 難易度の切り替え
            if event.key in (pygame.K_UP, pygame.K_w):
                self.selected_index = (self.selected_index - 1) % len(DIFFICULTIES)
            elif event.key in (pygame.K_DOWN, pygame.K_s):
                self.selected_index = (self.selected_index + 1) % len(DIFFICULTIES)
            elif event.key in (pygame.K_RETURN, pygame.K_SPACE):
                # 選択した難易度でゲーム開始
                return f"playing:{self.selected_difficulty}"
            elif event.key == pygame.K_ESCAPE:
                return "quit"
        return None

    def update(self, dt: float) -> str | None:
        return None

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(COLORS["background"])

        # タイトル
        title = self.font_large.render("川崎鬼ごっこ2", True, COLORS["highlight"])
        surface.blit(title, title.get_rect(center=(SCREEN_WIDTH // 2, 80)))

        subtitle = self.font_small.render("〜 ゴールを目指して川崎から逃げろ！ 〜", True, COLORS["text_dim"])
        surface.blit(subtitle, subtitle.get_rect(center=(SCREEN_WIDTH // 2, 130)))

        # 難易度選択
        diff_title = self.font_medium.render("難易度を選択", True, COLORS["text"])
        surface.blit(diff_title, diff_title.get_rect(center=(SCREEN_WIDTH // 2, 200)))

        for i, name in enumerate(DIFFICULTIES):
            color = COLORS["highlight"] if i == self.selected_index else COLORS["text_dim"]
            prefix = "▶ " if i == self.selected_index else "   "
            text = self.font_medium.render(f"{prefix}{name}", True, color)
            surface.blit(text, text.get_rect(center=(SCREEN_WIDTH // 2, 250 + i * 40)))

        # ハイスコア
        if self.highscore is not None:
            hs_text = f"ハイスコア: {self.highscore:.2f} 秒"
        else:
            hs_text = "ハイスコア: ---"
        hs_surface = self.font_small.render(hs_text, True, COLORS["text"])
        surface.blit(hs_surface, hs_surface.get_rect(center=(SCREEN_WIDTH // 2, 380)))

        # 操作説明
        help_lines = [
            "↑↓ / WS : 難易度選択",
            "Enter / Space : スタート",
            "Esc : 終了",
        ]
        for i, line in enumerate(help_lines):
            help_surf = self.font_small.render(line, True, COLORS["text_dim"])
            surface.blit(help_surf, help_surf.get_rect(center=(SCREEN_WIDTH // 2, 420 + i * 28)))
