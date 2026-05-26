import { isEmailConfigured, sendPanicExitCodeEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/panic-mode/rate-limit";
import {
  createUnlockRequest,
  generateUnlockCode,
  getSessionExitCode,
  getUnlockRequestBySessionAndContact,
  saveSessionExitCode,
  updateUnlockRequest,
} from "@/lib/panic-mode/file-store";

const DUPLICATE_SEND_MS = 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ExitCodeError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ExitCodeError";
  }
}

export function validateContactEmail(email: string | undefined): string {
  const trimmed = email?.trim() ?? "";
  if (!trimmed) {
    throw new ExitCodeError(
      "This contact has no email address. Add an email in Settings → Safety.",
      400,
      "MISSING_EMAIL"
    );
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new ExitCodeError("Invalid email address format.", 400, "INVALID_EMAIL");
  }
  return trimmed.toLowerCase();
}

export async function getOrCreateSessionExitCode(
  sessionId: string,
  userId: string
): Promise<{ unlockCode: string; expiresAt: string }> {
  const existing = await getSessionExitCode(sessionId);
  if (existing && new Date(existing.expiresAt) > new Date()) {
    return { unlockCode: existing.unlockCode, expiresAt: existing.expiresAt };
  }

  const unlockCode = generateUnlockCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await saveSessionExitCode({
    sessionId,
    userId,
    unlockCode,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  return { unlockCode, expiresAt };
}

export async function sendExitCodeToContact(params: {
  sessionId: string;
  safetyContactId: string;
  userId: string;
  contactName: string;
  contactEmail: string;
  userName: string;
}): Promise<{
  id: string;
  sentAt: string;
  lastSentAt: string;
  contactName: string;
  emailMessageId: string;
  reusedCode: boolean;
}> {
  if (!isEmailConfigured()) {
    throw new ExitCodeError(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.local",
      503,
      "EMAIL_NOT_CONFIGURED"
    );
  }

  const email = validateContactEmail(params.contactEmail);

  const rateKey = `${params.userId}:${params.safetyContactId}`;
  const rate = checkRateLimit(rateKey);
  if (!rate.allowed) {
    throw new ExitCodeError(
      `Too many requests. Try again in ${Math.ceil((rate.retryAfterMs ?? 0) / 1000)} seconds.`,
      429,
      "RATE_LIMITED"
    );
  }

  const existing = await getUnlockRequestBySessionAndContact(
    params.sessionId,
    params.safetyContactId,
    params.userId
  );

  if (existing) {
    const sinceLastSend = Date.now() - new Date(existing.lastSentAt).getTime();
    if (sinceLastSend < DUPLICATE_SEND_MS) {
      throw new ExitCodeError(
        `A code was already sent ${Math.ceil(sinceLastSend / 1000)}s ago. Wait before resending.`,
        409,
        "DUPLICATE_SEND"
      );
    }
  }

  const sessionCode = await getOrCreateSessionExitCode(
    params.sessionId,
    params.userId
  );
  const unlockCode = existing?.unlockCode ?? sessionCode.unlockCode;
  const expiresAt = existing?.expiresAt ?? sessionCode.expiresAt;

  let request =
    existing ??
    (await createUnlockRequest({
      sessionId: params.sessionId,
      safetyContactId: params.safetyContactId,
      userId: params.userId,
      unlockCode,
      contactName: params.contactName,
      contactEmail: email,
      sentVia: ["email"],
      expiresAt,
      lastSentAt: new Date().toISOString(),
    }));

  try {
    const { id: emailMessageId } = await sendPanicExitCodeEmail({
      to: email,
      contactName: params.contactName,
      userName: params.userName,
      unlockCode: request.unlockCode,
      expiresAt: request.expiresAt,
    });

    const lastSentAt = new Date().toISOString();
    const updated = await updateUnlockRequest(request.id, {
      lastSentAt,
      emailMessageId,
      contactEmail: email,
    });
    request = updated ?? request;

    return {
      id: request.id,
      sentAt: lastSentAt,
      lastSentAt,
      contactName: request.contactName,
      emailMessageId,
      reusedCode: Boolean(existing),
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to send unlock code email";
    throw new ExitCodeError(message, 502, "EMAIL_SEND_FAILED");
  }
}
