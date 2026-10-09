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
Variável recomendada: `NEXT_PUBLIC_SITE_URL=https://<domínio-oficial>` (canonical, sitemap, Open Graph).
