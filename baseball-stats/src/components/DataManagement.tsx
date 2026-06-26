import { useState } from "react";
import type { GameRecord } from "@/lib/types";
import { copyGamesToClipboard, downloadGamesJson } from "@/lib/storage";

interface DataManagementProps {
  games: GameRecord[];
  onReset: () => void;
  onImport: (jsonText: string) => number;
}

export function DataManagement({ games, onReset, onImport }: DataManagementProps) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  function showMessage(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleReset() {
    if (
      !window.confirm(
        "すべての試合データを削除して初期状態に戻します。\nこの操作は取り消せません。本当によろしいですか？",
      )
    ) {
      return;
    }
    onReset();
    setShowImport(false);
    setImportText("");
    showMessage("全データをリセットしました。");
  }

  async function handleExportCopy() {
    if (games.length === 0) {
      showMessage("エクスポートするデータがありません。");
      return;
    }
    try {
      await copyGamesToClipboard(games);
      showMessage(`${games.length}試合分をクリップボードにコピーしました。`);
    } catch {
      showMessage("クリップボードへのコピーに失敗しました。");
    }
  }

  function handleExportDownload() {
    if (games.length === 0) {
      showMessage("エクスポートするデータがありません。");
      return;
    }
    downloadGamesJson(games);
    showMessage(`${games.length}試合分をJSONファイルでダウンロードしました。`);
  }

  function handleImportSubmit() {
    if (!importText.trim()) {
      showMessage("インポートするJSONテキストを入力してください。");
      return;
    }

    const replaceMsg =
      games.length > 0
        ? `現在の${games.length}試合分のデータは上書きされます。`
        : "";

    if (
      !window.confirm(
        `インポートしたデータで復元します。\n${replaceMsg}\nよろしいですか？`,
      )
    ) {
      return;
    }

    try {
      const count = onImport(importText);
      setImportText("");
      setShowImport(false);
      showMessage(`${count}試合分のデータをインポートしました。`);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "インポートに失敗しました。");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImportText(reader.result);
        setShowImport(true);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-3 border-t border-zinc-800/60 pt-4">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        データ管理
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleExportCopy}
          className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-emerald-700/50 hover:text-emerald-300"
        >
          データをエクスポート（コピー）
        </button>
        <button
          type="button"
          onClick={handleExportDownload}
          className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-emerald-700/50 hover:text-emerald-300"
        >
          データをエクスポート（.json）
        </button>
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-emerald-700/50 hover:text-emerald-300"
        >
          データをインポート
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-2.5 text-sm text-red-400/90 transition hover:border-red-800/60 hover:bg-red-950/40"
        >
          全データをリセット
        </button>
      </div>

      {showImport && (
        <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-4">
          <label className="mb-2 block text-sm text-zinc-400">
            JSONテキストを貼り付け
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={6}
            placeholder='[{"id":"...","date":"2026-06-11",...}]'
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 outline-none focus:border-emerald-500"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300">
              ファイルを選択
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={handleImportSubmit}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              インポート実行
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport(false);
                setImportText("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p className="text-center text-xs text-emerald-400/90">{feedback}</p>
      )}
    </div>
  );
}
