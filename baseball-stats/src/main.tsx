import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BaseballStatsApp } from "@/components/BaseballStatsApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <BaseballStatsApp />
    </main>
  </StrictMode>,
);
