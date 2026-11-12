"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { NorenPanel } from "@/components/layout/noren";
import { EASE, useReducedMotion } from "@/lib/motion";

// Primeira carga: sem transição (a intro cuida da entrada). Navegações internas: noren.
let navigated = false;

/**
 * Transição entre páginas: noren (duas cortinas) se abrindo do centro + conteúdo subindo levemente.
 * Num clique interno quem conduz é o NorenNav (layout): fecha por cima da página anterior e
 * abre sobre a nova. Este noren fica para voltar/avançar do navegador (aparece fechado e abre).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animateIn = navigated;
  const [curtain, setCurtain] = useState(animateIn);
  const hold = 0.35;

  useEffect(() => {
    navigated = true;
    if (!animateIn) return;
    const t = window.setTimeout(() => setCurtain(false), (hold + 1.35) * 1000);
    return () => window.clearTimeout(t);
  }, [animateIn]);

  return (
    <>
      {curtain ? (
        // escondido enquanto o NorenNav conduz a troca (ver html[data-noren] no globals.css)
        <div aria-hidden className="mk-noren-template pointer-events-none fixed inset-0 z-[95]">
          <NorenPanel side="left" mode="open" delay={hold} />
          <NorenPanel side="right" mode="open" delay={hold} />
        </div>
      ) : null}
      <motion.div
        initial={animateIn ? { opacity: 0, y: reduce ? 0 : 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: animateIn ? hold + 0.1 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
