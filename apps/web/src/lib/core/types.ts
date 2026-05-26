export type ItemType =
  | "task"
  | "reminder"
  | "event"
  | "deadline"
  | "routine"
  | "note"
  | "assignment"
  | "exam"
  | "project"
  | "study_session";

export type ItemStatus =
  | "inbox"
  | "active"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ColorTag = "red" | "orange" | "yellow" | "green" | "blue" | "purple";

export type SmartSection =
  | "Do Now"
  | "Important This Week"
  | "Quick Wins"
  | "Low Energy Tasks"
  | "Can Wait"
  | "Overdue";

export type ThemePreset =
  | "burgundy"
  | "rose"
  | "sage"
  | "beige"
  | "noir"
  | "alabaster";

export type CalendarProvider = "google" | "microsoft" | "apple";

export type AutomationProvider =
  | "googleClassroom"
  | "microsoftTeams"
  | "canvas"
  | "moodle"
  | "notion"
  | "schoolEmail";

export interface PulseItemMetadata {
  calendarProvider?: CalendarProvider;
  externalEventId?: string;
  calendarId?: string;
  location?: string;
  htmlLink?: string;
  course?: string;
  assignmentId?: string;
  rubric?: string[];
  requiresSubmissionVerification?: boolean;
  submissionVerified?: boolean;
  aiFeedback?: string[];
  revisionRequired?: boolean;
  origin?: string;
}

export interface PulseItem {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  status: ItemStatus;
  dueAt?: string;
  startAt?: string;
  endAt?: string;
  estimatedMinutes?: number;
  completedAt?: string;
  urgencyScore: number;
  importanceScore: number;
  stressScore: number;
  energyRequired: number;
  smartSection: SmartSection;
  colorTag: ColorTag;
  tags: string[];
  pinned: boolean;
  metadata?: PulseItemMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PrioritisationResult {
  urgencyScore: number;
  importanceScore: number;
  stressScore: number;
  energyRequired: number;
  smartSection: SmartSection;
  colorTag: ColorTag;
}

export interface DailySummary {
  urgentCount: number;
  meetingCount: number;
  overdueCount: number;
  completedToday: number;
  message: string;
}
