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
 * Espanhol (padrão) vive sem prefixo: `/menu`.
 * Inglês vive em `/en`: `/en/menu`.
 */
export function localePath(lang: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

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
