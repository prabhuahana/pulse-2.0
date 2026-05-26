"use client";

import { formatFocusTime } from "@/lib/utils";
import { usePulseStore } from "@/store/usePulseStore";
import { motion } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { useEffect } from "react";

export function FocusTimer() {
  const focusSecondsLeft = usePulseStore((s) => s.focusSecondsLeft);
  const focusRunning = usePulseStore((s) => s.focusRunning);
  const startFocus = usePulseStore((s) => s.startFocus);
  const tickFocus = usePulseStore((s) => s.tickFocus);
  const stopFocus = usePulseStore((s) => s.stopFocus);
  const reducedMotion = usePulseStore((s) => s.reducedMotion);

  useEffect(() => {
    if (!focusRunning) return;
    const id = setInterval(tickFocus, 1000);
    return () => clearInterval(id);
  }, [focusRunning, tickFocus]);

  const display = focusSecondsLeft ?? 25 * 60;
  const progress = focusSecondsLeft != null ? 1 - focusSecondsLeft / (25 * 60) : 0;

  return (
    <div className="flex flex-col items-center py-8">
      <motion.div
        animate={focusRunning && !reducedMotion ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 4 }}
        className="relative flex h-56 w-56 items-center justify-center rounded-full border-4 border-[var(--border)] bg-[var(--surface)] shadow-glow"
      >
        <svg className="absolute inset-2 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 276} 276`}
          />
        </svg>
        <span className="font-display text-5xl font-bold tabular-nums">
          {formatFocusTime(display)}
        </span>
      </motion.div>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        {focusRunning
          ? "Stay with one task. You've got this."
          : "Pick a task from Plan, then start focus."}
      </p>

      <div className="mt-8 flex gap-3">
        {!focusRunning ? (
          <>
            <button
              type="button"
              onClick={() => startFocus(25)}
              className="flex items-center gap-2 rounded-pulse-lg bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow-soft"
            >
              <Play size={18} /> 25 min
            </button>
            <button
              type="button"
              onClick={() => startFocus(15)}
              className="rounded-pulse-lg border border-[var(--border)] px-5 py-3 text-sm font-medium"
            >
              15 min
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => usePulseStore.setState({ focusRunning: false })}
              className="flex items-center gap-2 rounded-pulse-lg border border-[var(--border)] px-5 py-3"
            >
              <Pause size={18} /> Pause
            </button>
            <button
              type="button"
              onClick={stopFocus}
              className="flex items-center gap-2 rounded-pulse-lg bg-red-500/15 px-5 py-3 text-red-600"
            >
              <Square size={18} /> End
            </button>
          </>
        )}
      </div>
    </div>
  );
}
