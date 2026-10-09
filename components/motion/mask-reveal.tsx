"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Revelação por máscara — como um noren se abrindo:
 * a imagem abre do centro para as laterais e assenta com leve zoom-out.
 * O wrapper externo (sem recorte) é quem observa a viewport.
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
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
      <motion.div
        className={cn("size-full overflow-hidden")}
        variants={{
          hidden: { clipPath: "inset(0% 50% 0% 50%)" },
          show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.4, ease: EASE, delay } },
        }}
      >
        <motion.div
          className="size-full"
          variants={{
            hidden: { scale: 1.18 },
            show: { scale: 1, transition: { duration: 2.2, ease: EASE, delay } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
