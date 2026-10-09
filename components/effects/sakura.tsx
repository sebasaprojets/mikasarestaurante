"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { canvasDpr, isLowEndDevice } from "@/lib/device";
import { isPerfLite, PERF_LITE_EVENT } from "@/lib/perf";
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
    const dpr = canvasDpr();
    let w = 0;
    let h = 0;
    const resize = () => {
      if (w && canvas.clientWidth === w && Math.abs(canvas.clientHeight - h) < 160) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mobile = w < 768;
    const count = Math.round((mobile ? 24 : 48) * (isLowEndDevice() ? 0.6 : 1));
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
    let last = 0;
    const tick = (now: number) => {
      // passo normalizado a 60 fps; limitado para não "saltar" após trocar de aba
      const k = last ? Math.min((now - last) / 16.667, 3) : 1;
      last = now;
      t += k;
      ctx.clearRect(0, 0, w, h);
      const wind = Math.sin(t / 420) * 0.18;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += (p.vx + wind + Math.sin((t + i * 37) / 90) * 0.18) * k;
        p.y += p.vy * k;
        p.rot += p.vr * k;
        p.flip += p.vf * k;
        p.a = Math.min(1, p.a + 0.01 * k);
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
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    const lite = () => ps.splice(Math.ceil(ps.length * 0.65));
    if (isPerfLite()) lite();
    window.addEventListener(PERF_LITE_EVENT, lite);
    return () => {
      window.removeEventListener(PERF_LITE_EVENT, lite);
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full [transform:translateZ(0)]", className)}
    />
  );
}

/**
 * Cerejeira (sakura) no canto direito do hero, em três camadas com balanço lento
 * e pétalas caindo. Decorativa (aria-hidden).
 */
export function SakuraTree({ play, className }: { play: boolean; className?: string }) {
  const src = (n: string) => withBasePath(`/hero/sakura-${n}.webp`);
  // versão leve para telas pequenas (menos memória de GPU)
  // galhos + flores numa única imagem (movem-se juntos); 3 tamanhos para cada tela
  const treeSet = [
    `${withBasePath("/hero/sakura-tree-sm.webp")} 520w`,
    `${withBasePath("/hero/sakura-tree-md.webp")} 800w`,
    `${withBasePath("/hero/sakura-tree.webp")} 1200w`,
  ].join(", ");
  // largura real ocupada pela árvore em cada faixa de tela
  const treeSizes = "(max-width: 639px) 280px, (max-width: 1023px) 460px, 52vw";

  return (
    <>
      <motion.div
        aria-hidden
        className={cn("mk-early pointer-events-none absolute right-0 top-0 h-full aspect-[7/8] max-w-none", className)}
        initial={{ opacity: 0, scale: 1.05, x: 24 }}
        animate={play ? { opacity: 1, scale: 1, x: 0 } : {}}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
        // degradê do topo vem embutido nas imagens (mask-image forçava repaint a cada quadro)
        style={{ transformOrigin: "100% 60%" }}
      >
        {/* eslint-disable @next/next/no-img-element -- camadas decorativas animadas, já otimizadas (webp) */}
        {/* fundo desfocado: profundidade / névoa */}
        <img src={src("back")} fetchPriority="low" loading="lazy" alt="" decoding="async" className="mk-sway-slow absolute inset-0 size-full object-contain object-right-top" />
        {/* galhos + flores nítidas balançam juntos a partir do tronco */}
        <div className="mk-sway absolute inset-0" style={{ transformOrigin: "100% 80%" }}>
          <img src={src("tree-md")} srcSet={treeSet} sizes={treeSizes} fetchPriority="high" alt="" decoding="async" className="absolute inset-0 size-full object-contain object-right-top" />
        </div>
        {/* eslint-enable @next/next/no-img-element */}
      </motion.div>
      {play ? <Petals /> : null}
    </>
  );
}
