"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Palette, AlertCircle } from "lucide-react";
import { normalizeHex, isValidHex, createThemeColor } from "@/lib/colors";
import { PRESET_COLORS, generateThemeFromColor } from "@/lib/themes-enhanced";
import type { ThemeTokens } from "@/lib/themes-enhanced";

interface HexColorPickerProps {
  value: string;
  onColorChange: (color: string, theme: ThemeTokens) => void;
  isDark?: boolean;
  label?: string;
}

export function HexColorPicker({
  value,
  onColorChange,
  isDark = false,
  label = "Theme Color",
}: HexColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [previewColor, setPreviewColor] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeTokens | null>(null);

  useEffect(() => {
    setInputValue(value);
    setPreviewColor(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    const normalized = normalizeHex(input);
    if (isValidHex(normalized)) {
      setPreviewColor(normalized);
      setIsValid(true);
      const theme = generateThemeFromColor(normalized, isDark);
      if (theme) {
        setPreviewTheme(theme);
      }
    } else {
      setIsValid(false);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    setPreviewColor(color);
    setIsValid(true);
    const theme = generateThemeFromColor(color, isDark);
    if (theme) {
      setPreviewTheme(theme);
      setShowPreview(true);
    }
  };

  const handleApply = () => {
    if (isValid && previewTheme) {
      onColorChange(previewColor, previewTheme);
      setShowPreview(false);
    }
  };

  const colorObj = createThemeColor(previewColor);
  const contrastWarning =
    colorObj && !colorObj.accessible
      ? "This color may have contrast issues"
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--text)]">
          <Palette className="w-4 h-4" />
          {label}
        </label>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="#FF6B6B"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 font-mono text-sm ${
                isValid
                  ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                  : "border-red-500 bg-red-50 text-red-900"
              } focus:outline-none focus:border-[var(--accent)]`}
            />
            {isValid && inputValue === previewColor && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-[var(--accent)] cursor-pointer"
                style={{ backgroundColor: previewColor }}
                onClick={() => setShowPreview(!showPreview)}
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            disabled={!isValid || !previewTheme}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              isValid && previewTheme
                ? "bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Apply
          </motion.button>
        </div>

        {!isValid && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Invalid hex color. Use format: #RRGGBB
          </p>
        )}

        {contrastWarning && (
          <p className="text-xs text-yellow-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {contrastWarning}
          </p>
        )}
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Presets
        </p>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePresetClick(color)}
              className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                previewColor.toUpperCase() === color
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
                  : "border-[var(--border)]"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Live Preview */}
      {showPreview && previewTheme && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        >
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Live Preview
          </p>

          <div className="space-y-2">
            {/* Background */}
            <div
              className="h-20 rounded-lg border border-[var(--border)]"
              style={{ background: previewTheme.gradient }}
            />

            {/* Buttons Preview */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: previewTheme.accent,
                  color: previewTheme.text,
                }}
              >
                Primary
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-lg font-medium text-sm border transition-all"
                style={{
                  borderColor: previewTheme.accent,
                  color: previewTheme.accent,
                }}
              >
                Secondary
              </button>
            </div>

            {/* Text Preview */}
            <div
              className="p-3 rounded-lg space-y-1"
              style={{ backgroundColor: previewTheme.surface }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: previewTheme.text }}
              >
                Main Text Color
              </p>
              <p
                className="text-xs"
                style={{ color: previewTheme.textMuted }}
              >
                Muted Text Color
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
