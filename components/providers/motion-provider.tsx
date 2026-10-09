"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { INTRO_EVENT } from "@/lib/hooks/use-intro-ready";
import { startPerfProbe } from "@/lib/perf";

/**
 * Animações sempre ativas (decisão do cliente), mesmo com "reduzir movimento".
 * Inicia a medição de fluidez (qualidade adaptativa) — depois da intro, se houver.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let stop = () => {};
    if (document.documentElement.hasAttribute("data-intro")) {
      const start = () => (stop = startPerfProbe(1500));
      window.addEventListener(INTRO_EVENT, start, { once: true });
      return () => {
        window.removeEventListener(INTRO_EVENT, start);
        stop();
      };
    }
    stop = startPerfProbe();
    return () => stop();
  }, []);
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
