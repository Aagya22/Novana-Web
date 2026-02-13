"use client";

import { useEffect } from "react";
import { setupGlobalToast } from "@/lib/toast";

export function SetupGlobalToast() {
  useEffect(() => {
    setupGlobalToast();
  }, []);

  return null;
}