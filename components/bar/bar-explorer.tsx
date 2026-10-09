"use client";

import { CategoryTabs, useScrollSpy } from "@/components/menu/menu-explorer";
import { Reveal } from "@/components/motion/reveal";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { barCategories, barItemsByCategory, barPromos, type BarCategory, type BarItem } from "@/data/bar";
import { getCopy } from "@/data/copy";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Promoções vigentes (artes do restaurante). */
export function BarPromos({ lang, className }: { lang: Locale; className?: string }) {
  return (
    <ul className={cn("grid gap-px border border-line bg-line md:grid-cols-3", className)}>
      {barPromos.map((p, i) => (
        <li key={p.id} className="bg-[#0d0908]">
          <Reveal delay={i * 0.1} className="flex h-full flex-col p-7 md:p-9">
            <span className="flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">
              <span aria-hidden className="h-px w-6 bg-torii" />
              {p.dias[lang]}
            </span>
            <h3 className="mt-5 font-display text-display-sm text-washi">{p.titulo[lang]}</h3>
            <p className="mt-2 font-display text-lg italic text-ouro-claro">{p.destaque[lang]}</p>
            <p className="mt-4 text-sm leading-relaxed text-washi-dim">{p.texto[lang]}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

function CocktailCard({ item, cat, lang }: { item: BarItem; cat: BarCategory; lang: Locale }) {
  const price = formatPrice(item.preco ?? cat.precoUnico ?? null, lang);
  return (
    <li className="group relative flex flex-col border border-line bg-sumi/60 p-6 transition-colors duration-700 hover:border-line-strong md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[clamp(1.35rem,1.15rem+0.6vw,1.75rem)] leading-tight text-washi transition-colors duration-500 group-hover:text-ouro-claro">
          {item.nome}
        </h3>
        {item.preco != null && price ? <span className="shrink-0 font-display text-xl text-ouro tabular-nums">{price}</span> : null}
      </div>
      <span aria-hidden className="mt-4 block h-px w-8 bg-torii/80" />
      {item.descricao ? <p className="mt-4 text-sm leading-relaxed text-washi-dim">{item.descricao[lang]}</p> : null}
    </li>
  );
}

function ListRow({ item, lang }: { item: BarItem; lang: Locale }) {
  return (
    <li className="border-b border-line py-5">
      <div className="flex items-baseline">
        <h3 className="font-display text-[clamp(1.15rem,1rem+0.5vw,1.45rem)] leading-snug text-washi">
          {item.nome}
          {item.volume ? <span className="ml-3 font-sans text-[0.66rem] tracking-[0.18em] text-washi-mute">{item.volume}</span> : null}
        </h3>
        <span aria-hidden className="mk-leader hidden sm:block" />
        <span className="ml-auto shrink-0 whitespace-nowrap pl-4 font-display text-lg text-ouro tabular-nums sm:ml-0 sm:pl-0">
          {formatPrice(item.preco, lang)}
        </span>
      </div>
      {item.descricao ? <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-washi-dim">{item.descricao[lang]}</p> : null}
    </li>
  );
}

export function BarExplorer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const b = c.barPage;
  const scrollTo = useScrollTo();
  const ids = barCategories.map((x) => x.id);
  const [active, setActive] = useScrollSpy(ids);

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

      {/* Promoções */}
      <section aria-labelledby="bar-promos" className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)] pt-16 md:pt-20">
        <h2 id="bar-promos" className="mk-eyebrow mb-8 flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-ouro/70" />
          {b.promos}
        </h2>
        <BarPromos lang={lang} />
      </section>

      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)] pb-[var(--spacing-section)] pt-10">
        {barCategories.map((cat, gi) => {
          const items = barItemsByCategory(cat.id);
          const cards = cat.grupo === "cocteles";
          return (
            <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-40 border-t border-line py-14 first:border-t-0 md:py-20">
              <div className={cn("grid gap-8", !cards && "lg:grid-cols-12")}>
                <header className={cn(!cards ? "lg:col-span-4" : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between")}>
                  <div>
                    <span className="font-sans text-[0.62rem] tracking-[0.3em] text-washi-mute tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                    <h2 id={`${cat.id}-title`} className="mt-3 flex items-center gap-4 font-display text-display-md font-light text-washi">
                      {cat.nome[lang]}
                      {cat.destaque ? <span aria-hidden className="font-jp text-base text-ouro/60">酒</span> : null}
                    </h2>
                    {cat.subtitulo ? <p className="mt-3 font-display text-lg italic text-ouro-claro/90">{cat.subtitulo[lang]}</p> : null}
                    {cat.nota ? <p className="mt-3 max-w-[52ch] text-xs leading-relaxed text-washi-mute">{cat.nota[lang]}</p> : null}
                  </div>
                  {cat.precoUnico ? (
                    <p className="font-display text-3xl text-ouro tabular-nums md:text-right">
                      {formatPrice(cat.precoUnico, lang)}
                      <span className="ml-2 font-sans text-[0.6rem] uppercase tracking-[0.24em] text-washi-mute">{b.each}</span>
                    </p>
                  ) : null}
                </header>

                <div className={cn(!cards && "lg:col-span-8")}>
                  {cards ? (
                    <ul className={cn("grid gap-4 sm:grid-cols-2", items.length >= 4 && "xl:grid-cols-4", items.length === 3 && "lg:grid-cols-3")}>
                      {items.map((it) => (
                        <CocktailCard key={it.id} item={it} cat={cat} lang={lang} />
                      ))}
                    </ul>
                  ) : (
                    <ul className="border-t border-line">
                      {items.map((it) => (
                        <ListRow key={it.id} item={it} lang={lang} />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })}
        <p className="mt-6 text-center text-xs text-washi-mute">{b.responsibly}</p>
      </div>
    </div>
  );
}
