import { cn } from "@/lib/utils";

/**
 * Wordmark provisório. Substituir pelo logo oficial (SVG) quando fornecido
 * — pendência registrada em data/site.ts.
 */
export function Logo({ className, withTagline = false }: { className?: string; withTagline?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[1.45rem] font-medium tracking-[0.34em] text-washi">MIKASA</span>
      {withTagline ? (
        <span className="mt-2 font-sans text-[0.55rem] uppercase tracking-[0.38em] text-ouro">
          Japanese Nikkei Cuisine
        </span>
      ) : null}
    </span>
  );
}
