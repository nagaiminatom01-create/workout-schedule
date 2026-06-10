"""
map_data.py — 迷路データの操作（座標変換・衝突判定・経路探索）

プレイヤーや川崎は「ワールド座標（ピクセル）」で動きますが、
迷路は「グリッド座標（タイル）」で管理しています。
このファイルが両者の橋渡しをします。
"""

import heapq

import pygame

from src.settings import TILE_FLOOR, TILE_SIZE


class MapData:
    """迷路グリッドに対する各種クエリを提供するクラス"""

    def __init__(self, grid: list[list[int]]):
        self.grid = grid
        self.height = len(grid)
        self.width = len(grid[0]) if self.height > 0 else 0

    # ------------------------------------------------------------------
    # 座標変換
    # ------------------------------------------------------------------
    def world_to_grid(self, world_pos: tuple[int, int] | pygame.Vector2) -> tuple[int, int]:
        """ピクセル座標 → グリッド座標"""
        return int(world_pos[0] // TILE_SIZE), int(world_pos[1] // TILE_SIZE)

    def grid_to_world(self, grid_pos: tuple[int, int]) -> tuple[int, int]:
        """グリッド座標 → タイル中心のピクセル座標"""
        return (
            grid_pos[0] * TILE_SIZE + TILE_SIZE // 2,
            grid_pos[1] * TILE_SIZE + TILE_SIZE // 2,
        )

    def grid_to_world_topleft(self, grid_pos: tuple[int, int]) -> tuple[int, int]:
        """グリッド座標 → タイル左上のピクセル座標"""
        return grid_pos[0] * TILE_SIZE, grid_pos[1] * TILE_SIZE

    # ------------------------------------------------------------------
    # 衝突判定
    # ------------------------------------------------------------------
    def is_wall_at_grid(self, gx: int, gy: int) -> bool:
        """指定グリッドが壁かどうか（範囲外は壁扱い）"""
        if gx < 0 or gy < 0 or gx >= self.width or gy >= self.height:
            return True
        return self.grid[gy][gx] != TILE_FLOOR

    def is_wall(self, rect: pygame.Rect) -> bool:
        """
        矩形が壁と重なるか判定する。
        矩形の四隅が触れるタイルを調べます。
        """
        corners = [
            (rect.left, rect.top),
            (rect.right - 1, rect.top),
            (rect.left, rect.bottom - 1),
            (rect.right - 1, rect.bottom - 1),
        ]
        for x, y in corners:
            gx, gy = self.world_to_grid((x, y))
            if self.is_wall_at_grid(gx, gy):
                return True
        return False

    # ------------------------------------------------------------------
    # A* 経路探索（川崎の追跡に使用）
    # ------------------------------------------------------------------
    def find_path(
        self,
        start: tuple[int, int],
        goal: tuple[int, int],
    ) -> list[tuple[int, int]]:
        """
        通路タイルのみを通る最短経路を A* で探索する。

        Returns:
            グリッド座標のリスト（開始点を含む）。経路が無い場合は [start] のみ。
        """
        if self.is_wall_at_grid(*start) or self.is_wall_at_grid(*goal):
            return [start]
        if start == goal:
            return [start]

        def heuristic(a: tuple[int, int], b: tuple[int, int]) -> int:
            return abs(a[0] - b[0]) + abs(a[1] - b[1])

        open_set: list[tuple[int, int, tuple[int, int]]] = []
        heapq.heappush(open_set, (0, 0, start))
        came_from: dict[tuple[int, int], tuple[int, int] | None] = {start: None}
        g_score: dict[tuple[int, int], int] = {start: 0}
        counter = 0

        while open_set:
            _, _, current = heapq.heappop(open_set)
            if current == goal:
                # 経路を逆順に辿って復元
                path = []
                node: tuple[int, int] | None = current
                while node is not None:
                    path.append(node)
                    node = came_from[node]
                path.reverse()
                return path

            for dx, dy in ((0, -1), (0, 1), (-1, 0), (1, 0)):
                neighbor = (current[0] + dx, current[1] + dy)
                if self.is_wall_at_grid(*neighbor):
                    continue
                tentative = g_score[current] + 1
                if tentative < g_score.get(neighbor, float("inf")):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative
                    counter += 1
                    f = tentative + heuristic(neighbor, goal)
                    heapq.heappush(open_set, (f, counter, neighbor))

        return [start]
