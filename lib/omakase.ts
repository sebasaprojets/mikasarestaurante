import { getCopy } from "@/data/copy";
import { findCategory, findItem, minPrice, omakaseFeatured } from "@/data/menu";
import type { MediaAsset } from "@/data/media";
import type { Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";

/** Destaque da seção Omakase, já resolvido para um idioma (dados serializáveis). */
export type OmakaseFeature = {
  id: string;
  nome: string;
  descricao: string | null;
  componentes?: string[];
  porcao?: string | null;
  price: string | null;
  imagem: MediaAsset | null;
};

/** Calculado no servidor: evita enviar o menu inteiro no JavaScript da Home. */
export function getOmakaseFeatures(lang: Locale): OmakaseFeature[] {
  const c = getCopy(lang);
  return omakaseFeatured.flatMap((f): OmakaseFeature[] => {
    if ("item" in f) {
      const it = findItem(f.item);
      if (!it) return [];
      return [{ id: it.id, nome: it.nome[lang], descricao: it.descricao?.[lang] ?? null, componentes: it.componentes, porcao: it.porcao, price: formatPrice(it.preco, lang), imagem: it.imagem }];
    }
    const cat = findCategory(f.categoria);
    if (!cat) return [];
    const from = formatPrice(minPrice(f.categoria), lang);
    return [{ id: cat.id, nome: cat.nome[lang], descricao: f.descricao[lang], price: from ? `${c.menuPage.from} ${from}` : null, imagem: f.imagem }];
  });
}
