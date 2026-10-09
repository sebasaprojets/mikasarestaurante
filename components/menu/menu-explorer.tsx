"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { MediaFrame } from "@/components/media/media-frame";
import { useScrollTo } from "@/components/providers/smooth-scroll";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCopy } from "@/data/copy";
import { menuCategories, menuItems, type MenuItem, type MenuTag } from "@/data/menu";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { useFinePointer } from "@/lib/hooks/use-media-query";
import { EASE, useReducedMotion } from "@/lib/motion";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

const filterTags: MenuTag[] = ["vegetariano", "picante", "signature"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/* ─────────────── Tabs sticky ─────────────── */

export function CategoryTabs({
  tabs,
  active,
  onSelect,
  label,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  // mantém a tab ativa visível no mobile
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!list || !el) return;
    const lr = list.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const left = list.scrollLeft + (er.left - lr.left) - lr.width / 2 + er.width / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <div className="sticky top-[var(--header-offset)] z-30 border-y border-line bg-sumi/85 backdrop-blur-xl transition-[top] duration-[900ms] ease-[var(--ease-mikasa)]">
      <div ref={listRef} data-lenis-prevent className="mk-no-scrollbar mx-auto max-w-[1600px] overflow-x-auto px-[var(--spacing-gutter)]">
        <nav aria-label={label}>
          <LayoutGroup id={label}>
            <ul className="flex w-max gap-7 md:gap-10">
              {tabs.map((tab) => {
                const isActive = tab.id === active;
                return (
                  <li key={tab.id} className="relative">
                    <a
                      href={`#${tab.id}`}
                      data-tab={tab.id}
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(tab.id);
                      }}
                      className={cn(
                        "flex h-14 items-center whitespace-nowrap font-sans text-[0.68rem] uppercase tracking-[0.22em] transition-colors duration-500",
                        isActive ? "text-ouro-claro" : "text-washi-dim hover:text-washi",
                      )}
                    >
                      {tab.label}
                    </a>
                    {isActive ? (
                      <motion.span
                        layoutId="tab-indicator"
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-px bg-ouro"
                        transition={{ duration: 0.8, ease: EASE }}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>
      </div>
    </div>
  );
}

/** Scroll-spy: devolve o id da seção visível. */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return [active, setActive] as const;
}

/* ─────────────── Preview que segue o cursor ─────────────── */

function HoverPreview({ item, lang }: { item: MenuItem | null; lang: Locale }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 24, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 150, damping: 24, mass: 0.7 });

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX + 28);
      y.set(e.clientY - 140);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block" style={{ x: reduce ? x : sx, y: reduce ? y : sy }}>
      <AnimatePresence>
        {item ? (
          <motion.div
            key={item.id}
            className="h-72 w-56 overflow-hidden border border-line"
            initial={{ opacity: 0, scale: 0.92, clipPath: "inset(10% 10% 10% 10%)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <MediaFrame asset={item.imagem} lang={lang} fallbackLabel={item.nome[lang]} kanji="匠" sizes="224px" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────── Item ─────────────── */

function priceLabel(item: MenuItem, lang: Locale) {
  const p = formatPrice(item.preco, lang);
  if (!p) return null;
  return item.opcoes ? `${getCopy(lang).menuPage.from} ${p}` : p;
}

function Options({ item, lang }: { item: MenuItem; lang: Locale }) {
  if (!item.opcoes) return null;
  return (
    <div className="mt-3">
      <p className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-ouro">{item.opcoes.titulo[lang]}</p>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-washi-dim">
        {item.opcoes.itens.map((o) => (
          <li key={o.nome.en}>
            {o.nome[lang]} <span className="font-display text-base text-ouro tabular-nums">{formatPrice(o.preco, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TagList({ tags, lang }: { tags: MenuTag[]; lang: Locale }) {
  const c = getCopy(lang);
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li key={t} className="border border-line px-2 py-0.5 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ouro">
          {c.tags[t]}
        </li>
      ))}
    </ul>
  );
}

function ItemRow({
  item,
  lang,
  onOpen,
  onHover,
}: {
  item: MenuItem;
  lang: Locale;
  onOpen: (i: MenuItem) => void;
  onHover: (i: MenuItem | null) => void;
}) {
  const c = getCopy(lang);
  const price = priceLabel(item, lang);
  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={() => onOpen(item)}
        onPointerEnter={(e) => e.pointerType === "mouse" && item.imagem && onHover(item)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(null)}
        className="group grid w-full gap-5 py-7 text-left md:py-8"
        aria-label={`${item.nome[lang]}${price ? ` — ${price}` : ""}. ${c.menuPage.view}`}
      >
        {/* Mobile: card com imagem (quando o prato tem mídia) */}
        {item.imagem ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden md:hidden">
            <MediaFrame asset={item.imagem} lang={lang} fallbackLabel={item.nome[lang]} kanji="匠" sizes="100vw" />
          </div>
        ) : null}

        <div>
          <div className="flex items-baseline">
            <h3 className="font-display text-[clamp(1.35rem,1.15rem+0.7vw,1.85rem)] leading-tight text-washi transition-colors duration-500 group-hover:text-ouro-claro">
              {item.nome[lang]}
              {item.porcao ? <span className="ml-3 font-sans text-[0.68rem] tracking-[0.18em] text-washi-mute">{item.porcao}</span> : null}
            </h3>
            <span aria-hidden className="mk-leader hidden md:block" />
            <span className="ml-auto shrink-0 whitespace-nowrap pl-4 font-display text-xl text-ouro tabular-nums md:ml-0 md:pl-0">
              {price ?? <span className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-washi-mute">{c.menuPage.pendingPrice}</span>}
            </span>
          </div>
          {item.componentes?.length ? (
            <p className="mt-2 font-display text-base italic text-ouro-claro/90">{item.componentes.join(" · ")}</p>
          ) : null}
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-washi-dim">
            {item.descricao?.[lang] ?? <span className="text-washi-mute">{c.menuPage.pendingDescription}</span>}
          </p>
          {item.escolha ? <p className="mt-1.5 text-sm italic text-washi-mute">{item.escolha[lang]}</p> : null}
          <Options item={item} lang={lang} />
          {item.tags.length ? (
            <div className="mt-3">
              <TagList tags={item.tags} lang={lang} />
            </div>
          ) : null}
        </div>
      </button>
    </li>
  );
}

/* ─────────────── Modal ─────────────── */

function ItemDialog({ item, lang, onClose }: { item: MenuItem | null; lang: Locale; onClose: () => void }) {
  const c = getCopy(lang);
  const cat = item ? menuCategories.find((x) => x.id === item.categoria) : null;
  const price = item ? priceLabel(item, lang) : null;
  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent closeLabel={c.a11y.close} className="grid md:grid-cols-2">
        {item ? (
          <>
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
              <MediaFrame
                asset={item.video?.available ? item.video : item.imagem}
                lang={lang}
                fallbackLabel={item.nome[lang]}
                kanji="匠"
                sizes="(min-width:768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-col p-8 md:p-12">
              <p className="mk-eyebrow">{cat?.nome[lang]}</p>
              <DialogTitle className="mt-5 font-display text-display-md font-light text-washi">{item.nome[lang]}</DialogTitle>
              {item.componentes?.length ? (
                <ul className="mt-4 flex flex-wrap gap-x-5">
                  {item.componentes.map((p) => (
                    <li key={p} className="font-display text-xl italic text-ouro-claro">
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
              <DialogDescription className="mt-6 text-[0.95rem] leading-relaxed text-washi-dim">
                {item.descricao?.[lang] ?? c.menuPage.pendingDescription}
              </DialogDescription>
              {item.escolha ? <p className="mt-3 text-sm italic text-washi-mute">{item.escolha[lang]}</p> : null}
              <Options item={item} lang={lang} />
              <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-washi-mute">USD</dt>
                  <dd className="font-display text-2xl text-ouro">{price ?? <span className="font-sans text-xs uppercase tracking-[0.2em] text-washi-mute">{c.menuPage.pendingPrice}</span>}</dd>
                </div>
                {item.porcao ? (
                  <div className="flex justify-between">
                    <dt className="text-washi-mute">{c.menuPage.portion}</dt>
                    <dd className="text-washi">{item.porcao}</dd>
                  </div>
                ) : null}
                {cat?.nota ? (
                  <div className="flex justify-between gap-6">
                    <dt className="shrink-0 text-washi-mute">{c.menuPage.includes}</dt>
                    <dd className="text-right text-washi">{cat.lista ? cat.lista[lang].join(" · ") : cat.nota[lang]}</dd>
                  </div>
                ) : null}
              </dl>
              {item.tags.length ? (
                <div className="mt-6">
                  <TagList tags={item.tags} lang={lang} />
                </div>
              ) : null}
              <div className="mt-auto pt-10">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={homeAnchor(lang, sectionIds.reservation)}>{c.menuPage.reserve}</Link>
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────── Explorer ─────────────── */

export function MenuExplorer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const m = c.menuPage;
  const scrollTo = useScrollTo();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MenuTag[]>([]);
  const [hovered, setHovered] = useState<MenuItem | null>(null);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const searching = query.trim().length > 0 || filters.length > 0;
  // só exibe filtros que tenham ao menos um prato marcado na carta
  const availableTags = filterTags.filter((t) => menuItems.some((i) => i.tags.includes(t)));

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return menuCategories
      .map((cat) => {
        const items = menuItems.filter((i) => {
          if (i.categoria !== cat.id) return false;
          if (filters.length && !filters.every((f) => i.tags.includes(f))) return false;
          if (!q) return true;
          const hay = normalize(
            [i.nome.es, i.nome.en, i.descricao?.[lang] ?? "", i.escolha?.[lang] ?? "", ...(i.componentes ?? []), ...(i.opcoes?.itens.map((o) => o.nome[lang]) ?? [])].join(" "),
          );
          return hay.includes(q);
        });
        return { cat, items };
      })
      .filter((g) => !searching || g.items.length > 0);
  }, [query, filters, lang, searching]);

  const ids = groups.map((g) => g.cat.id);
  const [active, setActive] = useScrollSpy(ids);

  const select = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) scrollTo(el, -140);
  };

  const toggle = (t: MenuTag) => setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]));

  return (
    <>
      <CategoryTabs tabs={groups.map((g) => ({ id: g.cat.id, label: g.cat.nome[lang] }))} active={active} onSelect={select} label={c.nav.menu} />

      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        {/* Busca + filtros */}
        <div className="flex flex-col gap-6 border-b border-line py-10 md:flex-row md:items-end md:justify-between">
          <div className="relative w-full md:max-w-md">
            <label htmlFor="menu-search" className="mb-2 block font-sans text-[0.62rem] uppercase tracking-[0.28em] text-washi-dim">
              {m.search}
            </label>
            <Search aria-hidden strokeWidth={1.25} className="pointer-events-none absolute bottom-3.5 left-0 size-4 text-ouro" />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m.searchPlaceholder}
              className="w-full border-0 border-b border-line-strong bg-transparent py-3 pl-8 pr-10 text-base text-washi placeholder:text-washi-mute focus:border-ouro focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label={m.clear} className="absolute bottom-1 right-0 grid size-10 place-items-center text-washi-dim hover:text-ouro-claro">
                <X className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
            ) : null}
          </div>

          <div role="group" aria-label={m.filters} className="flex flex-wrap items-center gap-2">
            {availableTags.map((t) => {
              const on = filters.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(t)}
                  className={cn(
                    "min-h-11 border px-4 font-sans text-[0.65rem] uppercase tracking-[0.22em] transition-colors duration-500",
                    on ? "border-ouro text-ouro-claro" : "border-line text-washi-dim hover:border-line-strong hover:text-washi",
                  )}
                >
                  {c.tags[t]}
                </button>
              );
            })}
            {searching ? (
              <button type="button" onClick={() => { setFilters([]); setQuery(""); }} className="min-h-11 px-3 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-washi-mute underline-offset-4 hover:text-washi hover:underline">
                {m.clear}
              </button>
            ) : null}
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          {searching ? `${groups.reduce((n, g) => n + g.items.length, 0)}` : ""}
        </div>

        {groups.length === 0 ? (
          <p className="py-24 text-center font-display text-2xl italic text-washi-dim">{m.noResults}</p>
        ) : null}

        {groups.map(({ cat, items }, gi) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-40 border-b border-line py-16 last:border-b-0 md:py-24">
            <div className="grid gap-10 lg:grid-cols-12">
              <header className="lg:col-span-4">
                <span className="font-sans text-[0.62rem] tracking-[0.3em] text-washi-mute tabular-nums">{String(gi + 1).padStart(2, "0")}</span>
                <h2 id={`${cat.id}-title`} className="mt-4 font-display text-display-md font-light text-washi">
                  {cat.nome[lang]}
                </h2>
                {cat.subtitulo ? <p className="mt-3 font-display text-lg italic text-ouro-claro/90">{cat.subtitulo[lang]}</p> : null}
                {cat.nota ? <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ouro">{cat.nota[lang]}</p> : null}
                {cat.lista ? (
                  <ul className="mt-3 space-y-1 text-sm text-washi-dim">
                    {cat.lista[lang].map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : null}
                {cat.status === "parcial" && !searching ? (
                  <p className="mt-6 max-w-[30ch] text-xs leading-relaxed text-washi-mute">{m.partialCategory}</p>
                ) : null}
              </header>

              <div className="lg:col-span-8">
                {items.length ? (
                  <ul className="border-t border-line">
                    {items.map((item) => (
                      <ItemRow key={item.id} item={item} lang={lang} onOpen={setSelected} onHover={setHovered} />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-start gap-6 border border-dashed border-line-strong p-8">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">Placeholder</span>
                    <p className="max-w-[48ch] text-sm leading-relaxed text-washi-dim">{m.pendingCategory}</p>
                    <Button asChild variant="link" size="none">
                      <a href={site.menus.food.flipbook} target="_blank" rel="noopener noreferrer">
                        {m.original} <ArrowUpRight className="size-3.5" strokeWidth={1.25} aria-hidden />
                        <span className="sr-only"> {c.a11y.externalLink}</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <HoverPreview item={hovered} lang={lang} />
      <ItemDialog item={selected} lang={lang} onClose={() => setSelected(null)} />
    </>
  );
}
