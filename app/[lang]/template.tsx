"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Emblem } from "@/components/brand/logo";
import { EASE, useReducedMotion } from "@/lib/motion";

// Primeira carga: sem transição (a intro cuida da entrada). Navegações internas: noren.
let navigated = false;

const OPEN = [0.76, 0, 0.24, 1] as const;

/** Uma metade do noren: tecido escuro com a metade do emblema na emenda. */
function Panel({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <motion.div
      className="absolute inset-y-0 w-1/2 overflow-hidden bg-[#0d0b0b] mk-washi"
      style={{ [left ? "left" : "right"]: 0 }}
      initial={{ x: "0%" }}
      animate={{ x: left ? "-101%" : "101%" }}
      transition={{ duration: 1.25, ease: OPEN, delay: 0.35 }}
    >
      {/* barra superior do noren */}
      <div className="absolute inset-x-0 top-0 h-[7vh] border-b border-line bg-sumi" />
      {/* vincos verticais do tecido */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(25% - 1px), rgba(0,0,0,0.45) calc(25% - 1px) 25%)" }}
      />
      {/* metade do emblema (o outro lado está no outro painel) */}
      <div
        className="absolute top-1/2 w-[clamp(140px,16vw,220px)]"
        style={left ? { right: 0, transform: "translate(50%, -50%)" } : { left: 0, transform: "translate(-50%, -50%)" }}
      >
        <Emblem className="w-full opacity-80" />
      </div>
      {/* fio dourado na emenda */}
      <div className={`absolute inset-y-0 ${left ? "right-0" : "left-0"} w-px bg-ouro/40`} />
    </motion.div>
  );
}

/** Transição entre páginas: noren (duas cortinas) se abrindo do centro + conteúdo subindo levemente. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animateIn = navigated;
  const [curtain, setCurtain] = useState(animateIn);

  useEffect(() => {
    navigated = true;
    if (!animateIn) return;
    const t = window.setTimeout(() => setCurtain(false), 1700);
    return () => window.clearTimeout(t);
  }, [animateIn]);

  return (
    <>
      {curtain ? (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
          <Panel side="left" />
          <Panel side="right" />
        </div>
      ) : null}
      <motion.div
        initial={animateIn ? { opacity: 0, y: reduce ? 0 : 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: animateIn ? 0.45 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
