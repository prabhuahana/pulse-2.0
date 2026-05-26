export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function getGoogleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: `${getAppUrl()}/api/calendar/connect/google/callback`,
  };
}

export function getMicrosoftConfig() {
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID || "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    tenant,
    redirectUri: `${getAppUrl()}/api/calendar/connect/microsoft/callback`,
    authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
  };
}

export function isGoogleConfigured(): boolean {
  const c = getGoogleConfig();
  return Boolean(c.clientId && c.clientSecret);
}

export function isMicrosoftConfigured(): boolean {
  const c = getMicrosoftConfig();
  return Boolean(c.clientId && c.clientSecret);
}

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export const MICROSOFT_SCOPES = [
  "offline_access",
  "User.Read",
  "Calendars.ReadWrite",
].join(" ");
