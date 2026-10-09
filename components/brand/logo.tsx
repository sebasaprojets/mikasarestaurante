import { useId } from "react";
import { EMBLEM_VIEWBOX, KANJI_ID, LETTER_BOXES, letterId, WORDMARK_VIEWBOX } from "@/components/brand/logo-meta";
import { cn } from "@/lib/utils";

/** Gradiente dourado do logo (luz no alto, ouro profundo embaixo). */
export function GoldGradient({ id, vertical = true }: { id: string; vertical?: boolean }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
      <stop offset="0" stopColor="#f0dca6" />
      <stop offset="0.45" stopColor="#d4b06a" />
      <stop offset="1" stopColor="#a8823f" />
    </linearGradient>
  );
}

/** Arco do emblema: círculo quase completo, com a abertura do traço de pincel embaixo à esquerda. */
export const EMBLEM_ARC = "M 92.7 255.8 A 126 126 0 1 1 187.3 255.8";

/** Emblema oficial: kanji dentro do círculo dourado. */
export function Emblem({ className, title }: { className?: string; title?: string }) {
  const gid = useId();
  return (
    <svg viewBox={EMBLEM_VIEWBOX} className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <GoldGradient id={gid} />
      </defs>
      <path d={EMBLEM_ARC} fill="none" stroke={`url(#${gid})`} strokeWidth="5" strokeLinecap="round" />
      <use href={`#${KANJI_ID}`} fill={`url(#${gid})`} />
    </svg>
  );
}

/** Wordmark oficial "MIKASA" (vetorizado). */
export function Wordmark({ className }: { className?: string }) {
  const gid = useId();
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} aria-hidden>
      <defs>
        <GoldGradient id={gid} />
      </defs>
      <g fill={`url(#${gid})`}>
        {LETTER_BOXES.map((_, i) => (
          <use key={i} href={`#${letterId(i)}`} />
        ))}
      </g>
    </svg>
  );
}

/** Logo horizontal para header/footer: emblema + MIKASA (+ tagline opcional). */
export function Logo({ className, withTagline = false }: { className?: string; withTagline?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Emblem className="size-9 shrink-0 md:size-10" />
      <span className="flex flex-col">
        <Wordmark className="h-[15px] w-auto md:h-[17px]" />
        {withTagline ? (
          <span className="mt-2 font-sans text-[0.5rem] uppercase tracking-[0.34em] text-ouro">Japanese Nikkei Cuisine</span>
        ) : null}
      </span>
      <span className="sr-only">MIKASA — Japanese Nikkei Cuisine</span>
    </span>
  );
}
