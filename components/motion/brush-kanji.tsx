"use client";

import { useId, useRef } from "react";
import { useInView } from "motion/react";
import { GoldGradient } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Traço de pincel que "pinta" o kanji: um zigue-zague largo é desenhado de cima
 * para baixo e revela o glifo. As cerdas são dois traços finos deslocados (antes
 * era um filtro de turbulência recalculado a cada quadro). A animação é uma
 * transição CSS de stroke-dashoffset disparada uma vez por `data-shown`.
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
  const rid = `r${uid}`;
  const ref = useRef<SVGSVGElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.5 });
  const timing = { ["--bd" as string]: `${duration}s`, ["--bdl" as string]: `${delay}s` };

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      aria-hidden
      data-shown={shown ? "" : undefined}
      className={cn("pointer-events-none select-none overflow-visible", className)}
      style={timing}
    >
      <defs>
        <GoldGradient id={gid} />
        <radialGradient id={rid}>
          <stop offset="0" stopColor="#e6cf96" stopOpacity="1" />
          <stop offset="1" stopColor="#e6cf96" stopOpacity="0" />
        </radialGradient>
        <mask id={mid} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
            <path className="mk-brush" d={BRUSH} pathLength={1} strokeWidth="22" />
            {/* cerdas: traços finos levemente fora do principal */}
            <path className="mk-brush mk-brush-late" d={BRUSH} pathLength={1} strokeWidth="5" transform="translate(-3 7)" opacity="0.85" />
            <path className="mk-brush mk-brush-late" d={BRUSH} pathLength={1} strokeWidth="4" transform="translate(4 -8)" opacity="0.7" />
          </g>
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
      {/* gota de tinta: leve brilho ao terminar (degradê radial, sem blur) */}
      <circle className="mk-ink" cx="50" cy="54" r="56" fill={`url(#${rid})`} />
    </svg>
  );
}
