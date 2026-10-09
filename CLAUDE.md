@AGENTS.md

# MIKASA — Japanese Nikkei Cuisine · Regras permanentes do projeto

Site oficial do MIKASA (Playa Dorada Mall, Puerto Plata, República Dominicana).
Nível visual de hospitalidade de luxo. **LUXO = CONTENÇÃO.**

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · shadcn/ui (padrão
copy-in em `components/ui`) · Motion (`motion/react`) · Lenis · next/image · next/font · Vercel.

> Next 16 tem mudanças de API: consulte `node_modules/next/dist/docs/` antes de usar APIs novas.
> `middleware` agora é `proxy.ts`.

## Estrutura

```
app/[lang]/        rotas (layout raiz, Home, /menu, /bar) — ES sem prefixo, EN em /en
app/               sitemap.ts, robots.ts, opengraph-image.png, icon.svg
components/        ui/ (shadcn) · layout/ · sections/ · menu/ · bar/ · motion/ · effects/ · media/ · brand/ · seo/
data/              site.ts · menu.ts · bar.ts · media.ts · reviews.ts · copy.ts (textos ES/EN)
lib/               i18n · seo · motion (tokens) · format · hours · whatsapp · nav · hooks/
styles/globals.css design tokens (@theme)
public/media/      mídia oficial (ver README da pasta)
proxy.ts           roteamento de idioma
```

- Conteúdo e dados ficam em `data/`, nunca embutidos em componentes.
- Todo texto visível existe em **ES (padrão)** e **EN** (`data/copy.ts` e campos `Localized`).
- Horário, telefone, links, prêmios: somente em `data/site.ts`.

## Marca e efeitos

- Logo oficial vetorizado: traços em `components/brand/logo-paths.ts`, renderizados UMA vez pelo sprite
  `LogoSprite` (layout) e reutilizados com `<use href="#mk-kanji">` / `#mk-l0…5` (medidas em `logo-meta.ts`).
  Nunca importar `logo-paths` em Client Components. Substituir pelo SVG original quando enviado.
- Intro cinematográfica (`components/effects/intro.tsx`): 1x por sessão (`sessionStorage`), sem botão de pular (toca até o fim),
  fogo WebGL (`effects/fire.tsx`), reduced motion = fade curto.
- Hero: cerejeira em camadas (`public/hero/sakura-*.webp`) + pétalas em canvas (`effects/sakura.tsx`).

## Design tokens (fonte de verdade: `styles/globals.css`)

- **Paleta**: Sumi `#0A0A0B` · Carvão `#151517` · Ouro `#C6A15B` · Ouro claro `#E6CF96` · Washi `#EFE9DF` · Torii `#A8322A` (só detalhes mínimos).
  Texto secundário `washi-dim #B9B3AA`, terciário `washi-mute #8D8880` (≥ 4.5:1 sobre Sumi).
- **Tipografia**: Cormorant Garamond (display) · Manrope (texto/UI) — fontes variáveis, subset latino.
  Shippori Mincho = subset local só com 匠 炎 酒 (`styles/fonts/`); kanji novo → gerar subset de novo.
  Escala: `text-display-xl/lg/md/sm`, `mk-eyebrow`.
- **Movimento**: easing `cubic-bezier(0.22, 1, 0.36, 1)`, 0.8–1.4s, stagger leve. Reduced motion: sem parallax, sem autoplay, só fades.
- **Bordas**: quase retas (1–2px). Linhas douradas de 1px (`border-line`, `mk-rule`).
- **Espaçamento**: `--spacing-section`, `--spacing-gutter` (fluidos), muito espaço negativo.

## Regra crítica — NUNCA INVENTAR

Pratos, preços, avaliações, prêmios, horários, números, ingredientes, nomes, depoimentos.
Sem fonte → marcar como pendente (`null`, `status: "pendiente"`, placeholder identificado).
Fontes oficiais dos menus: ver cabeçalho de `data/menu.ts` e `data/bar.ts`.
Avaliações: somente reais (Google / TripAdvisor) em `data/reviews.ts`.
Mídia: nunca usar imagem falsa como foto oficial (`data/media.ts` → `available`).

## Não usar

Gradientes genéricos, neon, emojis, sombras exageradas, cards de template, bordas muito arredondadas,
visual SaaS, excesso de animação ou de elementos simultâneos.

## Fluxo de desenvolvimento

1. Entender o impacto · 2. Verificar componentes existentes · 3. Validar UX/UI ·
4. Implementar de forma incremental (nunca reescrever grandes partes sem necessidade) ·
5. `npm run lint` e `npm run build` · 6. Com erro: não commitar, corrigir ·
7. `git add` · `git commit -m "tipo(escopo): descrição"` · `git push origin <branch>` ·
8. Reportar: alterações, arquivos, lint, build, hash, push, preview.

Testar sempre em **375px, 768px e 1440px** (sem overflow horizontal).
Metas: Lighthouse ≥ 90, LCP < 2.5s, WCAG AA, foco dourado visível.
Performance: dados pesados (menu completo etc.) ficam no servidor — passe só o necessário como props
para Client Components; componentes abertos sob demanda via `next/dynamic` (ex.: lightbox da galeria).
Acessibilidade: não usar `aria-label` em `<p>`/`<div>` sem role; texto animado usa `sr-only` + `aria-hidden`.

## Deploy

- **Vercel** (produção): build normal, com `proxy.ts` (ES sem prefixo) e Cache Components.
- **GitHub Pages** (preview): `.github/workflows/pages.yml` roda `scripts/build-pages.sh` a cada push na `main`
  → export estático em `/<repo>/es/` e `/<repo>/en/` (`STATIC_EXPORT=true`, sem proxy, sitemap/robots estáticos).
  Use `withBasePath()` em `<a>`, `<video>` e `next/image` com caminhos internos.

## Git

Nunca commitar `.env*`, chaves, tokens ou segredos. Nunca commitar vídeos pesados
(Git LFS / Vercel Blob / CDN).

## Pendências conhecidas

Ver `site.pending` em `data/site.ts` (logo oficial, domínio, mídia, transcrição dos menus, avaliações).
