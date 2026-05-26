"use client";

import { BottomNav } from "@/components/BottomNav";
import { PanicModeGuard } from "@/components/panic/PanicModeGuard";
import { useHydrated } from "@/hooks/useHydrated";
import { usePanicStore } from "@/store/usePanicStore";
import { usePulseStore } from "@/store/usePulseStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/onboarding"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const onboardingDone = usePulseStore((s) => s.onboardingDone);
  const panicActive = usePanicStore((s) => s.isActive);
  const showNav =
    !PUBLIC_PATHS.includes(pathname) && !pathname.startsWith("/panic/");

  useEffect(() => {
    if (!hydrated) return;
    if (!onboardingDone && pathname !== "/onboarding") {
      router.replace("/onboarding");
    } else if (onboardingDone && pathname === "/onboarding") {
      router.replace("/home");
    }
  }, [hydrated, onboardingDone, pathname, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <PanicModeGuard>
      <div className="pulse-mesh" aria-hidden />
      <main
        className={`mx-auto min-h-dvh max-w-lg px-4 pt-6 ${
          showNav ? "pb-28" : "pb-6"
        }`}
      >
        {children}
      </main>
      {showNav && onboardingDone && !panicActive && <BottomNav />}
    </PanicModeGuard>
  );
}
