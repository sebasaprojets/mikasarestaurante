import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { getCopy } from "@/data/copy";
import { reviews } from "@/data/reviews";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { sectionIds } from "@/lib/nav";

/** Reconhecimentos — Restaurant Guru 2023–2026, seguidores e avaliações reais. */
export function Recognition({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  return (
    <section id={sectionIds.recognition} className="relative border-y border-line py-[var(--spacing-section)] mk-washi">
      <div className="mx-auto max-w-[1600px] px-[var(--spacing-gutter)]">
        <SectionHeading index="07" eyebrow={c.recognition.eyebrow} title={c.recognition.title} align="center" />

        <ul className="mx-auto mt-20 grid max-w-5xl grid-cols-2 border-l border-t border-line md:grid-cols-4">
          {site.awards.map((a, i) => (
            <li key={a.year} className="border-b border-r border-line">
              <Reveal delay={i * 0.1} className="flex flex-col items-center px-4 py-10 text-center md:py-14">
                <span className="font-display text-[clamp(2.5rem,1.8rem+2.4vw,4rem)] font-light leading-none text-ouro">{a.year}</span>
                <span className="mt-4 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-washi-dim">{a.name}</span>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-20 flex flex-col items-center text-center">
          <CountUp
            to={site.social.followers.value}
            suffix={site.social.followers.suffix}
            className="font-display text-[clamp(3rem,2rem+4vw,5.5rem)] font-light leading-none text-washi"
          />
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-10 items-center font-sans text-[0.66rem] uppercase tracking-[0.3em] text-washi-dim transition-colors hover:text-ouro-claro"
          >
            {c.recognition.followers} · {site.social.instagram.handle}
            <span className="sr-only"> {c.a11y.externalLink}</span>
          </a>
        </Reveal>

        <div className="mx-auto mt-24 max-w-5xl">
          <h3 className="text-center font-display text-display-sm text-washi">{c.recognition.reviewsTitle}</h3>
          {reviews.length ? (
            <ul className="mt-12 grid gap-px bg-line md:grid-cols-3">
              {reviews.map((r, i) => (
                <li key={`${r.author}-${i}`} className="bg-sumi p-8">
                  <p className="text-ouro" aria-label={`${r.rating}/5`}>
                    {"★".repeat(r.rating)}
                    <span className="text-washi-mute">{"★".repeat(5 - r.rating)}</span>
                  </p>
                  <blockquote lang={r.lang} className="mt-5 font-display text-lg italic leading-relaxed text-washi">
                    “{r.text}”
                  </blockquote>
                  <p className="mt-6 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-washi-dim">
                    {r.author} · {c.recognition.sourceLabel}:{" "}
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-ouro hover:text-ouro-claro">
                        {r.source}
                      </a>
                    ) : (
                      r.source
                    )}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mx-auto mt-8 max-w-xl border border-dashed border-line-strong px-6 py-6 text-center text-sm leading-relaxed text-washi-mute">
              <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ouro">Placeholder</span>
              {c.recognition.reviewsPending}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
