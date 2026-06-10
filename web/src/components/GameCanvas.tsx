"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameEngine, type GameScreen, type GameState } from "@/lib/game/gameEngine";
import { copyClearResult, shareClearResult } from "@/lib/game/share";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/game/settings";

type TouchKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ShiftLeft";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [screen, setScreen] = useState<GameScreen>("title");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const syncState = useCallback((engine: GameEngine) => {
    const next = engine.getState();
    setScreen((prev) => (prev === next.screen ? prev : next.screen));
    setGameState(next);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new GameEngine();
    engineRef.current = engine;
    syncState(engine);
    canvas.focus();

    let animationId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;
      engine.update(dt);
      engine.draw(ctx);
      syncState(engine);
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      ) {
        e.preventDefault();
      }
      engine.setKeyDown(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engine.setKeyUp(e.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [syncState]);

  const pressKey = (code: TouchKey) => {
    engineRef.current?.setKeyDown(code);
  };

  const releaseKey = (code: TouchKey) => {
    engineRef.current?.setKeyUp(code);
  };

  const handleShare = () => {
    if (!gameState) return;
    shareClearResult(gameState);
  };

  const handleCopy = async () => {
    if (!gameState) return;
    const ok = await copyClearResult(gameState);
    setCopyMessage(ok ? "コピーしました！" : "コピーに失敗しました");
    window.setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          className="max-w-full rounded-lg border border-zinc-700 shadow-2xl outline-none"
          tabIndex={0}
          aria-label="川崎鬼ごっこ2 ゲーム画面"
          onPointerDown={() => canvasRef.current?.focus()}
        />

        {screen === "clear" && gameState && (
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-sky-400"
              >
                Xでクリアをシェア
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-zinc-500 bg-zinc-900/90 px-4 py-2 text-sm font-semibold text-zinc-100 shadow-lg transition hover:bg-zinc-800"
              >
                結果をコピー
              </button>
            </div>
            {copyMessage && (
              <p className="text-xs font-medium text-amber-300">{copyMessage}</p>
            )}
          </div>
        )}
      </div>

      <div className="w-full md:hidden">
        <p className="mb-3 text-center text-xs text-zinc-500">
          タッチ操作（スマホ向け）
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="grid grid-cols-3 gap-2">
            <span />
            <TouchButton
              label="↑"
              onPress={() => pressKey("ArrowUp")}
              onRelease={() => releaseKey("ArrowUp")}
            />
            <span />
            <TouchButton
              label="←"
              onPress={() => pressKey("ArrowLeft")}
              onRelease={() => releaseKey("ArrowLeft")}
            />
            <TouchButton
              label="↓"
              onPress={() => pressKey("ArrowDown")}
              onRelease={() => releaseKey("ArrowDown")}
            />
            <TouchButton
              label="→"
              onPress={() => pressKey("ArrowRight")}
              onRelease={() => releaseKey("ArrowRight")}
            />
          </div>
          <TouchButton
            label="DASH"
            wide
            onPress={() => pressKey("ShiftLeft")}
            onRelease={() => releaseKey("ShiftLeft")}
          />
        </div>
      </div>

      <p className="max-w-[672px] text-center text-sm text-zinc-400">
        移動: 矢印キー / WASD　｜　ダッシュ: Shift　｜　難易度選択: ↑↓ / WS　｜　スタート: Enter / Space
      </p>
    </div>
  );
}

function TouchButton({
  label,
  wide = false,
  onPress,
  onRelease,
}: {
  label: string;
  wide?: boolean;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/90 text-sm font-bold text-zinc-100 shadow active:bg-amber-500/80 active:text-zinc-900 ${
        wide ? "h-24 w-20" : "h-14 w-14"
      }`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onRelease();
      }}
      onPointerLeave={() => onRelease()}
      onPointerCancel={() => onRelease()}
    >
      {label}
    </button>
  );
}
