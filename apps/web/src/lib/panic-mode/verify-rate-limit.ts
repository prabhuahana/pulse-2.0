const buckets = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 15;

export function checkVerifyRateLimit(sessionId: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const timestamps = buckets.get(sessionId) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - recent[0]!),
    };
  }

  recent.push(now);
  buckets.set(sessionId, recent);
  return { allowed: true };
}
