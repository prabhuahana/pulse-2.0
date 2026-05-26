import type { ThemePreset } from "@/lib/core";

export interface ThemeTokens {
  id: ThemePreset;
  label: string;
  bg: string;
  surface: string;
  surfaceSolid: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentGlow: string;
  gradient: string;
}

export const THEMES: Record<ThemePreset, ThemeTokens> = {
  burgundy: {
    id: "burgundy",
    label: "Burgundy",
    bg: "#2b121f",
    surface: "rgba(74, 29, 50, 0.82)",
    surfaceSolid: "#37172a",
    text: "#f7e6ec",
    textMuted: "#d8c3d2",
    border: "rgba(255,255,255,0.12)",
    accent: "#d48ca2",
    accentGlow: "rgba(212,140,162,0.32)",
    gradient: "linear-gradient(135deg, #2b121f 0%, #6c2540 50%, #d48ca2 100%)",
  },
  rose: {
    id: "rose",
    label: "Rose",
    bg: "#fff2f4",
    surface: "rgba(255, 244, 246, 0.86)",
    surfaceSolid: "#fff8fb",
    text: "#3e1f2c",
    textMuted: "#8c6673",
    border: "rgba(196,100,134,0.18)",
    accent: "#c76a8d",
    accentGlow: "rgba(199,106,141,0.28)",
    gradient: "linear-gradient(135deg, #fff2f4 0%, #f5d9df 50%, #f1e5e8 100%)",
  },
  sage: {
    id: "sage",
    label: "Sage",
    bg: "#ecf2e9",
    surface: "rgba(247, 250, 244, 0.9)",
    surfaceSolid: "#f4f7ef",
    text: "#2f3c33",
    textMuted: "#687566",
    border: "rgba(96, 122, 97, 0.18)",
    accent: "#7b9a7f",
    accentGlow: "rgba(123,154,127,0.3)",
    gradient: "linear-gradient(135deg, #ecf2e9 0%, #d7e1d4 50%, #f5f7ef 100%)",
  },
  beige: {
    id: "beige",
    label: "Beige",
    bg: "#f4ebe1",
    surface: "rgba(255, 251, 246, 0.9)",
    surfaceSolid: "#fbf5ee",
    text: "#4a3d33",
    textMuted: "#8a7b6c",
    border: "rgba(81, 63, 47, 0.16)",
    accent: "#b98b5d",
    accentGlow: "rgba(185,139,93,0.25)",
    gradient: "linear-gradient(135deg, #f4ebe1 0%, #e6d7c2 50%, #faf3e7 100%)",
  },
  noir: {
    id: "noir",
    label: "Noir",
    bg: "#08090c",
    surface: "rgba(20, 20, 24, 0.86)",
    surfaceSolid: "#121217",
    text: "#f4f5f7",
    textMuted: "#a7a8b2",
    border: "rgba(255,255,255,0.08)",
    accent: "#ffffff",
    accentGlow: "rgba(255,255,255,0.24)",
    gradient: "linear-gradient(135deg, #08090c 0%, #1b1d24 50%, #111214 100%)",
  },
  alabaster: {
    id: "alabaster",
    label: "Alabaster",
    bg: "#fbfaf7",
    surface: "rgba(255, 255, 255, 0.86)",
    surfaceSolid: "#ffffff",
    text: "#1f1b17",
    textMuted: "#7b7368",
    border: "rgba(0,0,0,0.08)",
    accent: "#b29875",
    accentGlow: "rgba(178,152,117,0.24)",
    gradient: "linear-gradient(135deg, #fbfaf7 0%, #f2ede4 50%, #ffffff 100%)",
  },
};

export const COLOR_STYLES = {
  red: { bar: "#e85d5d", bg: "rgba(232,93,93,0.12)" },
  orange: { bar: "#f0a060", bg: "rgba(240,160,96,0.12)" },
  yellow: { bar: "#e8c547", bg: "rgba(232,197,71,0.12)" },
  green: { bar: "#5dbf8a", bg: "rgba(93,191,138,0.12)" },
  blue: { bar: "#5b9fd4", bg: "rgba(91,159,212,0.12)" },
  purple: { bar: "#9b7ed9", bg: "rgba(155,126,217,0.12)" },
} as const;
