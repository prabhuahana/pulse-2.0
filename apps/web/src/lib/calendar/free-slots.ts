import type { FreeSlot, SyncedCalendarEvent } from "@/lib/calendar/types";

function mergeIntervals(
  intervals: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      merged.push(sorted[i]);
    }
  }
  return merged;
}

export function findFreeSlots(
  events: SyncedCalendarEvent[],
  day: Date,
  minDurationMinutes = 30
): FreeSlot[] {
  const dayStart = new Date(day);
  dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(22, 0, 0, 0);

  const busy = events
    .map((e) => ({
      start: Math.max(new Date(e.startAt).getTime(), dayStart.getTime()),
      end: Math.min(new Date(e.endAt).getTime(), dayEnd.getTime()),
    }))
    .filter((i) => i.end > i.start);

  const merged = mergeIntervals(busy);
  const slots: FreeSlot[] = [];
  let cursor = dayStart.getTime();

  for (const block of merged) {
    if (block.start - cursor >= minDurationMinutes * 60_000) {
      slots.push({
        startAt: new Date(cursor).toISOString(),
        endAt: new Date(block.start).toISOString(),
        durationMinutes: Math.round((block.start - cursor) / 60_000),
      });
    }
    cursor = Math.max(cursor, block.end);
  }

  if (dayEnd.getTime() - cursor >= minDurationMinutes * 60_000) {
    slots.push({
      startAt: new Date(cursor).toISOString(),
      endAt: dayEnd.toISOString(),
      durationMinutes: Math.round((dayEnd.getTime() - cursor) / 60_000),
    });
  }

  return slots;
}
