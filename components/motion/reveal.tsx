"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number; amount?: number };

/**
 * Fade + leve deslocamento vertical ao entrar na viewport.
 * A animação é uma transição CSS (opacity/transform, na GPU): o JS só marca
 * `data-shown` uma vez — nada é recalculado por quadro durante a rolagem.
 */
export function Reveal({ delay = 0, y = 28, amount = 0.25, className, style, children, ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount });
  return (
    <div
      ref={ref}
      data-shown={shown ? "" : undefined}
      className={cn("mk-reveal", className)}
      style={{ ...style, ["--ry" as string]: `${y}px`, ["--rd" as string]: `${delay}s` }}
      {...props}
    >
      {children}
    </div>
  );
}
