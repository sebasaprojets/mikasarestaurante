# Segurança — MIKASA (auditoria e controles)

Última auditoria: 2026-10-16 · Referências: OWASP Top 10 (2021), OWASP ASVS 4.0 (nível 1, partes aplicáveis).

## 1. Arquitetura analisada

| Item | Encontrado |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Cache Components/PPR, Turbopack) · React 19.3 · TypeScript |
| Gerenciador | npm (`package-lock.json`) |
| Backend próprio | **Nenhum**: sem API Routes, Route Handlers, Server Actions, banco de dados, autenticação, sessões, cookies ou uploads |
| Servidor | Só `proxy.ts` (roteamento de idioma: rewrite/redirect) |
| Entrada do usuário | 1 formulário de reserva **100% no cliente**: monta texto e abre `wa.me` (WhatsApp). Nada é enviado ao nosso servidor |
| Terceiros | iframe do Google Maps (sem chave), links externos (Instagram, Threads, WhatsApp, Heyzine, Restaurant Guru) |
| Variáveis de ambiente | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_PREFIX_DEFAULT_LOCALE`, `STATIC_EXPORT` (todas **não secretas**) e `VERCEL_PROJECT_PRODUCTION_URL` (injetada pela Vercel). Nenhum segredo existe no projeto |
| Hospedagem | Vercel (produção, cabeçalhos de segurança ativos) · GitHub Pages (preview estático, sem cabeçalhos customizáveis) |

**Consequência:** as categorias de autenticação, sessão, JWT, MFA, RBAC, IDOR/BOLA, SQL/NoSQL injection,
CSRF, upload, desserialização, SSRF, CORS, banco de dados e backups **não se aplicam hoje** (não existe a superfície).
Nada disso foi "implementado de fachada". Se um backend for criado, ver a §7.

## 2. Riscos encontrados (antes das correções)

| # | Gravidade | Risco | Status |
| --- | --- | --- | --- |
| R1 | Média | Sem Content-Security-Policy: um XSS futuro teria impacto total (script externo, `eval`, `<base>`, `<object>`) | **Corrigido**: CSP sem `unsafe-eval` |
| R2 | Média | Sem HSTS e COOP; `frame-ancestors` ausente (só `X-Frame-Options`) | **Corrigido** |
| R3 | Baixa | Formulário sem limite de tamanho; aceitava caracteres de controle/bidi (spoofing do texto no WhatsApp), horário fora da lista via DevTools e convidados acima do máximo | **Corrigido** |
| R4 | Baixa | `proxy.ts`: `/es//host` gerava um caminho com `//` no redirect (padrão de open redirect protocol-relative). Endurecido; **não confirmei** que era explorável (o Next emite `Location` relativo) | **Corrigido** (preventivo) |
| R5 | Baixa | Sem CI de segurança (audit, SAST, segredos, CodeQL, Dependabot) | **Corrigido** |
| R6 | Baixa (dev) | `npm audit`: 5 "high" só em devDependencies (`eslint-config-next → fast-glob → micromatch → braces`, GHSA-vfj7-8cjw-p6xm, ReDoS). Não há versão corrigida de `braces`; o "fix" do npm faz downgrade para `eslint-config-next@14` (quebra). Não chega ao bundle nem à produção | **Risco aceito**, monitorado no CI |
| R7 | Info | `next start` local com `-H 127.0.0.1` entra em loop 308 (o rewrite usa `localhost`). Já existia antes; a Vercel responde 200. Os testes usam `localhost` | Documentado |
| R8 | Info | GitHub Pages não permite cabeçalhos HTTP: o preview roda **sem** CSP/HSTS/frame-ancestors | Limitação externa |

Verificado e sem problema: os dois `dangerouslySetInnerHTML` são constantes do código (estilo inicial,
script de intro) e JSON-LD com `<` escapado (`<`). Todos os `target="_blank"` usam `rel="noopener noreferrer"`.
`window.open` usa `noopener,noreferrer`. Não há segredos no repositório nem no histórico git; `.env*` e `*.pem` estão no `.gitignore`.
O otimizador de imagens recusa URLs remotas (sem `remotePatterns`). `poweredByHeader: false`. Não há source maps públicos.

## 3. Medidas implementadas

- `config/security-headers.ts` (fonte única, aplicada em `next.config.ts`):
  - CSP: `default-src 'self'`, sem `unsafe-eval` em produção, `object-src 'none'`, `base-uri 'self'`,
    `form-action 'self'`, `frame-ancestors 'self'`, `frame-src https://www.google.com`, `connect-src 'self'`,
    `upgrade-insecure-requests`.
  - Demais cabeçalhos: HSTS (`max-age=31536000`), `nosniff`, `Referrer-Policy`, `X-Frame-Options`, COOP `same-origin`,
    `Permissions-Policy` restritiva, `X-DNS-Prefetch-Control: off`.
  - **Por que `script-src` mantém `'unsafe-inline'`:** CSP com nonce exige renderização dinâmica em toda requisição
    e é incompatível com PPR/Cache Components (doc oficial do Next 16). Hashes não servem porque os scripts
    inline de bootstrap do Next variam por página. Trocar isso custaria a performance (LCP) do site inteiro,
    para uma superfície que hoje não renderiza HTML de usuário. Revisar se surgir conteúdo dinâmico de terceiros.
- `lib/sanitize.ts`: remove caracteres de controle e bidi, normaliza NFC e limita o tamanho por campo
  (nome 80, alergias 200, observações 500, mensagem 1500).
- Formulário de reserva: `maxLength` nos campos, validação de formato da data, horário só da lista oficial
  e convidados entre 1 e `maxGuests`. A URL do WhatsApp é limitada e codificada (`encodeURIComponent`).
- `proxy.ts`: colapsa barras iniciais no redirect canônico.
- CI `.github/workflows/security.yml`: audit de produção (bloqueia high+), lint, testes unitários, build, e2e
  de segurança, Semgrep, gitleaks (histórico completo), CodeQL `security-extended` e dependency-review em PRs.
  Os checkouts usam `persist-credentials: false`; `npm ci --ignore-scripts` (também no `pages.yml`).
- `.github/dependabot.yml`: npm e Actions semanais; majors ficam fora (revisão manual).

## 4. Testes e como reproduzir

```bash
npm ci --ignore-scripts
npm run audit:prod            # dependências de produção (falha em high+)
npm run lint
npm run test:security         # unitários: sanitização, CSP, cabeçalhos
npm run build
npm run test:security:e2e     # sobe `next start` em localhost:3217 e ataca o build local
# SAST (opcional local): pip install semgrep && semgrep scan --metrics=off --config p/javascript \
#   --config p/typescript --config p/react --config p/nextjs --config p/secrets --exclude node_modules --exclude .next --exclude out --exclude public
```

O e2e cobre: cabeçalhos em 5 rotas, 404 sem stack trace, open redirect (4 variantes), 308 canônico,
path traversal (8 variantes, inclusive `.env` e `.git/config`), métodos HTTP inesperados e payload de 2 MB
sem 5xx, ausência de `/api` e `/admin`, recusa de imagem remota, cache de `/media`, segredos no HTML,
nos bundles e em `/public`, e ausência de source maps.

## 5. Configurações externas pendentes (fora do código)

1. **GitHub → Settings → Code security**: ativar *Secret scanning* + *Push protection*, *Dependabot alerts* e *Code scanning* (o CodeQL só publica resultados com isso ativo).
2. **GitHub → Settings → Branches**: proteger a `main` (PR obrigatório e checks do workflow *Security* obrigatórios).
3. **Vercel**:
   - Ativar *Deployment Protection* nos previews (para não indexar nem expor branches).
   - Ativar *Firewall/WAF* com as regras gerenciadas e o *Attack Challenge Mode* em caso de ataque.
   - Ativar 2FA na conta.
4. **Domínio oficial** (quando definido):
   - Configurar `NEXT_PUBLIC_SITE_URL`.
   - Depois de confirmar HTTPS em todos os subdomínios, avaliar HSTS com `includeSubDomains; preload`.
   - DNS: CAA restringindo CAs e DNSSEC, se o registrador suportar.
5. **GitHub Pages** é preview público sem cabeçalhos de segurança. Para produção, use só a Vercel.
6. Contas (GitHub, Vercel, Google Business, Instagram): 2FA com app/chave física, e revisar quem tem acesso.

## 6. Riscos residuais

- `script-src 'unsafe-inline'` (ver §3). Mitigação: nenhum HTML vindo de usuário é renderizado; o React escapa toda a saída.
- R6 (dev deps) até sair uma versão corrigida de `braces` no `eslint-config-next`.
- O preview no GitHub Pages fica sem cabeçalhos (R8).
- A segurança do iframe do Google Maps e dos sites externos (Heyzine, WhatsApp) depende desses terceiros.
- Ações do GitHub são referenciadas por tag major (`@v4`), não por SHA. Para máximo rigor, fixe os SHAs
  (o Dependabot de `github-actions` mantém atualizados).
- Os dados de reserva saem do navegador direto para o WhatsApp. A privacidade depende do WhatsApp/Meta; o site não guarda nada.

## 7. Se um backend for adicionado (reservas, painel admin, newsletter)

Obrigatório antes de publicar:
- Validação com esquema (Zod, `.strict()`) no servidor, limite de corpo e rate limit por IP/identidade.
- Server Actions e Route Handlers com autenticação **e** autorização no ponto de acesso ao dado (não só no `proxy.ts`).
- ORM/consultas parametrizadas; usuário de banco com menor privilégio; TLS; segredos só em variáveis **sem** `NEXT_PUBLIC_`.
- Senhas com Argon2id (ou uma biblioteca de auth consolidada); cookies `Secure; HttpOnly; SameSite=Lax`; MFA para admin.
- Proteção CSRF (Server Actions já checam `Origin`; Route Handlers exigem verificação própria).
- Páginas privadas com `cache: no-store` e sem prerender; nada privado em `'use cache'`.
- Logs estruturados com request-id, sem tokens, senhas ou PII; alertas de falhas repetidas de login.
- Testes de autorização: anônimo, usuário comum e usuário A acessando recurso do B (permitido e negado).

## 8. Resposta a incidentes

1. **Detectar**: alertas do Dependabot/CodeQL/gitleaks, Runtime Logs e Firewall da Vercel, aviso de terceiros (`SECURITY.md`).
2. **Conter**:
   - Vercel → *Instant Rollback* para o último deploy bom.
   - Ativar o Attack Challenge Mode, se for tráfego abusivo.
   - Pausar o workflow do Pages, se o preview estiver comprometido.
3. **Erradicar**:
   - Corrigir em branch e abrir PR com os checks verdes.
   - Se uma credencial vazar: revogar e rotacionar **primeiro** (tokens GitHub/Vercel) e só depois limpar o histórico.
4. **Recuperar**: redeploy, conferir os cabeçalhos com `npm run test:security:e2e` e monitorar por 48 h.
5. **Aprender**: registrar a causa e adicionar um teste que impeça a regressão.

Logs: o site não gera logs de aplicação próprios. A Vercel retém os logs de runtime conforme o plano, e o acesso é restrito aos membros do time.

## 9. Checklist de implantação segura

- [ ] Workflow *Security* verde no PR (audit, lint, testes, build, e2e, Semgrep, gitleaks, CodeQL)
- [ ] `npm run test:security:e2e` passa contra o build
- [ ] Nenhuma variável nova com segredo usa o prefixo `NEXT_PUBLIC_`
- [ ] Nenhum `dangerouslySetInnerHTML` com dado externo/usuário
- [ ] Links externos com `rel="noopener noreferrer"`
- [ ] Novos domínios externos (scripts, imagens, iframes) adicionados conscientemente à CSP em `config/security-headers.ts`
- [ ] Depois do deploy: `curl -sI https://<domínio>/ | grep -iE 'content-security|strict-transport'`
- [ ] Itens da §5 conferidos
