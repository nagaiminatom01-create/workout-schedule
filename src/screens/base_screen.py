"""
base_screen.py — 全画面の共通インターフェース（基底クラス）

各画面（タイトル・ゲーム・クリアなど）はこのクラスを継承し、
handle_event / update / draw の3メソッドを実装します。
"""

from abc import ABC, abstractmethod

import pygame


class BaseScreen(ABC):
    """画面の基底クラス — すべての画面が継承する"""

    @abstractmethod
    def handle_event(self, event: pygame.event.Event) -> str | None:
        """
        キーボードやマウスのイベントを処理する。

        Returns:
            画面遷移先の名前（"title", "playing" など）。遷移しない場合は None
        """

    @abstractmethod
    def update(self, dt: float) -> str | None:
        """
        毎フレームの更新処理。

        Args:
            dt: 前フレームからの経過秒数

        Returns:
            画面遷移先の名前。遷移しない場合は None
        """

    @abstractmethod
    def draw(self, surface: pygame.Surface) -> None:
        """画面の描画処理"""
