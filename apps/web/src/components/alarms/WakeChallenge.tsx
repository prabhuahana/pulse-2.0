"use client";

import { useEffect, useMemo, useState } from "react";
import type { WakeChallengeType } from "@/types/alarm";

interface WakeChallengeProps {
  type: WakeChallengeType;
  onSuccess: () => void;
}

function MathChallenge({ onSuccess }: { onSuccess: () => void }) {
  const puzzle = useMemo(() => {
    const a = Math.floor(Math.random() * 12) + 3;
    const b = Math.floor(Math.random() * 12) + 3;
    const op = Math.random() > 0.5 ? "+" : "×";
    const answer = op === "+" ? a + b : a * b;
    return { text: `${a} ${op} ${b} = ?`, answer };
  }, []);

  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-center text-3xl font-bold">{puzzle.text}</p>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setWrong(false);
        }}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center text-xl"
        placeholder="Your answer"
        autoFocus
      />
      {wrong && (
        <p className="text-center text-sm text-red-600">Try again</p>
      )}
      <button
        type="button"
        onClick={() => {
          if (Number(value) === puzzle.answer) onSuccess();
          else setWrong(true);
        }}
        className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-semibold text-[var(--bg)]"
      >
        Submit
      </button>
    </div>
  );
}

function MemoryChallenge({ onSuccess }: { onSuccess: () => void }) {
  const sequence = useMemo(
    () =>
      Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 9).toString()
      ),
    []
  );
  const [phase, setPhase] = useState<"show" | "input">("show");
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  if (phase === "show") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Remember this sequence</p>
        <p className="text-4xl font-bold tracking-[0.5em]">{sequence.join("")}</p>
        <button
          type="button"
          onClick={() => setPhase("input")}
          className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-semibold text-[var(--bg)]"
        >
          Ready to type
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-[var(--text-muted)]">
        Enter the 4-digit sequence
      </p>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value.replace(/\D/g, "").slice(0, 4));
          setWrong(false);
        }}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center text-2xl tracking-[0.4em]"
        inputMode="numeric"
        autoFocus
      />
      {wrong && <p className="text-center text-sm text-red-600">Incorrect</p>}
      <button
        type="button"
        onClick={() => {
          if (value === sequence.join("")) onSuccess();
          else setWrong(true);
        }}
        className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-semibold text-[var(--bg)]"
      >
        Verify
      </button>
    </div>
  );
}

function TypingChallenge({ onSuccess }: { onSuccess: () => void }) {
  const phrase = useMemo(
    () =>
      ["I am awake", "Rise and shine", "New day starts now"][
        Math.floor(Math.random() * 3)
      ]!,
    []
  );
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-[var(--text-muted)]">
        Type exactly: <strong>{phrase}</strong>
      </p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3"
        autoFocus
      />
      <button
        type="button"
        disabled={value.trim() !== phrase}
        onClick={onSuccess}
        className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-semibold text-[var(--bg)] disabled:opacity-50"
      >
        Confirm awake
      </button>
    </div>
  );
}

function StepsChallenge({ onSuccess }: { onSuccess: () => void }) {
  const target = 25;
  const [steps, setSteps] = useState(0);
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.DeviceMotionEvent) return;
    let lastBump = 0;
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt(
        (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2
      );
      const now = Date.now();
      if (mag > 12 && now - lastBump > 400) {
        lastBump = now;
        setSteps((s) => Math.min(target, s + 1));
      }
    };
    window.addEventListener("devicemotion", handler);
    setMotionOk(true);
    return () => window.removeEventListener("devicemotion", handler);
  }, [target]);

  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-[var(--text-muted)]">
        {motionOk
          ? `Walk ${target} steps (${steps}/${target})`
          : "Tap the button once per step (motion sensors unavailable)"}
      </p>
      <p className="text-4xl font-bold">
        {steps}/{target}
      </p>
      {!motionOk && (
        <button
          type="button"
          onClick={() => setSteps((s) => Math.min(target, s + 1))}
          className="w-full rounded-pulse-lg border border-[var(--border)] py-4 text-lg font-medium"
        >
          +1 step
        </button>
      )}
      <button
        type="button"
        disabled={steps < target}
        onClick={onSuccess}
        className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-semibold text-[var(--bg)] disabled:opacity-50"
      >
        Done walking
      </button>
    </div>
  );
}

export function WakeChallenge({ type, onSuccess }: WakeChallengeProps) {
  switch (type) {
    case "math":
      return <MathChallenge onSuccess={onSuccess} />;
    case "memory":
      return <MemoryChallenge onSuccess={onSuccess} />;
    case "typing":
      return <TypingChallenge onSuccess={onSuccess} />;
    case "steps":
      return <StepsChallenge onSuccess={onSuccess} />;
    default:
      return <MathChallenge onSuccess={onSuccess} />;
  }
}
