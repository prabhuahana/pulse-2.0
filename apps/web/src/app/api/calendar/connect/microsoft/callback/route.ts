import { exchangeMicrosoftCode } from "@/lib/calendar/microsoft";
import { verifyOAuthState } from "@/lib/calendar/oauth-state";
import { updateSessionCalendar } from "@/lib/calendar/session";
import { getAppUrl } from "@/lib/calendar/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error_description") ?? searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${getAppUrl()}/settings/calendar?error=${encodeURIComponent(String(error))}`
    );
  }

  if (!code || !(await verifyOAuthState("microsoft", state))) {
    return NextResponse.redirect(
      `${getAppUrl()}/settings/calendar?error=invalid_oauth_state`
    );
  }

  try {
    const tokens = await exchangeMicrosoftCode(code);
    await updateSessionCalendar((data) => ({ ...data, microsoft: tokens }));
    return NextResponse.redirect(
      `${getAppUrl()}/settings/calendar?connected=microsoft`
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "microsoft_connect_failed";
    return NextResponse.redirect(
      `${getAppUrl()}/settings/calendar?error=${encodeURIComponent(msg)}`
    );
  }
}
