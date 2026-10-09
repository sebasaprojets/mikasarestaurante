import { MediaFrame } from "@/components/media/media-frame";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ScrollWords } from "@/components/motion/scroll-words";
import { SectionHeading } from "@/components/sections/section-heading";
import { getCopy } from "@/data/copy";
import { media } from "@/data/media";
import type { Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Filosofía — composição de revista: manifesto revelado palavra a palavra + imagem em parallax. */
export function Philosophy({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  return (
    <section id={sectionIds.philosophy} className="relative py-[var(--spacing-section)] mk-washi">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-[var(--spacing-gutter)] lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 lg:pt-10 xl:col-span-6">
          <SectionHeading index="01" eyebrow={c.philosophy.eyebrow} title={c.philosophy.title} kanji="匠" />
          <ScrollWords
            text={c.philosophy.manifesto}
            className="mt-14 max-w-[34ch] font-display text-[clamp(1.45rem,1.1rem+1.2vw,2.15rem)] font-light leading-[1.4] text-washi"
          />
          <Reveal className="mt-14 flex items-center gap-5">
            <span aria-hidden className="h-px w-14 bg-torii" />
            <span className="font-sans text-[0.68rem] uppercase tracking-[0.32em] text-washi-dim">{c.philosophy.signature}</span>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:col-start-8">
          <Reveal y={40}>
            <Parallax className="aspect-[4/5] w-full" distance={60}>
              <MediaFrame asset={media.philosophy} lang={lang} kanji="匠" sizes="(min-width:1024px) 40vw, 100vw" />
            </Parallax>
          </Reveal>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-display text-lg italic text-washi-dim">{c.philosophy.caption}</span>
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute">{lang === "es" ? "Japón · Perú" : "Japan · Peru"}</span>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/3 hidden -translate-x-full font-jp text-[9rem] leading-none text-ouro/[0.06] [writing-mode:vertical-rl] xl:block"
          >
            匠
          </span>
        </div>
      </div>

      {/* Criolla · Chifa · Nikkei — texto oficial da carta */}
      <div className="mx-auto mt-[clamp(5rem,10vw,9rem)] max-w-[1600px] px-[var(--spacing-gutter)]">
        <ol className="grid gap-px border-y border-line bg-line md:grid-cols-3">
          {c.philosophy.pillars.map((p, i) => (
            <li key={p.name} className="bg-sumi">
              <Reveal delay={i * 0.12} className="flex h-full flex-col p-8 md:p-10 lg:p-12">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-display-sm text-washi">{p.name}</h3>
                  <span className="font-sans text-[0.6rem] tracking-[0.3em] text-ouro tabular-nums">0{i + 1}</span>
                </div>
                <span aria-hidden className={`mt-5 block h-px w-10 ${p.name === "Nikkei" ? "bg-torii" : "bg-ouro/60"}`} />
                <p className="mt-6 text-sm leading-relaxed text-washi-dim">{p.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
