# MIKASA — Japanese Nikkei Cuisine

Site oficial · Playa Dorada Mall, Puerto Plata, República Dominicana.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

- Idiomas: Español (padrão, `/`) e English (`/en`).
- Rotas: `/` · `/menu` · `/bar` (e `/en/...`).
- Dados editáveis em `data/` — ver `CLAUDE.md` para as regras do projeto.

## Deploy (Vercel)

Importar o repositório na Vercel (framework Next.js, sem configuração extra).
Domínio oficial: **https://mikasarestaurante.com** (registrado na GoDaddy, DNS apontando para a Vercel).
QR code do site (`public/qr/`): cartaz para imprimir — https://mikasarestaurante.com/qr/mikasa-cartaz.pdf
(escuro) e `mikasa-cartaz-claro.pdf` (claro), mais `.png` —, o QR da marca sozinho (`mikasa-qr.svg|png`)
e um QR simples preto e branco (`mikasa-qr-pb`). Ele aponta para o domínio, então nunca precisa ser
trocado; para regenerar (só se domínio, logo ou textos mudarem): `npm run qr`.
Canonical, sitemap e Open Graph usam esse domínio em produção (`data/site.ts`); `NEXT_PUBLIC_SITE_URL` sobrescreve.
