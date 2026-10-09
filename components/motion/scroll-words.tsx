"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}
    </motion.span>
  );
}

/** Manifesto revelado palavra por palavra conforme o scroll. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={cn(className)}>
      {/* texto para leitores de tela (sem aria-label, que não é permitido em <p>) */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <span key={i}>
              <Word progress={scrollYProgress} range={[start, end]}>
                {w}
              </Word>
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </p>
  );
}
