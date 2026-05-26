"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Smartphone, AlertTriangle, LogOut, Heart } from "lucide-react";

interface PanicModeProps {
  isActive: boolean;
  durationMinutes: number;
  safetyContact?: {
    name: string;
    phone: string;
  };
  onRequestExit?: () => void;
  onDeactivate?: () => void;
}

export function PanicModeOverlay({
  isActive,
  durationMinutes,
  safetyContact,
  onRequestExit,
  onDeactivate,
}: PanicModeProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [breathing, setBreathing] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, durationMinutes]);

  useEffect(() => {
    if (!isActive) return;

    // Breathing cycle: 4s inhale, 4s hold, 4s exhale
    const breathingCycle = setInterval(() => {
      setBreathing((prev) => !prev);
    }, 4000);

    return () => clearInterval(breathingCycle);
  }, [isActive]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / (durationMinutes * 60)) * 100;

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col items-center justify-center p-6"
        >
          {/* Breathing Animation Background */}
          <motion.div
            animate={{
              scale: breathing ? 1.1 : 1,
            }}
            transition={{
              duration: 4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 opacity-10 bg-[var(--accent)]"
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 max-w-sm mx-auto text-center space-y-8"
          >
            {/* Header */}
            <motion.div
              animate={{ y: breathing ? -5 : 0 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="space-y-3"
            >
              <div className="flex justify-center">
                <motion.div
                  animate={{ rotate: breathing ? 0 : 360 }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                  className="text-[var(--accent)]"
                >
                  <Heart className="w-12 h-12 fill-current" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-bold text-[var(--text)]">
                Panic Mode Active
              </h1>
              <p className="text-[var(--text-muted)]">
                You&apos;re safe. Taking a breath to refocus.
              </p>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative w-48 h-48 mx-auto"
            >
              {/* Circular Progress */}
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="96"
                  cy="96"
                  r="85"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="85"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 85}
                  strokeDashoffset={2 * Math.PI * 85 * (1 - progress / 100)}
                  strokeLinecap="round"
                  transition={{ duration: 1 }}
                />
              </svg>

              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-[var(--text)] font-mono">
                  {formatTime(minutes, seconds)}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 uppercase tracking-wider">
                  Remaining
                </p>
              </div>
            </motion.div>

            {/* Allowed Actions */}
            <div className="space-y-3 pt-4">
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">
                Allowed Actions
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex flex-col items-center gap-2"
                >
                  <Phone className="w-6 h-6 text-green-500" />
                  <span className="text-xs font-medium">Emergency Calls</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex flex-col items-center gap-2"
                >
                  <Smartphone className="w-6 h-6 text-blue-500" />
                  <span className="text-xs font-medium">Messages</span>
                </motion.button>
              </div>
            </div>

            {/* Safety Contact */}
            {safetyContact && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
              >
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Safety Contact
                </p>
                <p className="font-medium text-[var(--text)]">{safetyContact.name}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRequestExit}
                  className="mt-3 w-full px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] font-medium text-sm hover:opacity-90 transition-all"
                >
                  Request Early Exit
                </motion.button>
              </motion.div>
            )}

            {/* Breathing Guide */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 text-xs text-[var(--text-muted)]"
            >
              <p className="uppercase tracking-wider">Guided Breathing</p>
              <motion.div
                animate={{ opacity: breathing ? 1 : 0.5 }}
                transition={{ duration: 4 }}
                className="space-y-1"
              >
                <p>Inhale for 4 seconds...</p>
                <p>Hold for 4 seconds...</p>
                <p>Exhale for 4 seconds...</p>
              </motion.div>
            </motion.div>

            {/* Exit Notice */}
            <p className="text-xs text-[var(--text-muted)] italic">
              Social media and distracting apps are blocked until time expires
            </p>
          </motion.div>

          {/* Bottom Emergency Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onRequestExit ?? onDeactivate}
            className="absolute bottom-6 left-6 right-6 p-3 rounded-lg border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text)] transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Exit Panic Mode
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
