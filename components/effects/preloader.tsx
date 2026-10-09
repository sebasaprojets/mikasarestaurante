"use client";

import { useEffect } from "react";
import { INTRO_EVENT } from "@/lib/hooks/use-intro-ready";

export const VISITED_KEY = "mk-visited";

/** Script inline (no <head>): marca a primeira visita antes do primeiro paint. */
export const preloadScript = `try{if(!localStorage.getItem("${VISITED_KEY}")){document.documentElement.setAttribute("data-preload","")}}catch(e){}`;

/**
 * Preloader — somente na primeira visita, máx. 1,8s.
 * A animação é 100% CSS (começa antes da hidratação); o JS só encerra.
 */
export function Preloader({ label }: { label: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-preload")) return;
    try {
      localStorage.setItem(VISITED_KEY, "1");
    } catch {}
    // Encerra 1,45s após o início da navegação (fade de 0,35s → total ≤ 1,8s).
    const wait = Math.max(0, 1450 - performance.now());
    const t1 = window.setTimeout(() => window.dispatchEvent(new Event(INTRO_EVENT)), wait);
    const t2 = window.setTimeout(() => root.removeAttribute("data-preload"), wait + 400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="mk-preloader fixed inset-0 z-[100] items-center justify-center bg-sumi"
      role="status"
      aria-label={label}
    >
      <svg viewBox="0 0 240 240" className="mk-pl-svg size-40 md:size-48" aria-hidden>
        <circle
          className="mk-pl-enso"
          cx="120"
          cy="120"
          r="96"
          fill="none"
          stroke="var(--color-ouro)"
          strokeWidth="1"
          strokeLinecap="round"
          pathLength={1}
          transform="rotate(-100 120 120)"
        />
        <text
          className="mk-pl-kanji"
          x="120"
          y="138"
          textAnchor="middle"
          fontSize="64"
          fill="none"
          stroke="var(--color-ouro)"
          strokeWidth="0.8"
          style={{ fontFamily: "var(--font-shippori), serif" }}
        >
          匠
        </text>
        <text
          className="mk-pl-word"
          x="120"
          y="186"
          textAnchor="middle"
          fontSize="11"
          letterSpacing="7"
          fill="var(--color-washi)"
          style={{ fontFamily: "var(--font-manrope), sans-serif" }}
        >
          MIKASA
        </text>
      </svg>
    </div>
  );
}
