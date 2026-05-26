"use client";

import { createDefaultPanicTasks } from "@/lib/panic-mode/tasks";
import type {
  PanicPhase,
  PanicSessionSnapshot,
  PanicTask,
  PanicTaskStatus,
  TaskVerificationResult,
} from "@/types/panic-session";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const PANIC_ALLOWED_PATHS = ["/panic/active", "/panic/unlock"];

interface PanicStore extends PanicSessionSnapshot {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  startSession: (params: {
    sessionId: string;
    userId: string;
    durationMinutes: number;
  }) => void;
  tickTimer: () => void;
  setPhase: (phase: PanicPhase) => void;
  setConsentUpload: (v: boolean) => void;
  updateTask: (taskId: string, patch: Partial<PanicTask>) => void;
  applyVerification: (
    taskId: string,
    result: TaskVerificationResult
  ) => void;
  startInteraction: (taskId: string) => void;
  tickInteraction: (taskId: string, elapsedSec: number) => void;
  completeInteraction: (taskId: string) => void;
  completeWakeTask: (taskId: string) => void;
  incrementWakeFailure: () => void;
  setSelectedContact: (id: string | null) => void;
  setUnlockRequestId: (id: string | null) => void;
  completeRecovery: () => void;
  allTasksVerified: () => boolean;
  canExitWithContact: () => boolean;
  endSession: () => void;
  isAllowedPath: (pathname: string) => boolean;
}

const initialSnapshot: PanicSessionSnapshot = {
  isActive: false,
  sessionId: null,
  userId: "",
  startedAt: null,
  scheduledEndAt: null,
  durationMinutes: 30,
  tasks: [],
  phase: "tasks",
  recoveryStartedAt: null,
  recoveryCompleted: false,
  unlockRequestId: null,
  selectedContactId: null,
  cooldownUntil: null,
  wakeFailureCount: 0,
  consentUpload: false,
};

export const usePanicStore = create<PanicStore>()(
  persist(
    (set, get) => ({
      ...initialSnapshot,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),

      startSession: ({ sessionId, userId, durationMinutes }) => {
        const startedAt = new Date().toISOString();
        const end = new Date(Date.now() + durationMinutes * 60 * 1000);
        set({
          ...initialSnapshot,
          isActive: true,
          sessionId,
          userId,
          startedAt,
          scheduledEndAt: end.toISOString(),
          durationMinutes,
          tasks: createDefaultPanicTasks(),
          phase: "tasks",
          hydrated: true,
        });
      },

      tickTimer: () => {
        /* Timer display only; exit is via contact code or complete-tasks button */
      },

      setPhase: (phase) => set({ phase }),

      setConsentUpload: (consentUpload) => set({ consentUpload }),

      updateTask: (taskId, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t
          ),
        })),

      applyVerification: (taskId, result) => {
        let status: PanicTaskStatus = "failed";
        if (result.verified) status = "verified";
        else if (result.uncertain) status = "uncertain";

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  status,
                  confidence: result.confidence,
                  feedback: result.message,
                  attempts: t.attempts + 1,
                  verifiedAt:
                    status === "verified"
                      ? new Date().toISOString()
                      : undefined,
                }
          ),
        }));
      },

      startInteraction: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "in_progress",
                  interactionStartedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      tickInteraction: (taskId, elapsedSec) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, interactionElapsedSec: elapsedSec } : t
          ),
        })),

      completeInteraction: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task?.minDurationSec) return;
        if (task.interactionElapsedSec < task.minDurationSec) return;

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "verified",
                  verifiedAt: new Date().toISOString(),
                  feedback: "Interaction completed.",
                }
              : t
          ),
        }));
      },

      completeWakeTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "verified",
                  verifiedAt: new Date().toISOString(),
                  feedback: "Wake challenge passed.",
                }
              : t
          ),
        }));
      },

      incrementWakeFailure: () =>
        set((s) => ({ wakeFailureCount: s.wakeFailureCount + 1 })),

      setSelectedContact: (selectedContactId) => set({ selectedContactId }),

      setUnlockRequestId: (unlockRequestId) => set({ unlockRequestId }),

      completeRecovery: () =>
        set({
          recoveryCompleted: true,
          phase: "unlock",
        }),

      allTasksVerified: () => {
        const { tasks } = get();
        return tasks.length > 0 && tasks.every((t) => t.status === "verified");
      },

      canExitWithContact: () => {
        const s = get();
        if (!s.isActive) return false;
        if (s.cooldownUntil && new Date(s.cooldownUntil) > new Date()) {
          return false;
        }
        return true;
      },

      endSession: () => {
        const cooldownUntil = new Date(
          Date.now() + 5 * 60 * 1000
        ).toISOString();
        set({
          ...initialSnapshot,
          cooldownUntil,
          hydrated: get().hydrated,
        });
      },

      isAllowedPath: (pathname) =>
        PANIC_ALLOWED_PATHS.some((p) => pathname.startsWith(p)),
    }),
    {
      name: "pulse-panic-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        isActive: s.isActive,
        sessionId: s.sessionId,
        userId: s.userId,
        startedAt: s.startedAt,
        scheduledEndAt: s.scheduledEndAt,
        durationMinutes: s.durationMinutes,
        tasks: s.tasks,
        phase: s.phase,
        recoveryStartedAt: s.recoveryStartedAt,
        recoveryCompleted: s.recoveryCompleted,
        unlockRequestId: s.unlockRequestId,
        selectedContactId: s.selectedContactId,
        cooldownUntil: s.cooldownUntil,
        wakeFailureCount: s.wakeFailureCount,
        consentUpload: s.consentUpload,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function getPanicRemainingSeconds(): number {
  const end = usePanicStore.getState().scheduledEndAt;
  if (!end) return 0;
  return Math.max(
    0,
    Math.floor((new Date(end).getTime() - Date.now()) / 1000)
  );
}
