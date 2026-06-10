"""
player.py — プレイヤーキャラクターの操作と描画

キーボード入力を受け取り、迷路内を移動します。
Shift キーでダッシュ（移動速度2倍・スタミナ消費）が可能です。
画像（player.png）があれば画像表示、なければ青い矩形を描画します。
"""

import pygame

from src.map_data import MapData
from src.settings import COLORS, DASH_SPEED_MULTIPLIER, IMAGE_PATHS, PLAYER_SPEED, TILE_SIZE
from src.stamina import Stamina
from src.utils.sprites import load_sprite


class Player:
    """プレイヤーを操作・描画するクラス"""

    def __init__(self, start_pos: tuple[int, int], map_data: MapData):
        # 当たり判定用の矩形（タイルより少し小さくして壁とのすり抜けを防ぐ）
        size = TILE_SIZE - 8
        self.rect = pygame.Rect(0, 0, size, size)
        self.rect.center = start_pos
        self.map_data = map_data
        self.color = COLORS["player"]
        self.stamina = Stamina()
        self.is_dashing = False

        # 画像読み込み（64x64 に収めて表示。無ければ None → 矩形描画）
        self.image = load_sprite(IMAGE_PATHS["player"])

    def handle_input(self, keys: pygame.key.ScancodeWrapper, dt: float) -> None:
        """
        押されているキーに応じて移動する。
        矢印キーと WASD の両方に対応。Shift でダッシュ。
        """
        dx, dy = 0, 0
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = 1
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = 1

        is_moving = dx != 0 or dy != 0
        shift_pressed = keys[pygame.K_LSHIFT] or keys[pygame.K_RSHIFT]

        # 移動中に Shift を押し、スタミナが使えるときだけダッシュ
        wants_dash = shift_pressed and is_moving
        self.is_dashing = wants_dash and self.stamina.can_dash

        speed = PLAYER_SPEED
        if self.is_dashing:
            speed = int(PLAYER_SPEED * DASH_SPEED_MULTIPLIER)

        self._try_move(dx * speed, 0)
        self._try_move(0, dy * speed)

        # 移動処理のあとにスタミナを更新
        self.stamina.update(dt, self.is_dashing)

    def _try_move(self, dx: int, dy: int) -> None:
        """X/Y 方向を個別に移動し、壁にぶつかればその方向だけキャンセル"""
        if dx == 0 and dy == 0:
            return

        new_rect = self.rect.copy()
        new_rect.x += dx
        new_rect.y += dy

        if not self.map_data.is_wall(new_rect):
            self.rect = new_rect

    def draw(self, surface: pygame.Surface) -> None:
        """画面にプレイヤーを描画する"""
        if self.image:
            image_rect = self.image.get_rect(center=self.rect.center)
            surface.blit(self.image, image_rect)
        else:
            # ダッシュ中は色を少し明るくして視覚的に区別
            color = (120, 210, 255) if self.is_dashing else self.color
            pygame.draw.rect(surface, color, self.rect, border_radius=4)
            inner = self.rect.inflate(-8, -8)
            pygame.draw.rect(surface, (200, 230, 255), inner, border_radius=2)
