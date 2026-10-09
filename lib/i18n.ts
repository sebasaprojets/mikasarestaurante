export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/** Texto com versão em cada idioma suportado. */
export type Localized<T = string> = Record<Locale, T>;

export const localeLabels: Record<Locale, string> = { es: "ES", en: "EN" };
export const htmlLang: Record<Locale, string> = { es: "es-DO", en: "en" };
export const ogLocale: Record<Locale, string> = { es: "es_DO", en: "en_US" };

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Com servidor (Vercel): espanhol (padrão) vive sem prefixo (`/menu`, via proxy.ts)
 * e inglês em `/en/menu`.
 * Em exportação estática (GitHub Pages) não há proxy: todos os idiomas usam prefixo.
 */
const prefixDefault = process.env.NEXT_PUBLIC_PREFIX_DEFAULT_LOCALE === "true";

export function localePath(lang: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale && !prefixDefault) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Prefixo do site quando publicado em subpasta (ex.: GitHub Pages). */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Para <a>, <video> e next/image (que não aplicam o basePath sozinhos). */
export const withBasePath = (path: string) => (path.startsWith("/") ? `${basePath}${path}` : path);

/** Remove o prefixo de idioma de um pathname. */
export function stripLocale(pathname: string): string {
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}

export function t<T>(value: Localized<T>, lang: Locale): T {
  return value[lang];
}
