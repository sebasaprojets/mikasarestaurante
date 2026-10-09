"use client";

import { MotionConfig } from "motion/react";

/** Animações sempre ativas (decisão do cliente), mesmo com "reduzir movimento" no sistema. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
