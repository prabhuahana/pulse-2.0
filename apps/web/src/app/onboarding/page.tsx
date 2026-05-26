"use client";

import { THEMES } from "@/lib/themes";
import { usePulseStore } from "@/store/usePulseStore";
import type { ThemePreset } from "@/lib/core";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const STEPS = ["welcome", "name", "theme", "ready"] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState<(typeof STEPS)[number]>("welcome");
  const [name, setName] = useState("");
  const completeOnboarding = usePulseStore((s) => s.completeOnboarding);
  const setTheme = usePulseStore((s) => s.setTheme);
  const theme = usePulseStore((s) => s.theme);

  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
    else completeOnboarding(name);
  }

  return (
    <div className="flex min-h-[80dvh] flex-col justify-center">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        {step === "welcome" && (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent)]/20 text-[var(--accent)]">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Welcome to Pulse</h1>
              <p className="mt-3 text-[var(--text-muted)] leading-relaxed">
                A calm space to organise tasks, deadlines, and focus — without the overwhelm.
              </p>
            </div>
          </>
        )}

        {step === "name" && (
          <>
            <h1 className="font-display text-2xl font-bold">What should we call you?</h1>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-pulse-lg border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-[var(--accent)]"
              autoFocus
            />
          </>
        )}

        {step === "theme" && (
          <>
            <h1 className="font-display text-2xl font-bold">Pick your vibe</h1>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(THEMES) as ThemePreset[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`rounded-pulse-lg border-2 p-4 text-left transition ${
                    theme === id ? "border-[var(--accent)]" : "border-[var(--border)]"
                  }`}
                  style={{ background: THEMES[id].gradient }}
                >
                  <span className="font-medium" style={{ color: THEMES[id].text }}>
                    {THEMES[id].label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "ready" && (
          <>
            <h1 className="font-display text-2xl font-bold">You&apos;re all set</h1>
            <p className="text-[var(--text-muted)] leading-relaxed">
              We&apos;ve added a few sample tasks so you can explore. Try quick capture on the home
              screen — natural language works.
            </p>
          </>
        )}

        <button
          type="button"
          onClick={next}
          disabled={step === "name" && !name.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-pulse-lg bg-[var(--accent)] py-4 font-semibold text-white disabled:opacity-50"
        >
          {step === "ready" ? "Open Pulse" : "Continue"}
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}
