"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { usePanicStore } from "@/store/usePanicStore";
import { usePulseStore } from "@/store/usePulseStore";
import type { SafetyContact } from "@/types/panic-mode";

type SendStatus = "idle" | "sending" | "sent" | "failed";

interface PanicUnlockSectionProps {
  userId: string;
  userName: string;
  onSessionEnd: () => void;
  /** When true, user has not finished all tasks (early exit copy) */
  earlyExit?: boolean;
}

export function PanicUnlockSection({
  userId,
  userName,
  onSessionEnd,
  earlyExit = false,
}: PanicUnlockSectionProps) {
  const sessionId = usePanicStore((s) => s.sessionId)!;
  const canExitWithContact = usePanicStore((s) => s.canExitWithContact);
  const setUnlockRequestId = usePanicStore((s) => s.setUnlockRequestId);
  const setSelectedContact = usePanicStore((s) => s.setSelectedContact);
  const safetyContacts = usePulseStore((s) => s.safetyContacts);

  const [step, setStep] = useState<"contact" | "code">("contact");
  const [contact, setContact] = useState<SafetyContact | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [unlockRequestId, setLocalUnlockId] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withEmail = safetyContacts.filter((c) => c.email?.trim());

  if (!canExitWithContact()) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
        Contact exit is temporarily unavailable. Please wait for the cooldown to
        end.
      </p>
    );
  }

  if (withEmail.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
        Add a safety contact with an email in Settings to exit with a contact
        code.
      </p>
    );
  }

  async function sendToContact(c: SafetyContact) {
    setContact(c);
    setSelectedContact(c.id);
    setSendStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/panic/send-exit-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          safetyContactId: c.id,
          userId,
          userName,
          contactName: c.name,
          contactEmail: c.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      setLocalUnlockId(data.unlockRequestId);
      setUnlockRequestId(data.unlockRequestId);
      setLastSentAt(data.lastSentAt);
      setSendStatus("sent");
      setStep("code");
    } catch (e) {
      setSendStatus("failed");
      setError(e instanceof Error ? e.message : "Email failed");
    }
  }

  async function verifyCode() {
    if (!unlockRequestId || code.length !== 6) return;
    setVerifyLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/panic-mode/verify-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlockRequestId, code: code.trim(), userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      onSessionEnd();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h2 className="text-lg font-bold">
          {earlyExit ? "Exit early with a safety contact" : "Exit with safety contact"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {earlyExit
            ? "You have not finished all tasks. Your contact will receive an email with a code to help you exit."
            : "Or use a contact code instead of the button above."}
        </p>
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {step === "contact" && (
        <ul className="space-y-2">
          {withEmail.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={sendStatus === "sending"}
                onClick={() => void sendToContact(c)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 text-left hover:border-[var(--accent)] disabled:opacity-50"
              >
                <span>
                  <span className="font-medium">{c.name}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Mail className="h-3 w-3" />
                    {c.email}
                  </span>
                </span>
                {sendStatus === "sending" && contact?.id === c.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs text-[var(--accent)]">Send email</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {step === "code" && contact && (
        <div className="space-y-3">
          {sendStatus === "sent" && (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Email sent to {contact.email}
              {lastSentAt && (
                <span className="text-xs text-[var(--text-muted)]">
                  at {new Date(lastSentAt).toLocaleTimeString()}
                </span>
              )}
            </p>
          )}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center font-mono text-2xl tracking-widest"
          />
          <button
            type="button"
            disabled={verifyLoading || code.length !== 6}
            onClick={() => void verifyCode()}
            className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-medium text-[var(--bg)] disabled:opacity-50"
          >
            {verifyLoading ? "Verifying…" : "End Panic Mode"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("contact");
              setCode("");
              setLocalUnlockId(null);
              setError(null);
            }}
            className="w-full text-sm text-[var(--text-muted)] underline"
          >
            Choose a different contact
          </button>
        </div>
      )}
    </section>
  );
}
