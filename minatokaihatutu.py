import pygame
from settings import COLORS, TILE_SIZE, IMAGE_PATHS, load_sprite, SPEED_INCREASE_INTERVAL, MAX_ENEMY_SPEED

class
Enemy:
    """プレイヤーを追跡する敵キャラクター"""

    def __init__(self, start_pos, map_data, base_speed):
        self.rect = pygame.Rect(start_pos[0], start_pos[1], TILE_SIZE - 8, TILE_SIZE - 8)
        self.color = COLORS['enemy']
        self.base_speed = base_speed
        self.speed = base_speed
        self.map_data = map_data
        self.path = []
        self.image = load_sprite(IMAGE_PATHS['enemy'])

    def update(self, player, elapsed_time):
        # 経過時間に応じて速度を更新する
        self.update_speed(elapsed_time)

        # プレイヤーのいるタイルまで最短経路を計算する
        start_grid = self.map_data.world_to_grid(self.rect.center)
        target_grid = self.map_data.world_to_grid(player.rect.center)
        self.path = self.map_data.find_path(start_grid, target_grid)

        if len(self.path) >= 2:
            next_tile = self.path[1]
            target_pos = self.map_data.grid_to_world(next_tile)
            direction = pygame.Vector2(target_pos) - pygame.Vector2(self.rect.center)
            if direction.length_squared() > 0:
                direction = direction.normalize()
                self.rect.centerx += direction.x * self.speed
                self.rect.centery += direction.y * self.speed

    def update_speed(self, elapsed_time):
        # 30秒ごとに速度を1ずつ上昇させる
        increment = int(elapsed_time // SPEED_INCREASE_INTERVAL)
        self.speed = min(self.base_speed + increment, MAX_ENEMY_SPEED)

    def draw(self, surface):
        # 画像が読み込まれていれば画像を描画し、そうでなければ四角形を描画する
        if self.image:
            image_rect = self.image.get_rect(center=self.rect.center)
            surface.blit(self.image, image_rect)
        else:
            pygame.draw.rect(surface, self.color, self.rect)
            shadow_rect = self.rect.inflate(-10, -10)
            pygame.draw.rect(surface, COLORS['shadow'], shadow_rect)
