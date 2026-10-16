import { test } from "node:test";
import assert from "node:assert/strict";
import { LIMITS, clampMessage, sanitizeText } from "../../lib/sanitize.ts";
import { buildCsp, securityHeaders } from "../../config/security-headers.ts";

test("sanitizeText remove caracteres de controle e bidi", () => {
  assert.equal(sanitizeText("Ana\u0000‮Bob​", 80), "AnaBob");
});
test("sanitizeText respeita o limite (por code point) e colapsa espaços", () => {
  assert.equal(Array.from(sanitizeText("x".repeat(10_000), LIMITS.name)).length, LIMITS.name);
  assert.equal(sanitizeText("  a   b \n c ", 80), "a b c");
  assert.equal(Array.from(sanitizeText("😀".repeat(500), 5)).length, 5);
});
test("sanitizeText multiline preserva quebras, limita sequências", () => {
  assert.equal(sanitizeText("a\n\n\n\nb", 80, { multiline: true }), "a\n\nb");
});
test("sanitizeText não executa nem interpreta HTML/script (é só texto; escape é do React/encodeURIComponent)", () => {
  const out = sanitizeText("<script>alert(1)</script>", 80);
  assert.equal(out, "<script>alert(1)</script>");
  assert.equal(encodeURIComponent(out).includes("<"), false);
});
test("clampMessage limita a mensagem inteira", () => {
  assert.equal(Array.from(clampMessage("a".repeat(5000))).length, LIMITS.message);
});

test("CSP de produção: sem unsafe-eval, sem curingas, diretivas críticas presentes", () => {
  const csp = buildCsp();
  for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'self'", "upgrade-insecure-requests"])
    assert.ok(csp.includes(d), `faltou: ${d}`);
  assert.ok(!csp.includes("unsafe-eval"));
  assert.ok(!/(^|\s)\*(\s|;|$)/.test(csp), "curinga em CSP");
  assert.ok(!/(?:^|\s)https?:\s|(?:^|\s)http:(?:\s|;|$)/.test(csp), "esquema http: aberto");
});
test("CSP de dev permite eval só em dev", () => {
  assert.ok(buildCsp({ dev: true }).includes("unsafe-eval"));
});
test("cabeçalhos de produção incluem HSTS, nosniff, COOP, Referrer, Permissions e CSP", () => {
  const h = Object.fromEntries(securityHeaders().map((x) => [x.key.toLowerCase(), x.value]));
  for (const k of ["content-security-policy", "strict-transport-security", "x-content-type-options", "cross-origin-opener-policy", "referrer-policy", "permissions-policy", "x-frame-options"])
    assert.ok(h[k], `faltou ${k}`);
  assert.equal(h["x-content-type-options"], "nosniff");
});
