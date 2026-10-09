"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Quando `false`, aguarda (ex.: preloader). */
  play?: boolean;
  delay?: number;
  stagger?: number;
  /** Anima ao entrar na viewport em vez de imediatamente. */
  inView?: boolean;
};

/** Revela palavra a palavra: sobe, desfoca → nítido. Lento e contido. */
export function SplitText({
  text,
  as = "h2",
  className,
  play = true,
  delay = 0,
  stagger = 0.07,
  inView = false,
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const lines = text.split("\n");

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } },
  };
  const word = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: "0.6em", filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: { duration: reduce ? 0.6 : 1.3, ease: EASE },
    },
  };

  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, amount: 0.5 } }
    : { animate: play ? "show" : "hidden" };

  return (
    <Tag className={cn(className)} initial="hidden" variants={container} aria-label={text.replace(/\n/g, " ")} {...trigger}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((w, wi) => (
            <span key={wi} className="inline-block whitespace-pre">
              <motion.span className="inline-block will-change-transform" variants={word}>
                {w}
              </motion.span>
              {wi < line.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
