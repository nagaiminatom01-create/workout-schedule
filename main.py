"""
main.py — 川崎鬼ごっこ2 のエントリーポイント

このファイルを実行するとゲームが起動します。

実行方法:
    python main.py
"""

from src.game import Game


def main() -> None:
    """ゲームを起動する"""
    game = Game()
    game.run()


if __name__ == "__main__":
    main()
