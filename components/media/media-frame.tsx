import Image from "next/image";
import type { MediaAsset } from "@/data/media";
import { withBasePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AutoVideo } from "@/components/media/auto-video";

type Props = {
  asset: MediaAsset | null | undefined;
  lang: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Kanji decorativo do placeholder. */
  kanji?: string;
  /** Aplica Ken Burns lento. */
  kenBurns?: boolean;
  /** Placeholder mais quente (robata / bar). */
  tone?: "neutral" | "warm";
  /** Rótulo alternativo para o placeholder quando não há asset. */
  fallbackLabel?: string;
  /** Posição do rótulo "Placeholder" (ex.: no hero fica no topo). */
  labelClassName?: string;
};

/**
 * Exibe a mídia oficial quando disponível; caso contrário, um placeholder
 * claramente identificado. Ocupa 100% do container (use com aspect-ratio).
 */
export function MediaFrame({
  asset,
  lang,
  className,
  sizes = "100vw",
  priority = false,
  kanji,
  kenBurns = false,
  tone = "neutral",
  fallbackLabel,
  labelClassName,
}: Props) {
  const motionCls = kenBurns ? "mk-kenburns animate-kenburns" : "";

  if (asset?.available) {
    if (asset.kind === "video") {
      return (
        <div className={cn("relative size-full overflow-hidden bg-carvao", className)}>
          <AutoVideo
            src={withBasePath(asset.src)}
            webm={asset.webm ? withBasePath(asset.webm) : undefined}
            poster={asset.poster ? withBasePath(asset.poster) : undefined}
            priority={priority}
            label={asset.alt[lang]}
            className={motionCls}
          />
        </div>
      );
    }
    return (
      <div className={cn("relative size-full overflow-hidden bg-carvao", className)}>
        <Image
          src={withBasePath(asset.src)}
          alt={asset.alt[lang]}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", motionCls)}
        />
      </div>
    );
  }

  const label = asset?.alt[lang] ?? fallbackLabel ?? "";
  const file = asset ? asset.src.split("/").pop() : null;

  return (
    <div
      role="img"
      aria-label={`${lang === "es" ? "Imagen provisional" : "Placeholder image"}: ${label}`}
      className={cn(
        "mk-placeholder relative size-full overflow-hidden",
        tone === "warm" ? "bg-[#140c07]" : "bg-carvao",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn("absolute inset-0 mk-washi", motionCls)}
        style={{
          backgroundColor: "transparent",
          boxShadow:
            tone === "warm"
              ? "inset 0 0 160px 40px rgba(0,0,0,.75), inset 0 -120px 160px -60px rgba(217,119,43,.16)"
              : "inset 0 0 160px 40px rgba(0,0,0,.7)",
        }}
      />
      {kanji ? (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-jp text-[clamp(5rem,14vw,11rem)] leading-none text-ouro/[0.07] select-none"
        >
          {kanji}
        </span>
      ) : null}
      {/* Cantoneiras douradas */}
      <span aria-hidden className="absolute left-3 top-3 size-3 border-l border-t border-line-strong" />
      <span aria-hidden className="absolute right-3 top-3 size-3 border-r border-t border-line-strong" />
      <span aria-hidden className="absolute bottom-3 left-3 size-3 border-b border-l border-line-strong" />
      <span aria-hidden className="absolute bottom-3 right-3 size-3 border-b border-r border-line-strong" />
      <div aria-hidden className={cn("absolute inset-x-5 bottom-5 flex flex-col gap-1", labelClassName)}>
        <span className="font-display text-base italic text-washi-dim line-clamp-2">{label}</span>
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-washi-mute">
          Placeholder{file ? ` · ${file}` : ""}
        </span>
      </div>
    </div>
  );
}
