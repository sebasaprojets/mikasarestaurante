"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n";
import { useScrollTo } from "@/components/providers/smooth-scroll";

type Props = React.ComponentProps<typeof Link> & { href: string; onNavigate?: () => void };

/**
 * Link que, quando aponta para uma âncora da página atual,
 * faz scroll suave (Lenis) em vez de saltar.
 */
export function SmartLink({ href, onClick, onNavigate, ...props }: Props) {
  const pathname = usePathname() ?? "/";
  const scrollTo = useScrollTo();

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        const [path, hash] = href.split("#");
        if (hash && stripLocale(path || "/") === stripLocale(pathname)) {
          const el = document.getElementById(hash);
          if (el) {
            e.preventDefault();
            onNavigate?.();
            history.replaceState(null, "", `#${hash}`);
            // aguarda o fechamento do menu mobile antes de rolar
            requestAnimationFrame(() => scrollTo(el));
            return;
          }
        }
        onNavigate?.();
      }}
      {...props}
    />
  );
}
