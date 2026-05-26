"use client";

import { usePulseStore } from "@/store/usePulseStore";
import type { CalendarConnectionStatus } from "@/lib/calendar/types";
import type { SyncedCalendarEvent } from "@/lib/calendar/types";
import type { FreeSlot } from "@/lib/calendar/types";
import {
  Apple,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCw,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M13 1h10v10H13z" />
      <path fill="#7fba00" d="M1 13h10v10H1z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  );
}

export function CalendarConnections({ compact }: { compact?: boolean }) {
  const mergeCalendarEvents = usePulseStore((s) => s.mergeCalendarEvents);
  const setCalendarStatus = usePulseStore((s) => s.setCalendarStatus);
  const calendarStatus = usePulseStore((s) => s.calendarStatus);
  const lastSyncAt = usePulseStore((s) => s.lastSyncAt);

  const [status, setStatus] = useState<
    (CalendarConnectionStatus & {
      googleConfigured?: boolean;
      microsoftConfigured?: boolean;
    }) | null
  >(calendarStatus);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [appleId, setAppleId] = useState("");
  const [applePassword, setApplePassword] = useState("");
  const [connectingApple, setConnectingApple] = useState(false);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/calendar/connections");
    if (res.ok) {
      const json = await res.json();
      setStatus(json);
      setCalendarStatus(json);
    }
  }, [setCalendarStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") || params.get("error")) {
      loadStatus();
      if (params.get("connected")) {
        setMessage("Calendar connected! Tap Sync now to import events.");
        void handleSync();
      }
      if (params.get("error")) {
        setMessage(`Connection failed: ${params.get("error")}`);
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      mergeCalendarEvents(json.events as SyncedCalendarEvent[]);
      setFreeSlots(json.freeSlotsToday ?? []);
      setMessage(`Synced ${json.events?.length ?? 0} events`);
      await loadStatus();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect(provider: "google" | "microsoft" | "apple") {
    await fetch("/api/calendar/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    await loadStatus();
    setMessage(`Disconnected ${provider}`);
  }

  async function connectApple(e: React.FormEvent) {
    e.preventDefault();
    setConnectingApple(true);
    setMessage(null);
    try {
      const res = await fetch("/api/calendar/connect/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appleId, appPassword: applePassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setApplePassword("");
      setMessage("Apple Calendar connected!");
      await loadStatus();
      await handleSync();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Apple connect failed");
    } finally {
      setConnectingApple(false);
    }
  }

  const anyConnected = status?.google || status?.microsoft || status?.apple;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Calendars</h2>
          {anyConnected && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Sync now
            </button>
          )}
        </div>
      )}

      {message && (
        <p className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-muted)]">
          {message}
        </p>
      )}

      {lastSyncAt && (
        <p className="text-xs text-[var(--text-muted)]">
          Last synced {new Date(lastSyncAt).toLocaleString()}
        </p>
      )}

      {/* Google */}
      <ProviderCard
        name="Google Calendar"
        icon={<GoogleIcon />}
        connected={status?.google}
        email={status?.googleEmail}
        configured={status?.googleConfigured !== false}
        connectHref="/api/calendar/connect/google"
        onDisconnect={() => disconnect("google")}
        setupHint="GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local"
      />

      {/* Microsoft */}
      <ProviderCard
        name="Outlook Calendar"
        icon={<MicrosoftIcon />}
        connected={status?.microsoft}
        email={status?.microsoftEmail}
        configured={status?.microsoftConfigured !== false}
        connectHref="/api/calendar/connect/microsoft"
        onDisconnect={() => disconnect("microsoft")}
        setupHint="MICROSOFT_CLIENT_ID + MICROSOFT_CLIENT_SECRET in .env.local"
      />

      {/* Apple */}
      <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
            <Apple size={22} />
          </div>
          <div className="flex-1">
            <p className="font-medium">Apple Calendar</p>
            {status?.apple ? (
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Check size={12} className="text-green-600" />
                {status.appleEmail}
              </p>
            ) : (
              <>
                <p className="text-xs text-[var(--text-muted)]">
                  iCloud via app-specific password
                </p>
                <p className="mt-1 text-[var(--text-muted)] text-[11px]">
                  Apple credentials are encrypted on the server and require a strong SESSION_SECRET to connect safely.
                </p>
              </>
            )}
          </div>
          {status?.apple ? (
            <button
              type="button"
              onClick={() => disconnect("apple")}
              className="text-xs text-[var(--text-muted)] hover:text-red-500"
            >
              <Unplug size={16} />
            </button>
          ) : null}
        </div>

        {!status?.apple && (
          <form onSubmit={connectApple} className="mt-4 space-y-2">
            <input
              type="email"
              value={appleId}
              onChange={(e) => setAppleId(e.target.value)}
              placeholder="Apple ID (email)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-2 text-sm outline-none"
            />
            <input
              type="password"
              value={applePassword}
              onChange={(e) => setApplePassword(e.target.value)}
              placeholder="App-specific password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] px-3 py-2 text-sm outline-none"
            />
            <p className="text-xs text-[var(--text-muted)]">
              Create one at{" "}
              <a
                href="https://appleid.apple.com/account/manage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline"
              >
                appleid.apple.com
              </a>{" "}
              → Sign-In and Security → App-Specific Passwords
            </p>
            <button
              type="submit"
              disabled={connectingApple || !appleId || !applePassword}
              className="w-full rounded-xl bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {connectingApple ? "Connecting…" : "Connect Apple Calendar"}
            </button>
          </form>
        )}
      </div>

      {compact && anyConnected && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="flex w-full items-center justify-center gap-2 rounded-pulse-lg border border-[var(--border)] py-3 text-sm font-medium"
        >
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Sync calendars
        </button>
      )}

      {freeSlots.length > 0 && (
        <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm font-medium">Free time today</p>
          <ul className="mt-2 space-y-1">
            {freeSlots.slice(0, 4).map((slot) => (
              <li key={slot.startAt} className="text-xs text-[var(--text-muted)]">
                {new Date(slot.startAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {" – "}
                {slot.durationMinutes}m open
              </li>
            ))}
          </ul>
        </div>
      )}

      {!status?.googleConfigured && !status?.microsoftConfigured && !compact && (
        <div className="rounded-pulse-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-medium text-[var(--text)]">Developer setup required</p>
          <p className="mt-1">
            Copy <code className="text-xs">.env.example</code> to{" "}
            <code className="text-xs">.env.local</code> and add OAuth credentials.
          </p>
          <Link
            href="/settings/calendar"
            className="mt-2 inline-flex items-center gap-1 text-[var(--accent)]"
          >
            Setup guide <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  name,
  icon,
  connected,
  email,
  configured,
  connectHref,
  onDisconnect,
  setupHint,
}: {
  name: string;
  icon: React.ReactNode;
  connected?: boolean;
  email?: string;
  configured?: boolean;
  connectHref: string;
  onDisconnect: () => void;
  setupHint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{name}</p>
        {connected && email ? (
          <p className="truncate text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Mail size={12} />
            {email}
          </p>
        ) : connected ? (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <Check size={12} /> Connected
          </p>
        ) : !configured ? (
          <p className="text-xs text-amber-600">{setupHint}</p>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">Not connected</p>
        )}
      </div>
      {connected ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="shrink-0 text-[var(--text-muted)] hover:text-red-500"
          aria-label={`Disconnect ${name}`}
        >
          <Unplug size={18} />
        </button>
      ) : configured ? (
        <a
          href={connectHref}
          className="shrink-0 rounded-xl bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Connect
        </a>
      ) : (
        <Calendar size={18} className="text-[var(--text-muted)]" />
      )}
    </div>
  );
}
