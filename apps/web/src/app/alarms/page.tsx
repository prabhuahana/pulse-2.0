"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2 } from "lucide-react";
import {
  formatAlarmTime,
  useAlarmStore,
} from "@/store/useAlarmStore";
import type { AlarmRepeat, AlarmSound, WakeChallengeType } from "@/types/alarm";
import { requestNotificationPermission } from "@/lib/alarms/sounds";

const REPEAT_OPTIONS: { value: AlarmRepeat; label: string }[] = [
  { value: "none", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
];

const SOUND_OPTIONS: { value: AlarmSound; label: string }[] = [
  { value: "gentle", label: "Gentle" },
  { value: "classic", label: "Classic" },
  { value: "urgent", label: "Urgent" },
];

const CHALLENGE_OPTIONS: { value: WakeChallengeType; label: string }[] = [
  { value: "math", label: "Math problem" },
  { value: "memory", label: "Memory sequence" },
  { value: "typing", label: "Typing phrase" },
  { value: "steps", label: "Step count" },
];

export default function AlarmsPage() {
  const alarms = useAlarmStore((s) => s.alarms);
  const wakeChallengeType = useAlarmStore((s) => s.wakeChallengeType);
  const addAlarm = useAlarmStore((s) => s.addAlarm);
  const deleteAlarm = useAlarmStore((s) => s.deleteAlarm);
  const toggleAlarm = useAlarmStore((s) => s.toggleAlarm);
  const setWakeChallengeType = useAlarmStore((s) => s.setWakeChallengeType);

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Morning alarm");
  const [time, setTime] = useState("07:00");
  const [repeat, setRepeat] = useState<AlarmRepeat>("daily");
  const [sound, setSound] = useState<AlarmSound>("classic");

  async function handleCreate() {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    addAlarm({
      label: label.trim() || "Alarm",
      hour: h!,
      minute: m!,
      enabled: true,
      repeat,
      sound,
      vibration: true,
      snoozeMinutes: 5,
      maxSnoozes: 3,
    });
    setShowForm(false);
    await requestNotificationPermission();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Alarms</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Alarms keep ringing until you complete your wake challenge
        </p>
      </header>

      <section className="space-y-3 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Wake confirmation
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Choose how you must prove you are awake before an alarm stops
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CHALLENGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setWakeChallengeType(opt.value)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                wakeChallengeType === opt.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <ul className="space-y-2">
        {alarms.length === 0 && (
          <li className="flex flex-col items-center gap-2 py-12 text-[var(--text-muted)]">
            <Bell size={32} />
            <p className="text-sm">No alarms yet</p>
          </li>
        )}
        {alarms.map((alarm) => (
          <motion.li
            key={alarm.id}
            layout
            className="flex items-center justify-between rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
          >
            <div>
              <p className="font-medium">{alarm.label}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {formatAlarmTime(alarm.hour, alarm.minute)} · {alarm.repeat}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={alarm.enabled}
                onClick={() => toggleAlarm(alarm.id)}
                className={`h-7 w-12 rounded-full transition ${
                  alarm.enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white shadow transition ${
                    alarm.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => deleteAlarm(alarm.id)}
                className="p-2 text-red-600"
                aria-label="Delete alarm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>

      {showForm ? (
        <div className="space-y-3 rounded-pulse-lg border border-[var(--accent)] bg-[var(--surface)] p-4">
          <label className="block text-sm">
            Label
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Repeat
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value as AlarmRepeat)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            >
              {REPEAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Sound
            <select
              value={sound}
              onChange={(e) => setSound(e.target.value as AlarmSound)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
            >
              {SOUND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCreate()}
              className="flex-1 rounded-pulse-lg bg-[var(--accent)] py-2.5 font-medium text-[var(--bg)]"
            >
              Save alarm
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-pulse-lg border border-[var(--border)] px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-pulse-lg border-2 border-dashed border-[var(--border)] py-4 font-medium"
        >
          <Plus size={18} />
          Add alarm
        </button>
      )}

      <p className="text-xs text-[var(--text-muted)]">
        Keep this tab open or allow notifications so alarms can ring. On mobile,
        step detection uses motion sensors when available.
      </p>
    </div>
  );
}
