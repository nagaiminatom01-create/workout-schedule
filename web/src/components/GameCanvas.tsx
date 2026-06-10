"use client";

import { useEffect, useRef } from "react";
import { GameEngine } from "@/lib/game/gameEngine";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/game/settings";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new GameEngine();
    engineRef.current = engine;

    let animationId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;
      engine.update(dt);
      engine.draw(ctx);
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
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        className="rounded-lg border border-zinc-700 shadow-2xl"
        tabIndex={0}
        aria-label="川崎鬼ごっこ2 ゲーム画面"
      />
      <p className="max-w-[672px] text-center text-sm text-zinc-400">
        移動: 矢印キー / WASD　｜　ダッシュ: Shift　｜　難易度選択: ↑↓ / WS　｜　スタート: Enter / Space
      </p>
    </div>
  );
}
