"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type P = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number };

/** Brasas discretas subindo. Canvas leve, pausado fora da tela, ausente em reduced motion. */
export function Embers({ className, count = 26 }: { className?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 140, 60, ${a})`;
        ctx.shadowColor = "rgba(217, 119, 43, 0.9)";
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
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
  }, [reduce, count]);

  if (reduce) return null;
  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}
