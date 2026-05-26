"use client";

import { useMemo, useState } from "react";
import type { PanicTask } from "@/types/panic-session";
import { usePanicStore } from "@/store/usePanicStore";

interface PanicWakeTaskProps {
  task: PanicTask;
}

export function PanicWakeTask({ task }: PanicWakeTaskProps) {
  const wakeFailureCount = usePanicStore((s) => s.wakeFailureCount);
  const completeWakeTask = usePanicStore((s) => s.completeWakeTask);
  const incrementWakeFailure = usePanicStore((s) => s.incrementWakeFailure);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  const difficulty = 1 + Math.floor(wakeFailureCount / 2);

  const puzzle = useMemo(() => {
    const a = Math.floor(Math.random() * (10 + difficulty * 3)) + 5;
    const b = Math.floor(Math.random() * (10 + difficulty * 3)) + 5;
    const ops = difficulty >= 2 ? ["+", "×", "-"] : ["+", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)]!;
    let answer = 0;
    if (op === "+") answer = a + b;
    if (op === "×") answer = a * b;
    if (op === "-") answer = a - b;
    return { text: `${a} ${op} ${b} = ?`, answer };
  }, [difficulty]);

  if (task.status === "verified") {
    return (
      <div className="rounded-pulse-lg border border-green-300 bg-green-500/10 p-4">
        <p className="font-semibold text-green-800">{task.title}</p>
        <p className="text-sm text-green-700">Wake challenge passed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-[var(--text-muted)]">{task.description}</p>
        {difficulty > 1 && (
          <p className="mt-1 text-xs text-amber-700">
            Difficulty increased after {wakeFailureCount} failed attempt(s)
          </p>
        )}
      </div>
      <p className="text-center text-2xl font-bold">{puzzle.text}</p>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setWrong(false);
        }}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center text-xl"
        autoFocus
      />
      {wrong && (
        <p className="text-center text-sm text-red-600">Incorrect — try again</p>
      )}
      <button
        type="button"
        onClick={() => {
          if (Number(value) === puzzle.answer) {
            completeWakeTask(task.id);
          } else {
            setWrong(true);
            incrementWakeFailure();
            setValue("");
          }
        }}
        className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-medium text-[var(--bg)]"
      >
        Confirm alertness
      </button>
    </div>
  );
}
