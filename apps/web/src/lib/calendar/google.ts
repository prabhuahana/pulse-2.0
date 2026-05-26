import { getGoogleConfig } from "@/lib/calendar/config";
import { CalendarAuthError } from "@/lib/calendar/errors";
import type { OAuthTokens, SyncedCalendarEvent } from "@/lib/calendar/types";

export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(
  code: string
): Promise<OAuthTokens> {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const email = await fetchGoogleEmail(json.access_token);

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    email,
  };
}

async function fetchGoogleEmail(accessToken: string): Promise<string | undefined> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { email?: string };
  return json.email;
}

export async function refreshGoogleToken(
  tokens: OAuthTokens
): Promise<OAuthTokens> {
  if (!tokens.refreshToken) {
    if (tokens.expiresAt > Date.now() + 60_000) return tokens;
    throw new CalendarAuthError(
      "Google session expired. Please reconnect Google Calendar.",
      "google"
    );
  }
  if (tokens.expiresAt > Date.now() + 60_000) return tokens;

  const { clientId, clientSecret } = getGoogleConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new CalendarAuthError(
      `Google token refresh failed. Reconnect Google Calendar. (${errText})`,
      "google"
    );
  }
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };
  return {
    ...tokens,
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
}

function parseGoogleDate(
  start?: { dateTime?: string; date?: string; timeZone?: string },
  end?: { dateTime?: string; date?: string; timeZone?: string }
): { startAt: string; endAt: string; allDay: boolean; timezone?: string } | null {
  if (!start) return null;
  const allDay = Boolean(start.date && !start.dateTime);
  const startAt = start.dateTime ?? `${start.date}T00:00:00.000Z`;
  const endAt = end?.dateTime ?? end?.date ?? startAt;
  return {
    startAt: new Date(startAt).toISOString(),
    endAt: new Date(endAt).toISOString(),
    allDay,
    timezone: start.timeZone ?? end?.timeZone,
  };
}

export async function fetchGoogleEvents(
  tokens: OAuthTokens,
  timeMin: Date,
  timeMax: Date
): Promise<SyncedCalendarEvent[]> {
  const refreshed = await refreshGoogleToken(tokens);
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "500",
    showDeleted: "false",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${refreshed.accessToken}` } }
  );
  if (res.status === 401) {
    throw new CalendarAuthError(
      "Google authorization expired. Please reconnect.",
      "google"
    );
  }
  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    items?: Array<{
      id: string;
      status?: string;
      summary?: string;
      description?: string;
      location?: string;
      htmlLink?: string;
      recurringEventId?: string;
      start?: { dateTime?: string; date?: string; timeZone?: string };
      end?: { dateTime?: string; date?: string; timeZone?: string };
    }>;
  };

  const events: SyncedCalendarEvent[] = [];
  for (const e of json.items ?? []) {
    if (e.status === "cancelled") continue;
    const parsed = parseGoogleDate(e.start, e.end);
    if (!parsed) continue;
    events.push({
      provider: "google",
      externalId: e.id,
      calendarId: "primary",
      title: e.summary || "Untitled event",
      description: e.description,
      startAt: parsed.startAt,
      endAt: parsed.endAt,
      location: e.location,
      htmlLink: e.htmlLink,
      allDay: parsed.allDay,
      recurringEventId: e.recurringEventId,
      timezone: parsed.timezone,
      status: e.status,
    });
  }
  return events;
}
