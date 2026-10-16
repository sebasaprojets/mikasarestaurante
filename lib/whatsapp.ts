import { site } from "@/data/site";
import { clampMessage } from "@/lib/sanitize";

export function whatsappUrl(message: string) {
  return `${site.whatsapp.url}?text=${encodeURIComponent(clampMessage(message))}`;
}
