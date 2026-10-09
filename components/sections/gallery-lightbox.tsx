"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { ratioCls } from "@/components/sections/gallery-ratio";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCopy } from "@/data/copy";
import { gallery } from "@/data/media";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Lightbox da galeria — carregado sob demanda (next/dynamic). */
export function GalleryLightbox({
  lang,
  index,
  dir,
  onClose,
  go,
}: {
  lang: Locale;
  index: number | null;
  dir: number;
  onClose: () => void;
  go: (step: number) => void;
}) {
  const c = getCopy(lang);
  const open = index !== null;
  const current = index !== null ? gallery[index] : null;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
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
  );
}
