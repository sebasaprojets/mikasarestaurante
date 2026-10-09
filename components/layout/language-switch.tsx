"use client";

import { usePathname } from "next/navigation";
import { locales, localeLabels, localePath, stripLocale, withBasePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** ES | EN — mantém a página atual ao trocar o idioma. */
export function LanguageSwitch({ lang, label, className }: { lang: Locale; label: string; className?: string }) {
  const pathname = usePathname() ?? "/";
  const base = stripLocale(pathname);
  return (
    <nav aria-label={label} className={cn("flex items-center font-sans text-[0.68rem] tracking-[0.24em]", className)}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 ? <span aria-hidden className="mx-2 h-3 w-px bg-line-strong" /> : null}
          {/* <a> (não <Link>): trocar idioma troca o layout raiz (<html lang>) → navegação completa */}
          <a
            href={withBasePath(localePath(l, base))}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 min-w-8 items-center justify-center transition-colors duration-500",
              l === lang ? "text-ouro" : "text-washi-dim hover:text-washi",
            )}
          >
            {localeLabels[l]}
          </a>
        </span>
      ))}
    </nav>
  );
}
