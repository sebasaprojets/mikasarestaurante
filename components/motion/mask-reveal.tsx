"use client";

import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Revelação com traço de pincel sumi: a foto surge atrás de uma pincelada que varre
 * da esquerda para a direita (borda com cerdas — `.mk-brush-reveal` no globals.css)
 * e assenta com leve zoom-out. Animação CSS disparada uma vez; ao terminar a máscara
 * é removida (`data-done`). O wrapper externo (sem recorte) é quem observa a viewport.
 */
export function MaskReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.2 });
  const [done, setDone] = useState(false);
  return (
    <div ref={ref} className={className} data-shown={shown ? "" : undefined}>
      <div
        className={cn("mk-brush-reveal size-full overflow-hidden")}
        data-done={done ? "" : undefined}
        style={{ ["--rd" as string]: `${delay}s` }}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setDone(true);
        }}
      >
        <div className="mk-brush-zoom size-full">{children}</div>
      </div>
    </div>
  );
}
