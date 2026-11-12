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
Canonical, sitemap e Open Graph usam esse domínio em produção (`data/site.ts`); `NEXT_PUBLIC_SITE_URL` sobrescreve.
