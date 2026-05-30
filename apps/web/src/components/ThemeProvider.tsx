"use client";

import { THEMES } from "@/lib/themes";
import { useAccessibility } from "@/components/AccessibilityProvider";
import { useStiloStore } from "@/store/useStiloStore";
import { useEffect } from "react";
import type { ThemeTokens } from "@/lib/themes-enhanced";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStiloStore((s) => s.theme);
  const customTheme = useStiloStore((s) => s.customTheme);
  const { highContrast, reducedMotion } = useAccessibility();
  const tokens: ThemeTokens =
    theme === "custom" && customTheme
      ? customTheme
      : (THEMES[theme as keyof typeof THEMES] ?? THEMES.beige);
    
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg", tokens.bg);
    root.style.setProperty("--surface", tokens.surface);
    root.style.setProperty("--surface-solid", tokens.surfaceSolid);
    root.style.setProperty("--text", tokens.text);
    root.style.setProperty("--text-muted", tokens.textMuted);
    root.style.setProperty("--border", tokens.border);
    root.style.setProperty("--accent", tokens.accent);
    root.style.setProperty("--accent-glow", tokens.accentGlow);
    root.style.setProperty("--gradient", tokens.gradient);
    root.dataset.theme = theme;
    root.dataset.reducedMotion = reducedMotion ? "true" : "false";
  }, [theme, tokens, reducedMotion]);

  return (
    <div
      className={`min-h-dvh bg-[var(--bg)] text-[var(--text)] transition-colors duration-500 ${
        highContrast ? "contrast-more" : ""
      }`}
    >
      {children}
    </div>
  );
}
