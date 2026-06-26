import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "野球成績記録",
  description: "打撃・投手の成績を試合ごとに記録し、通算スタッツを自動計算する個人用ツール。",
  appleWebApp: {
    capable: true,
    title: "野球成績記録",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a12",
};

export default function StatsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
