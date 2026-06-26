import type { Metadata } from "next";
import { BaseballStatsApp } from "@/components/baseball/BaseballStatsApp";

export const metadata: Metadata = {
  title: "野球成績記録",
  description: "打撃・投手の成績を試合ごとに記録し、通算スタッツを自動計算する個人用ツール。",
};

export default function StatsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <BaseballStatsApp />
    </main>
  );
}
