"use client";

import { usePulseStore } from "@/store/usePulseStore";
import { useEffect, useState } from "react";

/** Wait for Zustand persist to load from localStorage before routing. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = usePulseStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(usePulseStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
