"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePulseStore } from "@/store/usePulseStore";
import type { AutomationProvider } from "@/lib/core";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, ShieldCheck, Sparkles, Zap } from "lucide-react";

const PROVIDER_LABELS: Record<AutomationProvider, { label: string; description: string }> = {
  googleClassroom: {
    label: "Google Classroom",
    description: "Assignments, due dates and announcements synced automatically.",
  },
  microsoftTeams: {
    label: "Microsoft Teams",
    description: "Class tasks, meetings and shared files detected from Teams.",
  },
  canvas: {
    label: "Canvas LMS",
    description: "Course work, rubrics and submission deadlines pulled in safely.",
  },
  moodle: {
    label: "Moodle",
    description: "Homework, quizzes and study guides imported into Pulse.",
  },
  notion: {
    label: "Notion",
    description: "Study pages and project notes become structured work plans.",
  },
  schoolEmail: {
    label: "School email",
    description: "Course announcements and due date alerts from your inbox.",
  },
};

export default function AutomationPage() {
  const items = usePulseStore((s) => s.items);
  const assignments = useMemo(
    () => items.filter((item) => item.type === "assignment" || item.tags.includes("school")),
    [items]
  );
  const automationStatus = usePulseStore((s) => s.automationStatus);
  const automationMode = usePulseStore((s) => s.automationMode);
  const connectAutomationProvider = usePulseStore((s) => s.connectAutomationProvider);
  const setAutomationMode = usePulseStore((s) => s.setAutomationMode);
  const importAssignment = usePulseStore((s) => s.importAssignment);
  const verifyAssignment = usePulseStore((s) => s.verifyAssignment);
  const requestRevision = usePulseStore((s) => s.requestRevision);
  const rescheduleWorkload = usePulseStore((s) => s.rescheduleWorkload);

  const importSample = () => {
    importAssignment({
      title: "Biology report on ecosystems",
      description:
        "Capture evidence, answer all rubric points, and upload work inside Pulse.",
      dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedMinutes: 90,
      tags: ["school", "biology"],
      metadata: {
        course: "Biology 12",
        assignmentId: "bio-ecosystems-001",
        rubric: [
          "Include three ecosystem examples",
          "Explain human impact",
          "Submit a proper reference list",
        ],
        origin: "Google Classroom",
      },
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/home"
          className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} /> Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--accent)]/15 text-[var(--accent)]">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">School & Work Automation</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Automatically detect assignments, deadlines, rubrics and submissions, with safe tracking rules.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {Object.entries(automationStatus).map(([provider, connected]) => (
          <button
            key={provider}
            type="button"
            onClick={() => connectAutomationProvider(provider as keyof typeof automationStatus)}
            className={`rounded-pulse-lg border px-4 py-4 text-left transition ${
              connected
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{PROVIDER_LABELS[provider as keyof typeof automationStatus].label}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {PROVIDER_LABELS[provider as keyof typeof automationStatus].description}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)]">
                {connected ? "Connected" : "Connect"}
              </span>
            </div>
          </button>
        ))}
      </section>

      <section className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Automation mode</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Choose how aggressive reminders and schedule changes should be.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["standard", "accountability", "no_escape"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAutomationMode(mode)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  automationMode === mode
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {mode.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={importSample}
          className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition hover:border-[var(--accent)]"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium">Import test assignment</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Add a sample assignment so Pulse can demonstrate safe tracking and revision logic.
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={rescheduleWorkload}
          className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition hover:border-[var(--accent)]"
        >
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-[var(--accent)]" />
            <div>
              <p className="font-medium">Auto reschedule work</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                When deadlines pile up, Pulse shifts lower-priority tasks to free space for urgent work.
              </p>
            </div>
          </div>
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold">Submission protection</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Tasks with assignment verification require proof inside Pulse before they can be marked complete.
          This protects against fake completion and keeps the focus on work that is actually done.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold">Imported assignments</h2>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
            No assignments imported yet. Connect a provider or add one to see the system in action.
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {item.metadata?.course ?? "Course"} • {item.type}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[var(--accent)] text-[11px] font-semibold">
                    {item.metadata?.origin ?? "Imported"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="text-xs text-[var(--text-muted)]">
                    Due: {item.dueAt ? new Date(item.dueAt).toLocaleString() : "Unscheduled"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Verification: {item.metadata?.submissionVerified ? "Verified" : "Pending"}
                  </p>
                </div>

                {item.metadata?.rubric?.length ? (
                  <div className="mt-3 rounded-xl bg-[var(--bg)] p-3 text-xs text-[var(--text-muted)]">
                    <p className="font-semibold text-[var(--text)]">Rubric check</p>
                    <ul className="mt-2 list-disc pl-4">
                      {item.metadata.rubric.map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {item.metadata?.aiFeedback?.length ? (
                  <div className="mt-3 rounded-xl bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]">
                    <p className="font-semibold text-[var(--text)]">AI feedback</p>
                    <ul className="mt-2 list-disc pl-4">
                      {item.metadata.aiFeedback.map((feedback, index) => (
                        <li key={index}>{feedback}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => verifyAssignment(item.id)}
                    className="rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Mark verified
                  </button>
                  <button
                    type="button"
                    onClick={() => requestRevision(item.id)}
                    className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)]"
                  >
                    Request revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
        <p className="font-medium">Note</p>
        <p className="mt-2">
          Pulse is designed for local-first automation and safe tracking. Real integrations are stubbed,
          but this page creates a reliable workflow for assignment import, verification, and revision.
        </p>
      </footer>
    </div>
  );
}
