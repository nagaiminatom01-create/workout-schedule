import { Enemy } from "./enemy";
import { Goal } from "./goal";
import { loadHighscore, saveHighscore } from "./highscore";
import { MapData } from "./mapData";
import { generateMaze } from "./maze";
import { InputState, Player } from "./player";
import {
  drawCenteredText,
  drawEnemy,
  drawGoal,
  drawMaze,
  drawMinimap,
  drawPlayer,
  drawStaminaBar,
  drawText,
} from "./renderer";
import {
  COLORS,
  DIFFICULTIES,
  DIFFICULTY_NORMAL,
  Difficulty,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  STAMINA_BAR_HEIGHT,
  STAMINA_BAR_Y,
} from "./settings";

export type GameScreen =
  | "title"
  | "playing"
  | "clear"
  | "game_over";

export interface GameState {
  screen: GameScreen;
  highscore: number | null;
  selectedDifficultyIndex: number;
  difficulty: Difficulty;
  elapsedTime: number;
  lastClearTime: number | null;
  lastSurvivalTime: number | null;
  isNewRecord: boolean;
}

export class GameEngine {
  private state: GameState;
  private mapData: MapData | null = null;
  private player: Player | null = null;
  private enemy: Enemy | null = null;
  private goal: Goal | null = null;
  private keysPressed = new Set<string>();

  constructor() {
    this.state = {
      screen: "title",
      highscore: loadHighscore(),
      selectedDifficultyIndex: DIFFICULTIES.indexOf(DIFFICULTY_NORMAL),
      difficulty: DIFFICULTY_NORMAL,
      elapsedTime: 0,
      lastClearTime: null,
      lastSurvivalTime: null,
      isNewRecord: false,
    };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  setKeyDown(code: string): void {
    this.keysPressed.add(code);
    this.handleKeyDown(code);
  }

  setKeyUp(code: string): void {
    this.keysPressed.delete(code);
  }

  private handleKeyDown(code: string): void {
    const { screen } = this.state;

    if (screen === "title") {
      if (code === "ArrowUp" || code === "KeyW") {
        this.state.selectedDifficultyIndex =
          (this.state.selectedDifficultyIndex - 1 + DIFFICULTIES.length) %
          DIFFICULTIES.length;
      } else if (code === "ArrowDown" || code === "KeyS") {
        this.state.selectedDifficultyIndex =
          (this.state.selectedDifficultyIndex + 1) % DIFFICULTIES.length;
      } else if (code === "Enter" || code === "Space") {
        this.startGame(DIFFICULTIES[this.state.selectedDifficultyIndex]);
      }
      return;
    }

    if (screen === "clear" || screen === "game_over") {
      if (code === "Enter") {
        this.state.screen = "title";
        this.state.highscore = loadHighscore();
      } else if (code === "KeyR") {
        this.startGame(this.state.difficulty);
      }
      return;
    }

    if (screen === "playing" && code === "Escape") {
      this.state.screen = "title";
      this.state.highscore = loadHighscore();
    }
  }

  private startGame(difficulty: Difficulty): void {
    this.state.difficulty = difficulty;
    this.state.elapsedTime = 0;
    this.state.screen = "playing";
    this.setupNewMaze();
  }

  private setupNewMaze(): void {
    const result = generateMaze();
    this.mapData = new MapData(result.grid);

    const playerPos = this.mapData.gridToWorld(result.spawns.player);
    const enemyPos = this.mapData.gridToWorld(result.spawns.enemy);

    this.player = new Player(playerPos, this.mapData);
    this.enemy = new Enemy(enemyPos, this.mapData, this.state.difficulty);
    this.goal = new Goal(result.spawns.goal, this.mapData);
  }

  private getInputState(): InputState {
    return {
      up: this.keysPressed.has("ArrowUp") || this.keysPressed.has("KeyW"),
      down: this.keysPressed.has("ArrowDown") || this.keysPressed.has("KeyS"),
      left: this.keysPressed.has("ArrowLeft") || this.keysPressed.has("KeyA"),
      right: this.keysPressed.has("ArrowRight") || this.keysPressed.has("KeyD"),
      shift:
        this.keysPressed.has("ShiftLeft") || this.keysPressed.has("ShiftRight"),
    };
  }

  update(dt: number): void {
    if (this.state.screen !== "playing") return;
    if (!this.player || !this.enemy || !this.goal) return;

    this.state.elapsedTime += dt;
    this.player.handleInput(this.getInputState(), dt);
    this.enemy.update(this.player, this.state.elapsedTime);

    if (this.goal.isReached(this.player)) {
      const time = this.state.elapsedTime;
      const prev = loadHighscore();
      saveHighscore(time);
      this.state.lastClearTime = time;
      this.state.isNewRecord = prev === null || time < prev;
      this.state.highscore = loadHighscore();
      this.state.screen = "clear";
      return;
    }

    if (this.enemy.rect.colliderect(this.player.rect)) {
      this.state.lastSurvivalTime = this.state.elapsedTime;
      this.state.screen = "game_over";
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = rgb(COLORS.background);
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    switch (this.state.screen) {
      case "title":
        this.drawTitle(ctx);
        break;
      case "playing":
        this.drawPlaying(ctx);
        break;
      case "clear":
        this.drawClear(ctx);
        break;
      case "game_over":
        this.drawGameOver(ctx);
        break;
    }
  }

  private drawTitle(ctx: CanvasRenderingContext2D): void {
    drawCenteredText(
      ctx,
      "川崎鬼ごっこ2",
      SCREEN_WIDTH / 2,
      80,
      "bold 48px sans-serif",
      COLORS.highlight,
    );
    drawCenteredText(
      ctx,
      "〜 ゴールを目指して川崎から逃げろ！ 〜",
      SCREEN_WIDTH / 2,
      130,
      "22px sans-serif",
      COLORS.text_dim,
    );
    drawCenteredText(
      ctx,
      "難易度を選択",
      SCREEN_WIDTH / 2,
      200,
      "28px sans-serif",
      COLORS.text,
    );

    DIFFICULTIES.forEach((name, i) => {
      const selected = i === this.state.selectedDifficultyIndex;
      const prefix = selected ? "▶ " : "   ";
      drawCenteredText(
        ctx,
        `${prefix}${name}`,
        SCREEN_WIDTH / 2,
        250 + i * 40,
        "28px sans-serif",
        selected ? COLORS.highlight : COLORS.text_dim,
      );
    });

    const hsText =
      this.state.highscore !== null
        ? `ハイスコア: ${this.state.highscore.toFixed(2)} 秒`
        : "ハイスコア: ---";
    drawCenteredText(
      ctx,
      hsText,
      SCREEN_WIDTH / 2,
      380,
      "22px sans-serif",
      COLORS.text,
    );

    const helpLines = [
      "↑↓ / WS : 難易度選択",
      "Enter / Space : スタート",
    ];
    helpLines.forEach((line, i) => {
      drawCenteredText(
        ctx,
        line,
        SCREEN_WIDTH / 2,
        420 + i * 28,
        "22px sans-serif",
        COLORS.text_dim,
      );
    });
  }

  private drawPlaying(ctx: CanvasRenderingContext2D): void {
    if (!this.mapData || !this.player || !this.enemy || !this.goal) return;

    drawMaze(ctx, this.mapData);
    drawGoal(ctx, this.goal);
    drawPlayer(ctx, this.player);
    drawEnemy(ctx, this.enemy);

    drawStaminaBar(ctx, this.player.stamina);

    const hudY = STAMINA_BAR_Y + STAMINA_BAR_HEIGHT + 28;
    drawText(
      ctx,
      `TIME: ${this.state.elapsedTime.toFixed(1)}s`,
      10,
      hudY,
      "20px sans-serif",
      COLORS.text,
    );
    drawText(
      ctx,
      `難易度: ${this.state.difficulty}`,
      10,
      hudY + 24,
      "20px sans-serif",
      COLORS.text_dim,
    );
    drawText(
      ctx,
      "Esc: タイトル",
      10,
      SCREEN_HEIGHT - 28,
      "20px sans-serif",
      COLORS.text_dim,
    );

    drawMinimap(ctx, this.mapData, this.player, this.enemy, this.goal);
  }

  private drawClear(ctx: CanvasRenderingContext2D): void {
    drawCenteredText(
      ctx,
      "CLEAR!",
      SCREEN_WIDTH / 2,
      160,
      "bold 56px sans-serif",
      COLORS.highlight,
    );

    if (this.state.lastClearTime !== null) {
      drawCenteredText(
        ctx,
        `クリアタイム: ${this.state.lastClearTime.toFixed(2)} 秒`,
        SCREEN_WIDTH / 2,
        230,
        "28px sans-serif",
        COLORS.text,
      );
    }

    if (this.state.isNewRecord) {
      drawCenteredText(
        ctx,
        "NEW RECORD!",
        SCREEN_WIDTH / 2,
        280,
        "bold 32px sans-serif",
        COLORS.highlight,
      );
    }

    drawCenteredText(
      ctx,
      "Enter: タイトル  /  R: リトライ",
      SCREEN_WIDTH / 2,
      360,
      "22px sans-serif",
      COLORS.text_dim,
    );
  }

  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    drawCenteredText(
      ctx,
      "GAME OVER",
      SCREEN_WIDTH / 2,
      160,
      "bold 56px sans-serif",
      COLORS.enemy,
    );

    if (this.state.lastSurvivalTime !== null) {
      drawCenteredText(
        ctx,
        `生存時間: ${this.state.lastSurvivalTime.toFixed(2)} 秒`,
        SCREEN_WIDTH / 2,
        230,
        "28px sans-serif",
        COLORS.text,
      );
    }

    drawCenteredText(
      ctx,
      "Enter: タイトル  /  R: リトライ",
      SCREEN_WIDTH / 2,
      320,
      "22px sans-serif",
      COLORS.text_dim,
    );
  }
}

function rgb(color: [number, number, number]): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}
