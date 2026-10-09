/**
 * Medidas do logo oficial (sem os traços). Os traços ficam só no sprite SVG
 * do layout (`LogoSprite`) e são referenciados por `<use href="#mk-…">`,
 * evitando repetir ~40 KB de paths no HTML e no JavaScript.
 */
export const EMBLEM_VIEWBOX = "0 0 280 280";
export const WORDMARK_VIEWBOX = "0 0 903.4 171.5";
export const WORDMARK_W = 903.4;
export const WORDMARK_H = 171.5;
/** Posição/largura de cada letra de "MIKASA" (para animações letra a letra). */
export const LETTER_BOXES: { x: number; w: number }[] = [{"x": 0.0, "w": 194.6}, {"x": 235.0, "w": 30.9}, {"x": 312.6, "w": 129.8}, {"x": 455.6, "w": 150.2}, {"x": 630.0, "w": 102.4}, {"x": 754.3, "w": 149.1}];

export const KANJI_ID = "mk-kanji";
export const letterId = (i: number) => `mk-l${i}`;
