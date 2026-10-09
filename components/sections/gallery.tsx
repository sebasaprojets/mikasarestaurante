"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { MaskReveal } from "@/components/motion/mask-reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCopy } from "@/data/copy";
import { gallery } from "@/data/media";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ratioCls = { portrait: "aspect-[3/4]", landscape: "aspect-[3/2]", square: "aspect-square" } as const;

/** Galeria editorial (masonry) com lightbox. */
export function Gallery({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const open = index !== null;
  const current = index !== null ? gallery[index] : null;

  const go = useCallback(
    (step: number) => {
      setDir(step);
      setIndex((i) => (i === null ? i : (i + step + gallery.length) % gallery.length));
    },
    [],
  );

  return (
    <section id={sectionIds.gallery} className="relative py-[var(--spacing-section)]">
      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        <SectionHeading index="06" eyebrow={c.gallery.eyebrow} title={c.gallery.title} />

        <ul className="mt-20 columns-1 gap-6 sm:columns-2 lg:columns-3 lg:gap-8">
          {gallery.map((item, i) => (
            <li key={item.asset.id} className="mb-6 break-inside-avoid lg:mb-8">
              <button
                type="button"
                onClick={() => {
                  setDir(1);
                  setIndex(i);
                }}
                className="group block w-full text-left"
                data-cursor={c.cursor.open}
                aria-label={`${c.gallery.categories[item.category]} — ${item.asset.alt[lang]}`}
              >
                <MaskReveal className={cn("relative w-full", ratioCls[item.ratio])} delay={(i % 3) * 0.08}>
                  <div className="size-full transition-transform duration-[1400ms] ease-[var(--ease-mikasa)] group-hover:scale-[1.03]">
                    <MediaFrame asset={item.asset} lang={lang} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
                  </div>
                </MaskReveal>
                <span className="mt-3 flex items-center justify-between">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute transition-colors duration-500 group-hover:text-ouro">
                    {c.gallery.categories[item.category]}
                  </span>
                  <span className="font-sans text-[0.6rem] tracking-[0.3em] text-washi-mute tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={(v) => !v && setIndex(null)}>
        <DialogContent
          closeLabel={c.a11y.close}
          className="w-[min(100vw-1rem,80rem)] border-none bg-transparent"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          {current ? (
            <div className="relative">
              <DialogTitle className="sr-only">{current.asset.alt[lang]}</DialogTitle>
              <DialogDescription className="sr-only">{c.gallery.categories[current.category]}</DialogDescription>
              <div className={cn("relative mx-auto max-h-[80svh] overflow-hidden", ratioCls[current.ratio], current.ratio === "portrait" ? "w-[min(100%,60svh)]" : "w-full")}>
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={current.asset.id}
                    className="absolute inset-0"
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <MediaFrame asset={current.asset} lang={lang} sizes="90vw" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4 px-1">
                <p className="font-display text-lg italic text-washi-dim">{current.asset.alt[lang]}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => go(-1)} aria-label={c.a11y.previous} className="grid size-11 place-items-center border border-line text-washi hover:border-ouro hover:text-ouro-claro">
                    <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                  <span className="w-14 text-center font-sans text-[0.65rem] tracking-[0.2em] text-washi-mute tabular-nums">
                    {String((index ?? 0) + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                  </span>
                  <button type="button" onClick={() => go(1)} aria-label={c.a11y.next} className="grid size-11 place-items-center border border-line text-washi hover:border-ouro hover:text-ouro-claro">
                    <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
