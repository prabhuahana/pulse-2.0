import { getSessionCalendar } from "@/lib/calendar/session";
import {
  isGoogleConfigured,
  isMicrosoftConfigured,
} from "@/lib/calendar/config";
import type { CalendarConnectionStatus } from "@/lib/calendar/types";
import { NextResponse } from "next/server";

export async function GET() {
  const { data } = await getSessionCalendar();

  const status: CalendarConnectionStatus & {
    googleConfigured: boolean;
    microsoftConfigured: boolean;
  } = {
    google: Boolean(data.google),
    microsoft: Boolean(data.microsoft),
    apple: Boolean(data.apple),
    googleEmail: data.google?.email,
    microsoftEmail: data.microsoft?.email,
    appleEmail: data.apple?.email ?? data.apple?.appleId,
    lastSyncAt: data.lastSyncAt,
    googleConfigured: isGoogleConfigured(),
    microsoftConfigured: isMicrosoftConfigured(),
  };

  return NextResponse.json(status);
}
