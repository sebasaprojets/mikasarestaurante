import { site } from "@/data/site";
import type { Locale } from "@/lib/i18n";

/** Preço em USD. `null` → pendente (a UI decide como exibir). */
export function formatPrice(value: number | null, lang: Locale): string | null {
  if (value == null) return null;
  return new Intl.NumberFormat(lang === "es" ? "es-DO" : "en-US", {
    style: "currency",
    currency: site.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
