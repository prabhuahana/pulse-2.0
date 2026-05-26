"use client";

import { formatFocusTime, greeting } from "@/lib/utils";
import {
  useDailySummary,
  useProductivityScore,
  usePulseStore,
} from "@/store/usePulseStore";
import { motion } from "framer-motion";
import { Flame, Quote, Sun, Timer, Zap } from "lucide-react";
import Link from "next/link";

export function GreetingHeader() {
  const userName = usePulseStore((s) => s.userName);
  const summary = useDailySummary();
  const panicMode = usePulseStore((s) => s.panicMode);

  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{greeting()},</p>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {userName || "friend"}
          </h1>
        </div>
        {panicMode && (
          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-600">
            Panic mode
          </span>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md"
      >
        <p className="text-sm leading-relaxed">{summary.message}</p>
      </motion.div>
    </header>
  );
}

export function ScoreAndStreak() {
  const score = useProductivityScore();
  const streak = usePulseStore((s) => s.streak);
  const xp = usePulseStore((s) => s.xp);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`}
          />
        </svg>
        <span className="font-display text-xl font-bold">{score}</span>
      </div>
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-muted)]">Productivity score</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium">
            <Flame size={14} /> {streak} day streak
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/15 px-2.5 py-1 text-xs font-medium">
            <Zap size={14} /> {xp} XP
          </span>
        </div>
      </div>
    </div>
  );
}

export function VirtualPetWidget() {
  const petStage = usePulseStore((s) => s.petStage);
  const stages = ["🌱", "🪴", "🌿", "🌸", "🌳"];
  const emoji = stages[Math.min(Math.floor(petStage), stages.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md">
      <span className="text-4xl" role="img" aria-label="Virtual plant">
        {emoji}
      </span>
      <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">Sprout is growing</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${Math.min(100, petStage * 10)}%` }}
        />
      </div>
    </div>
  );
}

export function FocusWidget() {
  const focusSecondsLeft = usePulseStore((s) => s.focusSecondsLeft);
  const focusRunning = usePulseStore((s) => s.focusRunning);

  return (
    <Link
      href="/focus"
      className="flex flex-col justify-between rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md transition hover:shadow-glow"
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
        <Timer size={16} />
      </div>
      <p className="font-display text-lg font-semibold">
        {focusSecondsLeft != null ? formatFocusTime(focusSecondsLeft) : "Focus"}
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        {focusRunning ? "Session active" : "Start a 25m session"}
      </p>
    </Link>
  );
}

export function QuoteWidget() {
  const quotes = [
    "Small steps still move you forward.",
    "You don't need to do everything — just the next thing.",
    "Rest is part of productivity.",
  ];
  const q = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md">
      <Quote size={16} className="mb-2 text-[var(--accent)]" />
      <p className="text-sm italic leading-relaxed text-[var(--text-muted)]">{q}</p>
    </div>
  );
}

export function WeatherWidget() {
  return (
    <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-md">
      <Sun size={16} className="mb-2 text-amber-500" />
      <p className="font-display text-lg font-semibold">22°</p>
      <p className="text-xs text-[var(--text-muted)]">Clear · Calm day</p>
    </div>
  );
}
