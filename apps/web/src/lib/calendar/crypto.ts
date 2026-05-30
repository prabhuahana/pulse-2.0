import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret === "stilo-dev-secret-change-me") {
    throw new Error(
      "A strong SESSION_SECRET is required to store Apple Calendar credentials securely. Set SESSION_SECRET in .env.local."
    );
  }
  return scryptSync(secret, "stilo-salt", 32);
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptSecret(encoded: string): string {
  const buf = Buffer.from(encoded, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
