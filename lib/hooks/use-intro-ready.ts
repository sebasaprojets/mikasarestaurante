"use client";

import { useEffect, useState } from "react";

export const INTRO_EVENT = "mikasa:intro-done";

declare global {
  interface Window {
    __mkIntroDone?: boolean;
  }
}

/** Marca a intro como concluída (flag global + evento). */
export function signalIntroDone() {
  window.__mkIntroDone = true;
  window.dispatchEvent(new Event(INTRO_EVENT));
}

/**
 * `true` quando a intro terminou (ou não existe nesta visita).
 * Robusto a componentes montados depois do evento (ex.: navegar durante a
 * saída da intro): consulta a flag global e observa a remoção de data-intro.
 */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const done = () => setReady(true);
    if (window.__mkIntroDone || !root.hasAttribute("data-intro")) {
      const id = requestAnimationFrame(done);
      return () => cancelAnimationFrame(id);
    }
    window.addEventListener(INTRO_EVENT, done, { once: true });
    const mo = new MutationObserver(() => {
      if (!root.hasAttribute("data-intro")) done();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    return () => {
      window.removeEventListener(INTRO_EVENT, done);
      mo.disconnect();
    };
  }, []);
  return ready;
}
