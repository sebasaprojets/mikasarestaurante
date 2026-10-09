/**
 * Heurística de aparelho modesto (poucos núcleos, pouca memória ou economia de
 * dados). Usada só para dosar efeitos em canvas/WebGL — o visual não muda.
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    (nav.hardwareConcurrency ?? 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4 ||
    nav.connection?.saveData === true
  );
}

/** Densidade de pixels máxima para canvas decorativos (suaves por natureza). */
export function canvasDpr(mobileCap = 1, desktopCap = 1.25): number {
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return Math.min(dpr, mobile || isLowEndDevice() ? mobileCap : desktopCap);
}
