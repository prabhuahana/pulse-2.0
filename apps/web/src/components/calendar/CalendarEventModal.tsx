"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { StiloCalendarEvent } from "@/types/calendar";
import type { CreateCalendarEventInput } from "@/types/calendar";

interface CalendarEventModalProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  initial?: StiloCalendarEvent | null;
  defaultStart?: Date;
  onClose: () => void;
  onSave: (input: CreateCalendarEventInput) => void;
  onUpdate?: (id: string, input: CreateCalendarEventInput) => void;
  onDelete?: (id: string) => void;
}

function toLocalInputValue(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  if (allDay) {
    return d.toISOString().slice(0, 10);
  }
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarEventModal({
  open,
  mode,
  initial,
  defaultStart,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}: CalendarEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const readOnly = mode === "view" && initial?.source !== "local";

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? "");
      setLocation(initial.location ?? "");
      setAllDay(initial.allDay);
      setStart(toLocalInputValue(initial.startAt, initial.allDay));
      setEnd(toLocalInputValue(initial.endAt, initial.allDay));
    } else if (defaultStart) {
      const s = new Date(defaultStart);
      s.setHours(9, 0, 0, 0);
      const e = new Date(s);
      e.setHours(10, 0, 0, 0);
      setTitle("");
      setDescription("");
      setLocation("");
      setAllDay(false);
      setStart(toLocalInputValue(s.toISOString(), false));
      setEnd(toLocalInputValue(e.toISOString(), false));
    }
  }, [open, initial, defaultStart]);

  if (!open) return null;

  function parseInput(value: string, isAllDay: boolean): string {
    if (isAllDay) {
      return new Date(`${value}T00:00:00`).toISOString();
    }
    return new Date(value).toISOString();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    const startAt = parseInput(start, allDay);
    const endAt = parseInput(end, allDay);
    if (new Date(endAt) <= new Date(startAt)) {
      setError("End must be after start");
      return;
    }

    const input: CreateCalendarEventInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startAt,
      endAt,
      allDay,
    };

    if (mode === "edit" && initial && onUpdate) {
      onUpdate(initial.id, input);
    } else {
      onSave(input);
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-pulse-lg border border-[var(--border)] bg-[var(--surface-solid)] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="event-modal-title" className="text-lg font-bold">
            {mode === "create"
              ? "New event"
              : mode === "edit"
                ? "Edit event"
                : initial?.title ?? "Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--surface)]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {initial?.source !== "local" && initial && (
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            Imported from {initial.source}. Edit in your calendar app.
            {initial.htmlLink && (
              <>
                {" "}
                <a
                  href={initial.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] underline"
                >
                  Open externally
                </a>
              </>
            )}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readOnly}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 disabled:opacity-60"
              required
            />
          </label>

          {!readOnly && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                />
                All day
              </label>

              <label className="block text-sm">
                Start
                <input
                  type={allDay ? "date" : "datetime-local"}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                  required
                />
              </label>

              <label className="block text-sm">
                End
                <input
                  type={allDay ? "date" : "datetime-local"}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                  required
                />
              </label>

              <label className="block text-sm">
                Location
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                />
              </label>

              <label className="block text-sm">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2"
                />
              </label>
            </>
          )}

          {readOnly && initial && (
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <p>
                {new Date(initial.startAt).toLocaleString()} –{" "}
                {new Date(initial.endAt).toLocaleString()}
              </p>
              {initial.location && <p>{initial.location}</p>}
              {initial.description && <p>{initial.description}</p>}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {!readOnly && (
              <button
                type="submit"
                className="flex-1 rounded-pulse-lg bg-[var(--accent)] py-2.5 font-medium text-[var(--bg)]"
              >
                {mode === "edit" ? "Save changes" : "Create event"}
              </button>
            )}
            {mode !== "create" && initial?.source === "local" && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initial.id);
                  onClose();
                }}
                className="rounded-pulse-lg border border-red-300 px-4 py-2.5 text-sm text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
