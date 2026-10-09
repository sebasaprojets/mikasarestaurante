import type { MetadataRoute } from "next";
import { localePath, locales } from "@/lib/i18n";
import { languageAlternates, siteUrl } from "@/lib/seo";

const paths = ["/", "/menu", "/bar"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${siteUrl}${localePath(lang, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(path)).map(([k, v]) => [k, `${siteUrl}${v}`]),
        ),
      },
    })),
  );
}
