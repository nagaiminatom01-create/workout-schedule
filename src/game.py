"""
game.py — ゲーム全体の管理（メインループ・画面遷移）

どの画面を表示するかを管理し、イベントを各画面に渡します。
画面の切り替えロジックはすべてここに集約されています。
"""

import pygame

from src.screens.base_screen import BaseScreen
from src.screens.clear_screen import ClearScreen
from src.screens.game_over_screen import GameOverScreen
from src.screens.game_screen import GameScreen
from src.screens.title_screen import TitleScreen
from src.settings import FPS, SCREEN_HEIGHT, SCREEN_WIDTH
from src.utils.highscore import load_highscore, save_highscore


class Game:
    """ゲーム全体を統括するクラス"""

    def __init__(self):
        pygame.init()
        pygame.display.set_caption("川崎鬼ごっこ2")
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        self.clock = pygame.time.Clock()
        self.running = True
        self.highscore = load_highscore()
        self.current_screen: BaseScreen = TitleScreen(self.highscore)

    def run(self) -> None:
        """メインループを開始する"""
        while self.running:
            dt = self.clock.tick(FPS) / 1000.0

            # イベント処理
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    break
                transition = self.current_screen.handle_event(event)
                if transition:
                    self._handle_transition(transition)

            if not self.running:
                break

            # 更新処理
            transition = self.current_screen.update(dt)
            if transition:
                self._handle_transition(transition)

            # 描画処理
            self.current_screen.draw(self.screen)
            pygame.display.flip()

        pygame.quit()

    def _handle_transition(self, signal: str) -> None:
        """
        画面遷移シグナルを解釈して画面を切り替える。

        シグナル形式の例:
            "title"
            "playing:HARD"
            "clear:45.32"
            "game_over:12.50"
            "quit"
        """
        if signal == "quit":
            self.running = False
            return

        if signal == "title":
            self.highscore = load_highscore()
            self.current_screen = TitleScreen(self.highscore)
            return

        if signal.startswith("playing:"):
            difficulty = signal.split(":", 1)[1]
            self.current_screen = GameScreen(difficulty=difficulty)
            return

        if signal.startswith("clear:"):
            clear_time = float(signal.split(":", 1)[1])
            difficulty = self._get_current_difficulty()
            is_new_record = save_highscore(clear_time)
            if is_new_record:
                self.highscore = clear_time
            self.current_screen = ClearScreen(clear_time, is_new_record, difficulty)
            return

        if signal.startswith("game_over:"):
            survival_time = float(signal.split(":", 1)[1])
            difficulty = self._get_current_difficulty()
            self.current_screen = GameOverScreen(survival_time, difficulty)
            return

    def _get_current_difficulty(self) -> str:
        """現在のゲーム画面から難易度を取得（リトライ用）"""
        if isinstance(self.current_screen, GameScreen):
            return self.current_screen.difficulty
        return "NORMAL"
