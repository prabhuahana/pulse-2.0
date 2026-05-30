"use client";

import { ItemCard } from "@/components/ItemCard";
import type { StiloItem, SmartSection } from "@/lib/core";
import { AnimatePresence } from "framer-motion";

interface SectionBlockProps {
  title: SmartSection;
  items: StiloItem[];
  defaultOpen?: boolean;
}

const SECTION_HINTS: Partial<Record<SmartSection, string>> = {
  "Do Now": "Focus here first",
  "Quick Wins": "Small tasks, big momentum",
  "Low Energy Tasks": "Gentle wins when you're tired",
  Overdue: "One step at a time",
};

export function SectionBlock({ title, items, defaultOpen = true }: SectionBlockProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby={`section-${title}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h2
          id={`section-${title}`}
          className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]"
        >
          {title}
        </h2>
        {SECTION_HINTS[title] && (
          <span className="text-xs text-[var(--text-muted)]">
            {SECTION_HINTS[title]}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} compact={title === "Quick Wins"} />
            </li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
