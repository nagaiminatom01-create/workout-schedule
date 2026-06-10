import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "川崎鬼ごっこ2",
  description:
    "ランダム迷路でゴールを目指せ！川崎から逃げ切ってクリアタイムを競おう。",
  openGraph: {
    title: "川崎鬼ごっこ2",
    description:
      "ランダム迷路でゴールを目指せ！川崎から逃げ切ってクリアタイムを競おう。",
    type: "website",
    locale: "ja_JP",
    siteName: "川崎鬼ごっこ2",
  },
  twitter: {
    card: "summary_large_image",
    title: "川崎鬼ごっこ2",
    description:
      "ランダム迷路でゴールを目指せ！川崎から逃げ切ってクリアタイムを競おう。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
