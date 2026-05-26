const buckets = new Map<string, number[]>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = buckets.get(key) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0]!;
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - oldest),
    };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true };
}
