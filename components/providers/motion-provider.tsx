"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { isLowEndDevice } from "@/lib/device";
import { INTRO_EVENT } from "@/lib/hooks/use-intro-ready";
import { startPerfProbe } from "@/lib/perf";

/**
 * Animações sempre ativas (decisão do cliente), mesmo com "reduzir movimento".
 * Qualidade adaptativa:
 *  - aparelho modesto → modo leve já no carregamento. Com intro, isso acontece por
 *    baixo dela; antes era ligado no quadro em que a intro começava a sair, e o
 *    `data-perf` no <html> recalculava o estilo da página inteira bem ali (tranco).
 *  - demais → mede a fluidez depois da intro, se houver (2,6s após o início da
 *    saída: mede o site já estável, não a própria transição).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let stop = () => {};
    if (document.documentElement.hasAttribute("data-intro") && !isLowEndDevice()) {
      const start = () => (stop = startPerfProbe(2600));
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
