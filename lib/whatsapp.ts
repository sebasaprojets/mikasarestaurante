import { site } from "@/data/site";

export function whatsappUrl(message: string) {
  return `${site.whatsapp.url}?text=${encodeURIComponent(message)}`;
}
