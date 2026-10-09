"use client";

import { useId, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { GoldGradient } from "@/components/brand/logo";
import { LETTERS, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-paths";

function Letter({ d, i, progress }: { d: string; i: number; progress: MotionValue<number> }) {
  // cada letra entra numa janela própria do progresso → revelação letra a letra
  const start = i * 0.09;
  const end = start + 0.45;
  const y = useTransform(progress, [start, end], [WORDMARK_H * 1.05, 0], { clamp: true });
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1], { clamp: true });
  return <motion.path d={d} style={{ y, opacity }} />;
}

/**
 * MIKASA gigante no fim do rodapé: as letras sobem de trás de uma linha de base
 * conforme a pessoa rola até o fim da página.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const gid = useId();
  const clipId = useId();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const line = useTransform(scrollYProgress, [0, 0.5], [0, 1], { clamp: true });

  return (
    <div ref={ref} aria-hidden className="relative mt-20 select-none">
      <svg viewBox={WORDMARK_VIEWBOX} className="block w-full overflow-visible">
        <defs>
          <GoldGradient id={gid} />
          <clipPath id={clipId}>
            <rect x={-20} y={-WORDMARK_H} width={WORDMARK_W + 40} height={WORDMARK_H * 2} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`} fill={`url(#${gid})`} fillRule="evenodd">
          {LETTERS.map((l, i) => (
            <Letter key={i} d={l.d} i={i} progress={scrollYProgress} />
          ))}
        </g>
      </svg>
      {/* linha de base vermelha que se estende do centro */}
      <motion.div className="mx-auto mt-6 h-px w-full origin-center bg-torii/70" style={{ scaleX: line }} />
    </div>
  );
}
