import { mkdir, readFile, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "panic");
const UNLOCK_DIR = path.join(DATA_DIR, "unlock");
const SESSION_DIR = path.join(DATA_DIR, "sessions");

export interface StoredUnlockRequest {
  id: string;
  sessionId: string;
  safetyContactId: string;
  userId: string;
  requestedAt: string;
  unlockCode: string;
  approved: boolean;
  approvedAt?: string;
  expiresAt: string;
  contactName: string;
  contactEmail?: string;
  sentVia: ("email")[];
  lastSentAt: string;
  emailMessageId?: string;
}

export interface StoredSessionExitCode {
  sessionId: string;
  userId: string;
  unlockCode: string;
  createdAt: string;
  expiresAt: string;
}

async function ensureDirs(): Promise<void> {
  await mkdir(UNLOCK_DIR, { recursive: true });
  await mkdir(SESSION_DIR, { recursive: true });
}

function unlockPath(id: string): string {
  return path.join(UNLOCK_DIR, `${id}.json`);
}

function sessionPath(sessionId: string): string {
  return path.join(SESSION_DIR, `${sessionId}.json`);
}

export function generateUnlockCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveSessionExitCode(
  data: StoredSessionExitCode
): Promise<void> {
  await ensureDirs();
  await writeFile(sessionPath(data.sessionId), JSON.stringify(data, null, 2));
}

export async function getSessionExitCode(
  sessionId: string
): Promise<StoredSessionExitCode | null> {
  await ensureDirs();
  try {
    const raw = await readFile(sessionPath(sessionId), "utf8");
    return JSON.parse(raw) as StoredSessionExitCode;
  } catch {
    return null;
  }
}

export async function createUnlockRequest(
  data: Omit<
    StoredUnlockRequest,
    "id" | "requestedAt" | "approved" | "approvedAt"
  >
): Promise<StoredUnlockRequest> {
  await ensureDirs();
  const request: StoredUnlockRequest = {
    id: `unlock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    requestedAt: new Date().toISOString(),
    approved: false,
    ...data,
  };
  await writeFile(unlockPath(request.id), JSON.stringify(request, null, 2));
  return request;
}

export async function updateUnlockRequest(
  id: string,
  patch: Partial<StoredUnlockRequest>
): Promise<StoredUnlockRequest | null> {
  const existing = await getUnlockRequest(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await writeFile(unlockPath(id), JSON.stringify(updated, null, 2));
  return updated;
}

export async function getUnlockRequest(
  id: string
): Promise<StoredUnlockRequest | null> {
  await ensureDirs();
  try {
    const raw = await readFile(unlockPath(id), "utf8");
    return JSON.parse(raw) as StoredUnlockRequest;
  } catch {
    return null;
  }
}

export async function getUnlockRequestBySessionAndContact(
  sessionId: string,
  safetyContactId: string,
  userId: string
): Promise<StoredUnlockRequest | null> {
  await ensureDirs();
  const files = await readdir(UNLOCK_DIR).catch(() => [] as string[]);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(UNLOCK_DIR, file), "utf8");
      const r = JSON.parse(raw) as StoredUnlockRequest;
      if (
        r.sessionId === sessionId &&
        r.safetyContactId === safetyContactId &&
        r.userId === userId &&
        !r.approved
      ) {
        return r;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function approveUnlockRequest(
  id: string
): Promise<StoredUnlockRequest | null> {
  return updateUnlockRequest(id, {
    approved: true,
    approvedAt: new Date().toISOString(),
  });
}

export async function listUnlockRequestsForSession(
  sessionId: string,
  userId: string
): Promise<StoredUnlockRequest[]> {
  await ensureDirs();
  const files = await readdir(UNLOCK_DIR).catch(() => [] as string[]);
  const results: StoredUnlockRequest[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(UNLOCK_DIR, file), "utf8");
      const r = JSON.parse(raw) as StoredUnlockRequest;
      if (r.sessionId === sessionId && r.userId === userId) {
        results.push(r);
      }
    } catch {
      continue;
    }
  }
  return results.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
}
