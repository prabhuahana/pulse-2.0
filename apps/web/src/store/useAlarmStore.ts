"use client";

import type {
  ActiveAlarmRing,
  Alarm,
  AlarmRepeat,
  AlarmSound,
  WakeChallengeType,
} from "@/types/alarm";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AlarmState {
  alarms: Alarm[];
  wakeChallengeType: WakeChallengeType;
  activeRing: ActiveAlarmRing | null;
  dismissedToday: string[];
  dismissedOnceAlarms: string[];

  setWakeChallengeType: (type: WakeChallengeType) => void;
  addAlarm: (alarm: Omit<Alarm, "id" | "createdAt" | "updatedAt">) => Alarm;
  updateAlarm: (id: string, patch: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  triggerRing: (alarmId: string) => void;
  snoozeActiveRing: () => void;
  dismissActiveRing: () => void;
  clearActiveRing: () => void;
}

function newAlarmId(): string {
  return `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set, get) => ({
      alarms: [],
      wakeChallengeType: "math",
      activeRing: null,
      dismissedToday: [],
      dismissedOnceAlarms: [],

      setWakeChallengeType: (wakeChallengeType) => set({ wakeChallengeType }),

      addAlarm: (partial) => {
        const now = new Date().toISOString();
        const alarm: Alarm = {
          id: newAlarmId(),
          createdAt: now,
          updatedAt: now,
          ...partial,
        };
        set((s) => ({ alarms: [...s.alarms, alarm] }));
        return alarm;
      },

      updateAlarm: (id, patch) =>
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id
              ? { ...a, ...patch, updatedAt: new Date().toISOString() }
              : a
          ),
        })),

      deleteAlarm: (id) =>
        set((s) => ({
          alarms: s.alarms.filter((a) => a.id !== id),
          activeRing:
            s.activeRing?.alarmId === id ? null : s.activeRing,
        })),

      toggleAlarm: (id) =>
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),

      triggerRing: (alarmId) =>
        set({
          activeRing: {
            alarmId,
            triggeredAt: new Date().toISOString(),
            snoozeCount: 0,
          },
        }),

      snoozeActiveRing: () => {
        const { activeRing, alarms } = get();
        if (!activeRing) return;
        const alarm = alarms.find((a) => a.id === activeRing.alarmId);
        if (!alarm) return;
        if (activeRing.snoozeCount >= alarm.maxSnoozes) return;

        const snoozedUntil = new Date(
          Date.now() + alarm.snoozeMinutes * 60 * 1000
        ).toISOString();

        set({
          activeRing: {
            ...activeRing,
            snoozeCount: activeRing.snoozeCount + 1,
            snoozedUntil,
          },
        });
      },

      dismissActiveRing: () => {
        const { activeRing, alarms } = get();
        if (!activeRing) return;
        const today = new Date().toDateString();
        const alarm = alarms.find((a) => a.id === activeRing.alarmId);
        set((s) => ({
          activeRing: null,
          dismissedToday: [...s.dismissedToday, `${activeRing.alarmId}-${today}`],
          dismissedOnceAlarms:
            alarm?.repeat === "none"
              ? [...s.dismissedOnceAlarms, activeRing.alarmId]
              : s.dismissedOnceAlarms,
        }));
      },

      clearActiveRing: () => set({ activeRing: null }),
    }),
    {
      name: "pulse-alarms-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function shouldAlarmRingToday(
  alarm: Alarm,
  now = new Date(),
  dismissedOnceAlarms: string[] = []
): boolean {
  if (!alarm.enabled) return false;

  const day = now.getDay();

  switch (alarm.repeat) {
    case "none":
      return !dismissedOnceAlarms.includes(alarm.id);
    case "daily":
      return true;
    case "weekdays":
      return day >= 1 && day <= 5;
    case "weekends":
      return day === 0 || day === 6;
    case "weekly":
      return alarm.repeatDays?.includes(day) ?? false;
    default:
      return true;
  }
}

export function isAlarmDue(
  alarm: Alarm,
  now = new Date(),
  dismissedOnceAlarms: string[] = []
): boolean {
  if (!shouldAlarmRingToday(alarm, now, dismissedOnceAlarms)) return false;
  return now.getHours() === alarm.hour && now.getMinutes() === alarm.minute;
}

export function formatAlarmTime(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
