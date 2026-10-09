# /public/media

Mídia oficial do MIKASA. **Ainda não fornecida** — o site mostra placeholders
identificados ("Placeholder · arquivo.jpg").

Para publicar um arquivo:

1. Coloque-o aqui com o nome esperado (ver `data/media.ts`), por exemplo:
   `hero-loop.mp4`, `hero-loop.webm`, `hero-poster.jpg`, `philosophy-01.jpg`,
   `omakase-01.jpg` … `omakase-04.jpg`, `robata-01.jpg`, `bar-01.jpg` … `bar-03.jpg`,
   `gallery-01.jpg` … `gallery-09.jpg` (`gallery-03` é vídeo: `.mp4` + `.jpg` poster).
2. Em `data/media.ts`, mude `available` para `true` naquele item.

Regras:
- Vídeo do hero: H.264 (+ WebM se possível), ~4 MB no máximo, loop curto, sem áudio.
- Vídeos pesados **não** entram no Git: use Git LFS, Vercel Blob ou CDN e coloque a URL em `src`.
- Nunca usar banco de imagens como se fossem fotos oficiais do restaurante.
- Priorizar material real do Instagram @mikasa.restaurant (com autorização).
