"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useCallback, useEffect } from "react";
import { INTRO_EVENT } from "@/lib/hooks/use-intro-ready";

/** Lenis — smooth scroll lento e preciso. Respeita prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        anchors: { offset: -72 },
        stopInertiaOnNavigate: true,
        respectReducedMotion: false,
      }}
    >
      <IntroScrollLock />
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

/** Trava o scroll do Lenis enquanto a intro toca. */
function IntroScrollLock() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !document.documentElement.hasAttribute("data-intro")) return;
    lenis.stop();
    const start = () => lenis.start();
    window.addEventListener(INTRO_EVENT, start, { once: true });
    return () => window.removeEventListener(INTRO_EVENT, start);
  }, [lenis]);
  return null;
}
