"use client";

import {
  FocusWidget,
  GreetingHeader,
  QuoteWidget,
  ScoreAndStreak,
  VirtualPetWidget,
  WeatherWidget,
} from "@/components/DashboardWidgets";
import { ItemCard } from "@/components/ItemCard";
import { QuickCapture } from "@/components/QuickCapture";
import { SectionBlock } from "@/components/SectionBlock";
import { activatePanicSession } from "@/lib/panic/startSession";
import { usePulseUserId } from "@/hooks/usePulseUserId";
import { usePanicStore } from "@/store/usePanicStore";
import { usePulseStore } from "@/store/usePulseStore";
import { groupBySection } from "@/lib/core";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const userId = usePulseUserId();
  const items = usePulseStore((s) => s.items);
  const panicActive = usePanicStore((s) => s.isActive);
  const safetyContacts = usePulseStore((s) => s.safetyContacts);
  const cooldownUntil = usePanicStore((s) => s.cooldownUntil);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = items.filter((i) => i.status !== "completed");
  const groups = groupBySection(active);
  const doNow = groups["Do Now"].slice(0, 3);

  const onCooldown =
    cooldownUntil && new Date(cooldownUntil) > new Date();

  async function handleStartPanic() {
    if (panicActive) {
      router.push("/panic/active");
      return;
    }
    const withEmail = safetyContacts.filter((c) => c.email?.trim());
    if (withEmail.length === 0) {
      sessionStorage.setItem("settingsTab", "panic");
      router.push("/settings");
      return;
    }
    if (onCooldown) {
      setError(
        `Please wait until ${new Date(cooldownUntil!).toLocaleTimeString()} before starting again.`
      );
      return;
    }

    setStarting(true);
    setError(null);
    try {
      await activatePanicSession({ userId });
      router.push("/panic/active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Panic Mode");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <GreetingHeader />

      {panicActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-pulse-lg border-2 border-red-400/50 bg-red-500/10 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Panic mode active</p>
              <p className="mt-1 text-sm text-red-600/90">
                Return to your safety tasks to complete verification.
              </p>
              <button
                type="button"
                onClick={() => router.push("/panic/active")}
                className="mt-2 text-xs font-medium underline"
              >
                Open Panic Mode
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ScoreAndStreak />

      <div className="grid grid-cols-2 gap-3">
        <FocusWidget />
        <VirtualPetWidget />
        <WeatherWidget />
        <QuoteWidget />
      </div>

      <QuickCapture />

      {doNow.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Do now
          </h2>
          <ul className="space-y-2">
            {doNow.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} compact />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!panicActive && (
        <SectionBlock title="Quick Wins" items={groups["Quick Wins"].slice(0, 2)} />
      )}

      <button
        type="button"
        onClick={() => void handleStartPanic()}
        disabled={starting || Boolean(onCooldown && !panicActive)}
        className="flex w-full items-center justify-center gap-2 rounded-pulse border border-dashed border-[var(--border)] py-3 text-sm text-[var(--text-muted)] disabled:opacity-50"
      >
        {starting && <Loader2 className="h-4 w-4 animate-spin" />}
        {panicActive
          ? "Return to Panic Mode"
          : onCooldown
            ? "Cooldown active"
            : "Start Panic Mode"}
      </button>
    </div>
  );
}
