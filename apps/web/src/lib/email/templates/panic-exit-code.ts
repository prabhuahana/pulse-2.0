export function buildPanicExitCodeEmail(params: {
  contactName: string;
  userName: string;
  unlockCode: string;
  expiresAt: string;
}): { subject: string; html: string; text: string } {
  const expires = new Date(params.expiresAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `${params.userName} needs your help exiting Panic Mode on Stilo`;

  const text = [
    `Hi ${params.contactName},`,
    ``,
    `${params.userName} is using Stilo Panic Mode and has asked you to help them exit early.`,
    ``,
    `Their unlock code is: ${params.unlockCode}`,
    ``,
    `Share this code with them only if you agree they should leave Panic Mode.`,
    `This code expires on ${expires}.`,
    ``,
    `If you did not expect this message, you can ignore it.`,
    ``,
    `— Stilo Safety System`,
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1e; max-width: 480px; margin: 0 auto; padding: 24px;">
  <p>Hi ${escapeHtml(params.contactName)},</p>
  <p><strong>${escapeHtml(params.userName)}</strong> is using Stilo Panic Mode and has asked you to help them exit early.</p>
  <p style="font-size: 28px; letter-spacing: 0.25em; font-weight: 700; text-align: center; padding: 16px; background: #f5f3ef; border-radius: 12px; margin: 24px 0;">
    ${escapeHtml(params.unlockCode)}
  </p>
  <p>Share this code with them only if you agree they should leave Panic Mode.</p>
  <p style="color: #6b6b76; font-size: 14px;">This code expires on ${escapeHtml(expires)}.</p>
  <p style="color: #6b6b76; font-size: 14px;">If you did not expect this message, you can ignore it.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
  <p style="color: #6b6b76; font-size: 12px;">Stilo Safety System</p>
</body>
</html>`.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
