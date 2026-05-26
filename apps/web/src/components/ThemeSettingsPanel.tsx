"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff, Copy, Check } from "lucide-react";
import { THEMES, PRESET_COLORS } from "@/lib/themes-enhanced";
import { HexColorPicker } from "./HexColorPicker";
import type { ThemeTokens } from "@/lib/themes-enhanced";
import type { ThemePreset } from "@/lib/core";

interface ThemeSettingsProps {
  currentTheme: ThemePreset | "custom";
  customColor?: string;
  isDarkMode: boolean;
  onThemeChange: (theme: ThemePreset | "custom", hex?: string) => void;
  onDarkModeToggle: (isDark: boolean) => void;
}

export function ThemeSettings({
  currentTheme,
  customColor = "#FF6B6B",
  isDarkMode,
  onThemeChange,
  onDarkModeToggle,
}: ThemeSettingsProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
          Theme Settings
        </h2>
        <p className="text-[var(--text-muted)]">
          Customize colors and appearance to match your style
        </p>
      </div>

      {/* Dark Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <label className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer hover:border-[var(--accent)] transition-colors"
        >
          <div>
            <p className="font-medium text-[var(--text)]">Dark Mode</p>
            <p className="text-sm text-[var(--text-muted)]">
              Use darker colors for the theme
            </p>
          </div>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={(e) => onDarkModeToggle(e.target.checked)}
            className="w-6 h-6 cursor-pointer accent-[var(--accent)]"
          />
        </label>
      </motion.div>

      {/* Preset Themes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Preset Themes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(THEMES) as Array<[ThemePreset, ThemeTokens]>).map(
            ([key, theme]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onThemeChange(key)}
                className={`p-4 rounded-lg border-2 transition-all space-y-2 ${
                  currentTheme === key
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-50"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
                style={{
                  background: theme.gradient,
                }}
              >
                <p
                  className="font-medium text-sm"
                  style={{ color: theme.text }}
                >
                  {theme.label}
                </p>
                {currentTheme === key && (
                  <p
                    className="text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    ✓ Selected
                  </p>
                )}
              </motion.button>
            )
          )}
        </div>
      </motion.div>

      {/* Custom Hex Color Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
      >
        <h3 className="text-lg font-semibold text-[var(--text)]">
          Custom Theme
        </h3>

        <HexColorPicker
          value={customColor}
          isDark={isDarkMode}
          onColorChange={(hex, theme) => {
            onThemeChange("custom", hex);
          }}
          label="Primary Color"
        />
      </motion.div>

      {/* Preview Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] font-medium transition-colors"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Preview
            </>
          )}
        </button>

        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 p-6 rounded-lg border-2 border-[var(--border)] overflow-hidden"
          >
            <h4 className="font-semibold text-[var(--text)]">
              Live Theme Preview
            </h4>

            {/* Sample Components */}
            <div className="space-y-3">
              {/* Gradient Background */}
              <div
                className="h-32 rounded-lg border border-[var(--border)]"
                style={{
                  background: `var(--gradient)`,
                }}
              />

              {/* Text Colors */}
              <div
                className="p-4 rounded-lg space-y-2"
                style={{
                  background: `var(--surface)`,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: `var(--text)` }}
                >
                  Primary Text
                </p>
                <p
                  className="text-sm"
                  style={{ color: `var(--text-muted)` }}
                >
                  Secondary/Muted Text
                </p>
              </div>

              {/* Button Variations */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  style={{
                    background: `var(--accent)`,
                    color: `var(--bg)`,
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                >
                  Primary
                </button>
                <button
                  style={{
                    color: `var(--accent)`,
                    borderColor: `var(--accent)`,
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-sm border-2 transition-opacity hover:opacity-70"
                >
                  Secondary
                </button>
              </div>

              {/* Input Field */}
              <input
                type="text"
                placeholder="Input example"
                style={{
                  background: `var(--surface)`,
                  color: `var(--text)`,
                  borderColor: `var(--border)`,
                }}
                className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none"
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = `var(--accent)`)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = `var(--border)`)
                }
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Accessibility Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2"
      >
        <p className="text-sm font-medium text-[var(--text)]">
          Accessibility Tips
        </p>
        <ul className="text-xs text-[var(--text-muted)] space-y-1 list-disc list-inside">
          <li>Custom colors automatically adjust for proper contrast</li>
          <li>Light and dark shades are generated automatically</li>
          <li>All themes support light and dark modes</li>
          <li>Settings are saved locally and to your account</li>
        </ul>
      </motion.div>
    </div>
  );
}
