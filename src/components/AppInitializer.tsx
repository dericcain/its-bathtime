"use client";

import { initializeAppState } from "@/lib/db";
import { useEffect } from "react";

export default function AppInitializer() {
  useEffect(() => {
    initializeAppState().catch(console.error);
  }, []);

  return null;
}
