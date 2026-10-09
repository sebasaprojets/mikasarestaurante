import type { Localized } from "@/lib/i18n";
import { media, type MediaAsset } from "@/data/media";

/**
 * MIKASA MENU — dados da carta.
 *
 * Fonte oficial:
 *   PDF       https://cdnm.heyzine.com/files/uploaded/v3/feb582904359a769b33aeb57cabaad24d9028fd6.pdf
 *   Flipbook  https://heyzine.com/flip-book/feb5829043.html
 *
 * ESTADO DA EXTRAÇÃO
 *   O PDF não pôde ser baixado no ambiente de desenvolvimento (host bloqueado
 *   pela política de rede). Nenhum prato foi inventado.
 *   Itens abaixo vêm SOMENTE do briefing do projeto (`fonte: "briefing"`).
 *   Categorias com `status: "pendiente"` aguardam transcrição do PDF
 *   (lembrete: as páginas 1 e 2 do PDF são imagens — transcrever manualmente).
 *
 * Campos `null` = informação pendente. A interface mostra "Por confirmar".
 */

export type MenuTag = "signature" | "picante" | "vegetariano" | "chefs-choice";

export type MenuCategoryId =
  | "sushi-rolls"
  | "itame-special-rolls"
  | "omakase-experience"
  | "hamachi-collection"
  | "platos-principales"
  | "noodles-vegetables"
  | "robata-steak-house"
  | "postres-caseros";

export type MenuItem = {
  id: string;
  categoria: MenuCategoryId;
  nome: Localized;
  descricao: Localized | null;
  /** USD. `null` = preço pendente. */
  preco: number | null;
  porcao: string | null;
  tags: MenuTag[];
  imagem: MediaAsset | null;
  video: MediaAsset | null;
  /** Subitens (ex.: cortes de um omakase). */
  componentes?: string[];
  fonte: "pdf" | "briefing";
};

export type MenuCategory = {
  id: MenuCategoryId;
  nome: Localized;
  nota?: Localized;
  status: "completo" | "parcial" | "pendiente";
};

export const menuCategories: MenuCategory[] = [
  {
    id: "sushi-rolls",
    nome: { es: "Sushi Rolls", en: "Sushi Rolls" },
    status: "pendiente",
  },
  {
    id: "itame-special-rolls",
    nome: { es: "Itame Special Rolls", en: "Itame Special Rolls" },
    status: "pendiente",
  },
  {
    id: "omakase-experience",
    nome: { es: "Omakase Experience", en: "Omakase Experience" },
    status: "parcial",
  },
  {
    id: "hamachi-collection",
    nome: { es: "Hamachi Collection", en: "Hamachi Collection" },
    status: "parcial",
  },
  {
    id: "platos-principales",
    nome: { es: "Platos Principales", en: "Main Courses" },
    status: "pendiente",
  },
  {
    id: "noodles-vegetables",
    nome: { es: "Noodles & Vegetables", en: "Noodles & Vegetables" },
    status: "parcial",
  },
  {
    id: "robata-steak-house",
    nome: { es: "Japanese Robata Steak House", en: "Japanese Robata Steak House" },
    nota: { es: "Acompañamientos incluidos", en: "Sides included" },
    status: "parcial",
  },
  {
    id: "postres-caseros",
    nome: { es: "Postres Caseros", en: "Homemade Desserts" },
    status: "pendiente",
  },
];

export const menuItems: MenuItem[] = [
  // ── Omakase Experience ────────────────────────────────────────
  {
    id: "omakase-bluefin",
    categoria: "omakase-experience",
    nome: { es: "Omakase Bluefin", en: "Omakase Bluefin" },
    descricao: {
      es: "Tres cortes de atún bluefin: akami, chutoro y otoro.",
      en: "Three cuts of bluefin tuna: akami, chutoro and otoro.",
    },
    preco: null,
    porcao: null,
    tags: [],
    componentes: ["Akami", "Chutoro", "Otoro"],
    imagem: media.omakase01,
    video: null,
    fonte: "briefing",
  },
  {
    id: "traditional-nigiri-experience",
    categoria: "omakase-experience",
    nome: { es: "Traditional Nigiri Experience", en: "Traditional Nigiri Experience" },
    descricao: null,
    preco: null,
    porcao: null,
    tags: [],
    imagem: media.omakase02,
    video: null,
    fonte: "briefing",
  },
  {
    id: "wagyu-tiradito",
    categoria: "omakase-experience",
    nome: { es: "Wagyu Tiradito", en: "Wagyu Tiradito" },
    descricao: null,
    preco: null,
    porcao: null,
    tags: [],
    imagem: media.omakase04,
    video: null,
    fonte: "briefing",
  },

  // ── Hamachi Collection ────────────────────────────────────────
  {
    id: "hamachi-collection",
    categoria: "hamachi-collection",
    nome: { es: "Hamachi Collection", en: "Hamachi Collection" },
    descricao: null,
    preco: null,
    porcao: null,
    tags: [],
    imagem: media.omakase03,
    video: null,
    fonte: "briefing",
  },

  // ── Noodles & Vegetables (preços do briefing) ─────────────────
  {
    id: "noodles-vegetales",
    categoria: "noodles-vegetables",
    nome: { es: "Vegetales", en: "Vegetables" },
    descricao: null,
    preco: 14,
    porcao: null,
    tags: [],
    imagem: null,
    video: null,
    fonte: "briefing",
  },
  {
    id: "noodles-pollo",
    categoria: "noodles-vegetables",
    nome: { es: "Pollo", en: "Chicken" },
    descricao: null,
    preco: 18,
    porcao: null,
    tags: [],
    imagem: null,
    video: null,
    fonte: "briefing",
  },
  {
    id: "noodles-prime-beef",
    categoria: "noodles-vegetables",
    nome: { es: "Prime Beef", en: "Prime Beef" },
    descricao: null,
    preco: 22,
    porcao: null,
    tags: [],
    imagem: null,
    video: null,
    fonte: "briefing",
  },
  {
    id: "noodles-camaron",
    categoria: "noodles-vegetables",
    nome: { es: "Camarón", en: "Shrimp" },
    descricao: null,
    preco: 25,
    porcao: null,
    tags: [],
    imagem: null,
    video: null,
    fonte: "briefing",
  },

  // ── Japanese Robata Steak House ───────────────────────────────
  {
    id: "tomahawk-brangus",
    categoria: "robata-steak-house",
    nome: { es: "Tomahawk Brangus", en: "Brangus Tomahawk" },
    descricao: {
      es: "Corte tomahawk Brangus a la robata. Acompañamientos incluidos.",
      en: "Brangus tomahawk cut from the robata grill. Sides included.",
    },
    preco: null,
    porcao: "32 oz",
    tags: [],
    imagem: media.robata01,
    video: null,
    fonte: "briefing",
  },
];

/** Experiências exibidas na seção Omakase da Home (ordem do briefing). */
export const omakaseFeatured: string[] = [
  "omakase-bluefin",
  "traditional-nigiri-experience",
  "hamachi-collection",
  "wagyu-tiradito",
];

/**
 * Robata — grupos exibidos na Home.
 * Os nomes dos cortes CAB, Brangus e dos acompanhamentos aguardam a carta oficial.
 */
export const robataGroups: { id: string; nome: Localized; itens: string[] }[] = [
  { id: "cab", nome: { es: "Cortes CAB", en: "CAB Cuts" }, itens: [] },
  { id: "brangus", nome: { es: "Cortes Brangus", en: "Brangus Cuts" }, itens: [] },
  { id: "acompanamientos", nome: { es: "Acompañamientos", en: "Sides" }, itens: [] },
];

export const itemsByCategory = (id: MenuCategoryId) => menuItems.filter((i) => i.categoria === id);
export const findItem = (id: string) => menuItems.find((i) => i.id === id);
