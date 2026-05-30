"use client";

import { useStiloStore } from "@/store/useStiloStore";
import { useEffect, useState } from "react";

/** Wait for Zustand persist to load from localStorage before routing. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useStiloStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useStiloStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
