"use client";

import { useEffect, useState } from "react";
import { usePanicStore } from "@/store/usePanicStore";

const RECOVERY_SECONDS = 60;

export function PanicRecoveryPhase() {
  const recoveryStartedAt = usePanicStore((s) => s.recoveryStartedAt);
  const completeRecovery = usePanicStore((s) => s.completeRecovery);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const start = recoveryStartedAt
        ? new Date(recoveryStartedAt).getTime()
        : Date.now();
      const sec = Math.floor((Date.now() - start) / 1000);
      setElapsed(sec);
      if (sec >= RECOVERY_SECONDS) {
        completeRecovery();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [recoveryStartedAt, completeRecovery]);

  const remaining = Math.max(0, RECOVERY_SECONDS - elapsed);

  return (
    <div className="space-y-4 rounded-pulse-lg border border-[var(--accent)] bg-[var(--surface)] p-6 text-center">
      <h2 className="text-xl font-bold">Recovery breathing</h2>
      <p className="text-sm text-[var(--text-muted)]">
        All tasks complete. Take a final minute to stabilize before requesting
        exit.
      </p>
      <p className="text-5xl font-bold text-[var(--accent)]">{remaining}s</p>
      <p className="text-xs text-[var(--text-muted)]">
        Breathe slowly. This step cannot be skipped.
      </p>
    </div>
  );
}
