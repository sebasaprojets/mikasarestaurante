"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SmartLink } from "@/components/layout/smart-link";
import { getCopy } from "@/data/copy";
import { localePath, type Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { getNav, homeAnchor, sectionIds } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Header premium:
 *  - transparente sobre o hero
 *  - ao rolar: blur, fundo escuro translúcido e linha dourada sutil
 *  - esconde ao rolar para baixo, reaparece ao rolar para cima
 */
export function Header({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const nav = getNav(lang, c);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - last.current;
    last.current = y;
    setScrolled(y > 24);
    if (menuOpen) return;
    if (y < 160) setHidden(false);
    else if (delta > 4) setHidden(true);
    else if (delta < -4) setHidden(false);
  });

  useEffect(() => {
    document.documentElement.style.setProperty("--header-offset", hidden ? "0px" : "var(--header-h)");
  }, [hidden]);

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b transition-[background-color,border-color,backdrop-filter] duration-700",
        scrolled ? "border-line bg-sumi/70 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
      initial={false}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-6 px-[var(--spacing-gutter)]">
        <SmartLink href={localePath(lang, "/")} aria-label="MIKASA — Japanese Nikkei Cuisine" className="relative z-10 -my-2 py-2">
          <Logo />
        </SmartLink>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.key}>
                <SmartLink
                  href={item.href}
                  className="relative py-3 font-sans text-[0.7rem] uppercase tracking-[0.24em] text-washi-dim transition-colors duration-500 hover:text-washi after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-ouro after:transition-transform after:duration-700 after:ease-[var(--ease-mikasa)] hover:after:scale-x-100"
                >
                  {item.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <LanguageSwitch lang={lang} label={c.a11y.language} />
          <Button asChild size="sm" className="hidden md:inline-flex">
            <SmartLink href={homeAnchor(lang, sectionIds.reservation)}>{c.nav.reserve}</SmartLink>
          </Button>
          <MobileMenu lang={lang} nav={nav} open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </motion.header>
  );
}
