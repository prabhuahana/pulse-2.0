"use client";

import { useStiloStore } from "@/store/useStiloStore";
import { Sparkles } from "lucide-react";
import { useState, FormEvent } from "react";

export function QuickCapture() {
  const addItemFromInput = useStiloStore((s) => s.addItemFromInput);
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    addItemFromInput(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3 shadow-soft">
        <Sparkles size={18} className="shrink-0 text-[var(--accent)]" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Try: "remind me to study chemistry tomorrow at 4"'
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
          aria-label="Quick capture"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-xl bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </form>
  );
}
