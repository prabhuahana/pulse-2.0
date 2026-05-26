"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { usePanicStore } from "@/store/usePanicStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/onboarding"];

export function PanicModeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const panicHydrated = usePanicStore((s) => s.hydrated);
  const isActive = usePanicStore((s) => s.isActive);
  const isAllowedPath = usePanicStore((s) => s.isAllowedPath);
  const tickTimer = usePanicStore((s) => s.tickTimer);

  useEffect(() => {
    usePanicStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hydrated || !panicHydrated) return;
    if (!isActive) return;
    if (PUBLIC_PATHS.includes(pathname)) return;
    if (!isAllowedPath(pathname)) {
      router.replace("/panic/active");
    }
  }, [
    hydrated,
    panicHydrated,
    isActive,
    pathname,
    router,
    isAllowedPath,
  ]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [isActive, tickTimer]);

  useEffect(() => {
    if (!isActive) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Panic Mode is active. Stay on this page to complete your safety tasks.";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActive]);

  return <>{children}</>;
}
