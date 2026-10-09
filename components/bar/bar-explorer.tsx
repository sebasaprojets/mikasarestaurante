"use client";

import { ArrowUpRight } from "lucide-react";
import { CategoryTabs, useScrollSpy } from "@/components/menu/menu-explorer";
import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { Button } from "@/components/ui/button";
import { barCategories, barItemsByCategory } from "@/data/bar";
import { getCopy } from "@/data/copy";
import { media } from "@/data/media";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

export function BarExplorer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const b = c.barPage;
  const scrollTo = useScrollTo();
  const ids = barCategories.map((x) => x.id);
  const [active, setActive] = useScrollSpy(ids);

  const featured = [
    { id: "whisky-japones", asset: media.bar01, label: c.barPreview.highlightWhisky },
    { id: "sake", asset: media.bar02, label: c.barPreview.highlightSake },
  ];

  return (
    <div className="relative isolate">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,#0f0a07_20%,#0f0a07_80%,transparent)]" />

      <CategoryTabs
        tabs={barCategories.map((x) => ({ id: x.id, label: x.nome[lang] }))}
        active={active}
        onSelect={(id) => {
          setActive(id);
          const el = document.getElementById(id);
          if (el) scrollTo(el, -140);
        }}
        label="Bar"
      />

      {/* Destaques: whisky japonês e sake */}
      <div className="mx-auto grid max-w-[1600px] gap-10 px-[var(--spacing-gutter)] py-20 md:grid-cols-2 md:gap-14">
        {featured.map((f, i) => (
          <Reveal key={f.id} delay={i * 0.12} className={i === 1 ? "md:mt-24" : ""}>
            <a
              href={`#${f.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(f.id);
                if (el) scrollTo(el, -140);
              }}
              className="group block"
              data-cursor={c.cursor.open}
            >
              <Tilt className="aspect-[4/5]">
                <div className="size-full border border-line">
                  <MediaFrame asset={f.asset} lang={lang} kanji="酒" tone="warm" sizes="(min-width:768px) 50vw, 100vw" />
                </div>
              </Tilt>
              <span className="mt-6 flex items-baseline justify-between">
                <span className="font-display text-display-sm text-washi transition-colors duration-500 group-hover:text-ouro-claro">{f.label}</span>
                <span className="mk-eyebrow">{b.featured}</span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)] pb-[var(--spacing-section)]">
        {barCategories.map((cat, gi) => {
          const items = barItemsByCategory(cat.id);
          return (
            <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-40 border-t border-line py-14 md:py-20">
              <div className="grid gap-8 lg:grid-cols-12">
                <header className="lg:col-span-4">
                  <span className="font-sans text-[0.62rem] tracking-[0.3em] text-washi-mute tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                  <h2 id={`${cat.id}-title`} className="mt-3 flex items-center gap-4 font-display text-display-sm text-washi md:text-display-md">
                    {cat.nome[lang]}
                    {cat.destaque ? <span aria-hidden className="font-jp text-base text-ouro/60">酒</span> : null}
                  </h2>
                </header>
                <div className="lg:col-span-8">
                  {items.length ? (
                    <ul className="border-t border-line">
                      {items.map((it) => (
                        <li key={it.id} className="flex flex-col gap-2 border-b border-line py-6 md:flex-row md:items-baseline md:justify-between">
                          <div>
                            <h3 className="font-display text-xl text-washi">{it.nome[lang]}</h3>
                            {it.origem ? <p className="mt-1 text-xs uppercase tracking-[0.2em] text-washi-mute">{it.origem}</p> : null}
                            {it.descricao ? <p className="mt-2 max-w-[55ch] text-sm text-washi-dim">{it.descricao[lang]}</p> : null}
                          </div>
                          <dl className="flex gap-6">
                            {it.precos.map((p) => (
                              <div key={p.formato.es} className="text-right">
                                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-washi-mute">{p.formato[lang]}</dt>
                                <dd className="font-display text-lg text-ouro tabular-nums">{formatPrice(p.valor, lang)}</dd>
                              </div>
                            ))}
                          </dl>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-start gap-5 border border-dashed border-line-strong p-7">
                      <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">Placeholder</span>
                      <p className="text-sm text-washi-dim">{b.pendingCategory}</p>
                      <Button asChild variant="link" size="none">
                        <a href={site.menus.bar.flipbook} target="_blank" rel="noopener noreferrer">
                          {b.original} <ArrowUpRight className="size-3.5" strokeWidth={1.25} aria-hidden />
                          <span className="sr-only"> {c.a11y.externalLink}</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
