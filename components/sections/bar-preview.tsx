import Link from "next/link";
import { MediaFrame } from "@/components/media/media-frame";
import { Reveal } from "@/components/motion/reveal";
import { Tilt } from "@/components/motion/tilt";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { barCategories } from "@/data/bar";
import { getCopy } from "@/data/copy";
import { media } from "@/data/media";
import { site } from "@/data/site";
import { localePath, type Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Prévia do bar — noturno, âmbar, reflexos de vidro discretos. */
export function BarPreview({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const highlights = [
    { asset: media.bar01, label: c.barPreview.highlightWhisky, offset: "lg:mt-24" },
    { asset: media.bar02, label: c.barPreview.highlightSake, offset: "" },
    { asset: media.bar03, label: c.barPreview.highlightMixology, offset: "lg:mt-40" },
  ];

  return (
    <section
      id={sectionIds.bar}
      className="relative isolate overflow-hidden py-[var(--spacing-section)]"
      style={{ background: "linear-gradient(180deg, #0a0a0b 0%, #0f0b08 30%, #120c07 70%, #0a0a0b 100%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[10%] -z-10 size-[60vmax] rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(198,140,60,0.10), transparent 70%)" }}
      />
      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionHeading index="05" eyebrow={c.barPreview.eyebrow} title={c.barPreview.title} kanji="酒" className="lg:col-span-6" />
          <Reveal className="self-end lg:col-span-5 lg:col-start-8" delay={0.15}>
            <p className="text-[0.95rem] leading-relaxed text-washi-dim">{c.barPreview.intro}</p>
            <p className="mt-4 font-display text-lg italic text-ouro-claro">{site.menus.bar.title}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3 lg:gap-12">
          {highlights.map((h, i) => (
            <Reveal key={h.label} delay={i * 0.12} className={h.offset}>
              <Tilt className="aspect-[3/4]">
                <div className="size-full border border-line" data-cursor={c.cursor.open}>
                  <MediaFrame asset={h.asset} lang={lang} kanji="酒" tone="warm" sizes="(min-width:640px) 33vw, 100vw" />
                </div>
              </Tilt>
              <p className="mt-5 font-display text-display-sm text-washi">{h.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 border-t border-line pt-10">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
            {barCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`${localePath(lang, "/bar")}#${cat.id}`}
                  className="inline-flex min-h-10 items-center gap-2 text-sm text-washi-dim transition-colors duration-500 hover:text-ouro-claro"
                >
                  {cat.destaque ? <span aria-hidden className="size-1 rounded-full bg-ouro" /> : null}
                  {cat.nome[lang]}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Button asChild variant="outline">
              <Link href={localePath(lang, "/bar")}>{c.barPreview.cta}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
