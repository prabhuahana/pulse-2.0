import { usePanicStore } from "@/store/usePanicStore";
import { usePulseStore } from "@/store/usePulseStore";

export async function activatePanicSession(params: {
  userId: string;
  durationMinutes?: number;
}): Promise<string> {
  const durationMinutes =
    params.durationMinutes ??
    usePulseStore.getState().panicDurationMinutes ??
    30;
  const sessionId = `panic-${Date.now()}`;

  const res = await fetch("/api/panic/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      userId: params.userId,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to activate panic session");
  }

  usePanicStore.getState().startSession({
    sessionId,
    userId: params.userId,
    durationMinutes,
  });

  usePulseStore.setState({
    panicMode: true,
    panicSessionId: sessionId,
    panicDurationMinutes: durationMinutes,
  });

  return sessionId;
}

export function endPanicSessionFully(): void {
  usePanicStore.getState().endSession();
  usePulseStore.getState().endPanicMode();
}
