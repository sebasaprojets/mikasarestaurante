"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useCallback } from "react";

/** Lenis — smooth scroll lento e preciso. Respeita prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        smoothWheel: true,
        anchors: { offset: -72 },
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

/** Scroll programático: usa Lenis quando presente, senão nativo. */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (target: string | HTMLElement, offset = -72) => {
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
    },
    [lenis],
  );
}
