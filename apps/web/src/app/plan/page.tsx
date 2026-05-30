"use client";

import { ItemCard } from "@/components/ItemCard";
import { QuickCapture } from "@/components/QuickCapture";
import { SectionBlock } from "@/components/SectionBlock";
import { useStiloStore } from "@/store/useStiloStore";
import { groupBySection, SECTION_ORDER, type SmartSection, type StiloItem } from "@/lib/core";
import { useState } from "react";

type ViewMode = "sections" | "list" | "timeline" | "completed";

export default function PlanPage() {
  const items = useStiloStore((s) => s.items);
  const [view, setView] = useState<ViewMode>("timeline");

  const active = items.filter((i) => i.status !== "completed");
  const completed = items.filter((i) => i.status === "completed");
  const groups = groupBySection(active);
  const timelineItems = [...active].sort((a, b) => {
    const left = new Date(a.startAt ?? a.dueAt ?? a.createdAt).getTime();
    const right = new Date(b.startAt ?? b.dueAt ?? b.createdAt).getTime();
    return left - right;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Plan</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Sorted by urgency, importance, and your energy — now shown as a timeline too.
        </p>
      </header>

      <div className="flex gap-2 rounded-pulse-lg bg-[var(--surface)] p-1">
        {(["timeline", "sections", "list", "completed"] as ViewMode[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex-1 rounded-xl py-2 text-xs font-medium capitalize transition ${
              view === v
                ? "bg-[var(--surface-solid)] shadow-soft text-[var(--accent)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <QuickCapture />

      {view === "timeline" && <TimelineView items={timelineItems} />}

      {view === "sections" &&
        SECTION_ORDER.map((section: SmartSection) => (
          <SectionBlock key={section} title={section} items={groups[section]} />
        ))}

      {view === "list" && (
        <ul className="space-y-2">
          {active.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {view === "completed" && (
        <ul className="space-y-2">
          {completed.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">
              Completed tasks appear here
            </p>
          ) : (
            completed.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function TimelineView({ items }: { items: StiloItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
        No timeline items yet. Add a task or sync your calendar to build a study plan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const date = new Date(item.startAt ?? item.dueAt ?? item.createdAt);
        const timeLabel = item.startAt
          ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : item.dueAt
          ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : "Any time";
        const width = Math.min(100, Math.max(18, (item.estimatedMinutes ?? 30) / 1.2));

        return (
          <div
            key={item.id}
            className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {item.type === "assignment" ? "Assignment" : item.type} • {timeLabel}
                </p>
              </div>
              <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[var(--accent)] text-[11px] font-semibold">
                {item.estimatedMinutes ?? 30} min
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${width}%` }}
              />
            </div>
            {item.description && (
              <p className="mt-3 text-sm text-[var(--text-muted)] line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
