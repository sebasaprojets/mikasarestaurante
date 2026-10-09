import type { Localized } from "@/lib/i18n";
import type { MediaAsset } from "@/data/media";

/**
 * LUXURY BAR & MIXOLOGY MENU — dados.
 *
 * Fonte oficial:
 *   PDF       https://cdnm.heyzine.com/files/uploaded/v3/6f21b040a716c37f5b4bd54779f96374cfc79273.pdf
 *   Flipbook  https://heyzine.com/flip-book/6f21b040a7.html
 *
 * Transcrito das imagens enviadas pelo restaurante:
 *   - "Bar Menu / Menú de Bar" e "Mixology" (preços e descrições ES/EN da carta)
 *   - "Guru Mixology Bar" (ingredientes só em espanhol na arte; EN traduzido)
 *   - "Signature Cocktails" (ingredientes só em inglês na arte; ES traduzido)
 *   - Promoções (Promo of the Week, After Work Happy Hour, Gin & Tonic)
 * Nada foi inventado; manter promoções atualizadas — elas mudam com frequência.
 */

export type BarCategoryId =
  | "guru-mixology"
  | "signature-cocktails"
  | "mixology-world"
  | "mixology-autor"
  | "sake"
  | "whisky"
  | "nueva-seleccion"
  | "vino-blanco"
  | "vino-del-mes"
  | "vino-por-copa"
  | "sparkling-cava"
  | "cerveza-japonesa"
  | "agua"
  | "fukumoto"
  | "cafe-te";

export type BarItem = {
  id: string;
  categoria: BarCategoryId;
  nome: string;
  descricao: Localized | null;
  /** Volume/formato como na carta (ex.: "750 ml", "Glass"). */
  volume?: string;
  /** USD. `null` quando a categoria tem preço único. */
  preco: number | null;
  imagem?: MediaAsset | null;
  fonte: "pdf" | "arte";
};

export type BarCategory = {
  id: BarCategoryId;
  nome: Localized;
  subtitulo?: Localized;
  nota?: Localized;
  /** Preço único de todos os itens da categoria (ex.: mixologia). */
  precoUnico?: number;
  destaque?: boolean;
  grupo: "cocteles" | "destilados" | "vinos" | "otros";
};

export const barCategories: BarCategory[] = [
  {
    id: "guru-mixology",
    nome: { es: "Guru Mixology Bar", en: "Guru Mixology Bar" },
    subtitulo: { es: "Arte líquido · Precisión japonesa · Alma Nikkei", en: "Liquid art · Japanese precision · Nikkei soul" },
    nota: { es: "Más que cocteles, un ritual. Solo en Mikasa.", en: "More than cocktails, a ritual. Only at Mikasa." },
    precoUnico: 18,
    destaque: true,
    grupo: "cocteles",
  },
  {
    id: "signature-cocktails",
    nome: { es: "Signature Cocktails", en: "Signature Cocktails" },
    nota: {
      es: "Todos los cocteles se elaboran con destilados premium y los mejores ingredientes. Beba con moderación.",
      en: "All cocktails are crafted with premium spirits and the finest ingredients. Please drink responsibly.",
    },
    destaque: true,
    grupo: "cocteles",
  },
  {
    id: "mixology-world",
    nome: { es: "Mixología del mundo", en: "Mixology of the World" },
    precoUnico: 17,
    grupo: "cocteles",
  },
  {
    id: "mixology-autor",
    nome: { es: "Mixología de autor", en: "Mixology of the Author" },
    precoUnico: 18,
    grupo: "cocteles",
  },
  { id: "sake", nome: { es: "Sake", en: "Sake" }, destaque: true, grupo: "destilados" },
  {
    id: "whisky",
    nome: { es: "Rum · Whisky · Cognac", en: "Rum · Whisky · Cognac" },
    subtitulo: { es: "Selección de whisky japonés", en: "Japanese whisky selection" },
    destaque: true,
    grupo: "destilados",
  },
  { id: "nueva-seleccion", nome: { es: "Nueva selección", en: "New Selection" }, grupo: "vinos" },
  {
    id: "vino-blanco",
    nome: { es: "Vino blanco", en: "White Wine" },
    subtitulo: { es: "Nuestra selección de Albariño", en: "Our Albariño Selection" },
    grupo: "vinos",
  },
  { id: "vino-del-mes", nome: { es: "Nuestro vino del mes", en: "Our Wine of the Month" }, grupo: "vinos" },
  { id: "vino-por-copa", nome: { es: "Vino por copa Mikasa", en: "Mikasa Wine by the Glass" }, grupo: "vinos" },
  { id: "sparkling-cava", nome: { es: "Sparkling Wine & Cava", en: "Sparkling Wine & Cava" }, grupo: "vinos" },
  { id: "cerveza-japonesa", nome: { es: "Cerveza japonesa", en: "Japanese Beer" }, grupo: "otros" },
  { id: "agua", nome: { es: "Agua natural & sparkling", en: "Water" }, grupo: "otros" },
  { id: "fukumoto", nome: { es: "Fukumoto Sparkling Water", en: "Fukumoto Sparkling Water" }, grupo: "otros" },
  { id: "cafe-te", nome: { es: "Café & Té", en: "Coffee & Tea" }, grupo: "otros" },
];

const L = (es: string, en: string): Localized => ({ es, en });
let n = 0;
const it = (categoria: BarCategoryId, nome: string, preco: number | null, descricao: Localized | null = null, volume?: string): BarItem => ({
  id: `${categoria}-${++n}`,
  categoria,
  nome,
  descricao,
  volume,
  preco,
  fonte: categoria === "guru-mixology" || categoria === "signature-cocktails" ? "arte" : "pdf",
});

export const barItems: BarItem[] = [
  // ── Guru Mixology Bar ($18) ───────────────────────────────────
  it("guru-mixology", "Gurofuku", null, L("Limón, miel, piña, ron oscuro, ginger.", "Lime, honey, pineapple, dark rum, ginger.")),
  it("guru-mixology", "Gurú Savage", null, L("Tequila reposado, Aperol, spicy hidromiel, limón, Cointreau, Cherrys Wood smoke.", "Reposado tequila, Aperol, spicy mead, lime, Cointreau, cherry wood smoke.")),
  it("guru-mixology", "Gurú Maki", null, L("Tequila reposado, naranja, Cointreau, limón, miel, sirope de hibiscus.", "Reposado tequila, orange, Cointreau, lime, honey, hibiscus syrup.")),
  it("guru-mixology", "Gurumonarka", null, L("Mezcal, limón, piña, ginger, Cointreau, hidromiel.", "Mezcal, lime, pineapple, ginger, Cointreau, mead.")),

  // ── Signature Cocktails ($16) ─────────────────────────────────
  it("signature-cocktails", "Most Unusual", 16, L("Gin Hendrick's, tónica London Essence de naranja sanguina y flor de saúco, pepino, pétalos de rosa.", "Hendrick's Gin, Blood Orange & Elderflower London Essence Tonic, cucumber, rose petals.")),
  it("signature-cocktails", "Menorca Tonic", 16, L("Gin Mahon, agua tónica Indian Essence, arándano, pimienta rosa, limón.", "Mahon Gin, Indian Essence Tonic Water, blueberry, pink peppercorn, lemon.")),
  it("signature-cocktails", "Marabilis", 16, L("Gin Mare, tónica mediterránea, hojas de albahaca, fresas, lima.", "Gin Mare, Mediterranean tonic, basil leaves, strawberries, lime.")),
  it("signature-cocktails", "Mono Salvaje", 16, L("Monkey 47, tónica de toronja, piel de toronja, eneldo, frambuesa.", "Monkey 47, grapefruit tonic, grapefruit peel, dill, raspberry.")),

  // ── Mixology of the World ($17) ───────────────────────────────
  it("mixology-world", "Kasukarova Whisky", null, L("Whisky japonés, sake y jengibre fresco.", "Japanese whisky, sake and fresh ginger.")),
  it("mixology-world", "Suruka Mono Mojito", null, L("Vodka, flor de jamaica, menta y limón.", "Vodka, hibiscus flower, mint and lime.")),
  it("mixology-world", "Kyoto Ginger Margarita", null, L("Tequila, Cointreau, zumo de limón fresco y jengibre.", "Tequila, Cointreau, fresh lime juice and ginger.")),
  it("mixology-world", "Gaman Aka Sour", null, L("Pisco, limón, sirope de canela y clara de huevo.", "Pisco, lime, cinnamon syrup and egg white.")),
  it("mixology-world", "Exquisite", null, L("Tequila blanco, cítricos de naranja, lima fresca, agave orgánico, hibiscus y cilantro.", "Blanco tequila, orange citrus, fresh lime, organic agave, hibiscus and cilantro.")),
  it("mixology-world", "Savage Blend", null, L("Tequila blanco, zumo de limón fresco, miel, triple sec La Grange, jugo de flor de jamaica y jugo de jengibre.", "Blanco tequila, fresh lemon juice, honey, La Grange triple sec, hibiscus juice and ginger juice.")),

  // ── Mixology of the Autor ($18) ───────────────────────────────
  it("mixology-autor", "Hendrick's Dragon Fruit", null, L("Gin Hendrick's, fruta del dragón, lima fresca y tónica.", "Hendrick's gin, dragon fruit, fresh lime and tonic.")),
  it("mixology-autor", "Hendrick's Cucumber Lemonade", null, L("Gin Hendrick's, pepino fresco, limón y limonada.", "Hendrick's gin, fresh cucumber, lemon and lemonade.")),
  it("mixology-autor", "Bond Bon", null, L("Limón, syrup de piña, zumo de piña, licor de coco y ron blanco.", "Lime, pineapple syrup, pineapple juice, coconut liqueur and white rum.")),
  it("mixology-autor", "Mikasu Sandía", null, L("Limón, hidromiel, tomillo, ginebra y zumo de sandía.", "Lime, mead, thyme, gin and watermelon juice.")),
  it("mixology-autor", "Margarita Salvaje", null, L("Limón, infusión Mikasa, syrup de piña, zumo de ginger, Cointreau y tequila blanco.", "Lime, Mikasa infusion, pineapple syrup, ginger juice, Cointreau and blanco tequila.")),
  it("mixology-autor", "Moctail Mona Mojito", null, L("Limón, zumo de piña, syrup de piña, infusión Mikasa y agua.", "Lime, pineapple juice, pineapple syrup, Mikasa infusion and water.")),
  it("mixology-autor", "Amara Lime", null, L("Limón, syrup de fresa, zumo de chinola, vainilla y vodka.", "Lime, strawberry syrup, passion-fruit juice, vanilla and vodka.")),

  // ── Sake ──────────────────────────────────────────────────────
  it("sake", "Sake Ozeki Dry Fancy", 8, null, "180 ml"),
  it("sake", "Premium Sake Soto Junmai", 12),

  // ── Rum · Whisky · Cognac ─────────────────────────────────────
  it("whisky", "Tottori Blended Japanese Whisky", 12),
  it("whisky", "Kamiki Japanese Blended Malt Whisky", 17),
  it("whisky", "Matsui Pure Malt Japan", 18),
  it("whisky", "Matsui Tottori Japan", 18),
  it("whisky", "Matsui Kurayoshi Dragon Japan", 22),
  it("whisky", "Mars Kasei Japan", 22),
  it("whisky", "Iwai Japanese Traditional", 22),

  // ── New Selection / Nueva selección ───────────────────────────
  it("nueva-seleccion", "Altos Las Hormigas White", 28),
  it("nueva-seleccion", "Altos Las Hormigas La Danza Red", 28),
  it("nueva-seleccion", "Altos Las Hormigas Malbec Clásico Red", 34),
  it("nueva-seleccion", "Melior Verdejo White", 38),
  it("nueva-seleccion", "Melior Tempranillo Red", 38),
  it("nueva-seleccion", "Douglass Hill Cabernet Sauvignon Red", 24),
  it("nueva-seleccion", "Douglass Hill Chardonnay White", 24),
  it("nueva-seleccion", "Cibeles Tinto 2024 Rioja", 38),
  it("nueva-seleccion", "Cibeles Blanco 2024 Rioja", 38),

  // ── White Wine / Albariño ─────────────────────────────────────
  it("vino-blanco", "Leira Albariño", 42),
  it("vino-blanco", "Marietta Albariño", 42),
  it("vino-blanco", "Martin Codax Albariño", 42),
  it("vino-blanco", "Paco y Lola Albariño", 42),
  it("vino-blanco", "Genio y Figura Albariño", 48),
  it("vino-blanco", "Pazo Senorans Albariño", 48),

  // ── Our Wine of the Month ─────────────────────────────────────
  it("vino-del-mes", "Minuty Cote de Provence", 46),
  it("vino-del-mes", "Bardos Tinto Riviera del Duero", 43),
  it("vino-del-mes", "Chardonnay & Pinot Noir", 48),

  // ── Mikasa Wine by the Glass ──────────────────────────────────
  it("vino-por-copa", "Garlandcrest Chardonnay White", 7),
  it("vino-por-copa", "Garlandcrest Merlot Red", 7),

  // ── Sparkling Wine & Cava ─────────────────────────────────────
  it("sparkling-cava", "Pere Mata Brut Reserva", 40),
  it("sparkling-cava", "Pere Mata Brut Rosé", 42),
  it("sparkling-cava", "Mikasa Sparkling Wine Brut", 5, null, "Glass"),

  // ── Japanese Beer / Cerveza japonesa ──────────────────────────
  it("cerveza-japonesa", "Sapporo Premium Light", 8, null, "355 ml"),
  it("cerveza-japonesa", "Corona Extra", 6),
  it("cerveza-japonesa", "Stella Artois", 6),
  it("cerveza-japonesa", "Asahi Super Dry", 10),

  // ── Water / Agua ──────────────────────────────────────────────
  it("agua", "San Benedetto Natural", 7, null, "750 ml"),
  it("agua", "San Benedetto Sparkling", 7, null, "750 ml"),
  it("agua", "Ferrarelle Agua Mineral Gas Natural", 7, null, "750 ml"),
  it("agua", "Ferrarelle Agua Mineral Natural", 7, null, "750 ml"),

  // ── Fukumoto Sparkling Water ──────────────────────────────────
  it("fukumoto", "Fukumoto Sparkling Water", 8, L("Pregunte a su mesero por nuestros deliciosos sabores disponibles.", "Ask your server to discover today's delicious flavours.")),

  // ── Coffee & Tea ──────────────────────────────────────────────
  it("cafe-te", "Guro Espresso", 2.5),
  it("cafe-te", "Guro Cappuccino", 4),
  it("cafe-te", "Green Tea", 2.5),
];

/** Promoções (artes enviadas pelo restaurante). */
export type BarPromo = { id: string; dias: Localized; titulo: Localized; texto: Localized; destaque: Localized };

export const barPromos: BarPromo[] = [
  {
    id: "promo-semana",
    dias: L("Jueves a domingo", "Thursday to Sunday"),
    titulo: L("Promo de la semana", "Promo of the Week"),
    destaque: L("Asahi Super Dry & sake de la casa", "Asahi Super Dry & house sake"),
    texto: L(
      "Disfruta nuestra cerveza Asahi y nuestro sake japonés de la casa a precio especial.",
      "Japanese beer Asahi Super Dry and our house Japanese sake at a special price.",
    ),
  },
  {
    id: "happy-hour",
    dias: L("Martes y miércoles", "Tuesday & Wednesday"),
    titulo: L("After Work Happy Hour", "After Work Happy Hour"),
    destaque: L("2x1 en bebidas", "2-for-1 drinks"),
    texto: L("Disfruta nuestra selección de 2x1 en bebidas. Buena música, buenos tragos, el mejor ambiente.", "Enjoy our 2-for-1 drinks selection. Good drinks, good music, good vibes."),
  },
  {
    id: "gin-tonic",
    dias: L("Todos los días", "Everyday"),
    titulo: L("Gin & Tonic de la casa", "Best of the House Gin & Tonic"),
    destaque: L("Imperdible", "A must try"),
    texto: L("Preparado en casa por nuestro mixólogo: gin premium, cítricos frescos y botánicos seleccionados.", "Done in the house by our mixologist: premium gin, fresh citrus and select botanicals."),
  },
];

export const barItemsByCategory = (id: BarCategoryId) => barItems.filter((i) => i.categoria === id);
export const findBarCategory = (id: BarCategoryId) => barCategories.find((c) => c.id === id);
