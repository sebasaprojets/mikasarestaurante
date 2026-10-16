/**
 * Cabeçalhos de segurança HTTP (Vercel / `next start`). Fonte única — testada em tests/security.
 *
 * CSP SEM nonce, de propósito: nonce exige renderização dinâmica em toda requisição e é
 * incompatível com Cache Components/PPR (docs: 01-app/02-guides/content-security-policy.md).
 * Por isso `script-src` mantém 'unsafe-inline' (scripts de bootstrap do Next e o script de
 * intro são inline). Compensações: sem 'unsafe-eval', `object-src 'none'`, `base-uri 'self'`,
 * `form-action 'self'`, `frame-ancestors` restrito, `connect-src 'self'` e fontes por allowlist.
 * O site não tem entrada que renderize HTML de usuário (sem API, sem auth, sem banco).
 */

export const MAPS_FRAME_ORIGIN = "https://www.google.com";

export function buildCsp(opts: { dev?: boolean } = {}): string {
  const dev = opts.dev ?? false;
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "media-src": ["'self'"],
    "connect-src": ["'self'", ...(dev ? ["ws:", "wss:"] : [])],
    "worker-src": ["'self'", "blob:"],
    "frame-src": [MAPS_FRAME_ORIGIN],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "manifest-src": ["'self'"],
  };
  const body = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
  return dev ? body : `${body}; upgrade-insecure-requests`;
}

export type HeaderKV = { key: string; value: string };

export function securityHeaders(opts: { dev?: boolean } = {}): HeaderKV[] {
  const dev = opts.dev ?? false;
  return [
    ...(dev ? [] : [{ key: "Content-Security-Policy", value: buildCsp({ dev }) }]),
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()",
    },
    // Sem `preload`/`includeSubDomains` até o domínio oficial estar definido e 100% HTTPS.
    ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]),
  ];
}
