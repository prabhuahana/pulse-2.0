export class CalendarAuthError extends Error {
  constructor(
    message: string,
    public provider: "google" | "microsoft" | "apple"
  ) {
    super(message);
    this.name = "CalendarAuthError";
  }
}

export function isAuthErrorMessage(msg: string): boolean {
  return (
    msg.includes("invalid_grant") ||
    msg.includes("Token has been expired") ||
    msg.includes("Failed to refresh") ||
    msg.includes("401") ||
    msg.includes("UNAUTHENTICATED")
  );
}
