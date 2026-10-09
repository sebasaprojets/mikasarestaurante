"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { GoldGradient } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Traço de pincel que "pinta" o kanji: um zigue-zague largo, com bordas
 * irregulares (turbulência), é desenhado de cima para baixo e revela o glifo.
 */
const BRUSH = "M4 8 L96 4 L6 24 L96 20 L4 42 L96 38 L6 60 L96 56 L4 78 L96 74 L8 96 L96 94";

export function BrushKanji({
  char,
  className,
  delay = 0,
  duration = 2.4,
}: {
  char: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const gid = `g${uid}`;
  const mid = `m${uid}`;
  const fid = `f${uid}`;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("pointer-events-none select-none overflow-visible", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      <defs>
        <GoldGradient id={gid} />
        {/* bordas de cerdas: deforma o traço da máscara */}
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <mask id={mid} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <motion.path
            d={BRUSH}
            fill="none"
            stroke="#fff"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${fid})`}
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration, delay, ease: [0.45, 0.05, 0.25, 1] } } }}
          />
        </mask>
      </defs>
      <g mask={`url(#${mid})`}>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="88"
          fill={`url(#${gid})`}
          style={{ fontFamily: "var(--font-shippori), 'Shippori Mincho', serif" }}
        >
          {char}
        </text>
      </g>
      {/* gota de tinta: leve brilho ao terminar */}
      <motion.circle
        cx="50"
        cy="54"
        r="46"
        fill={`url(#${gid})`}
        variants={{ hidden: { opacity: 0 }, show: { opacity: [0, 0.08, 0], transition: { duration: 1.6, delay: delay + duration * 0.85 } } }}
        style={{ filter: "blur(18px)" }}
      />
    </motion.svg>
  );
}
