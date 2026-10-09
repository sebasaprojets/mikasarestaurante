"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { EASE, useReducedMotion } from "@/lib/motion";

// Primeira carga: sem animação (não atrasa o LCP). Navegações seguintes: fade + y.
let navigated = false;

/** Transição entre páginas: fade + leve deslocamento vertical. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animateIn = navigated;
  useEffect(() => {
    navigated = true;
  }, []);
  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: reduce ? 0 : 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
