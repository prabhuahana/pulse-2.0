"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePanicStore } from "@/store/usePanicStore";

/** Legacy route — redirects to active panic session */
export default function PanicUnlockPage() {
  const router = useRouter();
  const isActive = usePanicStore((s) => s.isActive);
  const hydrated = usePanicStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isActive ? "/panic/active" : "/home");
  }, [hydrated, isActive, router]);

  return null;
}
