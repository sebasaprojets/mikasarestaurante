"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { EASE } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number; amount?: number };

/** Fade + leve deslocamento vertical ao entrar na viewport. */
export function Reveal({ delay = 0, y = 28, amount = 0.25, children, ...props }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduce ? 0.6 : 1.2, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
