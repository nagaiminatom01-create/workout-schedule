import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
      <p className="mb-3 text-sm tracking-widest text-amber-400 uppercase">
        Kawasaki Onigokko 2
      </p>
      <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
        川崎鬼ごっこ2
      </h1>
      <p className="mb-10 max-w-lg text-center text-lg text-zinc-400">
        ランダム生成された迷路でゴールを目指せ。
        <br />
        敵キャラクター「川崎」が A* で追いかけてくる——逃げ切ってクリアしよう。
      </p>

      <Link
        href="/play"
        className="rounded-xl bg-amber-400 px-8 py-4 text-lg font-bold text-zinc-900 transition hover:bg-amber-300"
      >
        いますぐプレイ
      </Link>

      <section className="mt-16 grid w-full gap-6 text-sm text-zinc-400 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-2 font-semibold text-white">毎回ちがう迷路</h2>
          <p>再帰的バックトラッキングで、プレイのたびに新しい迷路が生成されます。</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-2 font-semibold text-white">3段階の難易度</h2>
          <p>EASY / NORMAL / HARD から選べます。川崎の速度が変わります。</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="mb-2 font-semibold text-white">ダッシュ＆スタミナ</h2>
          <p>Shift でダッシュ。スタミナを管理しながら逃げ切りを目指そう。</p>
        </div>
      </section>
    </main>
  );
}
