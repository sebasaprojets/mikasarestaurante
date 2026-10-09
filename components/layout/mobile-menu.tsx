"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { InstagramIcon, ThreadsIcon, WhatsAppIcon } from "@/components/brand/icons";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { SmartLink } from "@/components/layout/smart-link";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { EASE } from "@/lib/motion";
import { homeAnchor, sectionIds, type NavItem } from "@/lib/nav";

/** Menu mobile em tela cheia com entrada escalonada (StaggeredMenu recalibrado). */
export function MobileMenu({
  lang,
  nav,
  open,
  onOpenChange,
}: {
  lang: Locale;
  nav: NavItem[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const c = getCopy(lang);
  const reduce = useReducedMotion();
  const close = () => onOpenChange(false);
  const items = [...nav, { key: "reserve", label: c.nav.reserve, href: homeAnchor(lang, sectionIds.reservation) }];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger
        className="relative z-10 grid size-11 place-items-center lg:hidden"
        aria-label={open ? c.a11y.closeMenu : c.a11y.openMenu}
      >
        <span aria-hidden className="flex w-7 flex-col items-end gap-[7px]">
          <span className="h-px w-7 bg-washi" />
          <span className="h-px w-4 bg-ouro" />
        </span>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Content forceMount asChild aria-describedby={undefined} data-lenis-prevent>
              <motion.div
                className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-sumi mk-washi"
                initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
                animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
                exit={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)", opacity: reduce ? 0 : 1 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <DialogPrimitive.Title className="sr-only">MIKASA</DialogPrimitive.Title>
                <div className="flex h-[var(--header-h)] items-center justify-between px-[var(--spacing-gutter)]">
                  <Logo />
                  <DialogPrimitive.Close className="grid size-11 place-items-center" aria-label={c.a11y.closeMenu}>
                    <span aria-hidden className="relative block size-6">
                      <span className="absolute left-0 top-1/2 h-px w-6 rotate-45 bg-washi" />
                      <span className="absolute left-0 top-1/2 h-px w-6 -rotate-45 bg-ouro" />
                    </span>
                  </DialogPrimitive.Close>
                </div>

                <nav aria-label="Principal" className="flex flex-1 flex-col justify-center px-[var(--spacing-gutter)] py-10">
                  <ul className="flex flex-col gap-1">
                    {items.map((item, i) => (
                      <motion.li
                        key={item.key}
                        initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: EASE, delay: 0.25 + i * 0.06 }}
                      >
                        <SmartLink
                          href={item.href}
                          onNavigate={close}
                          className="group flex items-baseline gap-5 py-2.5 font-display text-[2.4rem] leading-tight text-washi transition-colors duration-500 hover:text-ouro-claro"
                        >
                          <span className="font-sans text-[0.62rem] tracking-[0.28em] text-ouro tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {item.label}
                        </SmartLink>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <motion.div
                  className="flex items-center justify-between border-t border-line px-[var(--spacing-gutter)] py-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.7 }}
                >
                  <LanguageSwitch lang={lang} label={c.a11y.language} />
                  <div className="flex items-center gap-1 text-washi-dim">
                    <a href={site.social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${site.social.instagram.handle}`} className="grid size-11 place-items-center hover:text-ouro-claro">
                      <InstagramIcon />
                    </a>
                    <a href={site.social.threads.url} target="_blank" rel="noopener noreferrer" aria-label={`Threads ${site.social.threads.handle}`} className="grid size-11 place-items-center hover:text-ouro-claro">
                      <ThreadsIcon />
                    </a>
                    <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${site.phone.display}`} className="grid size-11 place-items-center hover:text-ouro-claro">
                      <WhatsAppIcon />
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
