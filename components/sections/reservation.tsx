"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/brand/icons";
import { getCopy } from "@/data/copy";
import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";
import { isClosedOn, reservationSlots, to12h, todayIso } from "@/lib/hours";
import { sectionIds } from "@/lib/nav";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type OccasionKey = keyof ReturnType<typeof getCopy>["reservation"]["occasions"];
const occasionKeys: OccasionKey[] = ["birthday", "business", "proposal", "omakase", "other"];

type Form = {
  name: string;
  date: string;
  time: string;
  guests: number;
  occasion: OccasionKey | "";
  allergies: string;
  notes: string;
};
type Errors = Partial<Record<"name" | "date" | "time" | "guests", string>>;

const fieldCls =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-washi placeholder:text-washi-mute/80 transition-colors duration-500 focus:border-ouro focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-[#e58a80]";
const labelCls = "flex items-baseline justify-between font-sans text-[0.62rem] uppercase tracking-[0.28em] text-washi-dim";
const errorCls = "mt-2 text-xs text-[#e58a80]";

export function Reservation({ lang }: { lang: Locale }) {
  const c = getCopy(lang);
  const r = c.reservation;
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const dateRef = useRef<HTMLInputElement>(null);
  const slots = useMemo(() => reservationSlots(), []);
  const [form, setForm] = useState<Form>({ name: "", date: "", time: "", guests: 2, occasion: "", allergies: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  // data mínima = hoje (definida no cliente, evita divergência de hidratação)
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = todayIso();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (f: Form): Errors => {
    const e: Errors = {};
    if (!f.name.trim()) e.name = r.errors.name;
    if (!f.date) e.date = r.errors.date;
    else if (f.date < todayIso()) e.date = r.pastDate;
    else if (isClosedOn(f.date)) e.date = r.closedDay;
    if (!f.time) e.time = r.errors.time;
    if (!f.guests || f.guests < 1) e.guests = r.errors.guests;
    return e;
  };

  const buildMessage = (f: Form) => {
    const [y, m, d] = f.date.split("-").map(Number);
    const dateLabel = new Date(y, m - 1, d).toLocaleDateString(lang === "es" ? "es-DO" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const lines = [
      r.message.greeting,
      "",
      `• ${r.message.name}: ${f.name.trim()}`,
      `• ${r.message.date}: ${dateLabel}`,
      `• ${r.message.time}: ${to12h(f.time)}`,
      `• ${r.message.guests}: ${f.guests}`,
    ];
    if (f.occasion) lines.push(`• ${r.message.occasion}: ${r.occasions[f.occasion]}`);
    if (f.allergies.trim()) lines.push(`• ${r.message.allergies}: ${f.allergies.trim()}`);
    if (f.notes.trim()) lines.push(`• ${r.message.notes}: ${f.notes.trim()}`);
    lines.push("", r.message.thanks);
    return lines.join("\n");
  };

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    const first = (Object.keys(e) as (keyof Errors)[]).find((k) => e[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    const url = whatsappUrl(buildMessage(form));
    setSentUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const describe = (k: keyof Errors) => (errors[k] ? id(`${k}-error`) : undefined);
  const max = site.reservations.maxGuests;

  return (
    <section id={sectionIds.reservation} className="relative py-[var(--spacing-section)]">
      <div className="mx-auto grid max-w-[1600px] gap-16 px-[var(--spacing-gutter)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index="08" eyebrow={r.eyebrow} title={r.title} />
          <Reveal>
            <p className="mt-8 max-w-[34ch] text-[0.95rem] leading-relaxed text-washi-dim">{r.intro}</p>
            <dl className="mt-12 space-y-3 border-t border-line pt-8 text-sm">
              {site.hours.label[lang].map((h) => (
                <div key={h.days} className="flex justify-between gap-6">
                  <dt className="text-washi-dim">{h.days}</dt>
                  <dd className="text-washi">{h.time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7 lg:col-start-6">
          <form noValidate onSubmit={onSubmit} className="grid gap-x-10 gap-y-10 border border-line bg-carvao/60 p-6 sm:p-10 md:grid-cols-2 lg:p-14">
            {/* Nome */}
            <div className="md:col-span-2">
              <label htmlFor={id("name")} className={labelCls}>
                {r.name} <span className="text-ouro/80">{r.required}</span>
              </label>
              <input
                id={id("name")}
                name="name"
                autoComplete="name"
                required
                placeholder={r.namePlaceholder}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={describe("name")}
                className={fieldCls}
              />
              {errors.name ? <p id={id("name-error")} className={errorCls}>{errors.name}</p> : null}
            </div>

            {/* Data */}
            <div>
              <label htmlFor={id("date")} className={labelCls}>
                {r.date} <span className="text-ouro/80">{r.required}</span>
              </label>
              <input
                ref={dateRef}
                id={id("date")}
                name="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={describe("date")}
                className={cn(fieldCls, "[&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:invert")}
              />
              {errors.date ? <p id={id("date-error")} className={errorCls}>{errors.date}</p> : null}
            </div>

            {/* Horário */}
            <div>
              <label htmlFor={id("time")} className={labelCls}>
                {r.time} <span className="text-ouro/80">{r.required}</span>
              </label>
              <select
                id={id("time")}
                name="time"
                required
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                aria-invalid={!!errors.time}
                aria-describedby={describe("time")}
                className={cn(fieldCls, "appearance-none bg-[length:12px] bg-[right_4px_center] bg-no-repeat")}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none' stroke='%23C6A15B'><path d='M1 1.5l5 5 5-5'/></svg>\")",
                }}
              >
                <option value="" disabled className="bg-carvao">
                  {r.timePlaceholder}
                </option>
                {slots.map((s) => (
                  <option key={s} value={s} className="bg-carvao">
                    {to12h(s)}
                  </option>
                ))}
              </select>
              {errors.time ? <p id={id("time-error")} className={errorCls}>{errors.time}</p> : null}
            </div>

            {/* Pessoas */}
            <div>
              <span id={id("guests-label")} className={labelCls}>
                {r.guests} <span className="text-ouro/80">{r.required}</span>
              </span>
              <div className="mt-2 flex items-center justify-between border-b border-line-strong" role="group" aria-labelledby={id("guests-label")}>
                <button
                  type="button"
                  onClick={() => set("guests", Math.max(1, form.guests - 1))}
                  disabled={form.guests <= 1}
                  className="grid size-11 place-items-center text-washi transition-colors hover:text-ouro-claro disabled:opacity-30"
                  aria-label={lang === "es" ? "Quitar una persona" : "Remove one guest"}
                >
                  <Minus className="size-4" strokeWidth={1.25} aria-hidden />
                </button>
                <output id={id("guests")} tabIndex={-1} aria-live="polite" className="font-display text-3xl text-washi tabular-nums">
                  {form.guests}
                </output>
                <button
                  type="button"
                  onClick={() => set("guests", Math.min(max, form.guests + 1))}
                  disabled={form.guests >= max}
                  className="grid size-11 place-items-center text-washi transition-colors hover:text-ouro-claro disabled:opacity-30"
                  aria-label={lang === "es" ? "Añadir una persona" : "Add one guest"}
                >
                  <Plus className="size-4" strokeWidth={1.25} aria-hidden />
                </button>
              </div>
              <p className="mt-2 text-xs text-washi-mute">{r.guestsMore.replace("{n}", String(max))}</p>
            </div>

            {/* Ocasião */}
            <fieldset className="md:col-span-2">
              <legend className={cn(labelCls, "mb-4 w-full")}>
                {r.occasion} <span className="text-washi-mute">{r.optional}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {occasionKeys.map((k) => {
                  const active = form.occasion === k;
                  return (
                    <label
                      key={k}
                      className={cn(
                        "relative inline-flex min-h-11 cursor-pointer items-center border px-4 text-[0.78rem] tracking-[0.04em] transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ouro",
                        active ? "border-ouro text-ouro-claro" : "border-line text-washi-dim hover:border-line-strong hover:text-washi",
                      )}
                    >
                      <input
                        type="radio"
                        name="occasion"
                        value={k}
                        checked={active}
                        onChange={() => set("occasion", k)}
                        onClick={() => active && set("occasion", "")}
                        className="sr-only"
                      />
                      {r.occasions[k]}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Alergias */}
            <div className="md:col-span-2">
              <label htmlFor={id("allergies")} className={labelCls}>
                {r.allergies} <span className="text-washi-mute">{r.optional}</span>
              </label>
              <input
                id={id("allergies")}
                name="allergies"
                placeholder={r.allergiesPlaceholder}
                value={form.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                className={fieldCls}
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label htmlFor={id("notes")} className={labelCls}>
                {r.notes} <span className="text-washi-mute">{r.optional}</span>
              </label>
              <textarea
                id={id("notes")}
                name="notes"
                rows={3}
                placeholder={r.notesPlaceholder}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className={cn(fieldCls, "resize-none")}
              />
            </div>

            <div className="flex flex-col gap-5 md:col-span-2 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" className="h-auto min-h-14 w-full whitespace-normal px-5 py-3 text-center sm:w-auto sm:px-9">
                <WhatsAppIcon className="size-4" /> {r.submit}
              </Button>
              <Button asChild variant="outline" size="lg" className="h-auto min-h-14 w-full whitespace-normal px-5 py-3 text-center sm:w-auto sm:px-9">
                <a href={whatsappUrl(r.message.events)} target="_blank" rel="noopener noreferrer">
                  {r.events}
                  <span className="sr-only"> {c.a11y.externalLink}</span>
                </a>
              </Button>
            </div>

            <p aria-live="polite" className="text-sm text-washi-dim md:col-span-2 empty:hidden">
              {sentUrl ? (
                <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-ouro underline-offset-4 hover:text-ouro-claro">
                  {r.sent}
                </a>
              ) : null}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
