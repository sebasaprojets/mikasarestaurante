"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/icons";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Ubicación & Horario — mapa escuro carregado só quando próximo da viewport. */
export function Location({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadMap, setLoadMap] = useState(false);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoadMap(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id={sectionIds.location} className="relative border-t border-line py-[var(--spacing-section)]">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-[var(--spacing-gutter)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading index="09" eyebrow={c.location.eyebrow} title={c.location.title} />
          <Reveal>
            <dl className="mt-14 space-y-10">
              <div>
                <dt className="mk-eyebrow">{c.location.address}</dt>
                <dd className="mt-3 font-display text-2xl leading-snug text-washi">
                  {site.address.street}
                  <br />
                  <span className="text-washi-dim">
                    {site.address.city}, {site.address.country}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="mk-eyebrow">{c.location.hours}</dt>
                <dd className="mt-3 space-y-2">
                  {site.hours.label[lang].map((h) => (
                    <p key={h.days} className="flex max-w-sm justify-between gap-6 border-b border-line pb-2 text-[0.95rem]">
                      <span className="text-washi-dim">{h.days}</span>
                      <span className="text-washi">{h.time}</span>
                    </p>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="mk-eyebrow">{c.location.phone}</dt>
                <dd className="mt-3">
                  <a href={`tel:${site.phone.e164}`} className="font-display text-2xl text-washi transition-colors hover:text-ouro-claro">
                    {site.phone.display}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Button asChild>
                <a href={site.maps.url} target="_blank" rel="noopener noreferrer">
                  {c.location.maps} <ArrowUpRight className="size-4" strokeWidth={1.25} aria-hidden />
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="size-4" /> {c.location.whatsapp}
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-6 lg:col-start-7" delay={0.1}>
          <div ref={mapRef} className="relative aspect-[4/5] overflow-hidden border border-line bg-carvao sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]">
            {loadMap ? (
              <iframe
                title={c.location.mapTitle}
                src={site.maps.embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0 [filter:grayscale(1)_invert(0.92)_contrast(0.9)_brightness(0.85)_sepia(0.18)]"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center mk-washi">
                <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-mute">{c.location.mapTitle}</span>
              </div>
            )}
            <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(10,10,11,0.85)]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
