"""
sprites.py — 画像ファイルの読み込みヘルパー

assets/images/ に画像があれば使い、なければ None を返します。
読み込み時は 64x64 のキャンバスに、アスペクト比を維持して中央配置します。
呼び出し側（player.py など）が None のとき矩形描画に切り替えます。
"""

from pathlib import Path

import pygame

from src.settings import SPRITE_CANVAS_SIZE


def load_sprite(path: Path) -> pygame.Surface | None:
    """
    画像を読み込み、64x64 キャンバスに収めた Surface を返す。

    縦長・横長の画像でもアスペクト比を維持し、余白は透過のまま中央に配置します。

    Args:
        path: 画像ファイルのパス

    Returns:
        読み込み成功時は 64x64 の Surface、ファイルが無い・読み込み失敗時は None
    """
    if not path.exists():
        return None

    try:
        image = pygame.image.load(str(path)).convert_alpha()
        return _fit_to_canvas(image, SPRITE_CANVAS_SIZE)
    except pygame.error:
        return None


def _fit_to_canvas(image: pygame.Surface, canvas_size: int) -> pygame.Surface:
    """
    画像をアスペクト比を維持したまま canvas_size x canvas_size の枠内に収める。

    Args:
        image: 元画像
        canvas_size: キャンバスの一辺の長さ（ピクセル）

    Returns:
        中央配置済みの正方形キャンバス Surface
    """
    original_width, original_height = image.get_size()

    # 縦横どちらが長くても枠内に収まるよう、短い方に合わせてスケール
    scale = min(canvas_size / original_width, canvas_size / original_height)
    new_width = max(1, int(original_width * scale))
    new_height = max(1, int(original_height * scale))

    scaled = pygame.transform.smoothscale(image, (new_width, new_height))

    # 透過付きの正方形キャンバスを作り、中央に画像を配置
    canvas = pygame.Surface((canvas_size, canvas_size), pygame.SRCALPHA)
    x = (canvas_size - new_width) // 2
    y = (canvas_size - new_height) // 2
    canvas.blit(scaled, (x, y))

    return canvas
