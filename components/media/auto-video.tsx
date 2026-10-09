"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Vídeo em loop: autoplay · muted · loop · playsInline · poster.
 * - Só carrega quando próximo da viewport (exceto `priority`).
 * - Pausa fora da tela.
 * - Reduced motion: não reproduz automaticamente (fica o poster).
 */
export function AutoVideo({
  src,
  webm,
  poster,
  className,
  priority = false,
  label,
}: {
  src: string;
  webm?: string;
  poster?: string;
  className?: string;
  priority?: boolean;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [load, setLoad] = useState(priority);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          if (!reduce) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <video
      ref={ref}
      className={cn("size-full object-cover", className)}
      autoPlay={!reduce}
      muted
      loop
      playsInline
      preload={priority ? "auto" : "none"}
      poster={poster}
      aria-label={label}
    >
      {load && webm ? <source src={webm} type="video/webm" /> : null}
      {load ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
}
