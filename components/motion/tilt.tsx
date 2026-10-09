"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useFinePointer } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

/** Tilt 3D leve (máx. 6°) com reflexo de vidro sutil. Somente desktop. */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const cfg = { stiffness: 140, damping: 22, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), cfg);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), cfg);
  const glareX = useTransform(px, [0, 1], ["20%", "80%"]);
  const glare = useTransform(glareX, (gx) => `radial-gradient(60% 50% at ${gx} 0%, rgba(230,207,150,0.14), transparent 70%)`);

  const active = fine && !reduce;

  return (
    <div className={cn("[perspective:1200px]", className)}>
      <motion.div
        ref={ref}
        className="relative size-full [transform-style:preserve-3d]"
        style={active ? { rotateX: rx, rotateY: ry } : undefined}
        onPointerMove={(e) => {
          if (!active || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
      >
        {children}
        {active ? <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} /> : null}
      </motion.div>
    </div>
  );
}
