"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePulseStore } from "@/store/usePulseStore";
import { useHydrated } from "@/hooks/useHydrated";

export type FontMode = "standard" | "dyslexia";

interface AccessibilityContextValue {
  hydrated: boolean;
  fontMode: FontMode;
  highContrast: boolean;
  reducedMotion: boolean;
  setFontMode: (mode: FontMode) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const dyslexiaFont = usePulseStore((s) => s.dyslexiaFont);
  const highContrast = usePulseStore((s) => s.highContrast);
  const reducedMotion = usePulseStore((s) => s.reducedMotion);
  const setAccessibility = usePulseStore((s) => s.setAccessibility);

  const fontMode: FontMode = dyslexiaFont ? "dyslexia" : "standard";

  const applyToDocument = useCallback(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.fontMode = fontMode;
    root.dataset.dyslexia = dyslexiaFont ? "true" : "false";
    root.dataset.highContrast = highContrast ? "true" : "false";
    root.dataset.reducedMotion = reducedMotion ? "true" : "false";
  }, [fontMode, dyslexiaFont, highContrast, reducedMotion]);

  useEffect(() => {
    if (!hydrated) return;
    applyToDocument();
  }, [hydrated, applyToDocument]);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      hydrated,
      fontMode,
      highContrast,
      reducedMotion,
      setFontMode: (mode) => setAccessibility({ dyslexiaFont: mode === "dyslexia" }),
      setHighContrast: (enabled) => setAccessibility({ highContrast: enabled }),
      setReducedMotion: (enabled) => setAccessibility({ reducedMotion: enabled }),
    }),
    [
      hydrated,
      fontMode,
      highContrast,
      reducedMotion,
      setAccessibility,
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return ctx;
}
