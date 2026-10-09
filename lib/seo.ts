import type { Metadata } from "next";
import { site, weekdays } from "@/data/site";
import { localePath, locales, ogLocale, type Locale } from "@/lib/i18n";

export const siteUrl = site.url.replace(/\/$/, "");

/** alternates.languages com hreflang para ES, EN e x-default. */
export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
    "x-default": localePath("es", path),
  };
}

export function buildMetadata({
  lang,
  path,
  title,
  description,
}: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = localePath(lang, path);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: site.fullName,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const schemaDay: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function restaurantJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${siteUrl}/#restaurant`,
    name: site.fullName,
    url: `${siteUrl}${localePath(lang, "/")}`,
    image: `${siteUrl}/opengraph-image`,
    telephone: site.phone.e164,
    servesCuisine: [...site.servesCuisine],
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    acceptsReservations: true,
    menu: `${siteUrl}${localePath(lang, "/menu")}`,
    hasMenu: [
      `${siteUrl}${localePath(lang, "/menu")}`,
      `${siteUrl}${localePath(lang, "/bar")}`,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: site.address.countryCode,
    },
    hasMap: site.maps.url,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: weekdays.filter((d) => site.hours.open.includes(d)).map((d) => schemaDay[d]),
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    award: site.awards.map((a) => `${a.name} ${a.year}`),
    sameAs: [site.social.instagram.url, site.social.threads.url],
  };
}
