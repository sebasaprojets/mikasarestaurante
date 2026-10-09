"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MediaFrame } from "@/components/media/media-frame";
import { SmartLink } from "@/components/layout/smart-link";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { findCategory, findItem, minPrice, omakaseFeatured } from "@/data/menu";
import type { MediaAsset } from "@/data/media";
import { localePath, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  nome: string;
  descricao: string | null;
  componentes?: string[];
  porcao?: string | null;
  price: string | null;
  imagem: MediaAsset | null;
};

function toFeatures(lang: Locale): Feature[] {
  const c = getCopy(lang);
  return omakaseFeatured.flatMap((f): Feature[] => {
    if ("item" in f) {
      const it = findItem(f.item);
      if (!it) return [];
      return [{ id: it.id, nome: it.nome[lang], descricao: it.descricao?.[lang] ?? null, componentes: it.componentes, porcao: it.porcao, price: formatPrice(it.preco, lang), imagem: it.imagem }];
    }
    const cat = findCategory(f.categoria);
    if (!cat) return [];
    const from = formatPrice(minPrice(f.categoria), lang);
    return [{ id: cat.id, nome: cat.nome[lang], descricao: f.descricao[lang], price: from ? `${c.menuPage.from} ${from}` : null, imagem: f.imagem }];
  });
}

function Card({ item, index, lang }: { item: Feature; index: number; lang: Locale }) {
  const c = getCopy(lang);
  return (
    <article className="group flex w-[82vw] shrink-0 snap-start flex-col sm:w-[58vw] md:w-[min(30rem,34vw)]">
      <Link
        href={`${localePath(lang, "/menu")}#${item.id === "hamachi-collection" ? "hamachi-collection" : "omakase-experience"}`}
        className="relative block aspect-[4/5] w-full overflow-hidden md:aspect-auto md:h-[min(56vh,34rem)]"
        data-cursor={c.cursor.view}
        aria-label={`${item.nome} — ${c.cursor.view}`}
      >
        <div className="size-full transition-transform duration-[1400ms] ease-[var(--ease-mikasa)] group-hover:scale-[1.04]">
          <MediaFrame asset={item.imagem} lang={lang} kanji="匠" sizes="(min-width:768px) 34vw, 82vw" />
        </div>
      </Link>
      <div className="mt-6 flex items-baseline gap-4">
        <span className="font-sans text-[0.62rem] tracking-[0.3em] text-ouro tabular-nums">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display text-display-sm text-washi">{item.nome}</h3>
      </div>
      {item.componentes?.length ? (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 pl-9">
          {item.componentes.map((p) => (
            <li key={p} className="font-display text-lg italic text-ouro-claro">
              {p}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 max-w-[38ch] pl-9 text-sm leading-relaxed text-washi-dim">
        {item.descricao ?? <span className="text-washi-mute">{c.menuPage.pendingDescription}</span>}
      </p>
      <p className="mt-4 flex items-baseline gap-4 pl-9 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-washi-mute">
        {item.porcao ? <span>{item.porcao}</span> : null}
        <span className="font-display text-xl normal-case tracking-normal text-ouro">{item.price ?? c.menuPage.pendingPrice}</span>
      </p>
    </article>
  );
}

/** Omakase — seção assinatura com scroll horizontal fixado (desktop) e carrossel nativo (mobile). */
export function Omakase({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const items = toFeatures(lang);
  const desktop = useMediaQuery("(min-width: 768px)");
  // scroll horizontal fixado é controlado pelo próprio scroll da pessoa → mantido também com reduced motion
  const pinned = desktop;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const track = trackRef.current;
      if (track) setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Lenis já suaviza o scroll; sem mola extra (evita atraso)
  const smooth = scrollYProgress;
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  const intro = (
    <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-center sm:w-[58vw] md:w-[min(34rem,38vw)] md:pr-10">
      <div className="mb-7 flex items-center gap-4">
        <span className="font-sans text-[0.65rem] tracking-[0.3em] text-washi-mute tabular-nums">02</span>
        <span aria-hidden className="h-px w-10 bg-ouro/70" />
        <span className="mk-eyebrow">{c.omakase.eyebrow}</span>
        <span aria-hidden className="font-jp text-sm text-ouro/60">匠</span>
      </div>
      <h2 className="font-display text-display-lg font-light text-washi">{c.omakase.title}</h2>
      <p className="mt-8 max-w-[36ch] text-[0.95rem] leading-relaxed text-washi-dim">{c.omakase.intro}</p>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        <Button asChild variant="outline">
          <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.omakase.reserve}</SmartLink>
        </Button>
        <span className="hidden items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute md:flex">
          {c.omakase.hint}
          <span aria-hidden className="h-px w-10 bg-line-strong" />
        </span>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id={sectionIds.omakase}
      aria-label={c.omakase.eyebrow}
      className="relative bg-sumi"
      style={pinned && distance ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={cn(pinned ? "sticky top-0 flex h-screen items-center overflow-hidden" : "py-[var(--spacing-section)]")}>
        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={cn(
            "flex gap-8 px-[var(--spacing-gutter)] md:gap-14",
            pinned ? "w-max will-change-transform" : "mk-no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-px-[var(--spacing-gutter)] pb-4",
          )}
        >
          {intro}
          {items.map((item, i) => (
            <Card key={item.id} item={item} index={i} lang={lang} />
          ))}
          <div aria-hidden className="w-[4vw] shrink-0" />
        </motion.div>

        {pinned ? (
          <div aria-hidden className="absolute inset-x-[var(--spacing-gutter)] bottom-10 h-px bg-line">
            <motion.div className="h-full origin-left bg-ouro" style={{ scaleX: smooth }} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
