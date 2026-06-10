"""
maze.py — ランダム迷路の生成

再帰的バックトラッキング（DFS）で毎回異なる迷路を作ります。
プレイヤー・川崎・ゴールのスポーン位置もここで決めます。
"""

import random
from typing import NamedTuple

from src.settings import MAZE_HEIGHT, MAZE_WIDTH, TILE_FLOOR, TILE_WALL


class SpawnPositions(NamedTuple):
    """各キャラクターのスポーン座標（グリッド単位）"""
    player: tuple[int, int]
    enemy: tuple[int, int]
    goal: tuple[int, int]


class MazeResult(NamedTuple):
    """迷路生成の結果一式"""
    grid: list[list[int]]
    spawns: SpawnPositions


def generate_maze(
    width: int = MAZE_WIDTH,
    height: int = MAZE_HEIGHT,
) -> MazeResult:
    """
    ランダムな迷路を生成する。

    Args:
        width: グリッド幅（タイル数）
        height: グリッド高さ（タイル数）

    Returns:
        迷路グリッドとスポーン位置
    """
    # 全セルを壁で初期化
    grid = [[TILE_WALL for _ in range(width)] for _ in range(height)]

    def neighbors(cx: int, cy: int) -> list[tuple[int, int]]:
        """2マス先の未訪問セル候補を返す"""
        directions = [(0, -2), (0, 2), (-2, 0), (2, 0)]
        result = []
        for dx, dy in directions:
            nx, ny = cx + dx, cy + dy
            if 1 <= nx < width - 1 and 1 <= ny < height - 1 and grid[ny][nx] == TILE_WALL:
                result.append((nx, ny))
        return result

    # (1,1) から掘り進める
    start_x, start_y = 1, 1
    grid[start_y][start_x] = TILE_FLOOR
    stack = [(start_x, start_y)]

    while stack:
        cx, cy = stack[-1]
        candidates = neighbors(cx, cy)
        if not candidates:
            stack.pop()
            continue

        nx, ny = random.choice(candidates)
        # 現在セルと新セルの間の壁も通路にする
        wall_x = cx + (nx - cx) // 2
        wall_y = cy + (ny - cy) // 2
        grid[wall_y][wall_x] = TILE_FLOOR
        grid[ny][nx] = TILE_FLOOR
        stack.append((nx, ny))

    spawns = _pick_spawn_positions(grid, width, height)
    return MazeResult(grid=grid, spawns=spawns)


def _pick_spawn_positions(
    grid: list[list[int]],
    width: int,
    height: int,
) -> SpawnPositions:
    """
    通路タイルの中からプレイヤー・敵・ゴールの位置を選ぶ。

    プレイヤーは入口付近、敵は対角付近、ゴールはプレイヤーから最も遠い通路。
    """
    floors = [(x, y) for y in range(height) for x in range(width) if grid[y][x] == TILE_FLOOR]
    if len(floors) < 3:
        # フォールバック（通常は起きない）
        return SpawnPositions(player=(1, 1), enemy=(width - 2, height - 2), goal=(width // 2, height // 2))

    player_pos = floors[0]

    # プレイヤーからマンハッタン距離が最大のタイルをゴールに
    goal_pos = max(floors, key=lambda p: abs(p[0] - player_pos[0]) + abs(p[1] - player_pos[1]))

    # プレイヤー・ゴール以外でプレイヤーから最も遠いタイルを敵に
    remaining = [p for p in floors if p != player_pos and p != goal_pos]
    if remaining:
        enemy_pos = max(remaining, key=lambda p: abs(p[0] - player_pos[0]) + abs(p[1] - player_pos[1]))
    else:
        enemy_pos = goal_pos

    return SpawnPositions(player=player_pos, enemy=enemy_pos, goal=goal_pos)
