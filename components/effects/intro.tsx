"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { EMBLEM_ARC, GoldGradient } from "@/components/brand/logo";
import { EMBLEM_VIEWBOX, KANJI_D, LETTERS, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-paths";
import { Fire } from "@/components/effects/fire";
import { INTRO_EVENT } from "@/lib/hooks/use-intro-ready";

export const INTRO_FORCE_KEY = "mk-intro-force";

/**
 * Script inline no <head>, antes do primeiro paint: a intro toca quando a pessoa
 * ENTRA no site (link externo, URL digitada, nova aba). Não toca ao recarregar,
 * voltar/avançar, nem em navegação interna ou troca de idioma (referrer do próprio
 * site) — exceto quando a página de redirecionamento da raiz pede (flag em sessionStorage).
 */
export const introScript = `try{var f=sessionStorage.getItem("${INTRO_FORCE_KEY}");sessionStorage.removeItem("${INTRO_FORCE_KEY}");var r=document.referrer,same=false;try{same=!!r&&new URL(r).host===location.host}catch(e){}var nav=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];var t=nav&&nav.type;if(f||(!same&&t!=="reload"&&t!=="back_forward")){document.documentElement.setAttribute("data-intro","")}}catch(e){}`;

const CAM = [0.16, 1, 0.3, 1] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Duração (s) — total ≈ 5,8s; a intro toca sempre até o fim. */
const T = { exit: 4.7, exitDur: 1.1 };

function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" className={className} aria-hidden>
      <g fill="#060405" stroke="rgba(240,150,70,0.55)" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M0 50 Q300 100 600 50 L594 78 Q300 120 6 78 Z" />
        <path d="M42 96 L558 96 L552 116 L48 116 Z" />
        <path d="M286 116 L314 116 L314 164 L286 164 Z" />
        <path d="M58 164 L542 164 L542 186 L58 186 Z" />
        <path d="M140 116 L170 116 L180 400 L126 400 Z" />
        <path d="M430 116 L460 116 L474 400 L420 400 Z" />
      </g>
    </svg>
  );
}

/**
 * Intro cinematográfica (1x por sessão). A camada só existe quando o script
 * inline marca <html data-intro>; sem JS, um fallback CSS a esconde.
 */
export function Intro() {
  // A intro é a assinatura da marca: toca completa sempre (decisão do cliente).
  const reduce = false as boolean;
  const [phase, setPhase] = useState<"idle" | "play" | "exit" | "done">("idle");
  const fireK = useRef(0);
  const gid = useId();
  const sheenId = useId();
  const maskId = useId();

  // inicia
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) {
      const id = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setPhase("play"));
    return () => cancelAnimationFrame(id);
  }, []);

  // linha do tempo
  useEffect(() => {
    if (phase !== "play") return;
    const total = reduce ? 1.6 : T.exit;
    const ctrls = reduce
      ? []
      : [
          animate(0, 0.42, { duration: 1.6, delay: 0.2, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
          animate(0.42, 1, { duration: 1.6, delay: 2.0, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
        ];
    const t = window.setTimeout(() => setPhase("exit"), total * 1000);
    return () => {
      window.clearTimeout(t);
      ctrls.forEach((c) => c.stop());
    };
  }, [phase, reduce]);

  // saída
  useEffect(() => {
    if (phase !== "exit") return;
    window.dispatchEvent(new Event(INTRO_EVENT));
    const c = reduce ? null : animate(fireK.current, 1.25, { duration: 0.6, ease: EASE, onUpdate: (v) => (fireK.current = v) });
    const t = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-intro");
      setPhase("done");
    }, (reduce ? 0.5 : T.exitDur) * 1000);
    return () => {
      window.clearTimeout(t);
      c?.stop();
    };
  }, [phase, reduce]);

  if (phase === "done") return null;
  const playing = phase === "play" || phase === "exit";
  const exiting = phase === "exit";
  const at = (d: number) => (reduce ? 0 : d);

  return (
    <motion.div
      className="mk-intro fixed inset-0 z-[100] overflow-hidden bg-sumi"
      role="presentation"
      initial={false}
      animate={
        exiting
          ? reduce
            ? { opacity: 0 }
            : { clipPath: "inset(50% 0% 50% 0%)" }
          : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
      }
      transition={{ duration: reduce ? 0.5 : T.exitDur, ease: [0.76, 0, 0.24, 1], delay: exiting && !reduce ? 0.15 : 0 }}
    >
      {/* luz ambiente atrás do logo */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[42%] size-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(198,161,91,0.16), rgba(168,50,42,0.05) 45%, transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={playing ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 3.2, ease: EASE, delay: at(0.4) }}
      />

      {/* fogo subindo por baixo */}
      {!reduce && playing ? (
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[58%] mix-blend-screen">
          <Fire intensityRef={fireK} className="h-full w-full" />
        </div>
      ) : null}

      {/* torii em silhueta contra o fogo */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-1/2 w-[min(78vw,520px)] -translate-x-1/2"
        initial={{ opacity: 0, y: 40 }}
        animate={playing ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 3.4, ease: CAM, delay: at(0.6) }}
      >
        <Torii className="w-full" />
      </motion.div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sumi to-transparent" />

      {/* câmera: dolly-out lento com leve inclinação */}
      <div className="absolute inset-0 grid place-items-center [perspective:1400px]">
        <motion.div
          className="relative -mt-[12vh] flex flex-col items-center"
          initial={reduce ? { opacity: 0 } : { scale: 1.22, rotateX: 14, y: 30, opacity: 1 }}
          animate={
            exiting && !reduce
              ? { scale: 1.08, rotateX: 0, y: -10, opacity: 0, filter: "blur(6px)" }
              : playing
                ? { scale: 1, rotateX: 0, y: 0, opacity: 1 }
                : {}
          }
          transition={exiting ? { duration: 0.9, ease: EASE } : { duration: reduce ? 0.8 : 5.4, ease: CAM }}
        >
          {/* Emblema */}
          <svg viewBox={EMBLEM_VIEWBOX} className="w-[clamp(104px,15vw,176px)] overflow-visible" aria-hidden>
            <defs>
              <GoldGradient id={gid} />
            </defs>
            <motion.path
              d={EMBLEM_ARC}
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
              animate={playing ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ pathLength: { duration: 1.8, ease: EASE, delay: at(0.3) }, opacity: { duration: 0.4, delay: at(0.3) } }}
            />
            <motion.path
              d={KANJI_D}
              fill={`url(#${gid})`}
              fillRule="evenodd"
              initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)", filter: "blur(6px)" }}
              animate={playing ? { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)" } : {}}
              transition={{ duration: 1.5, ease: EASE, delay: at(0.9) }}
            />
          </svg>

          {/* Wordmark letra a letra + brilho que atravessa */}
          <svg viewBox={WORDMARK_VIEWBOX} className="mt-[clamp(1.5rem,4vh,2.75rem)] w-[clamp(240px,46vw,560px)] overflow-visible" aria-hidden>
            <defs>
              <GoldGradient id={`${gid}w`} />
              <linearGradient id={sheenId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id={maskId}>
                <motion.rect
                  y={-20}
                  height={WORDMARK_H + 40}
                  width={WORDMARK_W * 0.28}
                  fill={`url(#${sheenId})`}
                  initial={{ x: -WORDMARK_W * 0.4 }}
                  animate={playing && !reduce ? { x: WORDMARK_W * 1.1 } : {}}
                  transition={{ duration: 1.6, ease: [0.45, 0, 0.2, 1], delay: 2.5 }}
                />
              </mask>
            </defs>
            <g fill={`url(#${gid}w)`} fillRule="evenodd">
              {LETTERS.map((l, i) => {
                const fromCenter = l.x + l.w / 2 - WORDMARK_W / 2;
                return (
                  <motion.path
                    key={i}
                    d={l.d}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: WORDMARK_H * 0.5, x: fromCenter * 0.28, filter: "blur(10px)" }}
                    animate={playing ? { opacity: 1, y: 0, x: 0, filter: "blur(0px)" } : {}}
                    transition={{ duration: 1.4, ease: EASE, delay: at(1.5 + i * 0.09) }}
                  />
                );
              })}
            </g>
            {/* reflexo dourado claro */}
            <g fill="#fff6dc" fillRule="evenodd" mask={`url(#${maskId})`} opacity="0.85">
              {LETTERS.map((l, i) => (
                <path key={i} d={l.d} />
              ))}
            </g>
          </svg>

          {/* Tagline */}
          <motion.p
            className="mt-5 whitespace-nowrap font-sans text-[clamp(0.55rem,1.1vw,0.8rem)] uppercase text-ouro-claro"
            initial={{ opacity: 0, letterSpacing: reduce ? "0.42em" : "0.85em" }}
            animate={playing ? { opacity: 1, letterSpacing: "0.42em" } : {}}
            transition={{ duration: 1.8, ease: EASE, delay: at(2.4) }}
          >
            Japanese Nikkei Cuisine
          </motion.p>

          {/* Linha vermelha com ponto */}
          <div aria-hidden className="mt-5 flex w-[clamp(240px,46vw,560px)] items-center gap-3">
            <motion.span
              className="h-px flex-1 origin-right bg-torii"
              initial={{ scaleX: 0 }}
              animate={playing ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE, delay: at(2.8) }}
            />
            <motion.span
              className="grid size-3 place-items-center rounded-full border border-torii"
              initial={{ scale: 0, opacity: 0 }}
              animate={playing ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: at(3.3) }}
            >
              <span className="size-1 rounded-full bg-torii" />
            </motion.span>
            <motion.span
              className="h-px flex-1 origin-left bg-torii"
              initial={{ scaleX: 0 }}
              animate={playing ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE, delay: at(2.8) }}
            />
          </div>
        </motion.div>
      </div>

      <span className="sr-only" role="status">
        MIKASA — Japanese Nikkei Cuisine
      </span>
    </motion.div>
  );
}
