"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { MediaFrame } from "@/components/media/media-frame";
import { MaskReveal } from "@/components/motion/mask-reveal";
import { ratioCls } from "@/components/sections/gallery-ratio";
import { SectionHeading } from "@/components/sections/section-heading";
import { getCopy } from "@/data/copy";
import { gallery } from "@/data/media";
import type { Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";


const GalleryLightbox = dynamic(() => import("@/components/sections/gallery-lightbox").then((m) => m.GalleryLightbox), { ssr: false });

/** Galeria editorial (masonry) com lightbox. */
export function Gallery({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [opened, setOpened] = useState(false);

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
                  setOpened(true);
                }}
                className="group block w-full text-left"
                data-cursor={c.cursor.open}
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

      {/* lightbox carregado só no primeiro clique (menos JavaScript na Home) */}
      {opened ? <GalleryLightbox lang={lang} index={index} dir={dir} onClose={() => setIndex(null)} go={go} /> : null}
    </section>
  );
}
