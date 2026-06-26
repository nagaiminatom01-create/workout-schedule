import { useCallback, useEffect, useState } from "react";
import type { GameRecord } from "@/lib/types";
import { createSampleGames } from "@/lib/sampleData";
import {
  addGame,
  clearAllGames,
  loadGames,
  parseGamesJson,
  prependGames,
  removeGame,
  replaceGames,
  updateGame as updateGameStorage,
} from "@/lib/storage";

export function useGames() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setGames(loadGames());
    setHydrated(true);
  }, []);

  const saveGame = useCallback((game: GameRecord) => {
    setGames((prev) => addGame(prev, game));
  }, []);

  const updateGame = useCallback((game: GameRecord) => {
    setGames((prev) => updateGameStorage(prev, game));
  }, []);

  const deleteGame = useCallback((id: string) => {
    setGames((prev) => removeGame(prev, id));
  }, []);

  const addSampleGames = useCallback(() => {
    setGames((prev) => prependGames(prev, createSampleGames()));
  }, []);

  const resetAllGames = useCallback(() => {
    setGames(clearAllGames());
  }, []);

  const importGames = useCallback((jsonText: string) => {
    const imported = parseGamesJson(jsonText);
    setGames(replaceGames(imported));
    return imported.length;
  }, []);

  return {
    games,
    hydrated,
    saveGame,
    updateGame,
    deleteGame,
    addSampleGames,
    resetAllGames,
    importGames,
  };
}
