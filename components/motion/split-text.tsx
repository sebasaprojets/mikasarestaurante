"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Quando `false`, aguarda (ex.: preloader). */
  play?: boolean;
  delay?: number;
  stagger?: number;
  /** Anima ao entrar na viewport em vez de imediatamente. */
  inView?: boolean;
  /** Mostra sem animação (ex.: hero já revelado por baixo da intro). */
  instant?: boolean;
};

/**
 * Revela palavra a palavra: sobe e aparece, lento e contido.
 * Transição CSS por palavra (opacity/transform, na GPU) com atraso escalonado;
 * o JS só marca `data-shown` — sem desfoque animado nem estilo por quadro.
 */
export function SplitText({
  text,
  as = "h2",
  className,
  play = true,
  delay = 0,
  stagger = 0.07,
  inView = false,
  instant = false,
}: Props) {
  const Tag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const shown = inView ? seen : play;
  const lines = text.split("\n");
  let i = 0;

  return (
    <Tag
      ref={ref}
      data-shown={shown ? "" : undefined}
      data-instant={instant ? "" : undefined}
      className={cn(className)}
      style={{ ["--sd" as string]: `${delay}s`, ["--ss" as string]: `${stagger}s` }}
    >
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((w, wi, arr) => (
            <span key={wi} className="inline-block whitespace-pre">
              <span className="mk-split-word inline-block" style={{ ["--i" as string]: i++ }}>
                {w}
              </span>
              {wi < arr.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
