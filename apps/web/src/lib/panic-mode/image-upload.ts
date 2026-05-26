import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "data", "panic", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function saveTemporaryUpload(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Image must be under 5MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : "jpg";
  const id = randomUUID();
  const filePath = path.join(UPLOAD_DIR, `${id}.${ext}`);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function deleteTemporaryUpload(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    /* already removed */
  }
}

export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}
