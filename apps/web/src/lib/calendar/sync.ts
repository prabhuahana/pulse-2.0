import { createItem, reprioritiseItem, type StiloItem } from "@/lib/core";
import { fetchAppleEvents } from "@/lib/calendar/apple";
import { fetchGoogleEvents, refreshGoogleToken } from "@/lib/calendar/google";
import { fetchMicrosoftEvents, refreshMicrosoftToken } from "@/lib/calendar/microsoft";
import type {
  SessionCalendarData,
  SyncedCalendarEvent,
} from "@/lib/calendar/types";

export function calendarItemId(
  provider: string,
  externalId: string
): string {
  return `cal-${provider}-${externalId}`;
}

export function syncedEventToItem(event: SyncedCalendarEvent): StiloItem {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const durationMin = Math.max(
    15,
    Math.round((end.getTime() - start.getTime()) / 60000)
  );

  const base = createItem({
    id: calendarItemId(event.provider, event.externalId),
    type: "event",
    title: event.title,
    description: event.description,
    startAt: event.startAt,
    endAt: event.endAt,
    dueAt: event.endAt,
    estimatedMinutes: durationMin,
    tags: ["calendar", event.provider],
    status: "active",
    metadata: {
      calendarProvider: event.provider,
      externalEventId: event.externalId,
      calendarId: event.calendarId,
      location: event.location,
      htmlLink: event.htmlLink,
    },
  });

  return reprioritiseItem(base);
}

export function mergeCalendarIntoItems(
  existing: StiloItem[],
  synced: SyncedCalendarEvent[]
): StiloItem[] {
  const syncedIds = new Set(
    synced.map((e) => calendarItemId(e.provider, e.externalId))
  );

  const withoutOldCalendar = existing.filter((item) => {
    if (!item.metadata?.calendarProvider) return true;
    const id = calendarItemId(
      item.metadata.calendarProvider,
      item.metadata.externalEventId ?? item.id
    );
    return syncedIds.has(id);
  });

  const manual = withoutOldCalendar.filter((i) => !i.metadata?.calendarProvider);
  const calendarItems = synced.map(syncedEventToItem);

  return [...calendarItems, ...manual];
}

export async function fetchAllCalendarEvents(
  data: SessionCalendarData
): Promise<{ events: SyncedCalendarEvent[]; data: SessionCalendarData }> {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 7);
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 60);

  const events: SyncedCalendarEvent[] = [];
  const next = { ...data };

  if (data.google) {
    next.google = await refreshGoogleToken(data.google);
    const googleEvents = await fetchGoogleEvents(next.google, timeMin, timeMax);
    events.push(...googleEvents);
  }

  if (data.microsoft) {
    next.microsoft = await refreshMicrosoftToken(data.microsoft);
    const msEvents = await fetchMicrosoftEvents(next.microsoft, timeMin, timeMax);
    events.push(...msEvents);
  }

  if (data.apple) {
    const appleEvents = await fetchAppleEvents(data.apple, timeMin, timeMax);
    events.push(...appleEvents);
  }

  next.lastSyncAt = new Date().toISOString();
  return { events, data: next };
}
