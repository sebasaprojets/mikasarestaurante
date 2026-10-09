/** Tokens de movimento MIKASA — lento, preciso, contido. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.8,
  base: 1.1,
  slow: 1.4,
} as const;

export const STAGGER = 0.06;

/**
 * Preferência de movimento do site.
 * Decisão do cliente: as animações da marca tocam sempre (inclusive com
 * "reduzir movimento" no sistema). Retorna sempre `false` — igual no servidor
 * e no navegador, evitando divergência de hidratação.
 */
export const useReducedMotion = (): boolean => false;
