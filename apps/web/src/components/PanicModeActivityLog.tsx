"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle, LogOut, BarChart3 } from "lucide-react";
import type { ActivityLogEntry } from "@/app/api/panic-mode/activity/route";

interface ActivityLogProps {
  userId: string;
  limit?: number;
}

const activityTypeConfig = {
  PANIC_START: {
    label: "Panic Mode Started",
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  PANIC_END: {
    label: "Panic Mode Ended",
    icon: LogOut,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  UNLOCK_REQUESTED: {
    label: "Early Exit Requested",
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  UNLOCK_APPROVED: {
    label: "Exit Approved",
    icon: CheckCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  UNLOCK_DENIED: {
    label: "Exit Denied",
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
};

export function PanicModeActivityLog({ userId, limit = 50 }: ActivityLogProps) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/panic-mode/activity?userId=${userId}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activity logs");
        }

        const data = await response.json();
        setLogs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // Poll for new activity every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-16 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      >
        <p className="text-sm text-red-700 dark:text-red-300">Error: {error}</p>
      </motion.div>
    );
  }

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-8 rounded-lg border-2 border-dashed border-[var(--border)]"
      >
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[var(--text-muted)]" />
        <p className="text-[var(--text-muted)]">No activity yet</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
        Panic Mode History
      </h3>
      {logs.map((log, index) => {
        const config = activityTypeConfig[log.type];
        const Icon = config.icon;
        const timestamp = new Date(log.timestamp);
        const timeAgo = getTimeAgo(timestamp);

        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border border-[var(--border)] ${config.bgColor} flex items-start gap-3`}
          >
            <div className={`mt-1 flex-shrink-0 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text)]">{config.label}</p>
              {log.metadata && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {log.metadata.duration &&
                    `Duration: ${formatDuration(log.metadata.duration)}`}
                  {log.metadata.durationMinutes &&
                    `Duration: ${log.metadata.durationMinutes}m`}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                {timeAgo}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
