"use client";

import type { ReactNode } from "react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme();
  return <>{children}</>;
}
