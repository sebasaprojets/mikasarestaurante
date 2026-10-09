"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type P = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number };

/** Brasas discretas subindo. Canvas leve, pausado fora da tela. */
export function Embers({ className, count = 26 }: { className?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // brilho pré-renderizado (evita shadowBlur por partícula, caro no mobile)
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext("2d")!;
    const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,200,130,1)");
    grad.addColorStop(0.25, "rgba(230,140,60,0.85)");
    grad.addColorStop(1, "rgba(217,119,43,0)");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 32, 32);

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const n = window.innerWidth < 768 ? Math.round(count * 0.55) : count;

    const spawn = (initial = false): P => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.4,
      vy: 0.18 + Math.random() * 0.45,
      vx: (Math.random() - 0.5) * 0.18,
      life: 0,
      max: 260 + Math.random() * 420,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ps: P[] = Array.from({ length: n }, () => spawn(true));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.life++;
        p.y -= p.vy;
        p.x += p.vx + Math.sin((p.life + i * 40) / 60) * 0.12;
        const t = p.life / p.max;
        const a = Math.sin(Math.PI * Math.min(t, 1)) * 0.7;
        const size = p.r * 7;
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
        if (t >= 1 || p.y < -10) ps[i] = spawn();
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
  }, [count]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}
