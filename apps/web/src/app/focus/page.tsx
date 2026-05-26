"use client";

import { FocusTimer } from "@/components/FocusTimer";

export default function FocusPage() {
  return (
    <div className="space-y-4">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold">Focus</h1>
        <p className="text-sm text-[var(--text-muted)]">One task. One timer. Calm momentum.</p>
      </header>
      <FocusTimer />
    </div>
  );
}
