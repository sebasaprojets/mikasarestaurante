/**
 * Avaliações — SOMENTE avaliações reais, copiadas literalmente de
 * Google ou TripAdvisor, com autorização/atribuição adequada.
 *
 * NUNCA inventar nomes, notas ou textos.
 * Enquanto a lista estiver vazia, o site mostra um placeholder identificado.
 */

export type Review = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  source: "Google" | "TripAdvisor";
  /** Texto original, sem edição. */
  text: string;
  /** Idioma do texto original. */
  lang: "es" | "en" | string;
  /** Link público da avaliação (recomendado). */
  url?: string;
  date?: string;
};

export const reviews: Review[] = [];
