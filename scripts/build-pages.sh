#!/usr/bin/env bash
# Build estático para GitHub Pages: gera out/ com o site em <base>/es e <base>/en.
# Uso: NEXT_PUBLIC_BASE_PATH=/mikasarestaurante NEXT_PUBLIC_SITE_URL=https://<user>.github.io/mikasarestaurante bash scripts/build-pages.sh
set -euo pipefail

export STATIC_EXPORT=true
export NEXT_PUBLIC_PREFIX_DEFAULT_LOCALE=true
BASE="${NEXT_PUBLIC_BASE_PATH:-}"
SITE="${NEXT_PUBLIC_SITE_URL:-}"

# Arquivos que exigem servidor (proxy) ou não exportam com Cache Components
# (sitemap/robots dinâmicos) ficam fora do export; os equivalentes estáticos são gerados abaixo.
STASH="$(mktemp -d)"
for f in proxy.ts app/sitemap.ts app/robots.ts; do mkdir -p "$STASH/$(dirname "$f")"; mv "$f" "$STASH/$f"; done
restore() { for f in proxy.ts app/sitemap.ts app/robots.ts; do mv "$STASH/$f" "$f"; done; }
trap restore EXIT

npx next build

# Raiz → espanhol (idioma padrão). Página preta, sem texto visível, redireciona na hora.
cat > out/index.html <<HTML
<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>MIKASA — Japanese Nikkei Cuisine</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0a0a0b">
<script>try{sessionStorage.setItem("mk-intro-force","1")}catch(e){}location.replace("${BASE}/es/"+location.search+location.hash)</script>
<noscript><meta http-equiv="refresh" content="0; url=${BASE}/es/"></noscript>
<link rel="canonical" href="${SITE}/es/">
<style>html,body{margin:0;height:100%;background:#0a0a0b}</style>
</head><body><noscript><a href="${BASE}/es/" style="color:#c6a15b">MIKASA</a></noscript></body></html>
HTML

# sitemap.xml e robots.txt estáticos
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  for p in "" "menu/" "bar/"; do
    for l in es en; do
      echo "  <url><loc>${SITE}/${l}/${p}</loc><xhtml:link rel=\"alternate\" hreflang=\"es\" href=\"${SITE}/es/${p}\"/><xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"${SITE}/en/${p}\"/></url>"
    done
  done
  echo '</urlset>'
} > out/sitemap.xml
printf 'User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' "$SITE" > out/robots.txt

touch out/.nojekyll
echo "Static export pronto em out/"
