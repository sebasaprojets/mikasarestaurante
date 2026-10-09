import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { FooterWordmark } from "@/components/layout/footer-wordmark";
import { InstagramIcon, ThreadsIcon, WhatsAppIcon } from "@/components/brand/icons";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import { localePath, type Locale } from "@/lib/i18n";
import { homeAnchor, sectionIds } from "@/lib/nav";

const linkCls =
  "inline-flex min-h-10 items-center text-sm text-washi-dim transition-colors duration-500 hover:text-ouro-claro";

export function Footer({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <footer className="relative border-t border-line bg-sumi">
      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)] pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 md:pb-16">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href={localePath(lang, "/")} aria-label="MIKASA">
              <Logo withTagline />
            </Link>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-washi-mute">{site.address.full}</p>
            <span aria-hidden className="mt-10 block font-jp text-3xl text-ouro/40">
              匠
            </span>
          </div>

          <nav aria-label={c.footer.explore} className="md:col-span-2">
            <h2 className="mk-eyebrow mb-5">{c.footer.explore}</h2>
            <ul className="space-y-1">
              <li>
                <Link className={linkCls} href={localePath(lang, "/menu")}>
                  {c.nav.menu}
                </Link>
              </li>
              <li>
                <Link className={linkCls} href={localePath(lang, "/bar")}>
                  {c.nav.bar}
                </Link>
              </li>
              <li>
                <Link className={linkCls} href={homeAnchor(lang, sectionIds.reservation)}>
                  {c.nav.reserve}
                </Link>
              </li>
              <li>
                <Link className={linkCls} href={homeAnchor(lang, sectionIds.location)}>
                  {c.nav.location}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="mk-eyebrow mb-5">{c.footer.originals}</h2>
            <ul className="space-y-1">
              <li>
                <a className={linkCls} href={site.menus.food.flipbook} {...ext}>
                  {c.footer.menuFlipbook}
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </li>
              <li>
                <a className={linkCls} href={site.menus.bar.flipbook} {...ext}>
                  {c.footer.barFlipbook}
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="mk-eyebrow mb-5">{c.footer.contact}</h2>
            <ul className="space-y-1">
              <li>
                <a className={linkCls} href={`tel:${site.phone.e164}`}>
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a className={`${linkCls} gap-3`} href={site.whatsapp.url} {...ext}>
                  <WhatsAppIcon /> WhatsApp
                </a>
              </li>
              <li>
                <a className={`${linkCls} gap-3`} href={site.social.instagram.url} {...ext}>
                  <InstagramIcon /> {site.social.instagram.handle}
                </a>
              </li>
              <li>
                <a className={`${linkCls} gap-3`} href={site.social.threads.url} {...ext}>
                  <ThreadsIcon /> {site.social.threads.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-line pt-8 text-[0.7rem] tracking-[0.12em] text-washi-mute md:flex-row md:items-center md:justify-between">
          <p>
            © {site.fullName}. {c.footer.rights}
          </p>
          <p className="uppercase tracking-[0.28em]">Playa Dorada · Puerto Plata</p>
        </div>

        {/* MIKASA gigante revelado letra a letra no fim da página */}
        <FooterWordmark />
      </div>
    </footer>
  );
}
