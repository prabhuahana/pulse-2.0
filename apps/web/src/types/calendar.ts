import type { CalendarProvider } from "@/lib/core";

export type CalendarEventSource = "local" | CalendarProvider;

export interface PulseCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location?: string;
  source: CalendarEventSource;
  externalId?: string;
  calendarId?: string;
  htmlLink?: string;
  recurringEventId?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  location?: string;
}
