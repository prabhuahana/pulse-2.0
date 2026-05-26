"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Play, Square } from "lucide-react";

interface PanicModeActivatorProps {
  isActive: boolean;
  onActivate: (durationMinutes: number) => void;
  onDeactivate: () => void;
  defaultDuration?: number;
}

const durationPresets = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "8 hours", value: 480 },
];

export function PanicModeActivator({
  isActive,
  onActivate,
  onDeactivate,
  defaultDuration = 30,
}: PanicModeActivatorProps) {
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);

  const handleActivate = () => {
    onActivate(selectedDuration);
    setShowDurationPicker(false);
  };

  return (
    <div className="space-y-4">
      {isActive ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDeactivate}
          className="w-full px-6 py-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Square className="w-5 h-5" />
          Stop Panic Mode
        </motion.button>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDurationPicker(!showDurationPicker)}
            className="w-full px-6 py-4 rounded-lg bg-[var(--accent)] hover:opacity-90 text-[var(--bg)] font-semibold flex items-center justify-center gap-2 transition-opacity"
          >
            <AlertTriangle className="w-5 h-5" />
            Activate Panic Mode
          </motion.button>

          <AnimatePresence>
            {showDurationPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              >
                <p className="text-sm font-medium text-[var(--text)]">
                  Select Duration
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {durationPresets.map((preset) => (
                    <motion.button
                      key={preset.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDuration(preset.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        selectedDuration === preset.value
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                          : "border-[var(--border)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleActivate}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start {selectedDuration < 60 ? `${selectedDuration}m` : `${selectedDuration / 60}h`} Session
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Safety Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      >
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Panic Mode will help you focus by blocking distractions. Your safety contacts can approve early exit if needed.
        </p>
      </motion.div>
    </div>
  );
}
