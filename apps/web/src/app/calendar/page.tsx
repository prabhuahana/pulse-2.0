"use client";

import { useEffect } from "react";
import { CalendarConnections } from "@/components/CalendarConnections";
import { InteractiveCalendar } from "@/components/calendar/InteractiveCalendar";
import { useCalendarSync } from "@/hooks/useCalendarSync";
import { usePulseStore } from "@/store/usePulseStore";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  const calendarStatus = usePulseStore((s) => s.calendarStatus);
  const calendarSyncing = usePulseStore((s) => s.calendarSyncing);
  const calendarSyncError = usePulseStore((s) => s.calendarSyncError);
  const lastSyncAt = usePulseStore((s) => s.lastSyncAt);
  const setCalendarStatus = usePulseStore((s) => s.setCalendarStatus);
  const { syncCalendars } = useCalendarSync();

  const anyConnected =
    calendarStatus?.google ||
    calendarStatus?.microsoft ||
    calendarStatus?.apple;

  useEffect(() => {
    fetch("/api/calendar/connections")
      .then((r) => (r.ok ? r.json() : null))
      .then((status) => {
        if (status) setCalendarStatus(status);
      })
      .catch(() => {});
  }, [setCalendarStatus]);

  useEffect(() => {
    if (anyConnected && !lastSyncAt) {
      void syncCalendars();
    }
  }, [anyConnected, lastSyncAt, syncCalendars]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Plan your week, create events, and sync Google Calendar
        </p>
      </header>

      <CalendarConnections compact />

      {anyConnected && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void syncCalendars()}
            disabled={calendarSyncing}
            className="inline-flex items-center gap-2 rounded-pulse-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg)] disabled:opacity-50"
          >
            {calendarSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {calendarSyncing ? "Syncing…" : "Refresh sync"}
          </button>
          {lastSyncAt && (
            <span className="text-xs text-[var(--text-muted)]">
              Last synced {new Date(lastSyncAt).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {calendarSyncError && (
        <div
          className="flex items-start gap-2 rounded-pulse-lg border border-red-300 bg-red-500/10 p-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p>{calendarSyncError}</p>
            {calendarSyncError.includes("Reconnect") && (
              <Link
                href="/settings/calendar"
                className="mt-1 inline-block font-medium underline"
              >
                Reconnect Google Calendar
              </Link>
            )}
          </div>
        </div>
      )}

      {!anyConnected && (
        <Link
          href="/settings/calendar"
          className="block rounded-pulse-lg border border-dashed border-[var(--accent)] bg-[var(--accent)]/10 p-4 text-center text-sm font-medium text-[var(--accent)]"
        >
          Connect Google, Outlook, or Apple Calendar →
        </Link>
      )}

      <InteractiveCalendar />
    </div>
  );
}
