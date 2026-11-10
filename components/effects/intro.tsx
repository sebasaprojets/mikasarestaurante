"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { EMBLEM_ARC, GoldGradient } from "@/components/brand/logo";
import { EMBLEM_VIEWBOX, KANJI_ID, LETTER_BOXES, letterId, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-meta";
import { Fire } from "@/components/effects/fire";
import { isLowEndDevice } from "@/lib/device";
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

/** Área do canvas da queima, em unidades do viewBox do wordmark (folga para as faíscas subirem). */
const CANVAS_BOX = { x: -60, y: -230, w: WORDMARK_W + 120, h: WORDMARK_H + 300 };

/** Borda irregular da queima (soma de senoides com fases fixas), em relação à frente. */
const edgeAt = (x: number) =>
  7 * Math.sin(x * 0.021 + 1.3) + 5 * Math.sin(x * 0.057 + 4.1) + 3.5 * Math.sin(x * 0.13 + 2.2) + 2 * Math.sin(x * 0.31 + 0.7);

/**
 * Queima das letras desenhada num único <canvas> 2D: um desenho por quadro, sem
 * tocar no DOM (antes eram máscaras SVG + 16 círculos animados, ~800 mudanças de
 * estilo durante a queima). Assume no mesmo quadro em que esconde as letras SVG.
 */
function BurnCanvas({ playing, lite, hideRef }: { playing: boolean; lite: boolean; hideRef: React.RefObject<SVGGElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!playing) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const letters = LETTER_BOXES.map((_, i) => document.getElementById(letterId(i))?.getAttribute("d")).filter(Boolean) as string[];
    if (letters.length !== LETTER_BOXES.length) return;
    const paths = letters.map((d) => new Path2D(d));

    // região acima da frente (frente em y=0), calculada uma vez
    const above = new Path2D();
    above.moveTo(CANVAS_BOX.x, -2000);
    for (let x = CANVAS_BOX.x; x <= CANVAS_BOX.x + CANVAS_BOX.w; x += 6) above.lineTo(x, edgeAt(x));
    above.lineTo(CANVAS_BOX.x + CANVAS_BOX.w, -2000);
    above.closePath();

    const embers = lite ? EMBERS.slice(0, 7) : EMBERS;
    let raf = 0;
    let k = 1; // px por unidade do viewBox
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      k = canvas.width / CANVAS_BOX.w;
    };

    const draw = (t: number) => {
      const p = Math.min(1, Math.max(0, t / T.burnDur));
      const front = burnY(p);
      ctx.setTransform(k, 0, 0, k, -CANVAS_BOX.x * k, -CANVAS_BOX.y * k);
      ctx.clearRect(CANVAS_BOX.x, CANVAS_BOX.y, CANVAS_BOX.w, CANVAS_BOX.h);

      ctx.save();
      // recorta tudo que já queimou (abaixo da frente irregular)
      ctx.translate(0, front);
      ctx.clip(above);
      ctx.translate(0, -front);
      const gold = ctx.createLinearGradient(0, 0, 0, WORDMARK_H);
      gold.addColorStop(0, "#f0dca6");
      gold.addColorStop(0.45, "#d4b06a");
      gold.addColorStop(1, "#a8823f");
      ctx.fillStyle = gold;
      for (const path of paths) ctx.fill(path, "evenodd");
      // carvão e brasa só sobre as letras (source-atop)
      ctx.globalCompositeOperation = "source-atop";
      const charG = ctx.createLinearGradient(0, front - 62, 0, front);
      charG.addColorStop(0, "rgba(7,2,1,0)");
      charG.addColorStop(0.45, "rgba(7,2,1,0.88)");
      charG.addColorStop(1, "rgba(7,2,1,1)");
      ctx.fillStyle = charG;
      ctx.fillRect(CANVAS_BOX.x, front - 62, CANVAS_BOX.w, 80);
      const emberG = ctx.createLinearGradient(0, front - 16, 0, front + 8);
      emberG.addColorStop(0, "rgba(255,150,54,0)");
      emberG.addColorStop(0.55, "rgba(255,150,54,0.75)");
      emberG.addColorStop(1, "rgba(255,190,90,1)");
      ctx.fillStyle = emberG;
      ctx.fillRect(CANVAS_BOX.x, front - 16, CANVAS_BOX.w, 30);
      ctx.restore();

      // faíscas que se soltam da frente
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        const ep = 0.08 + e.t * 0.84;
        const life = (t - ep * T.burnDur) / e.dur;
        if (life <= 0 || life >= 1) continue;
        const ease = 1 - (1 - life) * (1 - life);
        ctx.globalAlpha = Math.sin(Math.PI * life);
        ctx.fillStyle = "#ffc46b";
        ctx.beginPath();
        ctx.arc(e.x * WORDMARK_W + e.drift * ease, burnY(ep) - e.rise * ease, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let t0 = 0;
    const loop = (now: number) => {
      if (!t0) {
        t0 = now;
        size();
        // troca SVG → canvas no mesmo quadro
        if (hideRef.current) hideRef.current.style.visibility = "hidden";
      }
      const t = (now - t0) / 1000;
      draw(t);
      if (t < T.burnDur + 2) raf = requestAnimationFrame(loop);
    };
    const timer = window.setTimeout(() => (raf = requestAnimationFrame(loop)), T.burnStart * 1000);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [playing, lite, hideRef]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${(CANVAS_BOX.x / WORDMARK_W) * 100}%`,
        top: `${(CANVAS_BOX.y / WORDMARK_H) * 100}%`,
        width: `${(CANVAS_BOX.w / WORDMARK_W) * 100}%`,
        height: `${(CANVAS_BOX.h / WORDMARK_H) * 100}%`,
      }}
    />
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
  const lettersRef = useRef<SVGGElement>(null);
  const [lite, setLite] = useState(false);

  // inicia
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) {
      const id = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      setLite(isLowEndDevice());
      setPhase("play");
    });
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
        className="absolute left-1/2 top-[42%] size-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-[transform,opacity]"
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
          className="relative -mt-[12vh] flex flex-col items-center will-change-transform"
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
          <svg viewBox={EMBLEM_VIEWBOX} className="w-[clamp(104px,15vw,176px)] overflow-visible [transform:translateZ(0)]" aria-hidden>
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
          <div className="relative mt-[clamp(1.5rem,4vh,2.75rem)] w-[clamp(240px,46vw,560px)]">
          <svg viewBox={WORDMARK_VIEWBOX} className="block w-full overflow-visible" aria-hidden>
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
                  transition={{ duration: 1.3, ease: [0.45, 0, 0.2, 1], delay: 2.1 }}
                />
              </mask>
            </defs>
            <g ref={lettersRef}>
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
            </g>
          </svg>
          <BurnCanvas playing={playing} lite={lite} hideRef={lettersRef} />
          </div>

          {/* Tagline */}
          <motion.p
            className="mt-5 whitespace-nowrap font-sans text-[clamp(0.7rem,1.1vw,0.8rem)] uppercase tracking-[0.42em] text-ouro-claro"
            initial={{ opacity: 0, scaleX: reduce ? 1 : 1.35 }}
            animate={playing ? { opacity: 1, scaleX: 1 } : {}}
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
