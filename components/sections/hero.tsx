"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MediaFrame } from "@/components/media/media-frame";
import { CircularText } from "@/components/motion/circular-text";
import { SplitText } from "@/components/motion/split-text";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { media } from "@/data/media";
import { localePath, type Locale } from "@/lib/i18n";
import { useIntroReady } from "@/lib/hooks/use-intro-ready";
import { EASE } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";

export function Hero({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const asset = media.heroLoop.available ? media.heroLoop : media.heroPoster;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.2, ease: EASE, delay },
  });

  return (
    <section ref={ref} id="inicio" aria-label="MIKASA" className="relative h-[100svh] min-h-[600px] overflow-hidden bg-sumi">
      {/* Mídia */}
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : y }}>
        <MediaFrame asset={asset} lang={lang} priority kenBurns kanji="匠" sizes="100vw" labelClassName="bottom-auto top-[calc(var(--header-h)+1.25rem)] max-w-[60%] md:left-auto md:items-end md:text-right" />
        {/* Luz ambiente — muito lenta, apenas atmosfera */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[38%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 motion-safe:animate-[drift_22s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(closest-side, rgba(198,161,91,0.10), transparent 70%)" }}
        />
      </motion.div>

      {/* Véus para legibilidade */}
      <div aria-hidden className="absolute inset-0 bg-sumi/35" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-sumi via-sumi/70 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sumi/80 to-transparent" />

      <motion.div
        style={{ opacity: reduce ? 1 : fade }}
        className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-[var(--spacing-gutter)] pb-[clamp(5.5rem,12vh,9rem)]"
      >
        <motion.p className="mk-eyebrow mb-7 flex items-center gap-4" {...fadeUp(0.05)}>
          <span aria-hidden className="h-px w-10 bg-ouro" />
          {c.hero.eyebrow}
        </motion.p>

        <SplitText
          as="h1"
          text={c.hero.headline}
          play={ready}
          delay={0.15}
          className="max-w-[20ch] font-display text-display-xl font-light text-washi"
        />

        <motion.div className="mt-11 flex flex-wrap items-center gap-x-9 gap-y-5" {...fadeUp(0.9)}>
          <Button asChild size="lg">
            <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.hero.primary}</SmartLink>
          </Button>
          <Button asChild variant="link" size="none">
            <SmartLink href={localePath(lang, "/menu")}>{c.hero.secondary}</SmartLink>
          </Button>
        </motion.div>
      </motion.div>

      {/* Selo Restaurant Guru */}
      <motion.div
        className="absolute right-[var(--spacing-gutter)] top-[calc(var(--header-h)+1.5rem)] text-ouro md:bottom-[clamp(5.5rem,12vh,9rem)] md:top-auto"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE, delay: 1.1 }}
      >
        <CircularText
          text={c.hero.badge}
          label="Restaurant Guru 2023, 2024, 2025, 2026"
          className="size-24 md:size-36 lg:size-40"
          center={<span className="font-display text-lg italic text-ouro-claro md:text-2xl">IV</span>}
        />
      </motion.div>

      {/* Indicador de scroll */}
      <div aria-hidden className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
        <span className="font-sans text-[0.58rem] uppercase tracking-[0.36em] text-washi-mute">{c.hero.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-line">
          <span className="mk-scroll-line absolute inset-0 bg-ouro" />
        </span>
      </div>
    </section>
  );
}
