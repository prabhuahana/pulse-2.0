"use client";

import { useEffect, useRef } from "react";
import { AlarmRingingOverlay } from "@/components/alarms/AlarmRingingOverlay";
import {
  startAlarmSound,
  stopAlarmSound,
  vibrateAlarm,
  showAlarmNotification,
} from "@/lib/alarms/sounds";
import {
  isAlarmDue,
  useAlarmStore,
} from "@/store/useAlarmStore";

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const alarms = useAlarmStore((s) => s.alarms);
  const activeRing = useAlarmStore((s) => s.activeRing);
  const wakeChallengeType = useAlarmStore((s) => s.wakeChallengeType);
  const triggerRing = useAlarmStore((s) => s.triggerRing);
  const snoozeActiveRing = useAlarmStore((s) => s.snoozeActiveRing);
  const dismissActiveRing = useAlarmStore((s) => s.dismissActiveRing);
  const dismissedToday = useAlarmStore((s) => s.dismissedToday);
  const dismissedOnceAlarms = useAlarmStore((s) => s.dismissedOnceAlarms);

  const lastMinuteRef = useRef<string>("");
  const ringingAlarm = activeRing
    ? alarms.find((a) => a.id === activeRing.alarmId)
    : null;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const minuteKey = `${now.toDateString()}-${now.getHours()}-${now.getMinutes()}`;

      if (activeRing?.snoozedUntil) {
        if (new Date(activeRing.snoozedUntil) > now) return;
      }

      if (activeRing && ringingAlarm) return;

      if (minuteKey === lastMinuteRef.current) return;
      lastMinuteRef.current = minuteKey;

      for (const alarm of alarms) {
        const dismissKey = `${alarm.id}-${now.toDateString()}`;
        if (dismissedToday.includes(dismissKey)) continue;
        if (isAlarmDue(alarm, now, dismissedOnceAlarms)) {
          triggerRing(alarm.id);
          break;
        }
      }
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [alarms, activeRing, dismissedToday, dismissedOnceAlarms, triggerRing, ringingAlarm]);

  useEffect(() => {
    if (!activeRing || !ringingAlarm) {
      stopAlarmSound();
      return;
    }

    if (activeRing.snoozedUntil && new Date(activeRing.snoozedUntil) > new Date()) {
      stopAlarmSound();
      return;
    }

    startAlarmSound(ringingAlarm.sound);
    if (ringingAlarm.vibration) vibrateAlarm();
    showAlarmNotification(ringingAlarm.label);

    const vibeInterval = ringingAlarm.vibration
      ? setInterval(() => vibrateAlarm(), 3000)
      : null;

    return () => {
      stopAlarmSound();
      if (vibeInterval) clearInterval(vibeInterval);
    };
  }, [activeRing, ringingAlarm]);

  const snoozesLeft = ringingAlarm
    ? Math.max(0, ringingAlarm.maxSnoozes - (activeRing?.snoozeCount ?? 0))
    : 0;

  return (
    <>
      {children}
      {activeRing && ringingAlarm && (
        <AlarmRingingOverlay
          alarm={ringingAlarm}
          wakeChallengeType={wakeChallengeType}
          snoozesLeft={snoozesLeft}
          onSnooze={snoozeActiveRing}
          onDismissed={dismissActiveRing}
        />
      )}
    </>
  );
}
