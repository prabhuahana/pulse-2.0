"use client";

import { useEffect, useState } from "react";
import type { PanicTask } from "@/types/panic-session";
import { usePanicStore } from "@/store/usePanicStore";

interface PanicInteractionTaskProps {
  task: PanicTask;
}

export function PanicInteractionTask({ task }: PanicInteractionTaskProps) {
  const startInteraction = usePanicStore((s) => s.startInteraction);
  const tickInteraction = usePanicStore((s) => s.tickInteraction);
  const completeInteraction = usePanicStore((s) => s.completeInteraction);
  const [journal, setJournal] = useState("");
  const min = task.minDurationSec ?? 60;
  const elapsed = task.interactionElapsedSec;
  const verified = task.status === "verified";
  const running = task.status === "in_progress";

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const started = task.interactionStartedAt
        ? new Date(task.interactionStartedAt).getTime()
        : Date.now();
      const sec = Math.floor((Date.now() - started) / 1000);
      tickInteraction(task.id, sec);
      if (sec >= min && task.interactionKind !== "journal") {
        completeInteraction(task.id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [
    running,
    task.id,
    task.interactionStartedAt,
    task.interactionKind,
    min,
    tickInteraction,
    completeInteraction,
  ]);

  if (verified) {
    return (
      <div className="rounded-pulse-lg border border-green-300 bg-green-500/10 p-4">
        <p className="font-semibold text-green-800">{task.title}</p>
        <p className="text-sm text-green-700">Completed</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-[var(--text-muted)]">{task.description}</p>
      </div>

      {task.interactionKind === "breathing" && running && (
        <div className="text-center">
          <p className="text-4xl font-bold text-[var(--accent)]">
            {Math.max(0, min - elapsed)}s
          </p>
          <p className="mt-2 text-sm">Inhale 4s · Hold 4s · Exhale 4s</p>
        </div>
      )}

      {task.interactionKind === "grounding" && running && (
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          <li>5 things you can see</li>
          <li>4 things you can touch</li>
          <li>3 things you can hear</li>
          <li>2 things you can smell</li>
          <li>1 thing you can taste</li>
          <p className="pt-2 font-medium text-[var(--text)]">
            Time left: {Math.max(0, min - elapsed)}s
          </p>
        </ul>
      )}

      {task.interactionKind === "journal" && running && (
        <textarea
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          rows={4}
          placeholder="What are you feeling right now? What do you need?"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
        />
      )}

      {!running ? (
        <button
          type="button"
          onClick={() => startInteraction(task.id)}
          className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 text-sm font-medium text-[var(--bg)]"
        >
          Start ({min}s required)
        </button>
      ) : (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full bg-[var(--accent)] transition-all"
              style={{
                width: `${Math.min(100, (elapsed / min) * 100)}%`,
              }}
            />
          </div>
          {task.interactionKind === "journal" && (
            <button
              type="button"
              disabled={elapsed < min || journal.trim().length < 10}
              onClick={() => completeInteraction(task.id)}
              className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 text-sm font-medium text-[var(--bg)] disabled:opacity-50"
            >
              {elapsed < min
                ? `Continue (${min - elapsed}s left)`
                : "Submit journal"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
