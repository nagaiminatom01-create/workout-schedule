"""
highscore.py — ハイスコア（最速クリアタイム）の保存・読み込み

data/highscore.json に JSON 形式で記録します。
短いタイムほど良いスコアです。
"""

import json
from datetime import datetime
from pathlib import Path

from src.settings import DATA_DIR, HIGHSCORE_FILE


def _ensure_data_dir() -> None:
    """data フォルダが無ければ作成する"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_highscore() -> float | None:
    """
    保存済みの最速クリアタイムを読み込む。

    Returns:
        記録がある場合は秒数（float）、無い場合は None
    """
    if not HIGHSCORE_FILE.exists():
        return None

    try:
        with open(HIGHSCORE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        best = data.get("best_time")
        return float(best) if best is not None else None
    except (json.JSONDecodeError, ValueError, OSError):
        return None


def save_highscore(clear_time: float) -> bool:
    """
    クリアタイムをハイスコアとして保存する。
    既存記録より速い（小さい）場合のみ上書きする。

    Args:
        clear_time: クリアにかかった秒数

    Returns:
        新記録を保存した場合 True、更新しなかった場合 False
    """
    _ensure_data_dir()
    current = load_highscore()

    if current is not None and clear_time >= current:
        return False

    data = {
        "best_time": round(clear_time, 2),
        "updated_at": datetime.now().isoformat(timespec="seconds"),
    }

    with open(HIGHSCORE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return True
