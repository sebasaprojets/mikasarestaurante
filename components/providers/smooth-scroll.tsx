"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useCallback, useEffect } from "react";

/** Lenis — smooth scroll lento e preciso. Respeita prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        // gesto lateral do trackpad também rola (ex.: carrossel do Omakase)
        gestureOrientation: "both",
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
    const root = document.documentElement;
    if (!lenis || !root.hasAttribute("data-intro")) return;
    lenis.stop();
    // Religa só quando a intro já sumiu (o scroll da página fica travado por CSS
    // até lá) e num momento ocioso: `lenis.start()` lê a posição do scroll e força
    // um layout da página inteira; no quadro em que a intro começava a sair isso
    // custava ~50 ms (o "tranco" da transição).
    let idle = 0;
    let late = 0;
    const start = () => {
      const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (ric) idle = ric(() => lenis.start(), { timeout: 800 });
      else late = window.setTimeout(() => lenis.start(), 100);
    };
    const mo = new MutationObserver(() => {
      if (root.hasAttribute("data-intro")) return;
      mo.disconnect();
      start();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    return () => {
      mo.disconnect();
      window.clearTimeout(late);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [lenis]);
  return null;
}
