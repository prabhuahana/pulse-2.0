"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import type { PanicTask } from "@/types/panic-session";
import { usePanicStore } from "@/store/usePanicStore";

interface PanicImageTaskProps {
  task: PanicTask;
  sessionId: string;
}

export function PanicImageTask({ task, sessionId }: PanicImageTaskProps) {
  const consentUpload = usePanicStore((s) => s.consentUpload);
  const setConsentUpload = usePanicStore((s) => s.setConsentUpload);
  const applyVerification = usePanicStore((s) => s.applyVerification);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verifyFile(file: File) {
    if (!consentUpload) {
      setError("Please consent to temporary image upload first.");
      return;
    }

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("image", file);
    form.append("sessionId", sessionId);
    form.append("taskId", task.id);
    form.append("taskTitle", task.title);
    form.append("visionPrompt", task.visionPrompt ?? task.description);

    try {
      const res = await fetch("/api/panic/verify-task", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      applyVerification(task.id, {
        verified: data.verified,
        uncertain: data.uncertain,
        failed: data.failed,
        confidence: data.confidence,
        message: data.message,
      });

      if (!data.verified) {
        setError(data.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    void verifyFile(file);
  }

  const verified = task.status === "verified";

  return (
    <div className="space-y-4 rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h3 className="font-semibold">{task.title}</h3>
        <p className="text-sm text-[var(--text-muted)]">{task.description}</p>
      </div>

      {!verified && (
        <label className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={consentUpload}
            onChange={(e) => setConsentUpload(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I consent to uploading a photo for AI verification. Images are analyzed
            server-side and deleted immediately afterward. They are not stored
            permanently.
          </span>
        </label>
      )}

      {task.feedback && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            verified
              ? "bg-green-500/10 text-green-800"
              : task.status === "uncertain"
                ? "bg-amber-500/10 text-amber-900"
                : "bg-red-500/10 text-red-700"
          }`}
          role="status"
        >
          {task.feedback}
          {task.confidence != null && (
            <span className="block text-xs opacity-80">
              Confidence: {Math.round(task.confidence * 100)}%
            </span>
          )}
        </p>
      )}

      {!verified && (
        <>
          {preview && (
            <img
              src={preview}
              alt="Upload preview"
              className="max-h-48 w-full rounded-lg object-cover"
            />
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || !consentUpload}
              onClick={() => inputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-pulse-lg bg-[var(--accent)] py-3 text-sm font-medium text-[var(--bg)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing image…
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Take photo
                </>
              )}
            </button>
            <button
              type="button"
              disabled={loading || !consentUpload}
              onClick={() => {
                const el = inputRef.current;
                if (el) {
                  el.removeAttribute("capture");
                  el.click();
                  el.setAttribute("capture", "environment");
                }
              }}
              className="flex items-center justify-center gap-2 rounded-pulse-lg border border-[var(--border)] px-4 py-3 text-sm"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {verified && (
        <p className="text-sm font-medium text-green-700">Task verified</p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
