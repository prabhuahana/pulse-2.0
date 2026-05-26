import { CalendarAuthError } from "@/lib/calendar/errors";
import { fetchAllCalendarEvents } from "@/lib/calendar/sync";
import { findFreeSlots } from "@/lib/calendar/free-slots";
import {
  getSessionCalendar,
  saveSessionData,
} from "@/lib/calendar/session";
import { NextResponse } from "next/server";

export async function POST() {
  const { sessionId, data } = await getSessionCalendar();

  if (!data.google && !data.microsoft && !data.apple) {
    return NextResponse.json(
      { error: "No calendars connected", code: "NOT_CONNECTED" },
      { status: 400 }
    );
  }

  try {
    const { events, data: updated } = await fetchAllCalendarEvents(data);
    await saveSessionData(sessionId, updated);

    const todaySlots = findFreeSlots(events, new Date(), 30);

    return NextResponse.json({
      events,
      lastSyncAt: updated.lastSyncAt,
      freeSlotsToday: todaySlots,
    });
  } catch (e) {
    if (e instanceof CalendarAuthError) {
      return NextResponse.json(
        {
          error: e.message,
          code: "AUTH_EXPIRED",
          provider: e.provider,
        },
        { status: 401 }
      );
    }
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: msg, code: "SYNC_FAILED" }, { status: 500 });
  }
}
