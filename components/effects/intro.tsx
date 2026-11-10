"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { EMBLEM_ARC, GoldGradient } from "@/components/brand/logo";
import { EMBLEM_VIEWBOX, KANJI_ID, LETTER_BOXES, letterId, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-meta";
import { Fire } from "@/components/effects/fire";
import { signalIntroDone } from "@/lib/hooks/use-intro-ready";

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

/**
 * Duração (s) — total ≈ 7,7s; a intro toca sempre até o fim.
 * As letras de MIKASA queimam devagar, de baixo para cima, quando o fogo sobe.
 */
const T = { exit: 6.6, exitDur: 1.1, burnStart: 3.5, burnDur: 2.8 };

/** Faíscas soltas pela frente da queima (posições fixas, sem aleatoriedade por render). */
const EMBERS = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return { x: r(1), t: r(2), drift: (r(3) - 0.5) * 70, rise: 70 + r(4) * 90, size: 1.6 + r(5) * 2.2, dur: 1.1 + r(6) * 0.9 };
});

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

/** Altura (y no viewBox do wordmark) da frente da queima para o progresso p (0–1). */
const burnY = (p: number) => WORDMARK_H + 30 - p * (WORDMARK_H + 70);

const REGION = { x: -60, y: -80, width: WORDMARK_W + 120, height: WORDMARK_H + 160 };

/**
 * Borda irregular da queima, calculada UMA vez (soma de senoides com fases fixas).
 * Antes era feTurbulence + displacement recalculados a cada quadro — pesado em celular.
 */
const edge = (ph: number) => {
  const pts: [number, number][] = [];
  for (let x = REGION.x; x <= REGION.x + REGION.width; x += 6) {
    const y =
      7 * Math.sin(x * 0.021 + 1.3 + ph) + 5 * Math.sin(x * 0.057 + 4.1 + ph * 2) + 3.5 * Math.sin(x * 0.13 + 2.2 + ph * 3) + 2 * Math.sin(x * 0.31 + 0.7 + ph * 5);
    pts.push([x, Math.round(y * 10) / 10]);
  }
  return pts;
};
const EDGE = edge(0);
const EDGE_TOP = edge(2.4);
const line = (e: [number, number][], dy: number) => e.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y + dy}`).join("");
const back = (e: [number, number][], dy: number) => e.slice().reverse().map(([x, y]) => `L${x} ${y + dy}`).join("");
const BURN_PATHS = {
  // tudo abaixo da frente (some)
  gone: `${line(EDGE, 0)}L${REGION.x + REGION.width} ${WORDMARK_H + 400}L${REGION.x} ${WORDMARK_H + 400}Z`,
  // carvão: topo com outra ondulação, base = a frente
  char: `${line(EDGE_TOP, -58)}${back(EDGE, 0)}Z`,
  // brasa: faixa na frente (o degradê dá o halo)
  ember: `${line(EDGE, -15)}${back(EDGE, 2)}Z`,
};

/**
 * Máscaras da queima. Os desenhos são fixos e só deslizam para cima (transform):
 * `alive` = o que ainda existe, `char` = faixa carbonizada acima da frente,
 * `ember` = brasa na própria frente (com halo falso, sem desfoque).
 */
function BurnDefs({ id, playing }: { id: string; playing: boolean }) {
  const front = useMotionValue(burnY(0));
  useEffect(() => {
    if (!playing) return;
    const c = animate(front, burnY(1), { duration: T.burnDur, delay: T.burnStart, ease: "linear" });
    return () => c.stop();
  }, [playing, front]);
  return (
    <>
      <linearGradient id={`${id}-charg`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.4" stopColor="#fff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={`${id}-emberg`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <mask id={`${id}-alive`} maskUnits="userSpaceOnUse" {...REGION}>
        <rect {...REGION} fill="#fff" />
        <motion.path d={BURN_PATHS.gone} fill="#000" style={{ y: front }} />
      </mask>
      <mask id={`${id}-char`} maskUnits="userSpaceOnUse" {...REGION}>
        <motion.path d={BURN_PATHS.char} fill={`url(#${id}-charg)`} style={{ y: front }} />
      </mask>
      <mask id={`${id}-ember`} maskUnits="userSpaceOnUse" {...REGION}>
        <motion.path d={BURN_PATHS.ember} fill={`url(#${id}-emberg)`} style={{ y: front }} />
      </mask>
    </>
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
  const burnId = useId();

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
          animate(0.42, 0.7, { duration: 1.4, delay: 2.0, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
          // as chamas crescem junto com a queima das letras
          animate(0.7, 1.12, { duration: T.burnDur, delay: T.burnStart, ease: [0.4, 0, 0.6, 1], onUpdate: (v) => (fireK.current = v) }),
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
    signalIntroDone();
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
              ? { scale: 1.08, rotateX: 0, y: -10, opacity: 0 }
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
            <motion.g
              fill={`url(#${gid})`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
              animate={playing ? { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" } : {}}
              transition={{ duration: 1.5, ease: EASE, delay: at(0.9) }}
            >
              <use href={`#${KANJI_ID}`} />
            </motion.g>
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
                  transition={{ duration: 1.3, ease: [0.45, 0, 0.2, 1], delay: 2.25 }}
                />
              </mask>
              <BurnDefs id={burnId} playing={playing} />
            </defs>
            <g mask={`url(#${burnId}-alive)`}>
            <g fill={`url(#${gid}w)`}>
              {LETTER_BOXES.map((l, i) => {
                const fromCenter = l.x + l.w / 2 - WORDMARK_W / 2;
                return (
                  <motion.g
                    key={i}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: WORDMARK_H * 0.5, x: fromCenter * 0.28 }}
                    animate={playing ? { opacity: 1, y: 0, x: 0 } : {}}
                    transition={{ duration: 1.4, ease: EASE, delay: at(1.5 + i * 0.09) }}
                  >
                    <use href={`#${letterId(i)}`} />
                  </motion.g>
                );
              })}
            </g>
            {/* reflexo dourado claro */}
            <g fill="#fff6dc" mask={`url(#${maskId})`} opacity="0.85">
              {LETTER_BOXES.map((_, i) => (
                <use key={i} href={`#${letterId(i)}`} />
              ))}
            </g>
            {/* carvão logo acima da frente da queima */}
            <motion.g fill="#070201" mask={`url(#${burnId}-char)`} initial={{ opacity: 0 }} animate={playing ? { opacity: 1 } : {}} transition={{ duration: 0.4, delay: T.burnStart }}>
              {LETTER_BOXES.map((_, i) => (
                <use key={i} href={`#${letterId(i)}`} />
              ))}
            </motion.g>
            </g>
            {/* brasa na frente da queima */}
            <motion.g fill="#ff9636" mask={`url(#${burnId}-ember)`} initial={{ opacity: 0 }} animate={playing ? { opacity: 1 } : {}} transition={{ duration: 0.4, delay: T.burnStart }}>
              {LETTER_BOXES.map((_, i) => (
                <use key={i} href={`#${letterId(i)}`} />
              ))}
            </motion.g>
            {/* faíscas que se soltam das letras */}
            {playing ? (
              <g>
                {EMBERS.map((e, i) => {
                  const p = 0.08 + e.t * 0.84;
                  const y0 = burnY(p);
                  return (
                    <motion.circle
                      key={i}
                      cx={e.x * WORDMARK_W}
                      r={e.size}
                      fill="#ffc46b"
                      cy={y0}
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], x: e.drift, y: -e.rise }}
                      transition={{ duration: e.dur, delay: T.burnStart + p * T.burnDur, ease: "easeOut" }}
                    />
                  );
                })}
              </g>
            ) : null}
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
