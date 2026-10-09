import { Reveal } from "@/components/motion/reveal";
import { barPromos } from "@/data/bar";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Promoções vigentes (artes do restaurante). */
export function BarPromos({ lang, className }: { lang: Locale; className?: string }) {
  return (
    <ul className={cn("grid gap-px border border-line bg-line md:grid-cols-3", className)}>
      {barPromos.map((p, i) => (
        <li key={p.id} className="bg-[#0d0908]">
          <Reveal delay={i * 0.1} className="flex h-full flex-col p-7 md:p-9">
            <span className="flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">
              <span aria-hidden className="h-px w-6 bg-torii" />
              {p.dias[lang]}
            </span>
            <h3 className="mt-5 font-display text-display-sm text-washi">{p.titulo[lang]}</h3>
            <p className="mt-2 font-display text-lg italic text-ouro-claro">{p.destaque[lang]}</p>
            <p className="mt-4 text-sm leading-relaxed text-washi-dim">{p.texto[lang]}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
