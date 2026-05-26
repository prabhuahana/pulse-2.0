import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { isGoogleConfigured } from "@/lib/calendar/config";
import { setOAuthState } from "@/lib/calendar/oauth-state";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Calendar is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local",
      },
      { status: 503 }
    );
  }
  const state = await setOAuthState("google");
  return NextResponse.redirect(getGoogleAuthUrl(state));
}
