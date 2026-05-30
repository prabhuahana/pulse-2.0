"use client";

import { useEffect, useMemo, useState } from "react";
import type { WakeChallengeType } from "@/types/alarm";

interface WakeChallengeProps {
  type: WakeChallengeType;
  onSuccess: () => void;
}

function MathChallenge({ onSuccess }: { onSuccess: () => void }) {
  function generateExpression() {
    const numCount = Math.floor(Math.random() * 3) + 3; // 3..5 numbers
    const nums = Array.from({ length: numCount }, () =>
      Math.floor(Math.random() * 14) + 2
    );
    const operators = Array.from({ length: numCount - 1 }, () => {
      const ops = ["+", "-", "*", "/"];
      return ops[Math.floor(Math.random() * ops.length)];
    });

    // build tokens interleaved
    let tokens: string[] = [];
    for (let i = 0; i < numCount; i++) {
      tokens.push(String(nums[i]));
      if (i < operators.length) tokens.push(operators[i]);
    }

    // randomly add one pair of parentheses to increase BODMAS complexity
    if (operators.length >= 2 && Math.random() > 0.4) {
      const start = Math.floor(Math.random() * (operators.length - 0));
      const end = Math.min(
        start + 1 + Math.floor(Math.random() * (operators.length - start)),
        operators.length
      );
      // parentheses around numbers from start..end (inclusive)
      const leftIndex = start * 2; // token index
      const rightIndex = end * 2; // token index
      tokens.splice(leftIndex, 0, "(");
      tokens.splice(rightIndex + 2, 0, ")");
    }

    const expr = tokens.join(" ");

    const evaluate = (tokens: string[]) => {
      const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

      // shunting-yard to RPN
      const output: string[] = [];
      const opsStack: string[] = [];

      for (const t of tokens) {
        if (!isNaN(Number(t))) {
          output.push(t);
        } else if (t === "(") {
          opsStack.push(t);
        } else if (t === ")") {
          while (opsStack.length && opsStack[opsStack.length - 1] !== "(") {
            output.push(opsStack.pop()!);
          }
          opsStack.pop();
        } else {
          while (
            opsStack.length &&
            opsStack[opsStack.length - 1] !== "(" &&
            prec[opsStack[opsStack.length - 1]] >= prec[t]
          ) {
            output.push(opsStack.pop()!);
          }
          opsStack.push(t);
        }
      }
      while (opsStack.length) output.push(opsStack.pop()!);

      // evaluate RPN
      const stack: number[] = [];
      for (const tok of output) {
        if (!isNaN(Number(tok))) stack.push(Number(tok));
        else {
          const b = stack.pop()!;
          const a = stack.pop()!;
          let res = 0;
          if (tok === "+") res = a + b;
          else if (tok === "-") res = a - b;
          else if (tok === "*") res = a * b;
          else if (tok === "/") res = b === 0 ? a : a / b;
          stack.push(res);
        }
      }
      return stack[0];
    };

    const answer = evaluate(tokens);
    // show * as × and / as ÷ for readability
    const text = expr.replace(/\*/g, "×").replace(/\//g, "÷") + " = ?";
    return { text, answer };
  }

  const puzzle = useMemo(() => generateExpression(), []);

  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-center text-3xl font-bold">{puzzle.text}</p>
      <p className="text-center text-sm text-[var(--text-muted)]">
        Use order of operations (BODMAS). For divisions, round to two decimals.
      </p>
      <input
        type="text"
        inputMode="decimal"
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
          const num = Number(value);
          if (!isNaN(num)) {
            const correct = Math.abs(num - puzzle.answer) < 0.02;
            if (correct) onSuccess();
            else setWrong(true);
          } else {
            setWrong(true);
          }
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
