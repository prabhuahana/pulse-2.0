"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/lib/themes";
import { usePulseStore } from "@/store/usePulseStore";
import type { ThemePreset } from "@/lib/core";
import { Calendar, ChevronRight, RotateCcw, Palette, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ThemeSettings } from "@/components/ThemeSettingsPanel";
import { PanicModeSettings } from "@/components/PanicModeSettings";
import { generateThemeFromColor } from "@/lib/themes-enhanced";
import { useAccessibility } from "@/components/AccessibilityProvider";

export default function SettingsPage() {
  const theme = usePulseStore((s) => s.theme);
  const setTheme = usePulseStore((s) => s.setTheme);
  const {
    fontMode,
    highContrast,
    reducedMotion,
    setFontMode,
    setHighContrast,
    setReducedMotion,
  } = useAccessibility();
  const dyslexiaFont = fontMode === "dyslexia";
  const resetDemoData = usePulseStore((s) => s.resetDemoData);
  const panicMode = usePulseStore((s) => s.panicMode);
  const safetyContacts = usePulseStore((s) => s.safetyContacts);
  const panicDurationMinutes = usePulseStore((s) => s.panicDurationMinutes);
  const setSafetyContacts = usePulseStore((s) => s.setSafetyContacts);
  const setPanicDurationMinutes = usePulseStore((s) => s.setPanicDurationMinutes);

  const [activeTab, setActiveTab] = useState("basic");
  const [customThemeColor, setCustomThemeColor] = useState(
    localStorage.getItem("customThemeColor") || "#FF6B6B"
  );
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("customThemeDarkMode") === "true"
  );

  useEffect(() => {
    const tab = sessionStorage.getItem("settingsTab");
    if (tab === "panic") {
      setActiveTab("panic");
      sessionStorage.removeItem("settingsTab");
    }
  }, []);

  const handleThemeChange = (selectedTheme: ThemePreset | "custom", hex?: string) => {
    if (selectedTheme === "custom" && hex) {
      setCustomThemeColor(hex);
      const themeTokens = generateThemeFromColor(hex, isDarkMode);
      if (themeTokens) {
        localStorage.setItem("customThemeColor", hex);
      }
    } else if (selectedTheme !== "custom") {
      setTheme(selectedTheme);
      localStorage.removeItem("customThemeColor");
    }
  };

  const handleDarkModeToggle = (isDark: boolean) => {
    setIsDarkMode(isDark);
    localStorage.setItem("customThemeDarkMode", isDark.toString());
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Make Pulse yours</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 gap-2 mb-8 border border-[var(--border)] rounded-lg p-1 bg-[var(--surface)]">
          <TabsTrigger
            value="basic"
            className="rounded-md px-3 py-2 text-sm font-medium transition-colors data-[state=active]:bg-[var(--bg)]"
          >
            Basic
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors data-[state=active]:bg-[var(--bg)]"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Themes</span>
          </TabsTrigger>
          <TabsTrigger
            value="panic"
            className="flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors data-[state=active]:bg-[var(--bg)]"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic" className="space-y-8">
          <section>
            <Link
              href="/settings/calendar"
              className="flex items-center justify-between rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-medium">Calendar accounts</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Google, Outlook & Apple
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </Link>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Quick Theme
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemePreset[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`rounded-pulse-lg border-2 px-3 py-3 text-sm font-medium transition ${
                    theme === id ? "border-[var(--accent)]" : "border-[var(--border)]"
                  }`}
                >
                  {THEMES[id].label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Accessibility
            </h2>
            <Toggle
              label="Dyslexia-friendly font"
              checked={dyslexiaFont}
              onChange={(v) => setFontMode(v ? "dyslexia" : "standard")}
            />
            <Toggle
              label="High contrast"
              checked={highContrast}
              onChange={setHighContrast}
            />
            <Toggle
              label="Reduce motion"
              checked={reducedMotion}
              onChange={setReducedMotion}
            />
          </section>

          <section>
            <button
              type="button"
              onClick={resetDemoData}
              className="flex w-full items-center justify-center gap-2 rounded-pulse-lg border border-[var(--border)] py-3 text-sm text-[var(--text-muted)]"
            >
              <RotateCcw size={16} /> Reset demo tasks
            </button>
          </section>

          <p className="text-center text-xs text-[var(--text-muted)]">
            Pulse v0.1 · Local-first demo
          </p>
        </TabsContent>

        {/* Theme Settings Tab */}
        <TabsContent value="theme" className="animate-fade-up">
          <ThemeSettings
            currentTheme={theme}
            customColor={customThemeColor}
            isDarkMode={isDarkMode}
            onThemeChange={handleThemeChange}
            onDarkModeToggle={handleDarkModeToggle}
          />
        </TabsContent>

        {/* Panic Mode Tab */}
        <TabsContent value="panic" className="animate-fade-up">
          <PanicModeSettings
            isEnabled={panicMode}
            durationMinutes={panicDurationMinutes}
            safetyContacts={safetyContacts}
            blockedApps={[
              "Instagram",
              "TikTok",
              "Twitter",
              "Reddit",
              "YouTube",
            ]}
            allowedApps={["Messages", "Phone", "Maps", "Banking"]}
            recoveryScore={72}
            onSettingsChange={(settings) => {
              if (settings.safetyContacts !== undefined) {
                setSafetyContacts(settings.safetyContacts);
              }
              if (settings.duration !== undefined) {
                setPanicDurationMinutes(settings.duration);
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-pulse-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(event) => {
          event.preventDefault();
          onChange(!checked);
        }}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
