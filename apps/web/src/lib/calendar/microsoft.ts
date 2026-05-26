import { getMicrosoftConfig } from "@/lib/calendar/config";
import type { OAuthTokens, SyncedCalendarEvent } from "@/lib/calendar/types";

export function getMicrosoftAuthUrl(state: string): string {
  const { clientId, redirectUri, authorizeUrl } = getMicrosoftConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "offline_access User.Read Calendars.ReadWrite",
    state,
    response_mode: "query",
  });
  return `${authorizeUrl}?${params}`;
}

export async function exchangeMicrosoftCode(
  code: string
): Promise<OAuthTokens> {
  const { clientId, clientSecret, redirectUri, tokenUrl } = getMicrosoftConfig();
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
    }),
  });
  if (!res.ok) {
    throw new Error(`Microsoft token exchange failed: ${await res.text()}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const email = await fetchMicrosoftEmail(json.access_token);

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
    email,
  };
}

async function fetchMicrosoftEmail(
  accessToken: string
): Promise<string | undefined> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return undefined;
  const json = (await res.json()) as { mail?: string; userPrincipalName?: string };
  return json.mail ?? json.userPrincipalName;
}

export async function refreshMicrosoftToken(
  tokens: OAuthTokens
): Promise<OAuthTokens> {
  if (!tokens.refreshToken) return tokens;
  if (tokens.expiresAt > Date.now() + 60_000) return tokens;

  const { clientId, clientSecret, tokenUrl } = getMicrosoftConfig();
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh Microsoft token");
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

export async function fetchMicrosoftEvents(
  tokens: OAuthTokens,
  timeMin: Date,
  timeMax: Date
): Promise<SyncedCalendarEvent[]> {
  const refreshed = await refreshMicrosoftToken(tokens);
  const params = new URLSearchParams({
    startDateTime: timeMin.toISOString(),
    endDateTime: timeMax.toISOString(),
    $top: "250",
    $orderby: "start/dateTime",
  });

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
    {
      headers: {
        Authorization: `Bearer ${refreshed.accessToken}`,
        Prefer: 'outlook.timezone="UTC"',
      },
    }
  );
  if (!res.ok) {
    throw new Error(`Microsoft Graph error: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    value?: Array<{
      id: string;
      subject?: string;
      bodyPreview?: string;
      location?: { displayName?: string };
      webLink?: string;
      isAllDay?: boolean;
      start?: { dateTime: string; timeZone: string };
      end?: { dateTime: string; timeZone: string };
    }>;
  };

  return (json.value ?? []).map((e) => ({
    provider: "microsoft" as const,
    externalId: e.id,
    title: e.subject || "Untitled event",
    description: e.bodyPreview,
    startAt: new Date(e.start!.dateTime + "Z").toISOString(),
    endAt: new Date(e.end!.dateTime + "Z").toISOString(),
    location: e.location?.displayName,
    htmlLink: e.webLink,
    allDay: e.isAllDay,
  }));
}
