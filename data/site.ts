import type { Localized } from "@/lib/i18n";

/**
 * Dados oficiais do restaurante — fonte única.
 * Altere aqui; os componentes leem destes valores.
 * REGRA: nunca inventar. Campos sem confirmação ficam em `pending`.
 */

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const site = {
  name: "MIKASA",
  fullName: "MIKASA — Japanese Nikkei Cuisine",
  tagline: "Japanese Nikkei Cuisine",

  /** URL de produção. Defina NEXT_PUBLIC_SITE_URL na Vercel quando o domínio estiver confirmado. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  address: {
    street: "Playa Dorada Mall",
    city: "Puerto Plata",
    country: "República Dominicana",
    countryCode: "DO",
    full: "Playa Dorada Mall, Puerto Plata, República Dominicana",
  },

  phone: {
    display: "+1 (849) 214-7479",
    e164: "+18492147479",
  },

  whatsapp: {
    number: "18492147479",
    url: "https://wa.me/18492147479",
  },

  maps: {
    url: "https://maps.app.goo.gl/6CRf6DKWHppymi7HA",
    /** Embed sem chave de API, centralizado no endereço público. */
    embed:
      "https://www.google.com/maps?q=Playa+Dorada+Mall,+Puerto+Plata,+Rep%C3%BAblica+Dominicana&z=16&output=embed",
  },

  social: {
    instagram: {
      handle: "@mikasa.restaurant",
      url: "https://www.instagram.com/mikasa.restaurant/",
    },
    threads: {
      handle: "@mikasa.restaurant",
      url: "https://www.threads.net/@mikasa.restaurant",
    },
    /** Informado no briefing. Plataforma: Instagram. */
    followers: { value: 280, suffix: "K" },
  },

  awards: [
    { name: "Restaurant Guru", year: 2023 },
    { name: "Restaurant Guru", year: 2024 },
    { name: "Restaurant Guru", year: 2025 },
    { name: "Restaurant Guru", year: 2026 },
  ],

  currency: "USD",
  priceRange: "$$$$",
  servesCuisine: ["Japanese", "Nikkei"],

  /**
   * Horário atual.
   * Informação antiga (NÃO em uso): almoço 12:00–15:00 · jantar 16:00–23:00.
   */
  hours: {
    timezone: "America/Santo_Domingo",
    open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as Weekday[],
    closed: ["monday"] as Weekday[],
    opens: "13:00",
    closes: "23:00",
    label: {
      es: [
        { days: "Martes a Domingo", time: "1:00 PM – 11:00 PM" },
        { days: "Lunes", time: "Cerrado" },
      ],
      en: [
        { days: "Tuesday to Sunday", time: "1:00 PM – 11:00 PM" },
        { days: "Monday", time: "Closed" },
      ],
    } satisfies Localized<{ days: string; time: string }[]>,
  },

  reservations: {
    /** Intervalo entre horários oferecidos no formulário. */
    slotMinutes: 30,
    /** Último horário oferecido = fechamento − este valor. */
    lastSlotBeforeCloseMinutes: 30,
    maxGuests: 12,
  },

  menus: {
    food: {
      pdf: "https://cdnm.heyzine.com/files/uploaded/v3/feb582904359a769b33aeb57cabaad24d9028fd6.pdf",
      flipbook: "https://heyzine.com/flip-book/feb5829043.html",
    },
    bar: {
      title: "Luxury Bar & Mixology Menu",
      pdf: "https://cdnm.heyzine.com/files/uploaded/v3/6f21b040a716c37f5b4bd54779f96374cfc79273.pdf",
      flipbook: "https://heyzine.com/flip-book/6f21b040a7.html",
    },
  },

  /** Itens que ainda precisam ser fornecidos pelo restaurante. */
  pending: [
    "Logo oficial em SVG (o kanji dourado da capa do menu)",
    "Domínio de produção (NEXT_PUBLIC_SITE_URL)",
    "Fotos e vídeos oficiais (ver data/media.ts)",
    "Transcrição do menu do bar (ver data/bar.ts)",
    "Tags dos pratos (vegetariano / picante / signature) a validar com o restaurante",
    "Avaliações reais de Google / TripAdvisor (ver data/reviews.ts)",
  ],
} as const;

export type Site = typeof site;
