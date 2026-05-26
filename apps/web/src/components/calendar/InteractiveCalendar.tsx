"use client";

import { useCallback, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import { CalendarEventModal } from "@/components/calendar/CalendarEventModal";
import { usePulseStore } from "@/store/usePulseStore";
import type { PulseCalendarEvent } from "@/types/calendar";

function eventClassNames(event: PulseCalendarEvent): string[] {
  if (event.source === "local") return ["fc-event-local"];
  return [`fc-event-${event.source}`];
}

function toFullCalendarEvent(event: PulseCalendarEvent): EventInput {
  return {
    id: event.id,
    title: event.title,
    start: event.startAt,
    end: event.endAt,
    allDay: event.allDay,
    classNames: eventClassNames(event),
    extendedProps: { pulseEvent: event },
  };
}

export function InteractiveCalendar() {
  const synced = usePulseStore((s) => s.syncedCalendarEvents);
  const local = usePulseStore((s) => s.localCalendarEvents);
  const addLocal = usePulseStore((s) => s.addLocalCalendarEvent);
  const updateLocal = usePulseStore((s) => s.updateLocalCalendarEvent);
  const deleteEvent = usePulseStore((s) => s.deleteCalendarEvent);

  const allEvents = useMemo(
    () => [...synced, ...local],
    [synced, local]
  );

  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">(
    "dayGridMonth"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selected, setSelected] = useState<PulseCalendarEvent | null>(null);
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();

  const fcEvents = useMemo(
    () => allEvents.map(toFullCalendarEvent),
    [allEvents]
  );

  const openCreate = useCallback((start: Date) => {
    setSelected(null);
    setDefaultStart(start);
    setModalMode("create");
    setModalOpen(true);
  }, []);

  const openView = useCallback((event: PulseCalendarEvent) => {
    setSelected(event);
    setDefaultStart(undefined);
    setModalMode(event.source === "local" ? "edit" : "view");
    setModalOpen(true);
  }, []);

  const handleDateSelect = useCallback(
    (info: DateSelectArg) => {
      openCreate(info.start);
    },
    [openCreate]
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const pulseEvent = info.event.extendedProps.pulseEvent as
        | PulseCalendarEvent
        | undefined;
      if (pulseEvent) openView(pulseEvent);
    },
    [openView]
  );

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      const pulseEvent = info.event.extendedProps.pulseEvent as
        | PulseCalendarEvent
        | undefined;
      if (!pulseEvent || pulseEvent.source !== "local") {
        info.revert();
        return;
      }
      updateLocal(pulseEvent.id, {
        startAt: info.event.start?.toISOString() ?? pulseEvent.startAt,
        endAt:
          info.event.end?.toISOString() ??
          info.event.start?.toISOString() ??
          pulseEvent.endAt,
      });
    },
    [updateLocal]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView("dayGridMonth")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            view === "dayGridMonth"
              ? "bg-[var(--accent)] text-[var(--bg)]"
              : "border border-[var(--border)]"
          }`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => setView("timeGridWeek")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            view === "timeGridWeek"
              ? "bg-[var(--accent)] text-[var(--bg)]"
              : "border border-[var(--border)]"
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => openCreate(new Date())}
          className="ml-auto rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium"
        >
          + New event
        </button>
      </div>

      <div className="overflow-hidden rounded-pulse-lg border border-[var(--border)] bg-[var(--surface-solid)] p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          key={view}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={fcEvents}
          selectable
          selectMirror
          editable
          dayMaxEvents
          nowIndicator
          height="auto"
          aspectRatio={1.2}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={(info) => {
            const pulseEvent = info.event.extendedProps.pulseEvent as
              | PulseCalendarEvent
              | undefined;
            if (!pulseEvent || pulseEvent.source !== "local") {
              info.revert();
              return;
            }
            updateLocal(pulseEvent.id, {
              startAt: info.event.start!.toISOString(),
              endAt: info.event.end!.toISOString(),
            });
          }}
        />
      </div>

      {allEvents.length === 0 && (
        <p className="text-center text-sm text-[var(--text-muted)]">
          No events yet. Tap a day to create one, or connect Google Calendar and
          sync.
        </p>
      )}

      <CalendarEventModal
        open={modalOpen}
        mode={modalMode}
        initial={selected}
        defaultStart={defaultStart}
        onClose={() => setModalOpen(false)}
        onSave={(input) => addLocal(input)}
        onUpdate={(id, input) => updateLocal(id, input)}
        onDelete={(id) => deleteEvent(id)}
      />
    </div>
  );
}
