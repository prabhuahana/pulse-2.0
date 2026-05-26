import { cookies } from "next/headers";

const STATE_COOKIE = "pulse_oauth_state";

export async function setOAuthState(provider: string): Promise<string> {
  const state = `${provider}:${crypto.randomUUID()}`;
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return state;
}

export async function verifyOAuthState(
  provider: string,
  state: string | null
): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  return stored === state && state?.startsWith(`${provider}:`);
}
