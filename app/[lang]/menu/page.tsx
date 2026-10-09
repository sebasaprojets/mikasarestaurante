import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuExplorer } from "@/components/menu/menu-explorer";
import { PageHero } from "@/components/sections/page-hero";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import { hasLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/menu">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return buildMetadata({ lang, path: "/menu", title: c.meta.menuTitle, description: c.meta.menuDescription });
}

export default async function MenuPage({ params }: PageProps<"/[lang]/menu">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);
  return (
    <>
      <PageHero
        eyebrow={c.menuPage.eyebrow}
        title={c.menuPage.title}
        intro={c.menuPage.intro}
        kanji="匠"
        original={{ href: site.menus.food.flipbook, label: c.menuPage.original }}
        notice={c.menuPage.notice}
        externalLabel={c.a11y.externalLink}
      />
      <MenuExplorer lang={lang} />
    </>
  );
}
