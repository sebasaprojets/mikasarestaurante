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
  hamachiRollNigiri: photo("hamachi-roll-nigiri", 1400, 1967, {
    es: "Roll y nigiri de hamachi flameado sobre hoja de plátano",
    en: "Seared hamachi roll and nigiri on a banana leaf",
  }),
  lomoSaltadoCausa: photo("lomo-saltado-causa", 1400, 1741, {
    es: "Lomo saltado con causa limeña y salsa criolla",
    en: "Lomo saltado with causa limeña and criolla salad",
  }),
  arrozCamaron: photo("arroz-camaron", 1400, 1391, {
    es: "Arroz salteado con camarones y huevo pochado en sartén de hierro",
    en: "Fried rice with shrimp and a poached egg in a cast-iron pan",
  }),
  nigiriExperience: photo("nigiri-experience", 1400, 938, {
    es: "Selección de ocho nigiri alrededor de salsa de soya",
    en: "Selection of eight nigiri around soy sauce",
  }),
  duckRice: photo("duck-rice", 1400, 2030, {
    es: "Arroz Nikkei con pato asado en sartén de hierro",
    en: "Nikkei rice with roasted duck in a cast-iron pan",
  }),
  salmonRoll: photo("salmon-roll", 1400, 2063, {
    es: "Roll de salmón flameado con salsa sobre mármol",
    en: "Seared salmon roll with sauce on marble",
  }),
  artesanoDessert: photo("artesano-dessert", 1400, 2091, {
    es: "Wontons crocantes con helado y chocolate",
    en: "Crispy wontons with ice cream and chocolate",
  }),
  sashimiSelection: photo("sashimi-selection", 1400, 2023, {
    es: "Selección de sashimi de atún y salmón sobre hielo",
    en: "Tuna and salmon sashimi selection on ice",
  }),
  nagasakiBeefRice: photo("nagasaki-beef-rice", 1400, 2058, {
    es: "Carne glaseada sobre arroz salteado al wok",
    en: "Glazed beef over wok-fried rice",
  }),
  mitokoTataki: photo("mitoko-tataki", 1400, 2091, {
    es: "Tataki de atún sellado con salsa y naranja",
    en: "Seared tuna tataki with sauce and orange",
  }),
  wakameKukuSalad: photo("wakame-kuku-salad", 1400, 2053, {
    es: "Ensalada de wakame, mango, pepino y aguacate",
    en: "Wakame, mango, cucumber and avocado salad",
  }),
  nigiriWine: photo("nigiri-wine", 1400, 2086, {
    es: "Nigiri variados con una copa de vino tinto",
    en: "Assorted nigiri with a glass of red wine",
  }),
  // Do Instagram @mikasa.restaurant (recortadas da publicação e tratadas)
  tiradito: photo("tiradito", 1400, 1750, {
    es: "Tiradito de pescado blanco con salsa amarilla, ají y crocante",
    en: "White fish tiradito with yellow sauce, chili and crispy garnish",
  }),
  robataSteak: photo("robata-steak", 1400, 1601, {
    es: "Corte de res a la parrilla en láminas con ensalada, vegetales y puré",
    en: "Sliced grilled beef with salad, vegetables and purée",
  }),
  barWhisky: photo("bar-whisky-kamiki", 1400, 2058, {
    es: "Whisky japonés Kamiki Blended Malt con su estuche",
    en: "Kamiki Japanese blended malt whisky with its box",
  }),
  barVinos: photo("bar-vinos", 1400, 2172, {
    es: "Botellas de vino Ramón Bilbao y Minuty Côtes de Provence en la terraza de MIKASA",
    en: "Ramón Bilbao and Minuty Côtes de Provence wine bottles on the MIKASA terrace",
  }),
  barHatsu: photo("bar-hatsu-tea", 1400, 2249, {
    es: "Botellas de Hatsu tea frente a la entrada de MIKASA",
    en: "Hatsu tea bottles in front of the MIKASA entrance",
  }),
  mochiIceCream: photo("mochi-ice-cream", 1400, 1750, {
    es: "Mochi con helado de la casa servido en sartén negra",
    en: "Mochi with house-made ice cream served in a black pan",
  }),
  spicyTunaSavageRoll: photo("spicy-tuna-savage-roll", 1400, 1750, {
    es: "Spicy Tuna Savage Roll con atún picante sobre bandeja de pizarra",
    en: "Spicy Tuna Savage Roll topped with spicy tuna on a slate tray",
  }),
  generalTso: photo("general-tso", 1400, 1750, {
    es: "General Tso con ajonjolí sobre arroz, servido en sartén de hierro",
    en: "General Tso with sesame over rice, served in a cast-iron pan",
  }),
  nigiriAtun: photo("nigiri-atun", 1400, 1750, {
    es: "Cuatro nigiri de atún con hoja de shiso y salsa de soya",
    en: "Four tuna nigiri with a shiso leaf and soy sauce",
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
  bar01: photos.barWhisky,
  bar02: photos.barVinos,
  bar03: photos.barHatsu,
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
