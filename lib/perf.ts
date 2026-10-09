"use client";

import { isLowEndDevice } from "@/lib/device";

export const PERF_LITE_EVENT = "mikasa:perf-lite";

export const isPerfLite = () => typeof document !== "undefined" && document.documentElement.dataset.perf === "lite";

function enableLite() {
  if (isPerfLite()) return;
  document.documentElement.dataset.perf = "lite";
  window.dispatchEvent(new Event(PERF_LITE_EVENT));
}

/**
 * Qualidade adaptativa: aparelho modesto → modo leve imediato. Nos demais,
 * mede ~90 quadros e ativa o modo leve se a mediana ficar abaixo de ~50 fps
 * (ou 1/4 dos quadros abaixo de ~35 fps).
 * O modo leve só remove detalhes quase imperceptíveis (ver globals.css).
 */
export function startPerfProbe(delayMs = 1200) {
  if (isLowEndDevice()) {
    enableLite();
    return () => {};
  }
  let raf = 0;
  const timer = window.setTimeout(() => {
    const frames: number[] = [];
    let last = performance.now();
    const loop = (t: number) => {
      frames.push(t - last);
      last = t;
      if (frames.length < 90) raf = requestAnimationFrame(loop);
      else {
        // mediana e percentil 75: robustos a picos isolados (decodificação de imagem etc.)
        const f = frames.slice(10).sort((a, b) => a - b);
        const median = f[Math.floor(f.length * 0.5)];
        const p75 = f[Math.floor(f.length * 0.75)];
        if (median > 20 || p75 > 28) enableLite();
      }
    };
    raf = requestAnimationFrame(loop);
  }, delayMs);
  return () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(raf);
  };
}
