"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Shield,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SafetyContact } from "@/types/panic-mode";
import { usePulseStore } from "@/store/usePulseStore";

type Step = "contacts" | "code";
type SendStatus = "idle" | "sending" | "sent" | "failed";

interface PanicUnlockFlowProps {
  contacts: SafetyContact[];
  sessionId: string;
  userId: string;
  userName: string;
  onUnlocked: () => void;
}

export function PanicUnlockFlow({
  contacts,
  sessionId,
  userId,
  userName,
  onUnlocked,
}: PanicUnlockFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contacts");
  const [selectedContact, setSelectedContact] = useState<SafetyContact | null>(
    null
  );
  const [unlockRequestId, setUnlockRequestId] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactsWithEmail = contacts.filter((c) => c.email?.trim());

  const handleSelectContact = async (contact: SafetyContact) => {
    if (!contact.email?.trim()) {
      setError("This contact needs an email address. Update them in Settings → Safety.");
      return;
    }

    setSelectedContact(contact);
    setSendStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/panic/send-exit-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          safetyContactId: contact.id,
          userId,
          userName,
          contactName: contact.name,
          contactEmail: contact.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send unlock code email");
      }

      setUnlockRequestId(data.unlockRequestId);
      setLastSentAt(data.lastSentAt);
      setSendStatus("sent");
      setStep("code");
    } catch (e) {
      setSendStatus("failed");
      setError(e instanceof Error ? e.message : "Failed to send email");
    }
  };

  const handleResend = async () => {
    if (!selectedContact) return;
    await handleSelectContact(selectedContact);
  };

  const handleVerifyCode = async () => {
    if (!unlockRequestId || code.length !== 6) return;

    setVerifyLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/panic-mode/verify-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unlockRequestId,
          code: code.trim(),
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      onUnlocked();
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (contactsWithEmail.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-[var(--accent)]" />
        <div>
          <h1 className="font-display text-2xl font-bold">No contacts with email</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Safety contacts need an email address to receive your Panic Mode exit
            code.
          </p>
        </div>
        <Link
          href="/settings"
          onClick={() => sessionStorage.setItem("settingsTab", "panic")}
          className="inline-block rounded-pulse-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--bg)]"
        >
          Add contact with email
        </Link>
        <Link href="/home" className="block text-sm text-[var(--text-muted)] underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/home"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-display text-2xl font-bold">Exit Panic Mode</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {step === "contacts"
            ? "Choose a safety contact. We will email them your unlock code."
            : `Enter the code emailed to ${selectedContact?.name}.`}
        </p>
      </header>

      {error && (
        <p
          className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </p>
      )}

      {step === "contacts" && (
        <ul className="space-y-2">
          {contactsWithEmail.map((contact) => (
            <motion.li key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                type="button"
                disabled={sendStatus === "sending"}
                onClick={() => handleSelectContact(contact)}
                className="flex w-full items-center justify-between rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition hover:border-[var(--accent)] disabled:opacity-50"
              >
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </p>
                </div>
                {sendStatus === "sending" &&
                selectedContact?.id === contact.id ? (
                  <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[var(--accent)]">
                    Email code
                  </span>
                )}
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {step === "code" && selectedContact && (
        <div className="space-y-4">
          <div className="rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            {sendStatus === "sent" && (
              <p className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Code emailed to {selectedContact.email}
              </p>
            )}
            {sendStatus === "failed" && (
              <p className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                Email failed to send
              </p>
            )}
            {lastSentAt && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Sent at {new Date(lastSentAt).toLocaleString()}
              </p>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Enter 6-digit code from email</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] focus:border-[var(--accent)] focus:outline-none"
            />
          </label>

          <button
            type="button"
            disabled={verifyLoading || code.length !== 6}
            onClick={handleVerifyCode}
            className="w-full rounded-pulse-lg bg-[var(--accent)] py-3 font-medium text-[var(--bg)] disabled:opacity-50"
          >
            {verifyLoading ? "Verifying…" : "Unlock Panic Mode"}
          </button>

          <button
            type="button"
            disabled={sendStatus === "sending"}
            onClick={() => void handleResend()}
            className="w-full text-sm text-[var(--accent)] underline disabled:opacity-50"
          >
            Resend email
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("contacts");
              setCode("");
              setUnlockRequestId(null);
              setSendStatus("idle");
              setLastSentAt(null);
              setError(null);
            }}
            className="w-full text-sm text-[var(--text-muted)] underline"
          >
            Choose a different contact
          </button>
        </div>
      )}
    </div>
  );
}
