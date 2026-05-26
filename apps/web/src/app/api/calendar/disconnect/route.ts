import { updateSessionCalendar } from "@/lib/calendar/session";
import type { CalendarProvider } from "@/lib/core";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { provider } = (await request.json()) as { provider?: CalendarProvider };

  if (!provider || !["google", "microsoft", "apple"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  await updateSessionCalendar((data) => {
    const next = { ...data };
    delete next[provider];
    return next;
  });

  return NextResponse.json({ ok: true });
}
