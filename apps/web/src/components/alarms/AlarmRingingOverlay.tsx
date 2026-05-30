"use client";

import { motion } from "framer-motion";
import { Bell, Moon } from "lucide-react";
import { WakeChallenge } from "@/components/alarms/WakeChallenge";
import type { Alarm } from "@/types/alarm";
import type { WakeChallengeType } from "@/types/alarm";

interface AlarmRingingOverlayProps {
  alarm: Alarm;
  wakeChallengeType: WakeChallengeType;
  snoozesLeft: number;
  onSnooze: () => void;
  onDismissed: () => void;
}

export function AlarmRingingOverlay({
  alarm,
  wakeChallengeType,
  snoozesLeft,
  onSnooze,
  onDismissed,
}: AlarmRingingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] p-6"
      role="alertdialog"
      aria-labelledby="alarm-ring-title"
    >
      <div className="flex flex-1 flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="rounded-full bg-[var(--accent)]/20 p-8 text-[var(--accent)]"
        >
          <Bell className="h-16 w-16" />
        </motion.div>

        <div className="text-center">
          <h1 id="alarm-ring-title" className="text-3xl font-bold">
            {alarm.label || "Alarm"}
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Complete the challenge to turn off your alarm
          </p>
        </div>

        <div className="w-full max-w-sm rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <WakeChallenge type={wakeChallengeType} onSuccess={onDismissed} />
        </div>

        {/* Snooze disabled per user preference */}
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        Alarm cannot be dismissed without completing the challenge
      </p>
    </motion.div>
  );
}
