import { Resend } from "resend";
import { buildPanicExitCodeEmail } from "@/lib/email/templates/panic-exit-code";

export function getEmailFromAddress(): string {
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error(
      "EMAIL_FROM is not configured (e.g. Stilo <notifications@yourdomain.com>)."
    );
  }
  return from;
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to apps/web/.env.local"
    );
  }
  return new Resend(apiKey);
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      (process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM_EMAIL?.trim())
  );
}

export async function sendPanicExitCodeEmail(params: {
  to: string;
  contactName: string;
  userName: string;
  unlockCode: string;
  expiresAt: string;
}): Promise<{ id: string }> {
  const resend = getResendClient();
  const from = getEmailFromAddress();
  const { subject, html, text } = buildPanicExitCodeEmail(params);

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  if (!data?.id) {
    throw new Error("Email provider returned no message id");
  }

  return { id: data.id };
}
