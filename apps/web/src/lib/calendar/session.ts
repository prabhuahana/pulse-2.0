import type { SessionCalendarData } from "@/lib/calendar/types";
import { cookies } from "next/headers";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const SESSION_COOKIE = "pulse_session_id";
const DATA_DIR = path.join(process.cwd(), "data", "sessions");

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let id = cookieStore.get(SESSION_COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return id;
}

export async function loadSessionData(
  sessionId: string
): Promise<SessionCalendarData> {
  try {
    const raw = await readFile(
      path.join(DATA_DIR, `${sessionId}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as SessionCalendarData;
  } catch {
    return {};
  }
}

export async function saveSessionData(
  sessionId: string,
  data: SessionCalendarData
): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, `${sessionId}.json`),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export async function getSessionCalendar(): Promise<{
  sessionId: string;
  data: SessionCalendarData;
}> {
  const sessionId = await getOrCreateSessionId();
  const data = await loadSessionData(sessionId);
  return { sessionId, data };
}

export async function updateSessionCalendar(
  updater: (data: SessionCalendarData) => SessionCalendarData
): Promise<SessionCalendarData> {
  const { sessionId, data } = await getSessionCalendar();
  const next = updater(data);
  await saveSessionData(sessionId, next);
  return next;
}
