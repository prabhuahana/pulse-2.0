import { getMicrosoftAuthUrl } from "@/lib/calendar/microsoft";
import { isMicrosoftConfigured } from "@/lib/calendar/config";
import { setOAuthState } from "@/lib/calendar/oauth-state";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isMicrosoftConfigured()) {
    return NextResponse.json(
      {
        error:
          "Outlook is not configured. Add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to .env.local",
      },
      { status: 503 }
    );
  }
  const state = await setOAuthState("microsoft");
  return NextResponse.redirect(getMicrosoftAuthUrl(state));
}
