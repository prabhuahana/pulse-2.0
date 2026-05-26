export interface SafetyContact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface PanicModeSession {
  id: string;
  startedAt: string;
  scheduledEndAt: string;
  actualEndAt?: string;
  duration: number; // minutes
  safetyContactId?: string;
  unlockRequested: boolean;
  unlockApprovedAt?: string;
  unlockApprovedBy?: string;
}

export interface UnlockRequest {
  id: string;
  sessionId: string;
  requestedAt: string;
  safetyContactId: string;
  approvalToken: string;
  approved: boolean;
  approvedAt?: string;
  expiresAt: string;
}

export interface PanicModeState {
  isActive: boolean;
  sessionId?: string;
  durationMinutes: number;
  safetyContacts: SafetyContact[];
  blockedApps: string[];
  allowedApps: string[];
  cooldownUntil?: string; // ISO date string
  focusRecoveryScore: number;
  sessions: PanicModeSession[];
  unlockRequests: UnlockRequest[];
}
