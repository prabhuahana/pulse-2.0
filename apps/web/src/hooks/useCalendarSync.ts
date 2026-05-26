"use client";

import { useCallback } from "react";
import { usePulseStore } from "@/store/usePulseStore";

export function useCalendarSync() {
  const mergeCalendarEvents = usePulseStore((s) => s.mergeCalendarEvents);
  const setCalendarStatus = usePulseStore((s) => s.setCalendarStatus);
  const setCalendarSyncing = usePulseStore((s) => s.setCalendarSyncing);
  const setCalendarSyncError = usePulseStore((s) => s.setCalendarSyncError);

  const syncCalendars = useCallback(async (): Promise<boolean> => {
    setCalendarSyncing(true);
    setCalendarSyncError(null);

    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Calendar sync failed";
        setCalendarSyncError(message);
        if (data.code === "AUTH_EXPIRED" && data.provider === "google") {
          setCalendarStatus({
            ...(usePulseStore.getState().calendarStatus ?? {
              google: false,
              microsoft: false,
              apple: false,
            }),
            google: false,
          });
        }
        return false;
      }

      mergeCalendarEvents(data.events ?? []);

      const connRes = await fetch("/api/calendar/connections");
      if (connRes.ok) {
        const status = await connRes.json();
        setCalendarStatus(status);
      }

      return true;
    } catch (e) {
      setCalendarSyncError(
        e instanceof Error ? e.message : "Calendar sync failed"
      );
      return false;
    } finally {
      setCalendarSyncing(false);
    }
  }, [
    mergeCalendarEvents,
    setCalendarStatus,
    setCalendarSyncing,
    setCalendarSyncError,
  ]);

  return { syncCalendars };
}
