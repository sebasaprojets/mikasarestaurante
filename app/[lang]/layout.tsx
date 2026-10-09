import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import { Cursor } from "@/components/effects/cursor";
import { Grain } from "@/components/effects/grain";
import { LogoSprite } from "@/components/brand/logo-sprite";
import { Intro, introScript } from "@/components/effects/intro";
import { Footer } from "@/components/layout/footer";
import { FloatingReserve } from "@/components/layout/floating-reserve";
import { Header } from "@/components/layout/header";
import { MotionProvider } from "@/components/providers/motion-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { JsonLd } from "@/components/seo/json-ld";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import { cormorant, manrope, shippori } from "@/lib/fonts";
import { hasLocale, htmlLang, locales } from "@/lib/i18n";
import { homeAnchor, sectionIds } from "@/lib/nav";
import { buildMetadata, restaurantJsonLd, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCopy(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: c.meta.title, template: "%s" },
    applicationName: site.fullName,
    keywords: ["MIKASA", "Nikkei", "sushi", "omakase", "robata", "Puerto Plata", "Playa Dorada", "restaurante japonés", "Japanese restaurant"],
    formatDetection: { telephone: false },
    ...buildMetadata({ lang, path: "/", title: c.meta.title, description: c.meta.description }),
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const c = getCopy(lang);

  return (
    <html
      lang={htmlLang[lang]}
      className={`${cormorant.variable} ${manrope.variable} ${shippori.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:bg-ouro focus:px-5 focus:py-3 focus:text-sumi"
        >
          {c.a11y.skip}
        </a>
        <LogoSprite />
        <MotionProvider>
          <Intro />
          <SmoothScroll>
            <Header lang={lang} />
            <main id="contenido">{children}</main>
            <Footer lang={lang} />
            <FloatingReserve href={homeAnchor(lang, sectionIds.reservation)} label={c.nav.reserve} />
          </SmoothScroll>
          <Cursor />
          <Grain />
        </MotionProvider>
        <JsonLd data={restaurantJsonLd(lang)} />
      </body>
    </html>
  );
}
