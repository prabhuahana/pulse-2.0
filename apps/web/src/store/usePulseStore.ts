"use client";

import {
  buildDailySummary,
  createItem,
  parseNaturalLanguage,
  reprioritiseItem,
  SAMPLE_ITEMS,
  type PulseItem,
  type ThemePreset,
} from "@/lib/core";
import { createLocalEvent, syncedToPulseEvent } from "@/lib/calendar/event-mapper";
import { mergeCalendarIntoItems } from "@/lib/calendar/sync";
import type {
  CalendarConnectionStatus,
  SyncedCalendarEvent,
} from "@/lib/calendar/types";
import type { SafetyContact } from "@/types/panic-mode";
import type { CreateCalendarEventInput, PulseCalendarEvent } from "@/types/calendar";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PulseState {
  items: PulseItem[];
  theme: ThemePreset;
  dyslexiaFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  onboardingDone: boolean;
  userName: string;
  xp: number;
  streak: number;
  petStage: number;
  focusSecondsLeft: number | null;
  focusRunning: boolean;
  panicMode: boolean;
  panicSessionId: string | null;
  safetyContacts: SafetyContact[];
  panicDurationMinutes: number;
  automationMode: "standard" | "accountability" | "no_escape";
  automationStatus: Record<
    "googleClassroom" | "microsoftTeams" | "canvas" | "moodle" | "notion" | "schoolEmail",
    boolean
  >;
  calendarStatus: CalendarConnectionStatus | null;
  lastSyncAt: string | null;
  syncedCalendarEvents: PulseCalendarEvent[];
  localCalendarEvents: PulseCalendarEvent[];
  calendarSyncError: string | null;
  calendarSyncing: boolean;

  completeOnboarding: (name: string) => void;
  setTheme: (theme: ThemePreset) => void;
  setAccessibility: (opts: {
    dyslexiaFont?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
  }) => void;
  addItemFromInput: (input: string) => void;
  addItem: (item: Partial<PulseItem> & { title: string }) => void;
  importAssignment: (item: Partial<PulseItem> & { title: string }) => void;
  verifyAssignment: (id: string) => void;
  requestRevision: (id: string) => void;
  rescheduleWorkload: () => void;
  toggleComplete: (id: string) => void;
  deleteItem: (id: string) => void;
  connectAutomationProvider: (provider: keyof PulseState["automationStatus"]) => void;
  setAutomationMode: (mode: "standard" | "accountability" | "no_escape") => void;
  togglePanicMode: () => void;
  startPanicMode: (durationMinutes?: number) => void;
  endPanicMode: () => void;
  ensurePanicSession: () => void;
  setSafetyContacts: (contacts: SafetyContact[]) => void;
  addSafetyContact: (contact: Omit<SafetyContact, "id" | "createdAt">) => void;
  removeSafetyContact: (id: string) => void;
  setPanicDurationMinutes: (minutes: number) => void;
  startFocus: (minutes?: number) => void;
  tickFocus: () => void;
  stopFocus: () => void;
  resetDemoData: () => void;
  mergeCalendarEvents: (events: SyncedCalendarEvent[]) => void;
  setCalendarStatus: (status: CalendarConnectionStatus) => void;
  setCalendarSyncing: (syncing: boolean) => void;
  setCalendarSyncError: (error: string | null) => void;
  addLocalCalendarEvent: (input: CreateCalendarEventInput) => PulseCalendarEvent;
  updateLocalCalendarEvent: (
    id: string,
    patch: Partial<CreateCalendarEventInput>
  ) => void;
  deleteLocalCalendarEvent: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;
}

function seedItems(): PulseItem[] {
  return SAMPLE_ITEMS.map((s) => createItem(s));
}

export const usePulseStore = create<PulseState>()(
  persist(
    (set, get) => ({
      items: seedItems(),
      theme: "beige",
      dyslexiaFont: false,
      highContrast: false,
      reducedMotion: false,
      onboardingDone: false,
      userName: "",
      xp: 120,
      streak: 3,
      petStage: 2,
      focusSecondsLeft: null,
      focusRunning: false,
      panicMode: false,
      panicSessionId: null,
      safetyContacts: [],
      panicDurationMinutes: 30,
      automationMode: "standard",
      automationStatus: {
        googleClassroom: false,
        microsoftTeams: false,
        canvas: false,
        moodle: false,
        notion: false,
        schoolEmail: false,
      },
      calendarStatus: null,
      lastSyncAt: null,
      syncedCalendarEvents: [],
      localCalendarEvents: [],
      calendarSyncError: null,
      calendarSyncing: false,

      completeOnboarding: (name) =>
        set({ onboardingDone: true, userName: name || "there" }),

      setTheme: (theme) => set({ theme }),

      setAccessibility: (opts) => set(opts),

      addItemFromInput: (input) => {
        const parsed = parseNaturalLanguage(input);
        const item = createItem({
          title: parsed.title,
          type: parsed.type,
          dueAt: parsed.dueAt,
          tags: parsed.tags,
        });
        set((s) => ({ items: [item, ...s.items] }));
      },

      addItem: (partial) => {
        const item = createItem(partial);
        set((s) => ({ items: [item, ...s.items] }));
      },

      importAssignment: (partial) => {
        const item = createItem({
          ...partial,
          type: partial.type ?? "assignment",
          tags: [...(partial.tags ?? []), "school"],
          metadata: {
            ...partial.metadata,
            requiresSubmissionVerification: true,
            rubric: partial.metadata?.rubric ?? [
              "Match submission to instructions",
              "Attach proof of completion",
              "Check formatting requirements",
            ],
            origin: partial.metadata?.origin ?? "automated import",
          },
        });
        set((s) => ({ items: [item, ...s.items] }));
      },

      verifyAssignment: (id) =>
        set((s) => ({
          items: s.items.map((item) =>
            item.id !== id
              ? item
              : {
                  ...item,
                  metadata: {
                    ...item.metadata,
                    submissionVerified: true,
                    revisionRequired: false,
                    aiFeedback: [
                      "Submission verified by Pulse.",
                      ...(item.metadata?.aiFeedback ?? []),
                    ],
                  },
                }
          ),
        })),

      requestRevision: (id) =>
        set((s) => ({
          items: s.items.map((item) => {
            if (item.id !== id) return item;
            const nextDue = item.dueAt
              ? new Date(new Date(item.dueAt).getTime() + 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 24 * 60 * 60 * 1000);
            return reprioritiseItem({
              ...item,
              dueAt: nextDue.toISOString(),
              metadata: {
                ...item.metadata,
                revisionRequired: true,
                aiFeedback: [
                  "Your last draft needs another review.",
                  "Check the rubric and resubmit with evidence.",
                ],
              },
            });
          }),
        })),

      rescheduleWorkload: () =>
        set((s) => {
          const urgentAssignment = s.items.find(
            (item) =>
              item.type === "assignment" &&
              item.status !== "completed" &&
              item.dueAt &&
              new Date(item.dueAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
          );
          if (!urgentAssignment) return s;

          return {
            items: s.items.map((item) => {
              if (
                item.status === "completed" ||
                item.type === "assignment" ||
                item.tags.includes("school")
              ) {
                return item;
              }
              const nextDue = item.dueAt
                ? new Date(new Date(item.dueAt).getTime() + 24 * 60 * 60 * 1000)
                : undefined;
              return reprioritiseItem({
                ...item,
                dueAt: nextDue?.toISOString(),
              });
            }),
          };
        }),

      toggleComplete: (id) => {
        set((s) => {
          const items = s.items.map((item) => {
            if (item.id !== id) return item;
            const requiresVerification =
              item.metadata?.requiresSubmissionVerification &&
              !item.metadata?.submissionVerified;
            if (requiresVerification) return item;

            const completed = item.status !== "completed";
            const updated = {
              ...item,
              status: completed ? ("completed" as const) : ("active" as const),
              completedAt: completed ? new Date().toISOString() : undefined,
            };
            return reprioritiseItem(updated);
          });
          const justCompleted = items.find(
            (i) => i.id === id && i.status === "completed"
          );
          return {
            items,
            xp: justCompleted ? s.xp + 15 : s.xp,
            petStage: justCompleted
              ? Math.min(10, s.petStage + 0.2)
              : s.petStage,
          };
        });
      },

      deleteItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      togglePanicMode: () =>
        set((s) => {
          if (s.panicMode) {
            return { panicMode: false, panicSessionId: null };
          }
          const sessionId = `panic-${Date.now()}`;
          return { panicMode: true, panicSessionId: sessionId };
        }),

      startPanicMode: (durationMinutes = 30) => {
        const sessionId = `panic-${Date.now()}`;
        set({
          panicMode: true,
          panicSessionId: sessionId,
          panicDurationMinutes: durationMinutes,
        });
      },

      endPanicMode: () =>
        set({ panicMode: false, panicSessionId: null }),

      ensurePanicSession: () =>
        set((s) => {
          if (s.panicSessionId) return s;
          return { panicSessionId: `panic-${Date.now()}` };
        }),

      setSafetyContacts: (safetyContacts) => set({ safetyContacts }),

      addSafetyContact: (contact) => {
        const entry: SafetyContact = {
          id: `contact-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...contact,
        };
        set((s) => ({ safetyContacts: [...s.safetyContacts, entry] }));
      },

      removeSafetyContact: (id) =>
        set((s) => ({
          safetyContacts: s.safetyContacts.filter((c) => c.id !== id),
        })),

      setPanicDurationMinutes: (panicDurationMinutes) =>
        set({ panicDurationMinutes }),

      startFocus: (minutes = 25) =>
        set({
          focusSecondsLeft: minutes * 60,
          focusRunning: true,
        }),

      tickFocus: () => {
        const { focusSecondsLeft, focusRunning } = get();
        if (!focusRunning || focusSecondsLeft === null) return;
        if (focusSecondsLeft <= 1) {
          set({ focusSecondsLeft: null, focusRunning: false, xp: get().xp + 10 });
          return;
        }
        set({ focusSecondsLeft: focusSecondsLeft - 1 });
      },

      stopFocus: () => set({ focusSecondsLeft: null, focusRunning: false }),

      resetDemoData: () => set({ items: seedItems() }),

      connectAutomationProvider: (provider) =>
        set((s) => ({
          automationStatus: {
            ...s.automationStatus,
            [provider]: !s.automationStatus[provider],
          },
        })),

      setAutomationMode: (automationMode) => set({ automationMode }),

      mergeCalendarEvents: (events) =>
        set((s) => ({
          items: mergeCalendarIntoItems(s.items, events),
          syncedCalendarEvents: events.map(syncedToPulseEvent),
          lastSyncAt: new Date().toISOString(),
          calendarSyncError: null,
        })),

      setCalendarStatus: (calendarStatus) => set({ calendarStatus }),

      setCalendarSyncing: (calendarSyncing) => set({ calendarSyncing }),

      setCalendarSyncError: (calendarSyncError) => set({ calendarSyncError }),

      addLocalCalendarEvent: (input) => {
        const event = createLocalEvent({
          title: input.title,
          description: input.description,
          startAt: input.startAt,
          endAt: input.endAt,
          allDay: input.allDay ?? false,
          location: input.location,
        });
        set((s) => ({
          localCalendarEvents: [...s.localCalendarEvents, event],
        }));
        return event;
      },

      updateLocalCalendarEvent: (id, patch) =>
        set((s) => ({
          localCalendarEvents: s.localCalendarEvents.map((e) =>
            e.id !== id
              ? e
              : {
                  ...e,
                  ...patch,
                  allDay: patch.allDay ?? e.allDay,
                  updatedAt: new Date().toISOString(),
                }
          ),
        })),

      deleteLocalCalendarEvent: (id) =>
        set((s) => ({
          localCalendarEvents: s.localCalendarEvents.filter((e) => e.id !== id),
        })),

      deleteCalendarEvent: (id) => {
        const state = get();
        if (state.localCalendarEvents.some((e) => e.id === id)) {
          get().deleteLocalCalendarEvent(id);
          return;
        }
        set((s) => ({
          syncedCalendarEvents: s.syncedCalendarEvents.filter((e) => e.id !== id),
          items: s.items.filter((i) => i.id !== id),
        }));
      },
    }),
    {
      name: "pulse-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        items: s.items,
        theme: s.theme,
        dyslexiaFont: s.dyslexiaFont,
        highContrast: s.highContrast,
        reducedMotion: s.reducedMotion,
        onboardingDone: s.onboardingDone,
        userName: s.userName,
        xp: s.xp,
        streak: s.streak,
        petStage: s.petStage,
        automationMode: s.automationMode,
        automationStatus: s.automationStatus,
        lastSyncAt: s.lastSyncAt,
        safetyContacts: s.safetyContacts,
        panicDurationMinutes: s.panicDurationMinutes,
        syncedCalendarEvents: s.syncedCalendarEvents,
        localCalendarEvents: s.localCalendarEvents,
      }),
    }
  )
);

export function useDailySummary() {
  const items = usePulseStore((s) => s.items);
  return buildDailySummary(items);
}

export function useProductivityScore() {
  const items = usePulseStore((s) => s.items);
  const active = items.filter((i) => i.status !== "completed");
  const completed = items.filter((i) => i.status === "completed").length;
  const overdue = active.filter((i) => i.smartSection === "Overdue").length;
  const score = Math.max(
    0,
    Math.min(
      100,
      70 +
        completed * 3 -
        overdue * 8 -
        active.filter((i) => i.urgencyScore >= 85).length * 2
    )
  );
  return score;
}
