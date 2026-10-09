import { Reveal } from "@/components/motion/reveal";
import { SplitText } from "@/components/motion/split-text";
import { cn } from "@/lib/utils";

/** Cabeçalho editorial: índice · eyebrow · título. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  kanji,
  className,
  align = "left",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  kanji?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <Reveal className={cn("mb-7 flex items-center gap-4", align === "center" && "justify-center")}>
        {index ? <span className="font-sans text-[0.65rem] tracking-[0.3em] text-washi-mute tabular-nums">{index}</span> : null}
        <span aria-hidden className="h-px w-10 bg-ouro/70" />
        <span className="mk-eyebrow">{eyebrow}</span>
        {kanji ? (
          <span aria-hidden className="font-jp text-sm text-ouro/60">
            {kanji}
          </span>
        ) : null}
      </Reveal>
      <SplitText as="h2" inView text={title} className="font-display text-display-lg font-light text-washi" />
    </div>
  );
}
