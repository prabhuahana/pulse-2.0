export type PanicTaskType = "image" | "interaction" | "wake";

export type PanicTaskStatus =
  | "pending"
  | "in_progress"
  | "verified"
  | "uncertain"
  | "failed";

export type PanicPhase = "tasks" | "recovery" | "unlock" | "complete";

export type WakeChallengeKind = "math" | "memory" | "typing";

export interface PanicTask {
  id: string;
  type: PanicTaskType;
  title: string;
  description: string;
  /** Vision model instruction */
  visionPrompt?: string;
  minDurationSec?: number;
  interactionKind?: "breathing" | "grounding" | "journal";
  wakeKind?: WakeChallengeKind;
  status: PanicTaskStatus;
  confidence?: number;
  feedback?: string;
  attempts: number;
  interactionStartedAt?: string;
  interactionElapsedSec: number;
  verifiedAt?: string;
}

export interface PanicSessionSnapshot {
  isActive: boolean;
  sessionId: string | null;
  userId: string;
  startedAt: string | null;
  scheduledEndAt: string | null;
  durationMinutes: number;
  tasks: PanicTask[];
  phase: PanicPhase;
  recoveryStartedAt: string | null;
  recoveryCompleted: boolean;
  unlockRequestId: string | null;
  selectedContactId: string | null;
  cooldownUntil: string | null;
  wakeFailureCount: number;
  consentUpload: boolean;
}

export interface TaskVerificationResult {
  verified: boolean;
  uncertain: boolean;
  failed: boolean;
  confidence: number;
  message: string;
}
