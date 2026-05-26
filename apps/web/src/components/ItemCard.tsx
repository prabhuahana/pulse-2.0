"use client";

import { COLOR_STYLES } from "@/lib/themes";
import { formatDue } from "@/lib/utils";
import { usePanicStore } from "@/store/usePanicStore";
import { usePulseStore } from "@/store/usePulseStore";
import type { ColorTag, PulseItem } from "@/lib/core";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Trash2 } from "lucide-react";

interface ItemCardProps {
  item: PulseItem;
  compact?: boolean;
}

export function ItemCard({ item, compact }: ItemCardProps) {
  const toggleComplete = usePulseStore((s) => s.toggleComplete);
  const deleteItem = usePulseStore((s) => s.deleteItem);
  const reducedMotion = usePulseStore((s) => s.reducedMotion);
  const panicActive = usePanicStore((s) => s.isActive);
  const colors = COLOR_STYLES[item.colorTag as ColorTag] ?? COLOR_STYLES.yellow;
  const done = item.status === "completed";
  const blocked =
    panicActive ||
    (item.metadata?.requiresSubmissionVerification &&
      !item.metadata?.submissionVerified &&
      !done);

  return (
    <motion.article
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
      className={`group relative flex gap-3 overflow-hidden rounded-pulse border border-[var(--border)] p-4 shadow-soft transition-shadow hover:shadow-md ${
        compact ? "p-3" : ""
      }`}
      style={{ background: colors.bg }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-pulse"
        style={{ background: colors.bar }}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => toggleComplete(item.id)}
        disabled={blocked}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          done
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : blocked
            ? "border-red-300 bg-red-100 text-red-500"
            : "border-[var(--text-muted)] hover:border-[var(--accent)]"
        }`}
        aria-label={
          panicActive
            ? "Task completion disabled during Panic Mode"
            : blocked
              ? "Submission proof required before completion"
              : done
                ? "Mark incomplete"
                : "Mark complete"
        }
      >
        <AnimatePresence>
          {done && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`font-medium leading-snug ${
            done ? "text-[var(--text-muted)] line-through" : ""
          }`}
        >
          {item.title}
        </h3>
        {!compact && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            {item.dueAt && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatDue(item.dueAt)}
              </span>
            )}
            {item.estimatedMinutes && (
              <span>{item.estimatedMinutes}m</span>
            )}
            <span className="capitalize">{item.type}</span>
          </div>
        )}
        {blocked && (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            Proof required before Pulse will mark this assignment complete.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => deleteItem(item.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500"
        aria-label="Delete"
      >
        <Trash2 size={16} />
      </button>
    </motion.article>
  );
}
