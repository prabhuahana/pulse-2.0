"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  Trash2,
  Clock,
  Shield,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { SafetyContact } from "@/types/panic-mode";

interface PanicModeSettingsProps {
  isEnabled: boolean;
  durationMinutes: number;
  safetyContacts: SafetyContact[];
  blockedApps: string[];
  allowedApps: string[];
  recoveryScore: number;
  onSettingsChange: (settings: {
    duration?: number;
    safetyContacts?: SafetyContact[];
    blockedApps?: string[];
    allowedApps?: string[];
  }) => void;
}

export function PanicModeSettings({
  isEnabled,
  durationMinutes,
  safetyContacts,
  blockedApps,
  allowedApps,
  recoveryScore,
  onSettingsChange,
}: PanicModeSettingsProps) {
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });
  const [selectedDuration, setSelectedDuration] = useState(durationMinutes);

  const handleAddContact = () => {
    const email = newContact.email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (newContact.name && email && emailValid) {
      const contact: SafetyContact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone.trim() || undefined,
        email,
        createdAt: new Date().toISOString(),
      };

      onSettingsChange({
        safetyContacts: [...safetyContacts, contact],
      });

      setNewContact({ name: "", phone: "", email: "" });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = (id: string) => {
    onSettingsChange({
      safetyContacts: safetyContacts.filter((c) => c.id !== id),
    });
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    onSettingsChange({ duration });
  };

  const durationOptions = [5, 15, 30, 60, 120, 480]; // minutes

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
          Panic Mode Settings
        </h2>
        <p className="text-[var(--text-muted)]">
          Configure your safety system and focus recovery settings
        </p>
      </div>

      {/* Recovery Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Focus Recovery Score
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[var(--accent)]">
              {recoveryScore}
            </span>
            <span className="text-[var(--text-muted)] mb-1">/ 100</span>
          </div>
          <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ width: `${recoveryScore}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-[var(--accent)]"
            />
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Based on successful panic sessions and follow-through
          </p>
        </div>
      </motion.div>

      {/* Duration Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
          <Clock className="w-5 h-5" />
          Default Duration
        </label>

        <div className="grid grid-cols-3 gap-2">
          {durationOptions.map((duration) => {
            const label =
              duration < 60
                ? `${duration}m`
                : duration === 480
                  ? "8h"
                  : `${duration / 60}h`;
            return (
              <motion.button
                key={duration}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDurationChange(duration)}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  selectedDuration === duration
                    ? "border-[var(--accent)] bg-[var(--surface)]"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                <p
                  className={
                    selectedDuration === duration
                      ? "text-[var(--accent)]"
                      : "text-[var(--text)]"
                  }
                >
                  {label}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Safety Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-lg font-semibold text-[var(--text)]">
          <Shield className="w-5 h-5" />
          Safety Contacts
        </label>

        <p className="text-sm text-[var(--text-muted)]">
          Trusted people who receive an email with your exit code (email required)
        </p>

        {/* Contacts List */}
        <div className="space-y-2">
          {safetyContacts.length === 0 ? (
            <div className="p-4 text-center rounded-lg border-2 border-dashed border-[var(--border)]">
              <p className="text-[var(--text-muted)]">No safety contacts added yet</p>
            </div>
          ) : (
            safetyContacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              >
                <div>
                  <p className="font-medium text-[var(--text)]">{contact.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {contact.phone || contact.email}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Contact Form */}
        {!showAddContact ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddContact(true)}
            className="w-full p-3 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] text-[var(--text)] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Safety Contact
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-lg border border-[var(--accent)] bg-[var(--surface)] space-y-3 overflow-hidden"
          >
            <input
              type="text"
              placeholder="Contact name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Phone (optional, not used for exit codes)"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              <input
                type="email"
                placeholder="Email (required)"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddContact}
                disabled={
                  !newContact.name ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newContact.email.trim())
                }
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg)] font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAddContact(false);
                  setNewContact({ name: "", phone: "", email: "" });
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text)] font-medium text-sm hover:border-[var(--text)] transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Activity Logging Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2"
      >
        <div className="flex items-start gap-2">
          <Activity className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--text)]">Activity Tracking</p>
            <p className="text-xs text-[var(--text-muted)]">
              All Panic Mode sessions, unlock attempts, and safety contact approvals are logged for your security and reference.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 space-y-2"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              Important Safety Note
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
              Panic Mode is designed to help you focus, but does not replace professional mental health support. In crisis situations, always reach out to emergency services or a mental health professional.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
