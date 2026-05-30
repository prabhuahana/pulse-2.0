"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useStiloStore } from "@/store/useStiloStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboardingDone = useStiloStore((s) => s.onboardingDone);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(onboardingDone ? "/home" : "/onboarding");
  }, [hydrated, onboardingDone, router]);

  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
