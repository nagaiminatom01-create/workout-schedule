"""
settings.py — ゲーム全体で使う定数・設定をまとめるファイル

数値や色をここに集約しておくと、バランス調整が1か所で済みます。
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# パス設定
# ---------------------------------------------------------------------------
# プロジェクトのルートディレクトリ（src のひとつ上）
ROOT_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = ROOT_DIR / "assets"
IMAGE_DIR = ASSETS_DIR / "images"
FONT_DIR = ASSETS_DIR / "fonts"
DATA_DIR = ROOT_DIR / "data"
HIGHSCORE_FILE = DATA_DIR / "highscore.json"

# 画像読み込み時のキャンバスサイズ（アスペクト比維持でこの枠内に収める）
SPRITE_CANVAS_SIZE = 64

# 画像ファイル（存在しなければ矩形で代用）
IMAGE_PATHS = {
    "player": IMAGE_DIR / "player.png",
    "kawasaki": IMAGE_DIR / "kawasaki.png",
    "goal": IMAGE_DIR / "kouto.png",  # ゴール画像
}

# ---------------------------------------------------------------------------
# 画面・迷路サイズ
# ---------------------------------------------------------------------------
TILE_SIZE = 32
MAZE_WIDTH = 21   # タイル数（奇数推奨）
MAZE_HEIGHT = 15  # タイル数（奇数推奨）
SCREEN_WIDTH = MAZE_WIDTH * TILE_SIZE   # 672
SCREEN_HEIGHT = MAZE_HEIGHT * TILE_SIZE  # 480
FPS = 60

# ---------------------------------------------------------------------------
# 色定義（画像が無いときの矩形描画に使用）
# ---------------------------------------------------------------------------
COLORS = {
    "background": (20, 20, 30),
    "wall": (60, 60, 80),
    "floor": (35, 35, 50),
    "player": (80, 180, 255),
    "enemy": (255, 80, 80),
    "goal": (80, 220, 120),
    "shadow": (180, 40, 40),
    "text": (240, 240, 240),
    "text_dim": (160, 160, 180),
    "highlight": (255, 220, 80),
    "minimap_bg": (10, 10, 20),
    "minimap_wall": (80, 80, 100),
    "minimap_floor": (50, 50, 70),
    "minimap_border": (200, 200, 220),
    "stamina_bg": (40, 40, 55),
    "stamina_fill": (80, 200, 255),
    "stamina_exhausted": (180, 80, 80),
    "stamina_border": (200, 200, 220),
}

# ---------------------------------------------------------------------------
# プレイヤー設定
# ---------------------------------------------------------------------------
PLAYER_SPEED = 3  # 1フレームあたりの移動量（ピクセル）
DASH_SPEED_MULTIPLIER = 2.0  # ダッシュ中の速度倍率

# ---------------------------------------------------------------------------
# スタミナ・ダッシュ設定
# ---------------------------------------------------------------------------
STAMINA_MAX = 100.0
STAMINA_DRAIN_PER_SECOND = 45.0    # ダッシュ中の消費量（每秒）
STAMINA_RECOVERY_PER_SECOND = 30.0  # 非ダッシュ時の回復量（每秒）

# スタミナバー（画面左上に表示）
STAMINA_BAR_X = 10
STAMINA_BAR_Y = 10
STAMINA_BAR_WIDTH = 160
STAMINA_BAR_HEIGHT = 16

# ---------------------------------------------------------------------------
# 川崎（敵）設定 — 難易度ごとに速度を変える
# ---------------------------------------------------------------------------
SPEED_INCREASE_INTERVAL = 30  # 何秒ごとに速度を上げるか
SPEED_INCREASE_AMOUNT = 0.5   # 速度上昇量

# 難易度キー（タイトル画面の選択肢と対応）
DIFFICULTY_EASY = "EASY"
DIFFICULTY_NORMAL = "NORMAL"
DIFFICULTY_HARD = "HARD"
DIFFICULTIES = [DIFFICULTY_EASY, DIFFICULTY_NORMAL, DIFFICULTY_HARD]

# 難易度 → {base_speed, max_speed}
DIFFICULTY_SETTINGS = {
    DIFFICULTY_EASY: {"base_speed": 1.5, "max_speed": 3.5},
    DIFFICULTY_NORMAL: {"base_speed": 2.0, "max_speed": 5.0},
    DIFFICULTY_HARD: {"base_speed": 3.0, "max_speed": 6.5},
}

# ---------------------------------------------------------------------------
# ミニマップ設定（ゲーム画面右上に表示）
# ---------------------------------------------------------------------------
MINIMAP_WIDTH = 160
MINIMAP_HEIGHT = 110
MINIMAP_MARGIN = 8  # 画面端からの余白

# ---------------------------------------------------------------------------
# タイル種別（迷路グリッドの値）
# ---------------------------------------------------------------------------
TILE_WALL = 1
TILE_FLOOR = 0
