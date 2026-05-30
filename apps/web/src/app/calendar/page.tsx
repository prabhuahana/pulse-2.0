"use client";

import { InteractiveCalendar } from "@/components/calendar/InteractiveCalendar";
import { useStiloStore } from "@/store/useStiloStore";
import Link from "next/link";

export default function CalendarPage() {
  const calendarStatus = useStiloStore((s) => s.calendarStatus);
  const anyConnected =
    calendarStatus?.google ||
    calendarStatus?.microsoft ||
    calendarStatus?.apple;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-[var(--text-muted)]">
          A Google Calendar-style view for your synced and local events.
        </p>
      </header>

      {!anyConnected && (
        <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-medium text-[var(--text)]">Connect your calendar in Settings to import events.</p>
          <Link
            href="/settings"
            className="mt-3 inline-flex items-center rounded-pulse-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
          >
            Open settings
          </Link>
        </div>
      )}

      <InteractiveCalendar />
    </div>
  );
}
