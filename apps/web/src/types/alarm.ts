export type WakeChallengeType = "math" | "memory" | "typing" | "steps";

export type AlarmRepeat = "none" | "daily" | "weekdays" | "weekends" | "weekly";

export type AlarmSound = "gentle" | "classic" | "urgent";

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  repeat: AlarmRepeat;
  repeatDays?: number[];
  sound: AlarmSound;
  vibration: boolean;
  snoozeMinutes: number;
  maxSnoozes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveAlarmRing {
  alarmId: string;
  triggeredAt: string;
  snoozeCount: number;
  snoozedUntil?: string;
}
