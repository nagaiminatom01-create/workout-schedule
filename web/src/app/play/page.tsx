import Link from "next/link";
import GameCanvas from "@/components/GameCanvas";

export default function PlayPage() {
  return (
    <main className="mx-auto flex min-h-screen flex-col items-center px-4 py-8">
      <div className="mb-6 flex w-full max-w-3xl items-center justify-between">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← トップへ
        </Link>
        <h1 className="text-lg font-semibold text-amber-400">川崎鬼ごっこ2</h1>
        <span className="w-16" />
      </div>
      <GameCanvas />
    </main>
  );
}
