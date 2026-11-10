"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SmartLink } from "@/components/layout/smart-link";
import { EASE } from "@/lib/motion";

/** Botão flutuante "Reservar" — somente mobile/tablet. Some quando a seção de reservas está visível. */
export function FloatingReserve({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);

  // Sem listener de scroll: dois IntersectionObservers avisam só quando cruzam o limite.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let pastHero = false;
    let atReservation = false;
    const update = () => setShow(pastHero && !atReservation);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === sentinel.current) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        else atReservation = e.isIntersecting;
      }
      update();
    }, { rootMargin: "0px 0px -20% 0px" });
    if (sentinel.current) io.observe(sentinel.current);
    const target = document.getElementById("reservas");
    if (target) io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <>
    {/* marca o fim dos primeiros 60% da tela: passou dele → mostra o botão */}
    <div ref={sentinel} aria-hidden className="pointer-events-none absolute left-0 top-0 h-[60vh] w-px" />
    <AnimatePresence>
      {show ? (
        <motion.div
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 md:hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <SmartLink
            href={href}
            className="flex h-13 items-center justify-center gap-3 border border-ouro/60 bg-sumi/85 font-sans text-[0.72rem] font-medium uppercase tracking-[0.28em] text-ouro-claro backdrop-blur-xl"
          >
            <span aria-hidden className="h-px w-5 bg-ouro" />
            {label}
            <span aria-hidden className="h-px w-5 bg-ouro" />
          </SmartLink>
        </motion.div>
      ) : null}
    </AnimatePresence>
    </>
  );
}
