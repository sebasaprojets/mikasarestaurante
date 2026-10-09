"use client";

import { useEffect, useState } from "react";

export const INTRO_EVENT = "mikasa:intro-done";

/** `true` quando o preloader terminou (ou não existe nesta visita). */
export function useIntroReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const done = () => setReady(true);
    if (!document.documentElement.hasAttribute("data-preload")) {
      const id = requestAnimationFrame(done);
      return () => cancelAnimationFrame(id);
    }
    window.addEventListener(INTRO_EVENT, done, { once: true });
    return () => window.removeEventListener(INTRO_EVENT, done);
  }, []);
  return ready;
}
