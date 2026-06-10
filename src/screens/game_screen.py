"""
game_screen.py — メインのゲームプレイ画面

迷路・プレイヤー・川崎・ゴールを更新・描画し、
右上にミニマップを表示します。勝敗判定もここで行います。
"""

import pygame

from src.enemy import Enemy
from src.goal import Goal
from src.map_data import MapData
from src.maze import generate_maze
from src.maze_renderer import draw_maze
from src.player import Player
from src.screens.base_screen import BaseScreen
from src.settings import (
    COLORS,
    DIFFICULTY_NORMAL,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    STAMINA_BAR_HEIGHT,
    STAMINA_BAR_Y,
)
from src.utils.minimap import Minimap
from src.utils.stamina_bar import draw_stamina_bar


class GameScreen(BaseScreen):
    """ゲームプレイ画面"""

    def __init__(self, difficulty: str = DIFFICULTY_NORMAL):
        self.difficulty = difficulty
        self.elapsed_time = 0.0
        self._setup_new_maze()

        self.font = pygame.font.SysFont("meiryo", 20)

    def _setup_new_maze(self) -> None:
        """新しい迷路を生成し、キャラクターを配置する"""
        result = generate_maze()
        self.map_data = MapData(result.grid)

        player_pos = self.map_data.grid_to_world(result.spawns.player)
        enemy_pos = self.map_data.grid_to_world(result.spawns.enemy)

        self.player = Player(player_pos, self.map_data)
        self.enemy = Enemy(enemy_pos, self.map_data, self.difficulty)
        self.goal = Goal(result.spawns.goal, self.map_data)
        self.minimap = Minimap(self.map_data)

    def handle_event(self, event: pygame.event.Event) -> str | None:
        if event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE:
            return "title"
        return None

    def update(self, dt: float) -> str | None:
        self.elapsed_time += dt

        # プレイヤー操作（ダッシュ・スタミナ更新を含む）
        keys = pygame.key.get_pressed()
        self.player.handle_input(keys, dt)

        # 川崎の追跡
        self.enemy.update(self.player, self.elapsed_time)

        # 勝敗判定
        if self.goal.is_reached(self.player):
            return f"clear:{self.elapsed_time:.2f}"

        if self.enemy.rect.colliderect(self.player.rect):
            return f"game_over:{self.elapsed_time:.2f}"

        return None

    def draw(self, surface: pygame.Surface) -> None:
        surface.fill(COLORS["background"])

        # 迷路とキャラクター
        draw_maze(surface, self.map_data)
        self.goal.draw(surface)
        self.player.draw(surface)
        self.enemy.draw(surface)

        # HUD — 左上にスタミナバー、その下に経過時間・難易度
        draw_stamina_bar(surface, self.player.stamina, self.font)

        hud_y = STAMINA_BAR_Y + STAMINA_BAR_HEIGHT + 28
        time_text = self.font.render(f"TIME: {self.elapsed_time:.1f}s", True, COLORS["text"])
        surface.blit(time_text, (10, hud_y))

        diff_text = self.font.render(f"難易度: {self.difficulty}", True, COLORS["text_dim"])
        surface.blit(diff_text, (10, hud_y + 24))

        esc_hint = self.font.render("Esc: タイトル", True, COLORS["text_dim"])
        surface.blit(esc_hint, (10, SCREEN_HEIGHT - 28))

        # 右上ミニマップ
        self.minimap.draw(surface, self.player, self.enemy, self.goal)
