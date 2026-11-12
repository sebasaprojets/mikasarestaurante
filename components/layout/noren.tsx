"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Emblem } from "@/components/brand/logo";
import { basePath } from "@/lib/i18n";

/** Curva do noren (tecido pesado: arranca e assenta devagar). */
export const NOREN_EASE = [0.76, 0, 0.24, 1] as const;
/** Quanto o noren leva para fechar por cima da página atual (s). */
export const NOREN_CLOSE_S = 0.7;
/** Pausa com o noren fechado (emblema inteiro) antes de abrir sobre a página nova (s). */
const NOREN_OPEN_DELAY = 0.15;

/** Uma metade do noren: tecido escuro com a metade do emblema na emenda. */
export function NorenPanel({
  side,
  mode,
  delay = 0,
}: {
  side: "left" | "right";
  /** close: entra pela lateral até fechar · open: sai do centro para a lateral */
  mode: "close" | "open";
  delay?: number;
}) {
  const left = side === "left";
  const out = left ? "-101%" : "101%";
  return (
    <motion.div
      className="absolute inset-y-0 w-1/2 overflow-hidden bg-[#0d0b0b] mk-washi"
      style={{ [left ? "left" : "right"]: 0 }}
      initial={{ x: mode === "close" ? out : "0%" }}
      animate={{ x: mode === "close" ? "0%" : out }}
      transition={{ duration: mode === "close" ? NOREN_CLOSE_S : 1.25, ease: NOREN_EASE, delay }}
    >
      {/* barra superior do noren */}
      <div className="absolute inset-x-0 top-0 h-[7vh] border-b border-line bg-sumi" />
      {/* vincos verticais do tecido */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(25% - 1px), rgba(0,0,0,0.45) calc(25% - 1px) 25%)" }}
      />
      {/* metade do emblema (o outro lado está no outro painel) */}
      <div
        className="absolute top-1/2 w-[clamp(140px,16vw,220px)]"
        style={left ? { right: 0, transform: "translate(50%, -50%)" } : { left: 0, transform: "translate(-50%, -50%)" }}
      >
        <Emblem className="w-full opacity-80" />
      </div>
      {/* fio dourado na emenda */}
      <div className={`absolute inset-y-0 ${left ? "right-0" : "left-0"} w-px bg-ouro/40`} />
    </motion.div>
  );
}

/** Caminho interno de um link (sem basePath), ou null se não for troca de página do site. */
function internalTarget(a: HTMLAnchorElement): string | null {
  if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return null;
  // mesma página (âncoras): o SmartLink cuida com scroll suave
  if (url.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) return null;
  // arquivos (PDF do menu, QR…) abrem direto
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null;
  let path = url.pathname;
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || "/";
  return path + url.search + url.hash;
}

/**
 * Troca de página cinematográfica: ao clicar num link interno, o noren FECHA por cima
 * da página atual, a navegação acontece por trás dele e então ele ABRE sobre a nova.
 * Enquanto isso, `html[data-noren]` esconde o noren do template (app/[lang]/template.tsx),
 * que segue cuidando de voltar/avançar do navegador (lá ele aparece fechado e abre).
 */
export function NorenNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "close" | "open">("idle");
  const pending = useRef(false);

  useEffect(() => {
    let go = 0;
    let safety = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const target = internalTarget(a);
      if (!target) return;
      // impede o Link do Next de navegar já (ele respeita defaultPrevented);
      // os onClick do React (fechar menu mobile etc.) continuam rodando
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      document.documentElement.setAttribute("data-noren", "");
      setPhase("close");
      router.prefetch(target);
      go = window.setTimeout(() => router.push(target), NOREN_CLOSE_S * 1000);
      // nunca deixa a cortina presa se a navegação falhar
      safety = window.setTimeout(() => {
        if (!pending.current) return;
        pending.current = false;
        setPhase("open");
      }, 6000);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(go);
      window.clearTimeout(safety);
    };
  }, [router]);

  // página nova montada por trás do noren fechado: abre
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    setPhase("open");
  }, [pathname]);

  // depois de aberto: sai de cena e devolve o noren ao template (com folga para o dele,
  // escondido, terminar de abrir também)
  useEffect(() => {
    if (phase !== "open") return;
    const t = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-noren");
      setPhase("idle");
    }, 2000);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "idle") return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[96]">
      <NorenPanel key={`l-${phase}`} side="left" mode={phase} delay={phase === "open" ? NOREN_OPEN_DELAY : 0} />
      <NorenPanel key={`r-${phase}`} side="right" mode={phase} delay={phase === "open" ? NOREN_OPEN_DELAY : 0} />
    </div>
  );
}
