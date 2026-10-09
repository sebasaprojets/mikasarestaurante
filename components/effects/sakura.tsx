"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { withBasePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Petal = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; flip: number; vf: number; s: number; sprite: number; a: number };

const PINKS: [string, string][] = [
  ["#f8dde5", "#e7a9bb"],
  ["#f3c9d5", "#d98aa1"],
  ["#fbe9ee", "#ecb7c6"],
];

/** Sprite de pétala de sakura (com a fenda na ponta), pré-renderizado uma vez. */
function makeSprite(size: number, [c0, c1]: [string, string]) {
  const c = document.createElement("canvas");
  c.width = c.height = size * 2;
  const g = c.getContext("2d")!;
  g.translate(size, size);
  const grad = g.createLinearGradient(0, -size, 0, size);
  grad.addColorStop(0, c0);
  grad.addColorStop(1, c1);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, size * 0.9);
  g.bezierCurveTo(size * 0.9, size * 0.4, size * 0.7, -size * 0.75, size * 0.14, -size * 0.85);
  g.lineTo(0, -size * 0.62);
  g.lineTo(-size * 0.14, -size * 0.85);
  g.bezierCurveTo(-size * 0.7, -size * 0.75, -size * 0.9, size * 0.4, 0, size * 0.9);
  g.fill();
  return c;
}

/** Pétalas caindo devagar a partir da copa (lado direito). Canvas leve, pausa fora da tela. */
function Petals({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprites = PINKS.map((p) => makeSprite(16, p));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mobile = w < 768;
    const count = mobile ? 16 : 34;
    const spawn = (initial: boolean): Petal => ({
      // nascem na copa: metade direita, terço superior
      x: w * (0.48 + Math.random() * 0.55),
      y: initial ? Math.random() * h : h * (Math.random() * 0.35) - 20,
      vx: -(0.12 + Math.random() * 0.32),
      vy: 0.22 + Math.random() * 0.38,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.012,
      flip: Math.random() * Math.PI * 2,
      vf: 0.012 + Math.random() * 0.02,
      s: (mobile ? 0.32 : 0.38) + Math.random() * 0.42,
      sprite: Math.floor(Math.random() * sprites.length),
      a: 0,
    });
    const ps: Petal[] = Array.from({ length: count }, () => spawn(true));

    let raf = 0;
    let running = false;
    let t = 0;
    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);
      const wind = Math.sin(t / 420) * 0.18;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx + wind + Math.sin((t + i * 37) / 90) * 0.18;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += p.vf;
        p.a = Math.min(1, p.a + 0.01);
        const fade = Math.min(1, (h - p.y) / (h * 0.25));
        const sp = sprites[p.sprite];
        ctx.save();
        ctx.globalAlpha = 0.95 * p.a * Math.max(0, fade);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.s, p.s * (0.5 + 0.5 * Math.abs(Math.cos(p.flip))));
        ctx.drawImage(sp, -sp.width / 2, -sp.height / 2);
        ctx.restore();
        if (p.y > h + 20 || p.x < -30) ps[i] = spawn(false);
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}

/**
 * Cerejeira (sakura) no canto direito do hero, em três camadas com balanço lento
 * e pétalas caindo. Decorativa (aria-hidden).
 */
export function SakuraTree({ play, className }: { play: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const src = (n: string) => withBasePath(`/hero/sakura-${n}.webp`);

  return (
    <>
      <motion.div
        aria-hidden
        className={cn("pointer-events-none absolute right-0 top-0 h-full aspect-[7/8] max-w-none", className)}
        initial={{ opacity: 0, scale: 1.05, x: 24 }}
        animate={play ? { opacity: 1, scale: 1, x: 0 } : {}}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transformOrigin: "100% 60%",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 100%)",
        }}
      >
        {/* eslint-disable @next/next/no-img-element -- camadas decorativas animadas, já otimizadas (webp) */}
        {/* fundo desfocado: profundidade / névoa */}
        <img src={src("back")} alt="" decoding="async" className="mk-sway-slow absolute inset-0 size-full object-contain object-right-top" />
        {/* galhos + flores nítidas balançam juntos a partir do tronco */}
        <div className="mk-sway absolute inset-0" style={{ transformOrigin: "100% 80%" }}>
          <img src={src("branches")} alt="" decoding="async" className="absolute inset-0 size-full object-contain object-right-top" />
          <img src={src("front")} alt="" decoding="async" className="absolute inset-0 size-full object-contain object-right-top" />
        </div>
        {/* eslint-enable @next/next/no-img-element */}
      </motion.div>
      {!reduce && play ? <Petals /> : null}
    </>
  );
}
