import { localePath, type Locale } from "@/lib/i18n";
import type { Copy } from "@/data/copy";

export type NavItem = { key: string; label: string; href: string };

export const sectionIds = {
  philosophy: "filosofia",
  omakase: "omakase",
  robata: "robata",
  menu: "carta",
  bar: "bar",
  gallery: "galeria",
  recognition: "reconocimientos",
  reservation: "reservas",
  location: "ubicacion",
} as const;

export const homeAnchor = (lang: Locale, id: string) => `${localePath(lang, "/")}#${id}`;

export function getNav(lang: Locale, c: Copy): NavItem[] {
  return [
    { key: "philosophy", label: c.nav.philosophy, href: homeAnchor(lang, sectionIds.philosophy) },
    { key: "omakase", label: c.nav.omakase, href: homeAnchor(lang, sectionIds.omakase) },
    { key: "robata", label: c.nav.robata, href: homeAnchor(lang, sectionIds.robata) },
    { key: "menu", label: c.nav.menu, href: localePath(lang, "/menu") },
    { key: "bar", label: c.nav.bar, href: localePath(lang, "/bar") },
    { key: "location", label: c.nav.location, href: homeAnchor(lang, sectionIds.location) },
  ];
}
