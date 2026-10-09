"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/motion";

/** Desloca o conteúdo verticalmente durante o scroll. Desativado em reduced motion. */
export function Parallax({
  children,
  className,
  distance = 80,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute -inset-y-[var(--px)] inset-x-0" style={{ y: reduce ? 0 : y, ["--px" as string]: `${distance}px` }}>
        {children}
      </motion.div>
    </div>
  );
}
