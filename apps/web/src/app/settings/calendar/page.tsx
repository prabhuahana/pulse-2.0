"use client";

import { CalendarConnections } from "@/components/CalendarConnections";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CalendarSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/settings"
          className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} /> Settings
        </Link>
        <h1 className="font-display text-2xl font-bold">Calendar accounts</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Connect Google, Outlook, and Apple Calendar. Events sync into Pulse automatically.
        </p>
      </header>

      <section className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="font-semibold">Google & Outlook setup</h2>
        <p className="text-xs text-[var(--text-muted)]">
          Apple Calendar requires a strong <code className="text-xs">SESSION_SECRET</code> in <code className="text-xs">.env.local</code> to keep your credentials encrypted and safe.
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-[var(--text-muted)]">
          <li>
            Copy <code className="text-xs">.env.example</code> to{" "}
            <code className="text-xs">.env.local</code> in <code className="text-xs">apps/web</code>
          </li>
          <li>
            <strong className="text-[var(--text)]">Google:</strong>{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline"
            >
              Google Cloud Console
            </a>{" "}
            → OAuth client (Web) → redirect URI:{" "}
            <code className="text-xs break-all">
              http://localhost:3000/api/calendar/connect/google/callback
            </code>
          </li>
          <li>
            Enable <strong>Google Calendar API</strong> in APIs & Services → Library
          </li>
          <li>
            <strong className="text-[var(--text)]">Outlook:</strong>{" "}
            <a
              href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline"
            >
              Azure App registrations
            </a>{" "}
            → redirect URI:{" "}
            <code className="text-xs break-all">
              http://localhost:3000/api/calendar/connect/microsoft/callback
            </code>
          </li>
          <li>Restart <code className="text-xs">npm run dev</code> after saving .env.local</li>
        </ol>
      </section>

      <CalendarConnections />
    </div>
  );
}
