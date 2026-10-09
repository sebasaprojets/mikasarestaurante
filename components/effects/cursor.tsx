"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useFinePointer } from "@/lib/hooks/use-media-query";
import { EASE, useReducedMotion } from "@/lib/motion";

/**
 * Cursor extremamente sutil (somente desktop com mouse):
 * um anel dourado aparece sobre elementos com `data-cursor="Texto"`.
 * O cursor nativo é preservado.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 260, damping: 32, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 32, mass: 0.6 });
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(el ? el.getAttribute("data-cursor") : null);
    };
    const leave = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
    >
      <AnimatePresence>
        {label ? (
          <motion.div
            key="ring"
            className="-translate-x-1/2 -translate-y-1/2 grid size-24 place-items-center rounded-full border border-ouro/70 bg-sumi/25 backdrop-blur-[2px]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-ouro-claro">{label}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
