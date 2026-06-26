"use client";

import { useState } from "react";
import { Dashboard } from "@/components/baseball/Dashboard";
import { GameForm } from "@/components/baseball/GameForm";
import type { GameRecord } from "@/lib/baseball/types";
import { useGames } from "@/lib/baseball/useGames";

type MainTab = "input" | "dashboard";

export function BaseballStatsApp() {
  const [tab, setTab] = useState<MainTab>("input");
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);
  const {
    games,
    hydrated,
    saveGame,
    updateGame,
    deleteGame,
    addSampleGames,
    resetAllGames,
    importGames,
  } = useGames();

  function handleEdit(game: GameRecord) {
    setEditingGame(game);
    setTab("input");
  }

  function handleDelete(id: string) {
    deleteGame(id);
    setEditingGame((prev) => (prev?.id === id ? null : prev));
  }

  function handleSave(game: GameRecord) {
    saveGame(game);
  }

  function handleUpdate(game: GameRecord) {
    updateGame(game);
    setEditingGame(null);
    setTab("dashboard");
  }

  function handleCancelEdit() {
    setEditingGame(null);
  }

  function handleReset() {
    resetAllGames();
    setEditingGame(null);
  }

  function handleImport(jsonText: string) {
    const count = importGames(jsonText);
    setEditingGame(null);
    return count;
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-1 text-sm tracking-widest text-emerald-400 uppercase">
          Baseball Stats
        </p>
        <h1 className="text-3xl font-bold text-white md:text-4xl">野球成績記録</h1>
        <p className="mt-2 text-zinc-400">
          打撃・投手の成績を試合ごとに記録し、通算スタッツを自動計算します。
        </p>
      </header>

      <nav className="mb-8 flex gap-2 border-b border-zinc-800">
        <MainTabButton
          active={tab === "input"}
          onClick={() => {
            if (tab !== "input") setTab("input");
          }}
        >
          成績入力
          {editingGame && (
            <span className="ml-2 rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-300">
              編集中
            </span>
          )}
        </MainTabButton>
        <MainTabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
          成績ダッシュボード
          {games.length > 0 && (
            <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {games.length}
            </span>
          )}
        </MainTabButton>
      </nav>

      {tab === "input" ? (
        <GameForm
          key={editingGame?.id ?? "new"}
          editingGame={editingGame}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <Dashboard
          games={games}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSampleData={addSampleGames}
          onReset={handleReset}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

function MainTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-emerald-500 text-emerald-300"
          : "border-transparent text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
