import type { SyncedCalendarEvent } from "@/lib/calendar/types";
import type { PulseCalendarEvent } from "@/types/calendar";

export function syncedToPulseEvent(event: SyncedCalendarEvent): PulseCalendarEvent {
  const now = new Date().toISOString();
  return {
    id: `cal-${event.provider}-${event.externalId}`,
    title: event.title,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    allDay: event.allDay ?? false,
    location: event.location,
    source: event.provider,
    externalId: event.externalId,
    calendarId: event.calendarId,
    htmlLink: event.htmlLink,
    recurringEventId: event.recurringEventId,
    timezone: event.timezone,
    createdAt: now,
    updatedAt: now,
  };
}

export function createLocalEvent(
  input: Omit<PulseCalendarEvent, "id" | "source" | "createdAt" | "updatedAt"> & {
    title: string;
    startAt: string;
    endAt: string;
  }
): PulseCalendarEvent {
  const now = new Date().toISOString();
  return {
    ...input,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    source: "local",
    allDay: input.allDay ?? false,
    createdAt: now,
    updatedAt: now,
  };
}
