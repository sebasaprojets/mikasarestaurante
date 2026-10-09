import { Cormorant_Garamond, Manrope, Shippori_Mincho } from "next/font/google";

/** Display — títulos, frases de impacto, números importantes. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Texto — navegação, descrições, botões, formulários. */
export const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

/** Acentos japoneses — uso discreto (匠 炎 酒). Sem preload: glifos sob demanda. */
export const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});
