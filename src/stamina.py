"""
stamina.py — スタミナの消費・回復・ダッシュ可否の管理

ダッシュ中はスタミナを消費し、0 になると枯渇状態になります。
枯渇中はスタミナが満タンに回復するまでダッシュできません。
"""

from src.settings import (
    STAMINA_DRAIN_PER_SECOND,
    STAMINA_MAX,
    STAMINA_RECOVERY_PER_SECOND,
)


class Stamina:
    """プレイヤーのスタミナを管理するクラス"""

    def __init__(self) -> None:
        self.current: float = STAMINA_MAX
        self.exhausted: bool = False  # 0 になったあとの枯渇フラグ

    @property
    def ratio(self) -> float:
        """残量の割合（0.0 〜 1.0）— バー描画用"""
        return self.current / STAMINA_MAX

    @property
    def can_dash(self) -> bool:
        """ダッシュ可能か（枯渇していなければスタミナ残量に関わらず可）"""
        return not self.exhausted and self.current > 0

    def update(self, dt: float, is_dashing: bool) -> None:
        """
        毎フレーム呼び出し。ダッシュ中は消費、それ以外は回復する。

        Args:
            dt: 経過秒数
            is_dashing: このフレームでダッシュしているか
        """
        if is_dashing and self.can_dash:
            self.current -= STAMINA_DRAIN_PER_SECOND * dt
            if self.current <= 0:
                self.current = 0.0
                self.exhausted = True
        else:
            self.current = min(STAMINA_MAX, self.current + STAMINA_RECOVERY_PER_SECOND * dt)
            # 満タンまで回復したら枯渇状態を解除
            if self.exhausted and self.current >= STAMINA_MAX:
                self.exhausted = False
