"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { PanicImageTask } from "@/components/panic/PanicImageTask";
import { PanicInteractionTask } from "@/components/panic/PanicInteractionTask";
import { PanicUnlockSection } from "@/components/panic/PanicUnlockSection";
import { PanicWakeTask } from "@/components/panic/PanicWakeTask";
import { useStiloUserId } from "@/hooks/useStiloUserId";
import { getPanicRemainingSeconds, usePanicStore } from "@/store/usePanicStore";
import { useStiloStore } from "@/store/useStiloStore";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function PanicActivePage() {
  const router = useRouter();
  const userId = useStiloUserId();
  const userName = useStiloStore((s) => s.userName);
  const endPanicMode = useStiloStore((s) => s.endPanicMode);

  const hydrated = usePanicStore((s) => s.hydrated);
  const isActive = usePanicStore((s) => s.isActive);
  const sessionId = usePanicStore((s) => s.sessionId);
  const tasks = usePanicStore((s) => s.tasks);
  const endSession = usePanicStore((s) => s.endSession);
  const allTasksVerified = usePanicStore((s) => s.allTasksVerified);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isActive) {
      router.replace("/home");
    }
  }, [hydrated, isActive, router]);

  if (!hydrated || !isActive || !sessionId) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const remaining = getPanicRemainingSeconds();
  const verifiedCount = tasks.filter((t) => t.status === "verified").length;
  const tasksComplete = allTasksVerified();

  function handleSessionEnd() {
    endSession();
    endPanicMode();
    router.replace("/home");
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-600"
        >
          <Heart className="h-7 w-7 fill-current" />
        </motion.div>
        <h1 className="font-display text-2xl font-bold">Panic Mode Active</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {tasksComplete
            ? "All tasks complete. You can exit now."
            : "Complete tasks to exit with one tap, or ask a safety contact for a code."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">Timer</p>
          <p className="font-mono text-2xl font-bold">{formatTime(remaining)}</p>
        </div>
        <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">Tasks verified</p>
          <p className="font-mono text-2xl font-bold">
            {verifiedCount}/{tasks.length}
          </p>
        </div>
      </div>

      {tasksComplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <button
            type="button"
            onClick={handleSessionEnd}
            className="flex w-full items-center justify-center gap-2 rounded-pulse-lg bg-green-600 py-4 text-lg font-semibold text-white shadow-soft hover:bg-green-700"
          >
            <CheckCircle2 className="h-6 w-6" />
            Exit Panic Mode
          </button>
          <p className="text-center text-xs text-[var(--text-muted)]">
            You finished every task. No contact code needed.
          </p>
        </motion.div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Leaving or refreshing will bring you back here until Panic Mode ends.
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {tasksComplete ? "Completed tasks" : "Required tasks"}
        </h2>
        {tasks.map((task) => {
          if (task.type === "image") {
            return (
              <PanicImageTask
                key={task.id}
                task={task}
                sessionId={sessionId}
              />
            );
          }
          if (task.type === "interaction") {
            return <PanicInteractionTask key={task.id} task={task} />;
          }
          return <PanicWakeTask key={task.id} task={task} />;
        })}
      </div>

      <PanicUnlockSection
        userId={userId}
        userName={userName || "Stilo user"}
        onSessionEnd={handleSessionEnd}
        earlyExit={!tasksComplete}
      />
    </div>
  );
}
