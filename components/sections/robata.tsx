import Link from "next/link";
import { Embers } from "@/components/effects/embers";
import { MediaFrame } from "@/components/media/media-frame";
import { MaskReveal } from "@/components/motion/mask-reveal";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { findItem, robataGroups } from "@/data/menu";
import { localePath, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { sectionIds } from "@/lib/nav";

/** Japanese Robata Steak House — mudança de atmosfera: mais quente, mais escura, âmbar. */
export function Robata({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const tomahawk = findItem("tomahawk-brangus");
  const price = tomahawk ? formatPrice(tomahawk.preco, lang) : null;

  return (
    <section
      id={sectionIds.robata}
      className="relative isolate overflow-hidden py-[var(--spacing-section)]"
      style={{ background: "linear-gradient(180deg, #0a0a0b 0%, #120a06 18%, #160c06 60%, #0a0a0b 100%)" }}
    >
      {/* Brasa ao fundo + textura de carvão */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] opacity-90 motion-safe:animate-[drift_14s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(60% 55% at 50% 100%, rgba(217,119,43,0.20), rgba(168,50,42,0.06) 45%, transparent 75%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 mk-washi opacity-60" />
      <Embers className="-z-10" />

      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionHeading index="03" eyebrow={c.robata.eyebrow} title={c.robata.title} kanji="炎" className="lg:col-span-7" />
          <Reveal className="self-end lg:col-span-4 lg:col-start-9" delay={0.2}>
            <p className="font-display text-xl italic text-ouro-claro md:text-2xl">{c.robata.tagline}</p>
          </Reveal>
        </div>

        {/* Destaque — Tomahawk */}
        {tomahawk ? (
          <div className="mt-20 grid items-end gap-10 lg:mt-28 lg:grid-cols-12">
            <MaskReveal className="relative aspect-[4/3] lg:col-span-8">
              <div data-cursor={c.cursor.view} className="size-full">
                <MediaFrame asset={tomahawk.imagem} lang={lang} kanji="炎" tone="warm" sizes="(min-width:1024px) 66vw, 100vw" />
              </div>
            </MaskReveal>
            <Reveal className="lg:col-span-4 lg:pb-6" delay={0.15}>
              <p className="mk-eyebrow">{c.robata.featured}</p>
              <h3 className="mt-5 font-display text-display-md text-washi">{tomahawk.nome[lang]}</h3>
              <p className="mt-2 font-display text-[clamp(3rem,2rem+4vw,5.5rem)] font-light leading-none text-ouro">
                {tomahawk.porcao}
              </p>
              <p className="mt-6 max-w-[34ch] text-sm leading-relaxed text-washi-dim">{tomahawk.descricao?.[lang]}</p>
              <p className="mt-5 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-washi-mute">
                {price ?? c.menuPage.pendingPrice}
              </p>
            </Reveal>
          </div>
        ) : null}

        {/* Cortes CAB · Brangus · Acompanhamentos */}
        <div className="mt-24 grid gap-px border border-[rgba(217,119,43,0.18)] bg-[rgba(217,119,43,0.18)] md:grid-cols-3">
          {robataGroups.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.1} className="bg-[#100906] p-8 md:p-10">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-display-sm text-washi">{g.nome[lang]}</h3>
                <span className="font-sans text-[0.6rem] tracking-[0.3em] text-brasa/80 tabular-nums">0{i + 1}</span>
              </div>
              {g.itens.length ? (
                <ul className="mt-6 space-y-2 text-sm text-washi-dim">
                  {g.itens.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm leading-relaxed text-washi-mute">{c.robata.pendingGroup}</p>
              )}
              {g.id === "acompanamientos" ? (
                <p className="mt-6 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ouro">{c.robata.sides}</p>
              ) : null}
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <Button asChild variant="link" size="none">
            <Link href={`${localePath(lang, "/menu")}#robata-steak-house`}>{c.robata.cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
