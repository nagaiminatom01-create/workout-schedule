"""
enemy.py — 川崎（敵キャラクター）の追跡AIと描画

A* 経路探索でプレイヤーを追いかけます。
難易度に応じた初期速度・最大速度が settings.py で設定されます。
画像（kawasaki.png）があれば画像表示、なければ赤い矩形を描画します。
"""

import pygame

from src.map_data import MapData
from src.player import Player
from src.settings import (
    COLORS,
    DIFFICULTY_NORMAL,
    DIFFICULTY_SETTINGS,
    IMAGE_PATHS,
    SPEED_INCREASE_AMOUNT,
    SPEED_INCREASE_INTERVAL,
    TILE_SIZE,
)
from src.utils.sprites import load_sprite


class Enemy:
    """川崎 — プレイヤーを追跡する敵"""

    def __init__(
        self,
        start_pos: tuple[int, int],
        map_data: MapData,
        difficulty: str = DIFFICULTY_NORMAL,
    ):
        size = TILE_SIZE - 8
        self.rect = pygame.Rect(0, 0, size, size)
        self.rect.center = start_pos
        self.map_data = map_data
        self.color = COLORS["enemy"]
        self.path: list[tuple[int, int]] = []

        # 難易度から速度パラメータを取得
        settings = DIFFICULTY_SETTINGS.get(difficulty, DIFFICULTY_SETTINGS[DIFFICULTY_NORMAL])
        self.base_speed: float = settings["base_speed"]
        self.max_speed: float = settings["max_speed"]
        self.speed: float = self.base_speed
        self.difficulty = difficulty

        # 画像読み込み（64x64 に収めて表示。無ければ None → 矩形描画）
        self.image = load_sprite(IMAGE_PATHS["kawasaki"])

    def update(self, player: Player, elapsed_time: float) -> None:
        """
        毎フレーム呼び出し。速度更新と経路追跡を行う。

        Args:
            player: 追跡対象のプレイヤー
            elapsed_time: ゲーム開始からの経過秒数
        """
        self._update_speed(elapsed_time)

        # プレイヤー位置までの最短経路を計算
        start_grid = self.map_data.world_to_grid(self.rect.center)
        target_grid = self.map_data.world_to_grid(player.rect.center)
        self.path = self.map_data.find_path(start_grid, target_grid)

        if len(self.path) >= 2:
            next_tile = self.path[1]
            target_pos = self.map_data.grid_to_world(next_tile)
            direction = pygame.Vector2(target_pos) - pygame.Vector2(self.rect.center)

            if direction.length_squared() > 0:
                direction = direction.normalize()
                self._move_with_collision(direction.x * self.speed, direction.y * self.speed)

    def _update_speed(self, elapsed_time: float) -> None:
        """経過時間に応じて川崎の速度を上げる"""
        increments = int(elapsed_time // SPEED_INCREASE_INTERVAL)
        self.speed = min(self.base_speed + increments * SPEED_INCREASE_AMOUNT, self.max_speed)

    def _move_with_collision(self, dx: float, dy: float) -> None:
        """壁判定をしながら移動する"""
        new_rect = self.rect.copy()
        new_rect.x += int(dx)
        if not self.map_data.is_wall(new_rect):
            self.rect.x = new_rect.x

        new_rect = self.rect.copy()
        new_rect.y += int(dy)
        if not self.map_data.is_wall(new_rect):
            self.rect.y = new_rect.y

    def draw(self, surface: pygame.Surface) -> None:
        """画面に川崎を描画する"""
        if self.image:
            image_rect = self.image.get_rect(center=self.rect.center)
            surface.blit(self.image, image_rect)
        else:
            pygame.draw.rect(surface, self.color, self.rect, border_radius=4)
            shadow_rect = self.rect.inflate(-10, -10)
            pygame.draw.rect(surface, COLORS["shadow"], shadow_rect, border_radius=2)
