import type { CalendarProvider } from "@/lib/core";

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email?: string;
}

export interface AppleCalDAVCredentials {
  appleId: string;
  /** AES-GCM encrypted app-specific password */
  encryptedPassword: string;
  email?: string;
}

export interface SessionCalendarData {
  google?: OAuthTokens;
  microsoft?: OAuthTokens;
  apple?: AppleCalDAVCredentials;
  lastSyncAt?: string;
  syncCursor?: Partial<Record<CalendarProvider, string>>;
}

export interface SyncedCalendarEvent {
  provider: CalendarProvider;
  externalId: string;
  calendarId?: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  htmlLink?: string;
  allDay?: boolean;
  recurringEventId?: string;
  timezone?: string;
  status?: string;
}

export interface CalendarConnectionStatus {
  google: boolean;
  microsoft: boolean;
  apple: boolean;
  googleEmail?: string;
  microsoftEmail?: string;
  appleEmail?: string;
  lastSyncAt?: string;
}

export interface FreeSlot {
  startAt: string;
  endAt: string;
  durationMinutes: number;
}
