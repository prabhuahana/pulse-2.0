import type { AlarmSound } from "@/types/alarm";

let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let oscillator: OscillatorNode | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

const SOUND_FREQ: Record<AlarmSound, number> = {
  gentle: 440,
  classic: 523,
  urgent: 660,
};

export function startAlarmSound(sound: AlarmSound): void {
  stopAlarmSound();
  const ctx = getContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  gainNode = ctx.createGain();
  gainNode.gain.value = 0.15;
  gainNode.connect(ctx.destination);

  oscillator = ctx.createOscillator();
  oscillator.type = sound === "urgent" ? "square" : "sine";
  oscillator.frequency.value = SOUND_FREQ[sound];
  oscillator.connect(gainNode);
  oscillator.start();

  let volume = 0.15;
  intervalId = setInterval(() => {
    if (!gainNode) return;
    volume = Math.min(0.85, volume + 0.04);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    if (oscillator && sound === "urgent") {
      oscillator.frequency.setValueAtTime(
        SOUND_FREQ[sound] + Math.sin(Date.now() / 200) * 40,
        ctx.currentTime
      );
    }
  }, 2000);
}

export function stopAlarmSound(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  try {
    oscillator?.stop();
  } catch {
    /* already stopped */
  }
  oscillator?.disconnect();
  gainNode?.disconnect();
  oscillator = null;
  gainNode = null;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showAlarmNotification(label: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("Stilo Alarm", {
      body: label,
      tag: "pulse-alarm",
      requireInteraction: true,
    });
  } catch {
    /* ignore */
  }
}

export function vibrateAlarm(): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([400, 200, 400, 200, 400]);
  }
}
