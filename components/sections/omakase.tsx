"use client";

import Link from "next/link";
import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MediaFrame } from "@/components/media/media-frame";
import { BrushKanji } from "@/components/motion/brush-kanji";
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const lenis = useLenis();

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const track = trackRef.current;
      const vp = viewportRef.current;
      if (track && vp) setDistance(Math.max(0, track.scrollWidth - vp.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // pequena pausa no início e no fim; Lenis já suaviza (sem mola extra)
  const x = useTransform(scrollYProgress, [0.06, 0.94], [0, -distance], { clamp: true });

  /** Setas: avança/volta um card rolando a página até o ponto equivalente. */
  const go = (dir: 1 | -1) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const range = sec.offsetHeight - window.innerHeight;
    const n = items.length;
    const p = Math.min(1, Math.max(0, (window.scrollY - sec.offsetTop) / range));
    const inner = Math.min(1, Math.max(0, (p - 0.06) / 0.88));
    const idx = Math.min(n, Math.max(0, Math.round(inner * n) + dir));
    const target = sec.offsetTop + (0.06 + (idx / n) * 0.88) * range;
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  const intro = (
    <div className={cn("flex shrink-0 flex-col justify-center", pinned ? "w-full pr-10" : "w-[82vw] snap-start sm:w-[58vw]")}>
      <BrushKanji char="匠" className="mb-6 size-20 opacity-90 xl:size-24" />
      <div className="mb-7 flex items-center gap-4">
        <span className="font-sans text-[0.65rem] tracking-[0.3em] text-washi-mute tabular-nums">02</span>
        <span aria-hidden className="h-px w-10 bg-ouro/70" />
        <span className="mk-eyebrow">{c.omakase.eyebrow}</span>
        <span aria-hidden className="font-jp text-sm text-ouro/60">匠</span>
      </div>
      <h2 className="font-display text-display-lg font-light text-washi">{c.omakase.title}</h2>
      <p className="mt-8 max-w-[36ch] text-[0.95rem] leading-relaxed text-washi-dim">{c.omakase.intro}</p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <Button asChild variant="outline">
          <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.omakase.reserve}</SmartLink>
        </Button>
        {pinned ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={c.a11y.previous}
              className="grid size-11 place-items-center border border-line text-washi transition-colors duration-500 hover:border-ouro hover:text-ouro-claro"
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={c.a11y.next}
              className="grid size-11 place-items-center border border-line text-washi transition-colors duration-500 hover:border-ouro hover:text-ouro-claro"
            >
              <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      {pinned ? (
        <span className="mt-8 flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute">
          {c.omakase.hint}
          <span aria-hidden className="h-px w-10 bg-line-strong" />
        </span>
      ) : null}
    </div>
  );

  const cards = items.map((item, i) => <Card key={item.id} item={item} index={i} lang={lang} />);

  if (!pinned) {
    // Mobile/tablet: carrossel nativo com snap
    return (
      <section id={sectionIds.omakase} aria-label={c.omakase.eyebrow} className="relative bg-sumi py-[var(--spacing-section)]">
        <div className="mk-no-scrollbar flex snap-x snap-mandatory scroll-px-[var(--spacing-gutter)] gap-8 overflow-x-auto px-[var(--spacing-gutter)] pb-4">
          {intro}
          {cards}
          <div aria-hidden className="w-[4vw] shrink-0" />
        </div>
      </section>
    );
  }

  // Desktop: texto fixo à esquerda; só os cards deslizam (rolagem vertical ou gesto lateral)
  return (
    <section
      ref={sectionRef}
      id={sectionIds.omakase}
      aria-label={c.omakase.eyebrow}
      className="relative bg-sumi"
      style={distance ? { height: `calc(100vh + ${Math.round(distance * 1.15)}px)` } : undefined}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="grid w-full grid-cols-[minmax(19rem,34vw)_1fr] items-center pl-[var(--spacing-gutter)] xl:grid-cols-[minmax(22rem,30vw)_1fr]">
          {intro}
          <div
            ref={viewportRef}
            className="relative overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent 0, #000 4rem, #000 calc(100% - 3rem), transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 4rem, #000 calc(100% - 3rem), transparent 100%)",
            }}
          >
            <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-14 pl-16 pr-[var(--spacing-gutter)] will-change-transform">
              {cards}
            </motion.div>
          </div>
        </div>

        <div aria-hidden className="absolute inset-x-[var(--spacing-gutter)] bottom-10 h-px bg-line">
          <motion.div className="h-full origin-left bg-ouro" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
