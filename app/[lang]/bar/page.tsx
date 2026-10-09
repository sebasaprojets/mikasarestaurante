import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarExplorer } from "@/components/bar/bar-explorer";
import { PageHero } from "@/components/sections/page-hero";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import { hasLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/bar">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return buildMetadata({ lang, path: "/bar", title: c.meta.barTitle, description: c.meta.barDescription });
}

export default async function BarPage({ params }: PageProps<"/[lang]/bar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);
  return (
    <>
      <PageHero
        eyebrow={c.barPage.eyebrow}
        title={c.barPage.title}
        intro={c.barPage.intro}
        kanji="酒"
        tone="warm"
        original={{ href: site.menus.bar.flipbook, label: c.barPage.original }}
        notice={c.barPage.notice}
        externalLabel={c.a11y.externalLink}
      />
      <BarExplorer lang={lang} />
    </>
  );
}
