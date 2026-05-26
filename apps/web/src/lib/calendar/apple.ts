import { decryptSecret, encryptSecret } from "@/lib/calendar/crypto";
import type { AppleCalDAVCredentials, SyncedCalendarEvent } from "@/lib/calendar/types";

const ICAL_LINE = /^([A-Z-]+)(?:;[^:]*)?:(.*)$/i;

function parseIcsEvents(ics: string): Array<{
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  dtstart: string;
  dtend: string;
  allDay: boolean;
}> {
  const events: Array<{
    uid: string;
    summary: string;
    description?: string;
    location?: string;
    dtstart: string;
    dtend: string;
    allDay: boolean;
  }> = [];

  const blocks = ics.split("BEGIN:VEVENT");
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const lines = block.replace(/\r\n/g, "\n").replace(/\n /g, "").split("\n");
    const fields: Record<string, string> = {};
    for (const line of lines) {
      const m = line.match(ICAL_LINE);
      if (m) fields[m[1].toUpperCase()] = m[2].trim();
    }
    if (!fields.UID || !fields.DTSTART) continue;
    const allDay = fields.DTSTART.length === 8;
    events.push({
      uid: fields.UID,
      summary: fields.SUMMARY || "Untitled event",
      description: fields.DESCRIPTION,
      location: fields.LOCATION,
      dtstart: fields.DTSTART,
      dtend: fields.DTEND || fields.DTSTART,
      allDay,
    });
  }
  return events;
}

function parseIcsDate(value: string): string {
  if (value.length === 8) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`).toISOString();
  }
  const normalized = value.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  return new Date(normalized).toISOString();
}

function basicAuthHeader(appleId: string, password: string): string {
  return `Basic ${Buffer.from(`${appleId}:${password}`).toString("base64")}`;
}

async function caldavRequest(
  url: string,
  appleId: string,
  password: string,
  body: string,
  method = "REPORT"
): Promise<string> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: basicAuthHeader(appleId, password),
      Depth: "1",
      "Content-Type": "application/xml; charset=utf-8",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(
      `Apple CalDAV error (${res.status}). Check your Apple ID and app-specific password.`
    );
  }
  return res.text();
}

async function discoverCalendarHome(
  appleId: string,
  password: string
): Promise<string> {
  const propfind = `<?xml version="1.0" encoding="UTF-8"?>
<D:propfind xmlns:D="DAV:">
  <D:prop><D:current-user-principal/></D:prop>
</D:propfind>`;

  const principalRes = await caldavRequest(
    "https://caldav.icloud.com/",
    appleId,
    password,
    propfind,
    "PROPFIND"
  );
  const principalMatch = principalRes.match(
    /<[^:]*:?href[^>]*>([^<]+)<\/[^:]*:?href>/i
  );
  const principal = principalMatch?.[1];
  if (!principal) throw new Error("Could not find iCloud calendar principal");

  const principalUrl = principal.startsWith("http")
    ? principal
    : `https://caldav.icloud.com${principal.startsWith("/") ? "" : "/"}${principal}`;

  const homePropfind = `<?xml version="1.0" encoding="UTF-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><C:calendar-home-set/></D:prop>
</D:propfind>`;

  const homeRes = await caldavRequest(
    principalUrl,
    appleId,
    password,
    homePropfind,
    "PROPFIND"
  );
  const homeMatch = homeRes.match(/<[^:]*:?href[^>]*>([^<]+)<\/[^:]*:?href>/gi);
  const homeHref = homeMatch?.[homeMatch.length - 1]?.match(/>([^<]+)</)?.[1];
  if (!homeHref) throw new Error("Could not find iCloud calendar home");

  return homeHref.startsWith("http")
    ? homeHref
    : `https://caldav.icloud.com${homeHref.startsWith("/") ? "" : "/"}${homeHref}`;
}

export function createAppleCredentials(
  appleId: string,
  appPassword: string
): AppleCalDAVCredentials {
  return {
    appleId,
    encryptedPassword: encryptSecret(appPassword),
    email: appleId,
  };
}

export async function testAppleConnection(
  appleId: string,
  appPassword: string
): Promise<void> {
  await discoverCalendarHome(appleId, appPassword);
}

export async function fetchAppleEvents(
  creds: AppleCalDAVCredentials,
  timeMin: Date,
  timeMax: Date
): Promise<SyncedCalendarEvent[]> {
  const password = decryptSecret(creds.encryptedPassword);
  const homeUrl = await discoverCalendarHome(creds.appleId, password);

  const listBody = `<?xml version="1.0" encoding="UTF-8"?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
  <D:prop>
    <D:resourcetype/>
    <D:displayname/>
  </D:prop>
</D:propfind>`;

  const listRes = await caldavRequest(homeUrl, creds.appleId, password, listBody, "PROPFIND");
  const calendarHrefs = [...listRes.matchAll(/<[^:]*:?href[^>]*>([^<]+)<\/[^:]*:?href>/gi)]
    .map((m) => m[1])
    .filter((h) => h.includes(".calendar/") && !h.endsWith("/"));

  const events: SyncedCalendarEvent[] = [];
  const rangeStart = timeMin.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const rangeEnd = timeMax.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  for (const href of calendarHrefs.slice(0, 5)) {
    const calUrl = href.startsWith("http")
      ? href
      : `https://caldav.icloud.com${href.startsWith("/") ? "" : "/"}${href}`;

    const reportBody = `<?xml version="1.0" encoding="UTF-8"?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop>
    <D:getetag/>
    <C:calendar-data/>
  </D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${rangeStart}" end="${rangeEnd}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

    try {
      const reportRes = await caldavRequest(
        calUrl,
        creds.appleId,
        password,
        reportBody
      );
      const icsBlocks = [...reportRes.matchAll(/BEGIN:VCALENDAR[\s\S]*?END:VCALENDAR/gi)];
      for (const block of icsBlocks) {
        for (const ev of parseIcsEvents(block[0])) {
          events.push({
            provider: "apple",
            externalId: ev.uid,
            calendarId: href,
            title: ev.summary,
            description: ev.description,
            startAt: parseIcsDate(ev.dtstart),
            endAt: parseIcsDate(ev.dtend),
            location: ev.location,
            allDay: ev.allDay,
          });
        }
      }
    } catch {
      // skip unreadable calendars
    }
  }

  return events;
}
