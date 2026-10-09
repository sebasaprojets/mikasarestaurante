import { Cormorant_Garamond, Manrope } from "next/font/google";
import localFont from "next/font/local";

/**
 * Display — títulos, frases de impacto, números importantes.
 * Fonte variável (1 arquivo por estilo cobre 300–500) e só o subset latino,
 * que já inclui todos os acentos do espanhol (á é í ó ú ñ ¿ ¡).
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Texto — navegação, descrições, botões, formulários. */
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

/**
 * Acentos japoneses — Shippori Mincho com apenas os 3 kanji usados no site
 * (匠 炎 酒), 1,5 KB, em vez da fonte japonesa inteira (~120 arquivos).
 * Para adicionar um kanji novo, gere o subset de novo (Google Fonts `&text=`).
 */
export const shippori = localFont({
  src: "../styles/fonts/shippori-mincho-kanji.woff2",
  weight: "400",
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});
