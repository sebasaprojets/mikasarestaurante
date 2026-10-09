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
  philosophy: m({
    id: "philosophy-01",
    kind: "image",
    src: "/media/philosophy-01.jpg",
    width: 1200,
    height: 1600,
    alt: { es: "Manos del chef preparando un plato Nikkei", en: "Chef's hands plating a Nikkei dish" },
  }),
  omakase01: m({
    id: "omakase-01",
    kind: "image",
    src: "/media/omakase-01.jpg",
    width: 1200,
    height: 1500,
    alt: { es: "Omakase Bluefin: akami, chutoro y otoro", en: "Omakase Bluefin: akami, chutoro and otoro" },
  }),
  omakase02: m({
    id: "omakase-02",
    kind: "image",
    src: "/media/omakase-02.jpg",
    width: 1200,
    height: 1500,
    alt: { es: "Traditional Nigiri Experience", en: "Traditional Nigiri Experience" },
  }),
  omakase03: m({
    id: "omakase-03",
    kind: "image",
    src: "/media/omakase-03.jpg",
    width: 1200,
    height: 1500,
    alt: { es: "Hamachi Collection", en: "Hamachi Collection" },
  }),
  omakase04: m({
    id: "omakase-04",
    kind: "image",
    src: "/media/omakase-04.jpg",
    width: 1200,
    height: 1500,
    alt: { es: "Wagyu Tiradito", en: "Wagyu Tiradito" },
  }),
  robata01: m({
    id: "robata-01",
    kind: "image",
    src: "/media/robata-01.jpg",
    width: 1600,
    height: 1200,
    alt: { es: "Tomahawk Brangus sobre la robata", en: "Brangus Tomahawk on the robata grill" },
  }),
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
  category: "platos" | "sushi" | "robata" | "bebidas" | "ambiente" | "detalles" | "chef" | "fuego";
  ratio: "portrait" | "landscape" | "square";
};

const g = (
  id: string,
  category: GalleryItem["category"],
  ratio: GalleryItem["ratio"],
  alt: Localized,
  kind: MediaAsset["kind"] = "image",
): GalleryItem => ({
  category,
  ratio,
  asset: m({
    id,
    kind,
    src: kind === "video" ? `/media/${id}.mp4` : `/media/${id}.jpg`,
    poster: kind === "video" ? `/media/${id}.jpg` : undefined,
    width: ratio === "landscape" ? 1600 : 1200,
    height: ratio === "portrait" ? 1600 : ratio === "square" ? 1200 : 1066,
    alt,
  }),
});

export const gallery: GalleryItem[] = [
  g("gallery-01", "sushi", "portrait", { es: "Nigiri en la barra", en: "Nigiri at the counter" }),
  g("gallery-02", "ambiente", "landscape", { es: "Salón de MIKASA", en: "MIKASA dining room" }),
  g("gallery-03", "fuego", "square", { es: "Llama de la robata", en: "Robata flame" }, "video"),
  g("gallery-04", "chef", "portrait", { es: "Chef en el corte", en: "Chef at the cutting board" }),
  g("gallery-05", "bebidas", "portrait", { es: "Coctel en la barra", en: "Cocktail at the bar" }),
  g("gallery-06", "platos", "landscape", { es: "Emplatado Nikkei", en: "Nikkei plating" }),
  g("gallery-07", "detalles", "square", { es: "Detalle de ingredientes", en: "Ingredient detail" }),
  g("gallery-08", "robata", "landscape", { es: "Cortes en la robata", en: "Cuts on the robata" }),
  g("gallery-09", "sushi", "portrait", { es: "Selección de sashimi", en: "Sashimi selection" }),
];
