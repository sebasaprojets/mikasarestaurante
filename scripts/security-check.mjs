// Verificação de segurança contra o build de PRODUÇÃO local (`next start`). Uso: npm run test:security:e2e
// Requer `npm run build` prévio. Não toca em produção real: sobe o servidor em localhost.
import { spawn } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const PORT = process.env.SEC_PORT ?? "3217";
// `localhost` (não 127.0.0.1): o rewrite do proxy usa o host do servidor; host divergente vira proxy externo em `next start`.
const BASE = `http://localhost:${PORT}`;
let server;

before(async () => {
  server = spawn("npx", ["next", "start", "-p", PORT], { env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE + "/robots.txt")).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("servidor não subiu");
});
after(() => server?.kill());

const get = (p, init) => fetch(BASE + p, { redirect: "manual", ...init });

for (const path of ["/", "/menu", "/bar", "/en", "/en/menu"]) {
  test(`cabeçalhos de segurança em ${path}`, async () => {
    const r = await get(path);
    assert.equal(r.status, 200);
    const csp = r.headers.get("content-security-policy") ?? "";
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /frame-ancestors 'self'/);
    assert.doesNotMatch(csp, /unsafe-eval/);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    assert.match(r.headers.get("strict-transport-security") ?? "", /max-age=\d{7,}/);
    assert.equal(r.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(r.headers.get("cross-origin-opener-policy"), "same-origin");
    assert.ok(r.headers.get("referrer-policy"));
    assert.match(r.headers.get("permissions-policy") ?? "", /camera=\(\)/);
    assert.equal(r.headers.get("x-powered-by"), null);
  });
}

test("404 não vaza stack trace nem caminhos internos", async () => {
  const r = await get("/nao-existe-xyz");
  assert.equal(r.status, 404);
  const body = await r.text();
  assert.doesNotMatch(body, /node_modules|\/home\/|at .+\(.+:\d+:\d+\)|Error:/);
  assert.ok(r.headers.get("content-security-policy"));
});

test("open redirect: /es//host e variantes nunca redirecionam para outro host", async () => {
  for (const p of ["/es//evil.example", "/es///evil.example/x", "/es/\\evil.example", "/es/%2F%2Fevil.example"]) {
    const r = await get(p);
    const loc = r.headers.get("location");
    if (loc) {
      const u = new URL(loc, BASE);
      assert.equal(u.host, new URL(BASE).host, `${p} -> ${loc}`);
    }
    assert.ok(r.status < 500, `${p} => ${r.status}`);
  }
});

test("/es/menu redireciona (308) para a URL canônica sem prefixo", async () => {
  const r = await get("/es/menu");
  assert.equal(r.status, 308);
  assert.equal(new URL(r.headers.get("location"), BASE).pathname, "/menu");
});

test("path traversal não expõe arquivos do projeto", async () => {
  for (const p of ["/media/..%2f..%2fpackage.json", "/%2e%2e/package.json", "/_next/static/..%2f..%2f..%2fpackage.json", "/media/../../.env", "/.env", "/.git/config", "/next.config.ts", "/proxy.ts"]) {
    const r = await get(p);
    const t = await r.text();
    assert.doesNotMatch(t, /"name":\s*"mikasa-restaurante"|\[core\]|securityHeaders/, `${p} vazou conteúdo`);
    assert.notEqual(r.status, 200, `${p} => 200`);
  }
});

test("métodos não previstos não causam 5xx", async () => {
  for (const m of ["POST", "PUT", "DELETE", "PATCH"]) {
    const r = await get("/", { method: m, body: "x=1" });
    assert.ok(r.status < 500, `${m} => ${r.status}`);
  }
  const big = await get("/", { method: "POST", body: "a".repeat(2_000_000) });
  assert.ok(big.status < 500, `POST grande => ${big.status}`);
});

test("sem rotas /api expostas", async () => {
  for (const p of ["/api", "/api/reservations", "/api/auth/session", "/admin", "/_next/image?url=https://evil.example/x.png&w=640&q=75"]) {
    const r = await get(p);
    assert.ok([301, 302, 307, 308, 400, 401, 403, 404].includes(r.status), `${p} => ${r.status}`);
    if (r.status >= 300 && r.status < 400) assert.equal(new URL(r.headers.get("location"), BASE).host, new URL(BASE).host);
  }
});

test("imagens remotas não-autorizadas são recusadas pelo otimizador", async () => {
  const r = await get("/_next/image?url=" + encodeURIComponent("https://evil.example/x.png") + "&w=640&q=75");
  assert.equal(r.status, 400);
});

test("/media tem cache imutável (somente ativos públicos)", async () => {
  const r = await get("/media/tiradito.webp");
  assert.equal(r.status, 200);
  assert.match(r.headers.get("cache-control") ?? "", /immutable/);
});

test("HTML não contém segredos nem variáveis de servidor", async () => {
  const html = await (await get("/")).text();
  assert.doesNotMatch(html, /AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY/);
});

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
test("bundles do navegador (.next/static) e /public sem padrões de segredo", () => {
  const re = /AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_-]?key|secret|password|token)["']?\s*[:=]\s*["'][A-Za-z0-9_\-]{24,}["']/i;
  const files = [...walk(".next/static"), ...walk("public")].filter((f) => /\.(js|css|json|txt|html|svg|map)$/.test(f));
  assert.ok(files.length > 0);
  for (const f of files) assert.doesNotMatch(readFileSync(f, "utf8"), re, f);
  assert.equal(walk(".next/static").filter((f) => f.endsWith(".map")).length, 0, "source maps públicos");
});
