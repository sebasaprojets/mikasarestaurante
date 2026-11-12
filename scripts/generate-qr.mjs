#!/usr/bin/env node
/**
 * QR code + cartaz do site oficial → public/qr/
 *
 * O QR aponta para o domínio (https://mikasarestaurante.com), lido de `data/site.ts`.
 * Como o domínio sempre serve a versão publicada mais nova, o QR impresso nunca
 * precisa ser trocado. Só rode de novo se o domínio, o logo ou os textos mudarem:
 *   npm run qr      (usa o Chromium do Playwright e as fontes do Google Fonts)
 *
 * Saída (também publicada no site em /qr/...):
 *  - mikasa-cartaz.png / .pdf         cartaz escuro (Sumi, ouro) — PDF vetorial para gráfica
 *  - mikasa-cartaz-claro.png / .pdf   cartaz claro (Washi) — impressão em papel claro
 *  - mikasa-qr.svg / .png             só o QR, no estilo da marca (emblema no centro)
 *  - mikasa-qr-pb.svg / -pb.png       QR simples preto e branco (máxima compatibilidade)
 */
import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import QRCode from "qrcode";
import { site } from "../data/site.ts";
import { KANJI_D, LETTERS } from "../components/brand/logo-paths.ts";
import { EMBLEM_ARC, WORDMARK_VIEWBOX } from "../components/brand/logo-meta.ts";

const url = `https://${site.domain}`;
const out = new URL("../public/qr/", import.meta.url);
await mkdir(out, { recursive: true });

const C = {
  sumi: "#0A0A0B",
  carvao: "#151517",
  ouro: "#C6A15B",
  washi: "#EFE9DF",
  washiDim: "#B9B3AA",
  torii: "#A8322A",
};

/** Gradiente dourado do logo (o mesmo de components/brand/logo.tsx). */
const gold = (id) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0dca6"/><stop offset="0.45" stop-color="#d4b06a"/><stop offset="1" stop-color="#a8823f"/></linearGradient>`;

const emblemPaths = (fill) =>
  `<path d="${EMBLEM_ARC}" fill="none" stroke="${fill}" stroke-width="5" stroke-linecap="round"/><path d="${KANJI_D}" fill="${fill}" fill-rule="evenodd"/>`;

/**
 * QR no estilo da marca: módulos quase retos com respiro, "olhos" com centro Torii
 * (como um hanko) e o emblema dourado num ladrilho Sumi no meio.
 * Nível H (30% de redundância) — cobre o emblema central com folga.
 */
function brandQrSvg({ quiet = 0, bg = null } = {}) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const at = (r, c) => qr.modules.get(r, c);
  const vb = n + quiet * 2;

  // área central reservada ao emblema (ímpar, centrada)
  const box = Math.round(n * 0.27) | 1;
  const b0 = (n - box) / 2;
  const inCenter = (r, c) => r >= b0 && r < b0 + box && c >= b0 && c < b0 + box;
  const finders = [[0, 0], [0, n - 7], [n - 7, 0]];
  const inFinder = (r, c) => finders.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);

  const g = 0.07; // respiro entre módulos
  const rx = 0.2; // cantos quase retos (padrão do site)
  let mods = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (at(r, c) && !inFinder(r, c) && !inCenter(r, c))
        mods += `<rect x="${c + g}" y="${r + g}" width="${1 - 2 * g}" height="${1 - 2 * g}" rx="${rx}"/>`;

  const ring = (x, y) =>
    `<path fill-rule="evenodd" d="M${x + 1.2},${y}h4.6a1.2,1.2 0 0 1 1.2,1.2v4.6a1.2,1.2 0 0 1 -1.2,1.2h-4.6a1.2,1.2 0 0 1 -1.2,-1.2v-4.6a1.2,1.2 0 0 1 1.2,-1.2z M${x + 1.6},${y + 1}h3.8a0.6,0.6 0 0 1 0.6,0.6v3.8a0.6,0.6 0 0 1 -0.6,0.6h-3.8a0.6,0.6 0 0 1 -0.6,-0.6v-3.8a0.6,0.6 0 0 1 0.6,-0.6z"/>`;
  const eyes = finders
    .map(([r, c]) => `${ring(c, r)}<rect x="${c + 2}" y="${r + 2}" width="3" height="3" rx="0.45" fill="${C.torii}"/>`)
    .join("");

  // ladrilho Sumi com o emblema dourado, com uma borda de respiro em volta
  const t0 = b0 + 0.9;
  const ts = box - 1.8;
  const es = (ts * 0.76) / 280;
  const ex = t0 + (ts - 280 * es) / 2;
  const tile =
    `<rect x="${t0}" y="${t0}" width="${ts}" height="${ts}" rx="0.35" fill="${C.sumi}"/>` +
    `<g transform="translate(${ex} ${ex}) scale(${es})">${emblemPaths("url(#qrGold)")}</g>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-quiet} ${-quiet} ${vb} ${vb}" shape-rendering="geometricPrecision">` +
    `<defs>${gold("qrGold")}</defs>` +
    (bg ? `<rect x="${-quiet}" y="${-quiet}" width="${vb}" height="${vb}" fill="${bg}"/>` : "") +
    `<g fill="${C.sumi}">${mods}${eyes}</g>${tile}</svg>`
  );
}

const wordmarkSvg = (fill, defs = "") =>
  `<svg viewBox="${WORDMARK_VIEWBOX}" aria-hidden="true"><defs>${defs}</defs><g fill="${fill}">${LETTERS.map((l) => `<path d="${l.d}" fill-rule="evenodd"/>`).join("")}</g></svg>`;

/** Cartaz (proporção A — 1:√2), no formato: logo, faixa, QR, chamada, endereço, domínio. */
function posterHtml(theme) {
  const dark = theme === "dark";
  const t = dark
    ? { bg: C.sumi, frame: "rgb(198 161 91 / 0.42)", ink: C.washi, dim: C.washiDim, accent: C.ouro, panel: C.washi, word: "url(#wmGold)" }
    : { bg: C.washi, frame: "rgb(168 130 63 / 0.55)", ink: C.sumi, dim: "#5c5850", accent: "#9a7740", panel: "#FBF8F3", word: C.sumi };
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Manrope:wght@400;500&display=block" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1414px;height:2000px;background:${t.bg}}
  .p{position:relative;width:1414px;height:2000px;display:flex;flex-direction:column;align-items:center;color:${t.ink};font-family:Manrope,sans-serif}
  .frame{position:absolute;inset:52px;border:1.5px solid ${t.frame}}
  .frame::after{content:"";position:absolute;inset:12px;border:1px solid ${t.frame};opacity:.45}
  .wm{margin-top:300px;width:600px}
  .wm svg{display:block;width:100%;height:auto}
  .sub{margin-top:52px;display:flex;align-items:center;gap:40px;font-size:23px;font-weight:500;letter-spacing:.52em;text-transform:uppercase;color:${t.accent}}
  .sub span{padding-left:.52em}
  .sub i{display:block;width:110px;height:1.5px;background:${t.accent}}
  .panel{position:relative;margin-top:110px;width:820px;height:820px;background:${t.panel};border-radius:3px;display:grid;place-items:center}
  .panel::before{content:"";position:absolute;inset:-16px;border:1.5px solid ${t.frame}}
  .panel svg{width:640px;height:640px;display:block}
  .cta{margin-top:118px;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:66px;line-height:1;letter-spacing:.005em}
  .cta b{font-weight:400;color:${t.accent};padding:0 .3em}
  .place{margin-top:34px;font-size:20px;letter-spacing:.44em;text-transform:uppercase;color:${t.dim}}
  .dom{position:absolute;bottom:138px;font-size:25px;letter-spacing:.3em;color:${t.accent}}
</style></head><body><div class="p">
  <div class="frame"></div>
  <div class="wm">${wordmarkSvg(t.word, gold("wmGold"))}</div>
  <div class="sub"><i></i><span>${site.tagline}</span><i></i></div>
  <div class="panel">${brandQrSvg()}</div>
  <p class="cta">Escanea para descubrir<b>·</b>Scan to explore</p>
  <p class="place">${site.address.street} · ${site.address.city}</p>
  <p class="dom">${site.domain}</p>
</div></body></html>`;
}

// ── QR simples preto e branco (nível Q) ──────────────────────────────────────
const plain = { errorCorrectionLevel: "Q", margin: 4, color: { dark: "#000000", light: "#FFFFFF" } };
await writeFile(new URL("mikasa-qr-pb.svg", out), await QRCode.toString(url, { ...plain, type: "svg" }));
await writeFile(new URL("mikasa-qr-pb.png", out), await QRCode.toBuffer(url, { ...plain, type: "png", width: 2048 }));

// ── QR da marca + cartazes (renderizados no Chromium) ────────────────────────
const brandSvg = brandQrSvg({ quiet: 4, bg: C.washi });
await writeFile(new URL("mikasa-qr.svg", out), brandSvg);

const require = createRequire(import.meta.url);
let pw;
try {
  pw = require("playwright");
} catch {
  pw = require(join(execSync("npm root -g").toString().trim(), "playwright"));
}
const browser = await pw.chromium.launch();
try {
  const qrPage = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 2 });
  await qrPage.setContent(`<style>*{margin:0}svg{display:block;width:1024px;height:1024px}</style>${brandSvg}`);
  await writeFile(new URL("mikasa-qr.png", out), await qrPage.screenshot({ type: "png" }));

  for (const [theme, name] of [["dark", "mikasa-cartaz"], ["light", "mikasa-cartaz-claro"]]) {
    const page = await browser.newPage({ viewport: { width: 1414, height: 2000 }, deviceScaleFactor: 2 });
    await page.setContent(posterHtml(theme), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await writeFile(new URL(`${name}.png`, out), await page.screenshot({ type: "png" }));
    await writeFile(
      new URL(`${name}.pdf`, out),
      await page.pdf({ width: "1414px", height: "2000px", printBackground: true, pageRanges: "1" }),
    );
  }
} finally {
  await browser.close();
}

console.log(`QR → ${url}  (public/qr/)`);
