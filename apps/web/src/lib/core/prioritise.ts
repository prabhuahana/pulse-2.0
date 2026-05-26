import type {
  ColorTag,
  ItemType,
  PrioritisationResult,
  PulseItem,
  SmartSection,
} from "./types";

export interface PrioritiseInput {
  type: ItemType;
  title: string;
  dueAt?: string;
  estimatedMinutes?: number;
  tags?: string[];
  pinned?: boolean;
  status?: PulseItem["status"];
}

function hoursUntil(iso?: string): number | null {
  if (!iso) return null;
  return (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60);
}

export function prioritiseItem(input: PrioritiseInput): PrioritisationResult {
  const hours = hoursUntil(input.dueAt);
  const isOverdue = hours !== null && hours < 0;
  const due24h = hours !== null && hours >= 0 && hours <= 24;
  const due72h = hours !== null && hours >= 0 && hours <= 72;
  const dueWeek = hours !== null && hours >= 0 && hours <= 168;
  const estimate = input.estimatedMinutes ?? 30;
  const tags = input.tags ?? [];

  let urgencyScore = 35;
  if (isOverdue) urgencyScore = 95;
  else if (due24h) urgencyScore = 85;
  else if (due72h) urgencyScore = 60;
  else if (dueWeek) urgencyScore = 45;

  if (input.type === "deadline") urgencyScore = Math.min(100, urgencyScore + 15);
  if (input.type === "event") urgencyScore = Math.max(urgencyScore, 50);

  let importanceScore = 40;
  if (input.pinned) importanceScore = 90;
  else if (input.type === "deadline") importanceScore = 75;
  else if (tags.includes("school") || tags.includes("work")) importanceScore = 70;
  else if (tags.includes("personal")) importanceScore = 55;

  const energyRequired = Math.min(
    100,
    Math.round(estimate / 2 + (input.type === "deadline" ? 20 : 0))
  );

  const stressScore = Math.min(
    100,
    Math.round(
      (isOverdue ? 40 : 0) +
        (due24h ? 30 : due72h ? 15 : 0) +
        urgencyScore * 0.2
    )
  );

  const smartSection = assignSection({
    isOverdue,
    urgencyScore,
    importanceScore,
    dueWeek,
    estimate,
    energyRequired,
  });

  const colorTag = assignColor({
    status: input.status,
    isOverdue,
    urgencyScore,
    importanceScore,
    dueWeek,
    tags,
    completed: input.status === "completed",
  });

  return {
    urgencyScore,
    importanceScore,
    stressScore,
    energyRequired,
    smartSection,
    colorTag,
  };
}

function assignSection(ctx: {
  isOverdue: boolean;
  urgencyScore: number;
  importanceScore: number;
  dueWeek: boolean;
  estimate: number;
  energyRequired: number;
}): SmartSection {
  if (ctx.isOverdue) return "Overdue";
  if (ctx.urgencyScore >= 80 || (ctx.urgencyScore >= 70 && ctx.importanceScore >= 60)) {
    return "Do Now";
  }
  if (ctx.dueWeek && ctx.importanceScore >= 55) return "Important This Week";
  if (ctx.estimate <= 15 && ctx.energyRequired <= 45) return "Quick Wins";
  if (ctx.energyRequired <= 35 && ctx.urgencyScore < 70) return "Low Energy Tasks";
  return "Can Wait";
}

function assignColor(ctx: {
  status?: PulseItem["status"];
  isOverdue: boolean;
  urgencyScore: number;
  importanceScore: number;
  dueWeek: boolean;
  tags: string[];
  completed: boolean;
}): ColorTag {
  if (ctx.completed || ctx.status === "completed") return "green";
  if (ctx.isOverdue || ctx.urgencyScore >= 85) return "red";
  if (ctx.importanceScore >= 75) return "orange";
  if (ctx.tags.includes("school") || ctx.tags.includes("work")) return "purple";
  if (ctx.dueWeek) return "yellow";
  if (ctx.tags.includes("personal")) return "blue";
  return "yellow";
}

export function reprioritiseItem(item: PulseItem): PulseItem {
  const scores = prioritiseItem({
    type: item.type,
    title: item.title,
    dueAt: item.dueAt,
    estimatedMinutes: item.estimatedMinutes,
    tags: item.tags,
    pinned: item.pinned,
    status: item.status,
  });
  return {
    ...item,
    ...scores,
    updatedAt: new Date().toISOString(),
  };
}

export const SECTION_ORDER: SmartSection[] = [
  "Overdue",
  "Do Now",
  "Important This Week",
  "Quick Wins",
  "Low Energy Tasks",
  "Can Wait",
];

export function groupBySection(items: PulseItem[]): Record<SmartSection, PulseItem[]> {
  const groups = Object.fromEntries(
    SECTION_ORDER.map((s) => [s, [] as PulseItem[]])
  ) as Record<SmartSection, PulseItem[]>;

  for (const item of items) {
    if (item.status === "completed") continue;
    const section = item.smartSection;
    if (groups[section]) groups[section].push(item);
    else groups["Can Wait"].push(item);
  }

  for (const section of SECTION_ORDER) {
    groups[section].sort((a, b) => b.urgencyScore - a.urgencyScore);
  }

  return groups;
}

export function buildDailySummary(items: PulseItem[]): {
  urgentCount: number;
  meetingCount: number;
  overdueCount: number;
  completedToday: number;
  message: string;
} {
  const active = items.filter((i) => i.status !== "completed");
  const urgentCount = active.filter(
    (i) => i.smartSection === "Do Now" || i.urgencyScore >= 80
  ).length;
  const meetingCount = active.filter((i) => i.type === "event").length;
  const overdueCount = active.filter((i) => i.smartSection === "Overdue").length;
  const today = new Date().toDateString();
  const completedToday = items.filter(
    (i) =>
      i.completedAt && new Date(i.completedAt).toDateString() === today
  ).length;

  let message = "You're all caught up. Enjoy a calm moment.";
  if (urgentCount > 0 || meetingCount > 0) {
    const parts: string[] = [];
    if (urgentCount > 0)
      parts.push(`${urgentCount} urgent task${urgentCount > 1 ? "s" : ""}`);
    if (meetingCount > 0)
      parts.push(`${meetingCount} meeting${meetingCount > 1 ? "s" : ""}`);
    message = `You have ${parts.join(" and ")} today.`;
  }
  if (overdueCount > 0) {
    message += ` ${overdueCount} overdue — we'll tackle them step by step.`;
  }

  return { urgentCount, meetingCount, overdueCount, completedToday, message };
}

export function parseNaturalLanguage(input: string): Partial<PrioritiseInput> & {
  title: string;
} {
  let title = input.trim();
  let type: ItemType = "task";
  let dueAt: string | undefined;
  const tags: string[] = [];

  const lower = title.toLowerCase();
  if (lower.startsWith("remind me to ")) {
    type = "reminder";
    title = title.slice(13);
  } else if (lower.startsWith("remind me ")) {
    type = "reminder";
    title = title.slice(10);
  }

  if (/\b(study|homework|assignment|class)\b/i.test(title)) tags.push("school");
  if (/\b(meeting|call|sync)\b/i.test(title)) type = "event";
  if (/\b(deadline|due)\b/i.test(title)) type = "deadline";

  const tomorrow = /tomorrow/i.test(input);
  const today = /today/i.test(input);
  const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

  const base = new Date();
  if (tomorrow) base.setDate(base.getDate() + 1);
  if (today || tomorrow) {
    let hours = 17;
    let minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3]?.toLowerCase();
      if (ampm === "pm" && hours < 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;
    }
    base.setHours(hours, minutes, 0, 0);
    dueAt = base.toISOString();
  }

  title = title
    .replace(/\btomorrow\b/gi, "")
    .replace(/\btoday\b/gi, "")
    .replace(/\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return { title: title || input, type, dueAt, tags };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pulse-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createItem(
  partial: Partial<PulseItem> & { title: string }
): PulseItem {
  const now = new Date().toISOString();
  const base: PrioritiseInput = {
    type: partial.type ?? "task",
    title: partial.title,
    dueAt: partial.dueAt,
    estimatedMinutes: partial.estimatedMinutes,
    tags: partial.tags ?? [],
    pinned: partial.pinned ?? false,
    status: partial.status ?? "active",
  };
  const scores = prioritiseItem(base);

  return {
    id: partial.id ?? generateId(),
    type: base.type,
    title: base.title,
    description: partial.description,
    status: partial.status ?? "active",
    dueAt: partial.dueAt,
    startAt: partial.startAt,
    endAt: partial.endAt,
    estimatedMinutes: partial.estimatedMinutes ?? 30,
    completedAt: partial.completedAt,
    tags: partial.tags ?? [],
    pinned: partial.pinned ?? false,
    metadata: partial.metadata,
    createdAt: partial.createdAt ?? now,
    updatedAt: now,
    ...scores,
  };
}

export const SAMPLE_ITEMS: Omit<PulseItem, "id" | "createdAt" | "updatedAt">[] = [
  {
    type: "deadline",
    title: "Chemistry lab report",
    status: "active",
    dueAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    estimatedMinutes: 90,
    tags: ["school"],
    pinned: true,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Do Now",
    colorTag: "red",
  },
  {
    type: "task",
    title: "Reply to team email",
    status: "active",
    estimatedMinutes: 10,
    tags: ["work"],
    pinned: false,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Quick Wins",
    colorTag: "orange",
  },
  {
    type: "event",
    title: "Design sync",
    status: "active",
    startAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    estimatedMinutes: 60,
    tags: ["work"],
    pinned: false,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Important This Week",
    colorTag: "purple",
  },
  {
    type: "assignment",
    title: "Biology lab report",
    status: "active",
    dueAt: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
    estimatedMinutes: 120,
    tags: ["school"],
    pinned: false,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Do Now",
    colorTag: "red",
  },
  {
    type: "task",
    title: "Water the plants",
    status: "active",
    estimatedMinutes: 5,
    tags: ["personal"],
    pinned: false,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Low Energy Tasks",
    colorTag: "blue",
  },
  {
    type: "reminder",
    title: "Buy groceries",
    status: "active",
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedMinutes: 20,
    tags: ["personal"],
    pinned: false,
    urgencyScore: 0,
    importanceScore: 0,
    stressScore: 0,
    energyRequired: 0,
    smartSection: "Can Wait",
    colorTag: "blue",
  },
];
