import type { Localized } from "@/lib/i18n";
import { media, type MediaAsset } from "@/data/media";

/**
 * MIKASA FOOD MENU — dados da carta.
 *
 * Fonte oficial:
 *   PDF       https://cdnm.heyzine.com/files/uploaded/v3/feb582904359a769b33aeb57cabaad24d9028fd6.pdf
 *   Flipbook  https://heyzine.com/flip-book/feb5829043.html
 *
 * Transcrito das páginas 2–5 do menu oficial (imagens enviadas pelo restaurante).
 * Nomes, descrições, porções e preços exatamente como na carta.
 * Blocos repetidos no PDF (sombras de "Samurai Roll" e "Miyamoto Hamachi Roll") foram deduplicados.
 *
 * Tags: a carta não marca tags. Só aplicamos as que o próprio texto da carta declara
 * ("Spicy" no nome, "Veggy" no nome, "Chef Choice" no nome). Validar com o restaurante.
 */

export type MenuTag = "signature" | "picante" | "vegetariano" | "chefs-choice";

export type MenuCategoryId =
  | "entradas"
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
  /** USD. Com `opcoes`, é o menor preço ("desde"). `null` = pendente. */
  preco: number | null;
  porcao: string | null;
  tags: MenuTag[];
  imagem: MediaAsset | null;
  video: MediaAsset | null;
  /** Linha "Choice / Elección" da carta. */
  escolha?: Localized;
  /** Variações com preço próprio (ex.: proteína dos noodles). */
  opcoes?: { titulo: Localized; itens: { nome: Localized; preco: number }[] };
  /** Subitens (ex.: cortes do Omakase Bluefin). */
  componentes?: string[];
  fonte: "pdf" | "briefing";
};

export type MenuCategory = {
  id: MenuCategoryId;
  nome: Localized;
  subtitulo?: Localized;
  nota?: Localized;
  /** Lista exibida junto à nota (ex.: acompanhamentos incluídos). */
  lista?: Localized<string[]>;
  status: "completo" | "parcial" | "pendiente";
};

export const menuCategories: MenuCategory[] = [
  { id: "entradas", nome: { es: "Entradas", en: "Appetizers" }, status: "completo" },
  { id: "sushi-rolls", nome: { es: "Sushi Rolls", en: "Sushi Rolls" }, status: "completo" },
  { id: "itame-special-rolls", nome: { es: "Itame Special Rolls", en: "Itame Special Rolls" }, status: "completo" },
  {
    id: "omakase-experience",
    nome: { es: "Omakase Experience", en: "Omakase Experience" },
    subtitulo: { es: "Nigiri & Sashimi", en: "Nigiri & Sashimi" },
    status: "completo",
  },
  { id: "hamachi-collection", nome: { es: "Hamachi Collection", en: "Hamachi Collection" }, status: "completo" },
  { id: "platos-principales", nome: { es: "Platos Principales", en: "Main Dishes" }, status: "completo" },
  { id: "noodles-vegetables", nome: { es: "Noodles & Vegetables", en: "Noodles & Vegetables" }, status: "completo" },
  {
    id: "robata-steak-house",
    nome: { es: "Japanese Robata Steak House", en: "Japanese Robata Steak House" },
    subtitulo: { es: "La Parrilla · Premium cuts · Authentic fire · Nikkei soul", en: "Premium cuts · Authentic fire · Nikkei soul" },
    nota: { es: "Acompañamientos incluidos", en: "Side dishes included" },
    lista: {
      es: ["Vegetales al wok", "Arroz frito Nikkei", "Puré de papa causa Nikkei", "Papas trufadas", "Papas fritas gratinadas en parmesano"],
      en: ["Vegetables al wok", "Nikkei fried rice", "Potato purée Nikkei causa", "Truffled potatoes", "Parmesan French fries"],
    },
    status: "completo",
  },
  { id: "postres-caseros", nome: { es: "Postres Caseros", en: "Home Made Dessert" }, status: "completo" },
];

/* Helper: nome igual nos dois idiomas, descrição ES/EN da carta. */
function item(
  categoria: MenuCategoryId,
  id: string,
  nome: string | Localized,
  preco: number,
  porcao: string | null,
  en: string,
  es: string,
  extra: Partial<MenuItem> = {},
): MenuItem {
  return {
    id,
    categoria,
    nome: typeof nome === "string" ? { es: nome, en: nome } : nome,
    descricao: { es, en },
    preco,
    porcao,
    tags: [],
    imagem: null,
    video: null,
    fonte: "pdf",
    ...extra,
  };
}

export const menuItems: MenuItem[] = [
  // ── Appetizers / Entradas (p. 2) ──────────────────────────────
  item("entradas", "japanese-tacos", "Japanese Tacos", 27, "2 pc",
    "Nikkei fusion on crispy nori, sushi rice, spicy mayo, avocado, eel sauce and filo strips.",
    "Fusión Nikkei sobre nori crocante, arroz de sushi, spicy mayo, aguacate y salsa de anguila.",
    { escolha: { en: "Choice: Salmon tartare · Tuna tartare · Tomahawk beef", es: "Elección: Tartar de salmón · Tartar de atún · Tomahawk de res" } }),
  item("entradas", "okasuke-ceviche-al-grill", "Okasuke Ceviche al Grill", 37, null,
    "Shrimp, squid, octopus and catch of the day with tiger's milk and aji amarillo.",
    "Camarones, calamar, pulpo y pesca del día con leche de tigre y ají amarillo."),
  item("entradas", "robata-dumplings-asado", "Robata Dumplings Asado", 27, "6 pc",
    "Glazed dumplings with sakura sauce and edamame finished with charred katsuobushi.",
    "Dumplings glaseados en salsa sakura con edamame y katsuobushi al carbón.",
    { escolha: { en: "Choice: Pork or Chicken", es: "Elección: Cerdo o Pollo" } }),
  item("entradas", "duck-button", "Duck Button", 14, "4 pc",
    "Nikkei-style confit duck in the chef's sauce.",
    "Pato confitado estilo Nikkei en la salsa del chef."),
  item("entradas", "glazed-spicy-edamame", "Glazed & Spicy Edamame", 11, null,
    "Glazed edamame in sakura sauce finished with charred katsuobushi. Choice: spicy or not spicy.",
    "Edamames glaseados en salsa sakura con katsuobushi al carbón. Picante / No picante.",
    { tags: ["picante"] }),
  item("entradas", "poke-bowl", "Poke Bowl", 24, null,
    "Wild salmon, tuna tartare, crunchy shrimp, avocado and sushi rice.",
    "Salmón salvaje, tartar de atún, camarones crujientes, aguacate y arroz de sushi."),
  item("entradas", "rock-shrimps", "Rock Shrimps", 22, null,
    "Crispy shrimp with spicy mayo on lettuce and Nikkei guacamole.",
    "Camarones crujientes con salsa spicy mayo sobre lechuga y guacamole Nikkei."),
  item("entradas", "wakame-kuku-salad", "Wakame Kuku Salad", 14, null,
    "Ripe mango, green mango, cucumber and wakame seaweed.",
    "Mango maduro, mango verde, pepino y alga wakame."),
  item("entradas", "gyoza-dumplings", "Gyoza Dumplings", 10, null,
    "Samurai or steamed. Pork or chicken dumplings in the chef's sauce.",
    "Samurai o al vapor. Dumplings de cerdo o pollo, en salsa del chef."),
  item("entradas", "niku-tartar", "Niku Tartar", 38, null,
    "Brangus steak tartare, herb aioli, foie miso yakiniku, egg yolk, anticuchera sauce and charred casabe.",
    "Tartar de res Brangus con alioli de hierbas, foie miso yakiniku, yema de huevo, salsa anticuchera y casabe al carbón."),
  item("entradas", "katakana-tartar", "Katakana Tartar", 22, null,
    "Salmon or tuna tartare with avocado, cream cheese and eel sauce.",
    "Tartar de salmón o atún con aguacate, queso crema y salsa de anguila."),

  // ── Sushi Rolls (p. 3) ────────────────────────────────────────
  item("sushi-rolls", "buba-roll", "Buba Roll", 16, "8 pc",
    "Salmon dynamite, cream cheese and filo strips.",
    "Salmón dinamita, queso crema y filo crocante."),
  item("sushi-rolls", "mikasa-roll", "Mikasa Roll", 15, "8 pc",
    "Shrimp tempura, mixed tartare, spicy mayo and avocado.",
    "Camarón tempura, tartar mixto, mayo picante y aguacate."),
  item("sushi-rolls", "tokio-roll", "Tokio Roll", 14, "8 pc",
    "Shrimp, king crab, quinoa crunch, cream cheese and eel sauce.",
    "Camarón, king crab, quinoa crocante, queso crema y salsa de anguila."),
  item("sushi-rolls", "spicy-tuna-savage-roll", "Spicy Tuna Savage Roll", 15, "8 pc",
    "Spicy tuna with tempura coriander.",
    "Atún picante con cilantro tempura.",
    { tags: ["picante"] }),
  item("sushi-rolls", "mushi-zushi-fried-roll", "Mushi Zushi Fried Roll", 15, null,
    "Shrimp, king crab, avocado, spicy mayo and eel sauce.",
    "Camarón, cangrejo, aguacate, mayo picante y salsa de anguila."),
  item("sushi-rolls", "yasai-veggy-roll", "Yasai Veggy Roll", 14, null,
    "Cucumber, carrot, red cabbage, pepper, avocado and shiitake mushroom.",
    "Pepino, zanahoria, repollo rojo, pimiento, aguacate y hongo shiitake.",
    { tags: ["vegetariano"] }),
  item("sushi-rolls", "novus-guro-roll-acevichado", "Novus Guro Roll Acevichado", 24, null,
    "Tempura shrimp, avocado, mahi mahi sheet in tiger's milk and fish crackling.",
    "Camarón tempura, aguacate, lámina de mahi mahi en leche de tigre y chicharrón de pescado."),
  item("sushi-rolls", "wagyu-osaikobe-prime-beef-roll", "Wagyu Osaikobe Prime Beef Roll", 38, null,
    "Prime beef cured in red wine with ponzu and chimichurri.",
    "Carne prime curada en vino tinto con ponzu y chimichurri."),
  item("sushi-rolls", "hotaro-riceless-roll", "Hotaro Riceless Roll", 27, null,
    "Choice of salmon or tuna, crab snow, avocado and tempura shrimp.",
    "Elección de salmón o atún con nieve de cangrejo, aguacate y camarón tempura."),

  // ── Itame Special Rolls (p. 3) ────────────────────────────────
  item("itame-special-rolls", "takusan-novos-roll", "Takusan Novos Roll", 20, null,
    "Choice of salmon or tuna, avocado and chef special sauce.",
    "Elección de salmón o atún, aguacate y salsa especial del chef."),
  item("itame-special-rolls", "niku-maki-roll", "Niku-Maki Roll", 22, null,
    "Cream cheese, avocado, Prime Brangus beef and chef special sauce.",
    "Queso crema, aguacate, carne Brangus prime y salsa especial del chef."),
  item("itame-special-rolls", "samurai-roll", "Samurai Roll", 18, null,
    "Avocado, cream cheese and chef's sauce.",
    "Aguacate, queso crema y salsa del chef.",
    { escolha: { en: "Choice: Tuna, Salmon or Octopus", es: "Elección: Atún, Salmón o Pulpo" } }),

  // ── Omakase Experience · Nigiri & Sashimi (p. 4) ──────────────
  item("omakase-experience", "nigiri-selection", "Nigiri Selection (Chef Choice)", 17, "2 pc",
    "Fresh nigiri prepared by the chef using premium seasonal fish. Options: tuna or salmon.",
    "Nigiri fresco preparado por el chef con pescado premium de temporada. Opciones: atún o salmón.",
    { tags: ["chefs-choice"] }),
  item("omakase-experience", "omakase-box-nigiri-experience", "Omakase Box Nigiri Experience", 38, "4 pc",
    "Chef curated nigiri selection featuring premium cuts including salmon, tuna, prime beef and octopus.",
    "Selección de nigiri elegida por el chef con cortes premium como salmón, atún, carne prime y pulpo."),
  item("omakase-experience", "sashimi-selection", "Sashimi Selection", 54, "25 pc",
    "Chef selection of fresh sashimi including tuna, salmon, octopus, eel and hamachi.",
    "Selección de sashimi fresco con atún, salmón, pulpo, anguila y hamachi."),
  item("omakase-experience", "gyukazo-tiradito-atun", "Gyukazo Tiradito Atún", 28, null,
    "Thin sliced tuna in ponzu sauce with chalaquita and crunchy quinoa.",
    "Atún laminado con salsa ponzu, chalaquita y quinoa crocante."),
  item("omakase-experience", "omotenashi-tiradito-salmon", "Omotenashi Tiradito Salmón", 30, null,
    "Wild salmon tiradito in ponzu sauce with chalaquita and crunchy quinoa.",
    "Tiradito de salmón salvaje con salsa ponzu, chalaquita y quinoa crocante."),
  item("omakase-experience", "mitoko-tataki", "Mitoko Tataki", 24, "6 pc",
    "Seared tuna or salmon slices served with tomato kichi sauce.",
    "Atún o salmón sellado servido con salsa tomate kichi."),
  item("omakase-experience", "wagyu-tiradito", "Wagyu Tiradito", 36, null,
    "Wagyu with dill, lemon, avocado guacamole and Osaka-style cream cheese sauce.",
    "Wagyu con eneldo, limón, guacamole de aguacate y salsa de queso crema estilo Osaka.",
    { imagem: media.omakase04 }),
  item("omakase-experience", "traditional-nigiri-experience", "Traditional Nigiri Experience", 64, "8 pc",
    "Hamachi, salmon, tuna, Wagyu, eel, prime white fish, white escolar tuna and octopus.",
    "Hamachi, salmón, atún, Wagyu, anguila, pescado blanco prime, atún escolar blanco y pulpo.",
    { imagem: media.omakase02 }),
  item("omakase-experience", "omakase-bluefin-experience", "Omakase Bluefin Experience", 68, null,
    "2 pieces of each: Akami - Otoro - Chutoro.",
    "2 piezas de cada uno: Akami - Otoro - Chutoro.",
    { componentes: ["Akami", "Otoro", "Chutoro"], imagem: media.omakase01 }),

  // ── Hamachi Collection (p. 4) ─────────────────────────────────
  item("hamachi-collection", "oman-tataki-de-hamachi", "Oman Tataki de Hamachi", 32, "4 pc",
    "Fresh fatty Hamachi with togarashi.",
    "Lomo de hamachi fresco con togarashi."),
  item("hamachi-collection", "tokio-tirado-de-hamachi", "Tokio Tirado de Hamachi", 38, "6 slices",
    "Hamachi with fruit criolla, mint, leche de tigre, spicy chili and chef's sauce.",
    "Hamachi con criolla de frutas, menta, leche de tigre, chili picante y salsa del chef."),
  item("hamachi-collection", "miyamoto-hamachi-roll", "Miyamoto Hamachi Roll", 48, "4 pc + 2 nigiri",
    "Tempura shrimp, avocado, flamed Hamachi, lemon drops and anticuchera sauce.",
    "Camarón tempura, aguacate, hamachi flameado, limón y salsa anticuchera.",
    { imagem: media.omakase03 }),
  item("hamachi-collection", "mono-roll-de-hamachi-acevichado", "Mono Roll de Hamachi Acevichado", 34, "4 pc",
    "Cream cheese, avocado and Hamachi with chef's sauce, togarashi and sea salt.",
    "Queso crema, aguacate y hamachi con salsa del chef, togarashi y sal."),
  item("hamachi-collection", "kuzo-nigiri-de-panza-de-hamachi", "Kuzo Nigiri de Panza de Hamachi", 27, "2 pc",
    "Flamed Hamachi belly over ají amarillo, lemon zest and togarashi.",
    "Panza de hamachi flameada sobre ají amarillo, limón y togarashi."),

  // ── Main Dishes / Platos Principales (p. 5) ───────────────────
  item("platos-principales", "pork-ramen", "Pork Ramen", 22, null,
    "Japanese ramen broth with pork slices, fresh noodles, boiled egg, chives and baby corn.",
    "Ramen japonés con cerdo, fideos frescos, huevo cocido, cebollino y baby corn."),
  item("platos-principales", "torikatsu-japanese-chicken", "Torikatsu Japanese Chicken", 24, null,
    "Breaded chicken breast with garlic and panko, accompanied with Nikkei rice or french fries.",
    "Pechuga de pollo empanizada con ajo y panko, acompañada de arroz Nikkei o papas fritas."),
  item("platos-principales", "grand-maison-tokyo-duck-rice", "Grand Maison Tokyo Duck Rice", 38, null,
    "Nikkei fried rice with fresh vegetables, roasted duck, duck demi-glace and truffle oil.",
    "Arroz Nikkei salteado con vegetales frescos, pato asado, demi-glace de pato y aceite de trufa."),
  item("platos-principales", "lomo-saltado-causa-limena", "Lomo Saltado Causa Limeña", 34, null,
    "Flamed Brangus beef tenderloin with sake, sautéed vegetables, avocado causa and criolla salad.",
    "Lomo fino de res Brangus flameado en sake con vegetales salteados, acompañado de causa rellena de aguacate y criolla."),
  item("platos-principales", "nagasaki-beef-nippon-rice", "Nagasaki Beef & Nippon Rice", 32, null,
    "Wok fried rice with Angus beef strips in Nikkei sauce finished with chives.",
    "Arroz salteado al wok con cortes Angus en salsa Nikkei y toque de cebollino."),
  item("platos-principales", "mikayaki-salmon-salvaje", "Mikayaki Salmon Salvaje", 38, null,
    "Wild salmon grilled with Asian salad mix, potato purée and tamarind sauce.",
    "Salmón salvaje al grill con ensalada asiática, puré de papa y salsa de tamarindo."),
  item("platos-principales", "kokoro-lomo-saltado-fried-rice", "Kokoro Lomo Saltado Fried Rice", 32, null,
    "Wok fried rice with pork tenderloin, poached egg and fresh chives.",
    "Arroz frito al wok con lomo de cerdo, huevo pochado y cebollino fresco."),
  item("platos-principales", "japanese-rice", "Japanese Rice", 22, null,
    "Wok-seared Japanese rice with Nikkei flavors and slightly crispy texture.",
    "Arroz japonés salteado al wok con esencia Nikkei y textura ligeramente crocante."),
  item("platos-principales", "general-tsos-chicken", "General Tso's Chicken", 24, null,
    "Crispy chicken breast glazed in General Tso sauce served with steamed rice.",
    "Pechuga de pollo crujiente glaseada en salsa General Tso, servida con arroz al vapor."),

  // ── Noodles & Vegetables (p. 5) ───────────────────────────────
  item("noodles-vegetables", "nikkei-style-wok-noodles", { es: "Wok noodles estilo Nikkei", en: "Nikkei-style wok noodles" }, 14, null,
    "Spice level: mild, medium or spicy.",
    "Nivel de picante: suave, medio o picante.",
    {
      opcoes: {
        titulo: { es: "Añade tu proteína favorita", en: "Add your favorite protein" },
        itens: [
          { nome: { es: "Vegetales", en: "Vegetables" }, preco: 14 },
          { nome: { es: "Pollo", en: "Chicken" }, preco: 18 },
          { nome: { es: "Prime Beef", en: "Prime Beef" }, preco: 22 },
          { nome: { es: "Camarón", en: "Shrimp" }, preco: 25 },
        ],
      },
    }),

  // ── Japanese Robata Steak House / La Parrilla (p. 5) ──────────
  item("robata-steak-house", "satsuma-ribeye-cowboy-cab", "Satsuma Ribeye Cowboy CAB", 54, "24 oz",
    "Juicy ribeye steak grilled to perfection with rich marbling and intense beef flavor.",
    "Ribeye jugoso a la parrilla con marmoleo intenso y sabor profundo."),
  item("robata-steak-house", "matsusaka-ribeye-cab-steak", "Matsusaka Ribeye CAB Steak", 48, "16 oz",
    "Tender ribeye cut with balanced marbling and classic steakhouse flavor.",
    "Ribeye tierno con marmoleo equilibrado y sabor clásico."),
  item("robata-steak-house", "yukon-ribeye-brangus-cap", "Yukon Ribeye Brangus Cap", 58, "20 oz",
    "Premium Brangus ribeye cap grilled over charcoal for bold flavor.",
    "Tapa de ribeye Brangus premium asada al carbón con sabor intenso."),
  item("robata-steak-house", "masako-t-bone-porterhouse", "Masako T-Bone / Porterhouse", 64, "24 oz",
    "Classic porterhouse steak combining tenderloin and striploin in one cut.",
    "Clásico porterhouse que combina filete y striploin en un solo corte."),
  item("robata-steak-house", "magoroku-ny-strip-loin", "Magoroku NY Strip Loin", 48, "12 oz",
    "New York striploin grilled steak with rich flavor and firm texture.",
    "Corte New York a la parrilla con textura firme y sabor intenso."),
  item("robata-steak-house", "tomahawk-steak-brangus", "Tomahawk Steak Brangus", 94, "32 oz",
    "Impressive long bone ribeye grilled to perfection. Juicy, bold and full of character.",
    "Imponente ribeye con hueso largo a la parrilla. Jugoso, intenso y lleno de carácter.",
    { imagem: media.robata01 }),

  // ── Home Made Dessert / Postres Caseros (p. 5) ────────────────
  item("postres-caseros", "home-made-ice-cream-with-mochi", "Home Made Ice Cream with Mochi", 11, null,
    "Please ask your server for your favorite flavor.",
    "Por favor consulte con su mesero por su sabor favorito."),
  item("postres-caseros", "ageta-fried-ice-cream", "Ageta Fried Ice Cream", 15, null,
    "Mochi of your choice with dragon fruit ice cream.",
    "Mochi de su elección con helado de dragon fruit."),
  item("postres-caseros", "home-made-ice-cream", "Home Made Ice Cream", 6, null,
    "Please ask your server for your favorite flavor.",
    "Por favor consulte con su mesero por su sabor favorito."),
  item("postres-caseros", "artesano-dessert", "Artesano Dessert", 14, null,
    "Crunchy wonton filled with banana and Nutella.",
    "Wonton crocante relleno de banana y Nutella."),
];

/**
 * Experiências da seção Omakase da Home (ordem do briefing).
 * `item` aponta para um prato; `categoria` mostra a coleção inteira.
 */
export const omakaseFeatured: ({ item: string } | { categoria: MenuCategoryId; imagem: MediaAsset; descricao: Localized })[] = [
  { item: "omakase-bluefin-experience" },
  { item: "traditional-nigiri-experience" },
  {
    categoria: "hamachi-collection",
    imagem: media.omakase03,
    descricao: {
      es: "Tataki, tiradito, rolls y nigiri de panza de hamachi.",
      en: "Hamachi tataki, tiradito, rolls and belly nigiri.",
    },
  },
  { item: "wagyu-tiradito" },
];

/** Robata — agrupamento exibido na Home (classificação conforme o nome de cada corte na carta). */
export const robataFeatured = "tomahawk-steak-brangus";
export const robataGroups: { id: string; nome: Localized; itens: string[] }[] = [
  { id: "cab", nome: { es: "Cortes CAB", en: "CAB Cuts" }, itens: ["satsuma-ribeye-cowboy-cab", "matsusaka-ribeye-cab-steak"] },
  { id: "brangus", nome: { es: "Cortes Brangus", en: "Brangus Cuts" }, itens: ["yukon-ribeye-brangus-cap", "tomahawk-steak-brangus"] },
  { id: "clasicos", nome: { es: "Clásicos de la parrilla", en: "Steakhouse Classics" }, itens: ["masako-t-bone-porterhouse", "magoroku-ny-strip-loin"] },
];

export const itemsByCategory = (id: MenuCategoryId) => menuItems.filter((i) => i.categoria === id);
export const findItem = (id: string) => menuItems.find((i) => i.id === id);
export const findCategory = (id: MenuCategoryId) => menuCategories.find((c) => c.id === id);
export const minPrice = (id: MenuCategoryId) =>
  Math.min(...itemsByCategory(id).map((i) => i.preco ?? Infinity));
