import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui/button";

/** Cabeçalho das páginas internas (/menu, /bar). */
export function PageHero({
  eyebrow,
  title,
  intro,
  kanji,
  original,
  notice,
  externalLabel,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  kanji: string;
  original: { href: string; label: string };
  notice: string;
  externalLabel: string;
  tone?: "neutral" | "warm";
}) {
  return (
    <section
      className="relative overflow-hidden pb-16 pt-[calc(var(--header-h)+clamp(4rem,10vh,8rem))]"
      style={
        tone === "warm"
          ? { background: "radial-gradient(70% 80% at 80% 0%, rgba(198,140,60,0.10), transparent 70%)" }
          : undefined
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-[var(--spacing-gutter)] top-[calc(var(--header-h)+2rem)] font-jp text-[clamp(7rem,18vw,16rem)] leading-none text-ouro/[0.06]"
      >
        {kanji}
      </span>
      <div className="relative mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        <Reveal className="mb-7 flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-ouro/70" />
          <span className="mk-eyebrow">{eyebrow}</span>
        </Reveal>
        <SplitText as="h1" text={title} className="max-w-[18ch] font-display text-display-xl font-light text-washi" />
        <Reveal delay={0.3} className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[44ch] text-[0.95rem] leading-relaxed text-washi-dim">{intro}</p>
          <Button asChild variant="outline">
            <a href={original.href} target="_blank" rel="noopener noreferrer">
              {original.label} <ArrowUpRight className="size-4" strokeWidth={1.25} aria-hidden />
              <span className="sr-only"> {externalLabel}</span>
            </a>
          </Button>
        </Reveal>
        <Reveal delay={0.45}>
          <p className="mt-12 flex items-start gap-3 border-l border-torii/70 pl-4 text-xs leading-relaxed text-washi-mute md:max-w-[70ch]">
            {notice}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
