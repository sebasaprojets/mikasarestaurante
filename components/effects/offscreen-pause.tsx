"use client";

import { useEffect } from "react";

/**
 * Pausa as animações CSS contínuas de uma seção quando ela sai da tela
 * (e retoma ao voltar). Economiza CPU/GPU e bateria sem que o visitante perceba.
 * Canvas (pétalas, brasas) já pausam sozinhos com IntersectionObserver.
 */
export function OffscreenPause({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.removeAttribute("data-paused");
        else el.setAttribute("data-paused", "");
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);
  return null;
}
