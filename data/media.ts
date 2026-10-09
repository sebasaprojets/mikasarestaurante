import type { Localized } from "@/lib/i18n";

/**
 * Manifesto de mídia.
 *
 * Enquanto `available` for `false`, o site mostra um placeholder
 * claramente identificado (nunca uma foto falsa como se fosse oficial).
 *
 * Para publicar o material oficial:
 *   1. coloque o arquivo em /public/media/<arquivo>
 *      (vídeos pesados: use CDN / Vercel Blob e coloque a URL em `src`)
 *   2. mude `available` para `true`
 * Nenhum componente precisa ser alterado.
 */

export type MediaAsset = {
  id: string;
  kind: "image" | "video";
  src: string;
  /** Versão WebM opcional do vídeo. */
  webm?: string;
  /** Poster (imagem) do vídeo. Também usado como fallback. */
  poster?: string;
  width: number;
  height: number;
  alt: Localized;
  available: boolean;
};

const m = (asset: Omit<MediaAsset, "available"> & { available?: boolean }): MediaAsset => ({
  available: false,
  ...asset,
});

/** Fotos oficiais enviadas pelo restaurante (tratadas: cor, contraste, nitidez, vinheta). */
const photo = (id: string, width: number, height: number, alt: Localized): MediaAsset =>
  m({ id, kind: "image", src: `/media/${id}.webp`, width, height, alt, available: true });

export const photos = {
  hamachiRollNigiri: photo("hamachi-roll-nigiri", 1200, 1686, {
    es: "Roll y nigiri de hamachi flameado sobre hoja de plátano",
    en: "Seared hamachi roll and nigiri on a banana leaf",
  }),
  lomoSaltadoCausa: photo("lomo-saltado-causa", 1200, 1493, {
    es: "Lomo saltado con causa limeña y salsa criolla",
    en: "Lomo saltado with causa limeña and criolla salad",
  }),
  arrozCamaron: photo("arroz-camaron", 1200, 1193, {
    es: "Arroz salteado con camarones y huevo pochado en sartén de hierro",
    en: "Fried rice with shrimp and a poached egg in a cast-iron pan",
  }),
  nigiriExperience: photo("nigiri-experience", 1200, 803, {
    es: "Selección de ocho nigiri alrededor de salsa de soya",
    en: "Selection of eight nigiri around soy sauce",
  }),
  duckRice: photo("duck-rice", 1200, 1740, {
    es: "Arroz Nikkei con pato asado en sartén de hierro",
    en: "Nikkei rice with roasted duck in a cast-iron pan",
  }),
  salmonRoll: photo("salmon-roll", 1200, 1767, {
    es: "Roll de salmón flameado con salsa sobre mármol",
    en: "Seared salmon roll with sauce on marble",
  }),
  artesanoDessert: photo("artesano-dessert", 1200, 1791, {
    es: "Wontons crocantes con helado y chocolate",
    en: "Crispy wontons with ice cream and chocolate",
  }),
  sashimiSelection: photo("sashimi-selection", 1200, 1734, {
    es: "Selección de sashimi de atún y salmón sobre hielo",
    en: "Tuna and salmon sashimi selection on ice",
  }),
  nagasakiBeefRice: photo("nagasaki-beef-rice", 1200, 1764, {
    es: "Carne glaseada sobre arroz salteado al wok",
    en: "Glazed beef over wok-fried rice",
  }),
  mitokoTataki: photo("mitoko-tataki", 1200, 1791, {
    es: "Tataki de atún sellado con salsa y naranja",
    en: "Seared tuna tataki with sauce and orange",
  }),
  wakameKukuSalad: photo("wakame-kuku-salad", 1200, 1760, {
    es: "Ensalada de wakame, mango, pepino y aguacate",
    en: "Wakame, mango, cucumber and avocado salad",
  }),
  nigiriWine: photo("nigiri-wine", 1200, 1788, {
    es: "Nigiri variados con una copa de vino tinto",
    en: "Assorted nigiri with a glass of red wine",
  }),
  // Do Instagram @mikasa.restaurant (recortadas da publicação e tratadas)
  tiradito: photo("tiradito", 1200, 1500, {
    es: "Tiradito de pescado blanco con salsa amarilla, ají y crocante",
    en: "White fish tiradito with yellow sauce, chili and crispy garnish",
  }),
  robataSteak: photo("robata-steak", 1200, 1373, {
    es: "Corte de res a la parrilla en láminas con ensalada, vegetales y puré",
    en: "Sliced grilled beef with salad, vegetables and purée",
  }),
} satisfies Record<string, MediaAsset>;

export const media = {
  heroLoop: m({
    id: "hero-loop",
    kind: "video",
    src: "/media/hero-loop.mp4",
    webm: "/media/hero-loop.webm",
    poster: "/media/hero-poster.jpg",
    width: 1920,
    height: 1080,
    alt: {
      es: "Chef sellando un nigiri con soplete en la barra de MIKASA",
      en: "Chef torching a nigiri at the MIKASA counter",
    },
  }),
  heroPoster: m({
    id: "hero-poster",
    kind: "image",
    src: "/media/hero-poster.jpg",
    width: 1920,
    height: 1080,
    alt: { es: "Barra de MIKASA a media luz", en: "The MIKASA counter in low light" },
  }),
  philosophy: photos.nigiriWine,
  // Sem foto específica do Omakase Bluefin: usa a seleção de sashimi (atún) como representativa.
  omakase01: photos.sashimiSelection,
  omakase02: photos.nigiriExperience,
  omakase03: photos.hamachiRollNigiri,
  // Foto escolhida pelo restaurante para o card do Wagyu Tiradito
  omakase04: photos.tiradito,
  // Foto escolhida pelo restaurante para a seção Robata
  robata01: photos.robataSteak,
  bar01: m({
    id: "bar-01",
    kind: "image",
    src: "/media/bar-01.jpg",
    width: 1200,
    height: 1600,
    alt: { es: "Whisky japonés servido en la barra", en: "Japanese whisky served at the bar" },
  }),
  bar02: m({
    id: "bar-02",
    kind: "image",
    src: "/media/bar-02.jpg",
    width: 1200,
    height: 1600,
    alt: { es: "Selección de sake", en: "Sake selection" },
  }),
  bar03: m({
    id: "bar-03",
    kind: "image",
    src: "/media/bar-03.jpg",
    width: 1200,
    height: 1600,
    alt: { es: "Coctelería de autor", en: "Signature mixology" },
  }),
} satisfies Record<string, MediaAsset>;

export type GalleryItem = {
  asset: MediaAsset;
  category: "platos" | "sushi" | "robata" | "bebidas" | "ambiente" | "detalles" | "chef" | "fuego" | "postres";
  ratio: "portrait" | "landscape" | "square";
};

const gi = (asset: MediaAsset, category: GalleryItem["category"], ratio: GalleryItem["ratio"]): GalleryItem => ({ asset, category, ratio });

/** Galeria editorial — fotos oficiais. Ambiente, chef, bar e fogo: aguardando material. */
export const gallery: GalleryItem[] = [
  gi(photos.sashimiSelection, "sushi", "portrait"),
  gi(photos.lomoSaltadoCausa, "platos", "portrait"),
  gi(photos.artesanoDessert, "postres", "portrait"),
  gi(photos.nigiriExperience, "sushi", "landscape"),
  gi(photos.mitokoTataki, "detalles", "portrait"),
  gi(photos.arrozCamaron, "platos", "square"),
  gi(photos.wakameKukuSalad, "platos", "portrait"),
  gi(photos.nigiriWine, "sushi", "portrait"),
  gi(photos.duckRice, "platos", "portrait"),
  gi(photos.salmonRoll, "sushi", "portrait"),
  gi(photos.nagasakiBeefRice, "platos", "portrait"),
  gi(photos.hamachiRollNigiri, "sushi", "portrait"),
];
