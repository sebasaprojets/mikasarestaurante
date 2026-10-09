import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { itemsByCategory, menuCategories, minPrice } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { site } from "@/data/site";
import { localePath, type Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Prévia da carta — índice editorial dos capítulos. */
export function MenuPreview({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const menuHref = localePath(lang, "/menu");

  return (
    <section id={sectionIds.menu} className="relative py-[var(--spacing-section)]">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-[var(--spacing-gutter)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index="04" eyebrow={c.menuPreview.eyebrow} title={c.menuPreview.title} />
          <Reveal>
            <p className="mt-8 max-w-[32ch] text-[0.95rem] leading-relaxed text-washi-dim">{c.menuPreview.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button asChild>
                <Link href={menuHref}>{c.menuPreview.cta}</Link>
              </Button>
              <Button asChild variant="link" size="none">
                <a href={site.menus.food.flipbook} target="_blank" rel="noopener noreferrer">
                  {c.menuPreview.original}
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </Button>
            </div>
          </Reveal>
        </div>

        <ol className="border-t border-line lg:col-span-7 lg:col-start-6">
          {menuCategories.map((cat, i) => (
            <li key={cat.id} className="border-b border-line">
              <Reveal delay={i * 0.04} y={16}>
                <Link
                  href={`${menuHref}#${cat.id}`}
                  className="group flex items-center gap-6 py-6 transition-colors duration-700 md:py-7"
                >
                  <span className="w-8 font-sans text-[0.62rem] tracking-[0.3em] text-washi-mute tabular-nums transition-colors duration-700 group-hover:text-ouro">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-display text-[clamp(1.4rem,1.1rem+1.2vw,2.25rem)] font-light text-washi transition-transform duration-1000 ease-[var(--ease-mikasa)] group-hover:translate-x-3">
                    {cat.nome[lang]}
                  </span>
                  <span className="hidden text-right font-sans text-[0.62rem] uppercase tracking-[0.24em] text-washi-mute sm:block">
                    {itemsByCategory(cat.id).length} {itemsByCategory(cat.id).length === 1 ? c.menuPreview.dish : c.menuPreview.dishes}
                    <span className="mt-1 block font-display text-base normal-case tracking-normal text-ouro/90">
                      {c.menuPreview.from} {formatPrice(minPrice(cat.id), lang)}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    strokeWidth={1}
                    className="size-5 -translate-x-2 text-ouro opacity-0 transition-all duration-700 ease-[var(--ease-mikasa)] group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
