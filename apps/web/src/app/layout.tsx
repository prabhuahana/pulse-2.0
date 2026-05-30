import { AccessibilityInitScript } from "@/components/AccessibilityInitScript";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { AlarmProvider } from "@/components/alarms/AlarmProvider";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "open-dyslexic/open-dyslexic-regular.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stilo — Calm productivity",
  description:
    "Organise tasks, deadlines, and focus time with intelligent, calming automation.",
  appleWebApp: { capable: true, title: "Stilo" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <AccessibilityInitScript />
      </head>
      <body className="font-sans antialiased">
        <AccessibilityProvider>
          <ThemeProvider>
            <AlarmProvider>
              <AppShell>{children}</AppShell>
            </AlarmProvider>
          </ThemeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
