import type { Localized } from "@/lib/i18n";
import type { MediaAsset } from "@/data/media";

/**
 * LUXURY BAR & MIXOLOGY MENU — dados.
 *
 * Fonte oficial:
 *   PDF       https://cdnm.heyzine.com/files/uploaded/v3/6f21b040a716c37f5b4bd54779f96374cfc79273.pdf
 *   Flipbook  https://heyzine.com/flip-book/6f21b040a7.html
 *
 * ESTADO DA EXTRAÇÃO
 *   O PDF não pôde ser baixado no ambiente de desenvolvimento (host bloqueado
 *   pela política de rede). Nenhum item foi inventado.
 *   Ao transcrever: deduplicar blocos repetidos do PDF e transcrever
 *   coquetéis presentes apenas em páginas de imagem.
 */

export type BarCategoryId =
  | "nueva-seleccion"
  | "vino-por-copa"
  | "vino-del-mes"
  | "albarino-selection"
  | "sparkling-cava"
  | "sake"
  | "whisky-japones"
  | "rum"
  | "whisky"
  | "cognac"
  | "cervezas"
  | "aguas-fukumoto"
  | "cafe-te";

export type BarItem = {
  id: string;
  categoria: BarCategoryId;
  nome: Localized;
  descricao: Localized | null;
  /** Origem / produtor quando constar na carta. */
  origem?: string | null;
  /** Preços em USD. Use `copa`, `garrafa` etc. conforme a carta. */
  precos: { formato: Localized; valor: number }[];
  tags: ("signature" | "chefs-choice")[];
  imagem: MediaAsset | null;
  fonte: "pdf";
};

export type BarCategory = {
  id: BarCategoryId;
  nome: Localized;
  destaque?: boolean;
  status: "completo" | "parcial" | "pendiente";
};

export const barCategories: BarCategory[] = [
  { id: "nueva-seleccion", nome: { es: "Nueva Selección", en: "New Selection" }, status: "pendiente" },
  { id: "vino-por-copa", nome: { es: "Vino por copa", en: "Wine by the Glass" }, status: "pendiente" },
  { id: "vino-del-mes", nome: { es: "Vino del mes", en: "Wine of the Month" }, status: "pendiente" },
  { id: "albarino-selection", nome: { es: "Albariño Selection", en: "Albariño Selection" }, status: "pendiente" },
  { id: "sparkling-cava", nome: { es: "Sparkling & Cava", en: "Sparkling & Cava" }, status: "pendiente" },
  { id: "sake", nome: { es: "Sake", en: "Sake" }, destaque: true, status: "pendiente" },
  { id: "whisky-japones", nome: { es: "Whisky japonés", en: "Japanese Whisky" }, destaque: true, status: "pendiente" },
  { id: "rum", nome: { es: "Rum", en: "Rum" }, status: "pendiente" },
  { id: "whisky", nome: { es: "Whisky", en: "Whisky" }, status: "pendiente" },
  { id: "cognac", nome: { es: "Cognac", en: "Cognac" }, status: "pendiente" },
  { id: "cervezas", nome: { es: "Cervezas", en: "Beers" }, status: "pendiente" },
  {
    id: "aguas-fukumoto",
    nome: { es: "Aguas & Fukumoto Sparkling", en: "Waters & Fukumoto Sparkling" },
    status: "pendiente",
  },
  { id: "cafe-te", nome: { es: "Café & Té", en: "Coffee & Tea" }, status: "pendiente" },
];

export const barItems: BarItem[] = [];

export const barItemsByCategory = (id: BarCategoryId) => barItems.filter((i) => i.categoria === id);
