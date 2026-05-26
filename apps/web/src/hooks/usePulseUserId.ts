"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pulseUserId";

export function usePulseUserId(): string {
  const [userId, setUserId] = useState("demo-user");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `user-${Date.now()}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    setUserId(id);
  }, []);

  return userId;
}
