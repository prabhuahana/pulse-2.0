export type ItemType =
  | "task"
  | "reminder"
  | "event"
  | "deadline"
  | "routine"
  | "note";

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
  | "pastel"
  | "dark"
  | "monochrome"
  | "glass"
  | "anime"
  | "neon";

export interface StiloItem {
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
