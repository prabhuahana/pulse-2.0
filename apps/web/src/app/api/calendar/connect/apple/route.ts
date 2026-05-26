import {
  createAppleCredentials,
  testAppleConnection,
} from "@/lib/calendar/apple";
import { updateSessionCalendar } from "@/lib/calendar/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      appleId?: string;
      appPassword?: string;
    };

    const appleId = body.appleId?.trim();
    const appPassword = body.appPassword?.replace(/\s/g, "");

    if (!appleId || !appPassword) {
      return NextResponse.json(
        { error: "Apple ID and app-specific password are required" },
        { status: 400 }
      );
    }

    await testAppleConnection(appleId, appPassword);
    const creds = createAppleCredentials(appleId, appPassword);

    await updateSessionCalendar((data) => ({
      ...data,
      apple: creds,
    }));

    return NextResponse.json({ ok: true, email: appleId });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Failed to connect Apple Calendar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
