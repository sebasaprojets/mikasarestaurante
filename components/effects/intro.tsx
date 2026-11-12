"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { EMBLEM_ARC, GoldGradient } from "@/components/brand/logo";
import { EMBLEM_VIEWBOX, KANJI_ID, LETTER_BOXES, letterId, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-meta";
import { isLowEndDevice } from "@/lib/device";
import { signalIntroDone } from "@/lib/hooks/use-intro-ready";

export const INTRO_FORCE_KEY = "mk-intro-force";

/**
 * Script inline no <head>, antes do primeiro paint: a intro toca quando a pessoa
 * ENTRA no site (link externo, URL digitada, nova aba). Não toca ao recarregar,
 * voltar/avançar, nem em navegação interna ou troca de idioma (referrer do próprio
 * site) — exceto quando a página de redirecionamento da raiz pede (flag em sessionStorage).
 */
export const introScript = `try{var f=sessionStorage.getItem("${INTRO_FORCE_KEY}");sessionStorage.removeItem("${INTRO_FORCE_KEY}");var r=document.referrer,same=false;try{same=!!r&&new URL(r).host===location.host}catch(e){}var nav=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];var t=nav&&nav.type;if(f||(!same&&t!=="reload"&&t!=="back_forward")){document.documentElement.setAttribute("data-intro","")}}catch(e){}`;

const EASE = [0.22, 1, 0.36, 1] as const;
const DRAW = [0.65, 0, 0.35, 1] as const;

/**
 * Linha do tempo (s) — três atos, ≈ 6 s no total:
 *  I.  uma brasa sobe no escuro e desenha o círculo do emblema (ensō) em fogo,
 *      que esfria até o ouro; o kanji surge em pinceladas, ainda incandescente.
 *  II. MIKASA sobe letra a letra, um reflexo de luz corre pelo ouro; a legenda assenta.
 *  III. a tela inteira queima como papel, de baixo para cima (borda em brasa e
 *      fagulhas), revelando o site que já está pronto por baixo.
 */
const T = {
  spark: 0.25,
  arc: 0.75,
  arcDur: 1.35,
  kanji: 1.75,
  kanjiDur: 1.1,
  cool: 2.5,
  word: 2.55,
  sheen: 3.35,
  tag: 3.2,
  exit: 4.6,
  burnDur: 2.2,
};

/** Zigue-zague largo do pincel que revela o kanji (de cima para baixo), em 0–100. */
const BRUSH = "M4 8 L96 4 L6 24 L96 20 L4 42 L96 38 L6 60 L96 56 L4 78 L96 74 L8 96 L96 94";

/* ───────────── ruído 1D (borda irregular do papel queimando) ───────────── */
const hash = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const vnoise = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
};
/** 0–1, com línguas largas e um serrilhado fino por cima. */
const fbm = (x: number) => vnoise(x) * 0.55 + vnoise(x * 2.3 + 7.1) * 0.27 + vnoise(x * 5.7 + 3.3) * 0.12 + vnoise(x * 13 + 1.7) * 0.06;

/* ───────────── queima realista do papel (WebGL) ───────────── */

/** Mesmo ruído do shader, em JS: para soltar fagulhas e fumaça onde o papel está queimando. */
const h2 = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const n2 = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy) + (h2(ix + 1, iy) - h2(ix, iy)) * ux;
  const b = h2(ix, iy + 1) + (h2(ix + 1, iy + 1) - h2(ix, iy + 1)) * ux;
  return a + (b - a) * uy;
};
const fbm2 = (x: number, y: number) => {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < 5; i++) {
    v += a * n2(x, y);
    x *= 2.03;
    y *= 2.03;
    a *= 0.5;
  }
  return v;
};
/** Campo de queima (igual ao shader): <0 ainda é papel; >0 já queimou. */
const burnField = (u: number, v: number, aspect: number, t: number) => {
  const f = (1 - v) * 0.85 + fbm2(u * aspect * 3.2, v * 3.2) * 0.62;
  return t * 1.62 - 0.06 - f;
};

/** Campo de ruído da queima, calculado uma vez em baixa resolução (≈1/4 da tela). */
function buildField(w: number, h: number) {
  const fw = Math.max(64, Math.round(w / 4));
  const fh = Math.max(36, Math.round(h / 4));
  const aspect = w / h;
  const data = new Uint8Array(fw * fh);
  for (let y = 0; y < fh; y++) {
    const v = (y + 0.5) / fh;
    for (let x = 0; x < fw; x++) {
      const u = (x + 0.5) / fw;
      data[y * fw + x] = Math.min(255, Math.round(fbm2(u * aspect * 3.2, v * 3.2) * 255));
    }
  }
  return { data, w: fw, h: fh };
}

const VERT = `attribute vec2 a;varying vec2 v_uv;void main(){v_uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
varying vec2 v_uv;uniform sampler2D u_tex;uniform sampler2D u_field;uniform float u_t;uniform float u_time;uniform float u_aspect;
float h(vec2 p){return fract(sin(p.x*127.1+p.y*311.7)*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p*=2.03;a*=.5;}return v/.875;}
void main(){
  vec2 uv=v_uv;vec2 p=vec2(uv.x*u_aspect,uv.y);
  // campo de queima pré-calculado (estático) + um serrilhado fino por pixel
  float f=(1.-uv.y)*.85+texture2D(u_field,uv).r*.62+(n(p*44.)-.5)*.01;
  float d=u_t*1.62-.06-f;            // >0: já queimou
  if(d>0.){                          // buraco, com a borda de cinza preta se desfazendo
    float rim=1.-smoothstep(0.,.022,d+ (n(p*60.)-.5)*.01);
    gl_FragColor=vec4(vec3(.018,.011,.007)*rim,rim*.96);return;}
  float e=-d;                        // distância (no campo) até a borda, do lado do papel
  vec4 paper=texture2D(u_tex,uv);
  if(e>.2){gl_FragColor=paper;return;}
  vec3 col=paper.rgb;
  // papel chamuscado: tosta, escurece e ganha um marrom quente antes de pegar fogo
  float scorch=smoothstep(.11,.0,e);
  col=mix(col,col*.18+vec3(.085,.032,.012),scorch*.9);
  float charB=smoothstep(.035,.0,e);
  col=mix(col,vec3(.03,.014,.008),charB*.85);
  // brasa: linha incandescente que tremula (branco-amarelado no fio, vermelho ao esfriar)
  float flick=.6+.4*n(p*26.+vec2(0.,-u_time*7.));
  float glow=exp(-e/.0105)*flick;
  vec3 hot=mix(vec3(.95,.22,.03),vec3(1.,.93,.72),exp(-e/.0042));
  // pontos de brasa espalhados na faixa chamuscada
  float speck=smoothstep(.78,.95,n(p*90.+u_time*.6))*smoothstep(.06,.0,e)*.8;
  // chamas: línguas turbulentas subindo da borda
  float tq=fbm3(vec2(p.x*6.5,p.y*3.4+u_time*2.6));
  float fl=exp(-e/(.035+.07*tq))*smoothstep(.32,.78,tq);
  vec3 flame=mix(vec3(.85,.16,.02),vec3(1.,.72,.28),fl);
  col+=hot*glow*1.7+vec3(1.,.45,.12)*speck+flame*fl*1.05;
  gl_FragColor=vec4(col,1.);
}`;

/**
 * Prepara a queima em WebGL sobre uma "foto" do papel (fundo + logo exatamente onde
 * estão na tela). Devolve null sem WebGL — aí fica o recorte 2D.
 */
function createBurnGL(canvas: HTMLCanvasElement, snapshot: HTMLCanvasElement, field: { data: Uint8Array; w: number; h: number }) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // campo de queima (ruído estático) numa textura de baixa resolução, interpolada
  const ftex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, ftex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, field.w, field.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, field.data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(prog, "u_tex"), 0);
  gl.uniform1i(gl.getUniformLocation(prog, "u_field"), 1);
  const uT = gl.getUniformLocation(prog, "u_t");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uAsp = gl.getUniformLocation(prog, "u_aspect");
  return {
    render(t: number, time: number) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uT, t);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uAsp, canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/** "Foto" do papel no instante da saída: fundo, luzes e logo, nas posições reais da tela. */
function snapshotPaper(paper: HTMLElement, w: number, h: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const g = c.getContext("2d");
  if (!g) return c;
  g.scale(dpr, dpr);
  g.fillStyle = "#0a0a0b";
  g.fillRect(0, 0, w, h);
  // brasa ao pé da tela e luz quente atrás do emblema (as mesmas do DOM)
  g.save();
  g.translate(w / 2, h);
  g.scale(0.6 * w, 0.7 * 0.55 * h);
  let rg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  rg.addColorStop(0, "rgba(168,50,42,0.22)");
  rg.addColorStop(0.45, "rgba(120,40,20,0.08)");
  rg.addColorStop(0.75, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect(-1, -1, 2, 2);
  g.restore();
  const vmax = Math.max(w, h);
  rg = g.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, 0.35 * vmax);
  rg.addColorStop(0, "rgba(198,161,91,0.16)");
  rg.addColorStop(0.5, "rgba(168,50,42,0.05)");
  rg.addColorStop(0.72, "rgba(0,0,0,0)");
  g.fillStyle = rg;
  g.fillRect(0, 0, w, h);

  const goldFor = (top: number, bottom: number) => {
    const gr = g.createLinearGradient(0, top, 0, bottom);
    gr.addColorStop(0, "#f0dca6");
    gr.addColorStop(0.45, "#d4b06a");
    gr.addColorStop(1, "#a8823f");
    return gr;
  };
  const kanji = document.getElementById(KANJI_ID)?.getAttribute("d");
  const emblem = paper.querySelector<SVGSVGElement>('[data-snap="emblem"]');
  if (emblem && kanji) {
    const r = emblem.getBoundingClientRect();
    const k = r.width / 280;
    g.save();
    g.translate(r.left, r.top);
    g.scale(k, k);
    const gr = goldFor(0, 280);
    g.strokeStyle = gr;
    g.fillStyle = gr;
    g.lineWidth = 5;
    g.lineCap = "round";
    g.stroke(new Path2D(EMBLEM_ARC));
    g.fill(new Path2D(kanji), "evenodd");
    g.restore();
  }
  const word = paper.querySelector<SVGSVGElement>('[data-snap="wordmark"]');
  if (word) {
    const r = word.getBoundingClientRect();
    const k = r.width / WORDMARK_W;
    g.save();
    g.translate(r.left, r.top);
    g.scale(k, k);
    g.fillStyle = goldFor(0, WORDMARK_H);
    LETTER_BOXES.forEach((_, i) => {
      const d = document.getElementById(letterId(i))?.getAttribute("d");
      if (d) g.fill(new Path2D(d), "evenodd");
    });
    g.restore();
  }
  const tag = paper.querySelector<HTMLElement>('[data-snap="tagline"]');
  if (tag) {
    const r = tag.getBoundingClientRect();
    const cs = getComputedStyle(tag);
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    g.fillStyle = cs.color;
    g.textBaseline = "middle";
    const ls = parseFloat(cs.letterSpacing) || 0;
    let x = r.left;
    for (const ch of (tag.textContent ?? "").toUpperCase()) {
      g.fillText(ch, x, r.top + r.height / 2);
      x += g.measureText(ch).width + ls;
    }
  }
  const line = paper.querySelector<HTMLElement>('[data-snap="line"]');
  if (line) {
    const r = line.getBoundingClientRect();
    const lg = g.createLinearGradient(r.left, 0, r.right, 0);
    lg.addColorStop(0, "rgba(198,161,91,0)");
    lg.addColorStop(0.5, "rgba(198,161,91,0.7)");
    lg.addColorStop(1, "rgba(198,161,91,0)");
    g.fillStyle = lg;
    g.fillRect(r.left, r.top, r.width, Math.max(1, r.height));
  }
  return c;
}

type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hot: boolean };

/**
 * Um único <canvas> por cima de tudo, num único rAF:
 *  - durante a intro: fagulhas lentas subindo do pé da tela (atmosfera de robata);
 *  - na saída: o papel (fundo + logo) passa a ser desenhado em WebGL e queima de
 *    verdade — chamusca, carboniza, vira brasa e abre buracos irregulares, com
 *    chamas, fagulhas e fumaça saindo de onde está queimando. Sem WebGL (ou em
 *    aparelho modesto), recorte 2D com a borda em brasa.
 */
function IntroCanvas({
  playing,
  exiting,
  lite,
  paperRef,
  onBurnt,
}: {
  playing: boolean;
  exiting: boolean;
  lite: boolean;
  paperRef: React.RefObject<HTMLDivElement | null>;
  onBurnt: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const exitAt = useRef(0);
  const burntCb = useRef(onBurnt);
  useEffect(() => {
    burntCb.current = onBurnt;
  }, [onBurnt]);
  useEffect(() => {
    if (exiting && !exitAt.current) exitAt.current = performance.now();
  }, [exiting]);

  useEffect(() => {
    if (!playing) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      // brilho e fagulhas são macios: 1x basta (e custa 1/4 num retina)
      canvas.width = w;
      canvas.height = h;
    };
    size();
    window.addEventListener("resize", size);

    // sprites desenhados uma vez: língua de fogo (núcleo branco-quente embaixo, ponta
    // vermelha) e fumaça (cinza quente, bem translúcida)
    const flame = document.createElement("canvas");
    flame.width = 64;
    flame.height = 128;
    const fg = flame.getContext("2d");
    if (fg) {
      fg.setTransform(1, 0, 0, 2, 0, 0);
      const g = fg.createRadialGradient(32, 46, 1, 32, 38, 32);
      g.addColorStop(0, "rgba(255,248,224,1)");
      g.addColorStop(0.18, "rgba(255,212,120,0.95)");
      g.addColorStop(0.42, "rgba(255,128,36,0.62)");
      g.addColorStop(0.72, "rgba(196,44,12,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      fg.fillStyle = g;
      fg.fillRect(0, 0, 64, 64);
    }
    const smokeImg = document.createElement("canvas");
    smokeImg.width = smokeImg.height = 64;
    const sg = smokeImg.getContext("2d");
    if (sg) {
      const g = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(150,132,116,0.55)");
      g.addColorStop(0.6, "rgba(110,96,84,0.18)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      sg.fillStyle = g;
      sg.fillRect(0, 0, 64, 64);
    }
    type Smoke = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number };
    const smoke: Smoke[] = [];

    const embers: Ember[] = [];
    const MAX = lite ? 70 : 180;
    const spawn = (x: number, y: number, hot: boolean, speed: number) => {
      if (embers.length >= MAX) return;
      const max = hot ? 0.7 + Math.random() * 0.9 : 2.6 + Math.random() * 2.4;
      embers.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (hot ? 70 : 18),
        vy: -(speed * (0.6 + Math.random() * 0.8)),
        life: 0,
        max,
        r: hot ? 0.8 + Math.random() * 1.9 : 0.6 + Math.random() * 1.3,
        hot,
      });
    };

    const STEPS = 96;
    const edge = new Float32Array(STEPS + 1);
    let raf = 0;
    let last = performance.now();
    let ambientAcc = 0;
    let burnt = false;
    let mode: "none" | "gl" | "2d" = "none";
    let burnGL: ReturnType<typeof createBurnGL> = null;
    // o campo da queima é calculado com folga, num momento ocioso durante a intro
    let field: ReturnType<typeof buildField> | null = null;
    const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    const prep = () => (field ??= buildField(w, h));
    const idle = ric ? ric(prep, { timeout: 2500 }) : window.setTimeout(prep, 1500);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // fagulhas de fundo enquanto a intro toca
      if (!exitAt.current) {
        ambientAcc += dt * (lite ? 5 : 11);
        while (ambientAcc > 1) {
          ambientAcc -= 1;
          spawn(w * (0.15 + Math.random() * 0.7), h + 6, false, 26 + Math.random() * 34);
        }
      }

      // queima do papel — 1º quadro da saída: tira a "foto" do papel e passa a queimá-lo
      // em WebGL (o DOM do papel some no mesmo quadro); sem WebGL, recorte 2D
      if (exitAt.current && !burnt && mode === "none") {
        const paper = paperRef.current;
        const glc = glRef.current;
        if (paper && glc) {
          // resolução moderada: o fogo é macio por natureza (aparelho modesto: 1x)
          const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
          glc.width = Math.round(w * dpr);
          glc.height = Math.round(h * dpr);
          burnGL = createBurnGL(glc, snapshotPaper(paper, w, h, dpr), field ?? buildField(w, h));
        }
        if (burnGL && paper) {
          burnGL.render(0, 0);
          paper.style.visibility = "hidden";
          mode = "gl";
        } else mode = "2d";
      }
      if (exitAt.current && !burnt && mode === "gl" && burnGL) {
        const sec = (now - exitAt.current) / 1000;
        const p = Math.min(1, sec / T.burnDur);
        // pega devagar e vai ganhando força
        const tb = Math.pow(p, 1.25);
        burnGL.render(tb, sec);
        // fagulhas e fumaça saem de onde o papel está queimando agora
        const aspect = w / h;
        const tries = 46;
        for (let k = 0; k < tries; k++) {
          const u = Math.random();
          const v = Math.random();
          const d = burnField(u, v, aspect, tb);
          if (d < 0 && d > -0.014 && Math.random() < 0.55) spawn(u * w, v * h, true, 80 + Math.random() * 130);
          else if (d < -0.02 && d > -0.07 && Math.random() < 0.05) {
            smoke.push({ x: u * w, y: v * h, vx: (Math.random() - 0.5) * 16, vy: -(26 + Math.random() * 34), life: 0, max: 1.4 + Math.random() * 1.2, r: 16 + Math.random() * 16 });
          }
        }
        if (p >= 1) {
          burnt = true;
          burntCb.current();
        }
      }
      if (exitAt.current && !burnt && mode === "2d") {
        const t = (now - exitAt.current) / 1000 / T.burnDur;
        const p = Math.min(1, t);
        // começa devagar, pega fogo e acelera, assenta no topo
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        // altura das línguas proporcional à largura (no celular, estreito, ficava pontiagudo)
        const amp = Math.min(h * 0.16, w * 0.11);
        const front = h + amp - e * (h + amp * 2.2);
        const drift = (now - exitAt.current) / 1000;
        for (let i = 0; i <= STEPS; i++) {
          const x = i / STEPS;
          // línguas largas + serrilhado fino (papel não queima reto)
          edge[i] = front + (fbm(x * 5.2 + drift * 0.35) - 0.5) * amp * 2 + (vnoise(x * 46 + drift * 1.7) - 0.5) * amp * 0.16;
        }
        // recorte da camada da intro: fica só o que está ACIMA da borda
        const paper = paperRef.current;
        if (paper) {
          let poly = `polygon(0px -2px, ${w}px -2px`;
          for (let i = STEPS; i >= 0; i--) poly += `, ${((i / STEPS) * w).toFixed(1)}px ${edge[i].toFixed(1)}px`;
          paper.style.clipPath = poly + ")";
        }
        const path = new Path2D();
        path.moveTo(0, edge[0]);
        for (let i = 1; i <= STEPS; i++) path.lineTo((i / STEPS) * w, edge[i]);

        // fumaça/cinza logo abaixo da borda: o site aparece "de trás" do papel, com profundidade
        ctx.save();
        ctx.translate(0, 22);
        ctx.strokeStyle = "rgba(8,5,3,0.62)";
        ctx.lineWidth = 46;
        if (!lite) {
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = 30;
        }
        ctx.stroke(path);
        ctx.restore();
        // carvão: o que está logo acima da borda (o ouro das letras inclusive) escurece
        // e tosta antes de o fogo chegar
        ctx.save();
        ctx.translate(0, -30);
        ctx.strokeStyle = "rgba(12,5,2,0.9)";
        ctx.lineWidth = 38;
        if (!lite) {
          ctx.shadowColor = "rgba(12,5,2,0.9)";
          ctx.shadowBlur = 22;
        }
        ctx.stroke(path);
        ctx.restore();
        // papel aquecido logo acima da borda (brilho que sobe pelo papel)
        ctx.save();
        ctx.translate(0, -10);
        ctx.strokeStyle = "rgba(255,96,24,0.24)";
        ctx.lineWidth = 26;
        if (!lite) {
          ctx.shadowColor = "rgba(255,80,10,0.6)";
          ctx.shadowBlur = 34;
        }
        ctx.stroke(path);
        ctx.restore();
        // borda em brasa: halo contínuo + núcleo com espessura e brilho que variam
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,120,36,0.8)";
        ctx.lineWidth = lite ? 4 : 2.6;
        if (!lite) {
          ctx.shadowColor = "#ff5a0a";
          ctx.shadowBlur = 18;
        }
        ctx.stroke(path);
        ctx.shadowBlur = 0;
        ctx.lineCap = "round";
        for (let i = 0; i < STEPS; i++) {
          const heat = vnoise(i * 0.55 + drift * 4.2);
          ctx.strokeStyle = heat > 0.55 ? "rgba(255,240,200,0.95)" : "rgba(255,176,90,0.85)";
          ctx.lineWidth = 0.6 + heat * 3.2;
          ctx.beginPath();
          ctx.moveTo((i / STEPS) * w, edge[i]);
          ctx.lineTo(((i + 1) / STEPS) * w, edge[i + 1]);
          ctx.stroke();
        }
        ctx.restore();

        // chamas: línguas de fogo ao longo de toda a borda, tremulando e tombando com o vento
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const F = Math.max(18, Math.round(w / (lite ? 26 : 15)));
        const fh = Math.min(h * 0.12, w * 0.17, 125);
        for (let layer = 0; layer < (lite ? 1 : 2); layer++) {
          const big = layer === 0;
          for (let j = 0; j < F; j++) {
            const u = (j + 0.5 + (hash(j * 3.1 + layer) - 0.5) * 0.8) / F;
            const fi = Math.min(STEPS - 1, Math.max(0, Math.floor(u * STEPS)));
            const y = edge[fi] + (edge[fi + 1] - edge[fi]) * (u * STEPS - fi);
            const flick = vnoise(j * 1.37 + layer * 11 + drift * (big ? 5.5 : 8.5));
            const hf = fh * (big ? 0.55 + flick * 0.95 : 0.28 + flick * 0.5);
            const wf = hf * (big ? 0.42 : 0.34);
            const sk = 0.22 * Math.sin(drift * 2.3 + j * 0.45) + 0.08;
            ctx.globalAlpha = big ? 0.62 : 0.9;
            ctx.setTransform(1, 0, -sk, 1, u * w, y + 3);
            ctx.drawImage(flame, -wf / 2, -hf * 0.82, wf, hf);
          }
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.restore();

        // fumaça subindo do papel queimado
        if (!lite && p < 0.75 && Math.random() < 0.5) {
          const i = Math.floor(Math.random() * STEPS);
          smoke.push({ x: (i / STEPS) * w, y: edge[i] - fh * 0.6, vx: (Math.random() - 0.5) * 20, vy: -(30 + Math.random() * 40), life: 0, max: 1.6 + Math.random() * 1.2, r: 18 + Math.random() * 18 });
        }

        // fagulhas que se soltam da borda
        const n = lite ? 2 : 6;
        for (let k = 0; k < n; k++) {
          const i = Math.floor(Math.random() * STEPS);
          spawn((i / STEPS) * w, edge[i] - 2, true, 90 + Math.random() * 120);
        }
        if (p >= 1) {
          burnt = true;
          burntCb.current();
        }
      }

      // fumaça: cresce, sobe e some
      for (let i = smoke.length - 1; i >= 0; i--) {
        const m = smoke[i];
        // depois que o papel acabou, a fumaça se dissipa rápido (não fica sobre o site)
        m.life += burnt ? dt * 4 : dt;
        if (m.life >= m.max) {
          smoke.splice(i, 1);
          continue;
        }
        const k = m.life / m.max;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const r = m.r * (1 + k * 2.6);
        ctx.globalAlpha = 0.2 * Math.sin(Math.PI * k);
        ctx.drawImage(smokeImg, m.x - r, m.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // desenha e envelhece as fagulhas
      ctx.globalCompositeOperation = "lighter";
      for (let i = embers.length - 1; i >= 0; i--) {
        const m = embers[i];
        m.life += dt;
        if (m.life >= m.max || m.y < -20) {
          embers.splice(i, 1);
          continue;
        }
        const k = m.life / m.max;
        m.vx += Math.sin((m.y + m.x) * 0.02) * 8 * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const a = Math.sin(Math.PI * Math.min(1, k * 1.15)) * (m.hot ? 1 : 0.55);
        ctx.globalAlpha = a;
        ctx.fillStyle = m.hot ? (k < 0.35 ? "#ffe2a8" : "#ff9a42") : "#e9a456";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (document.documentElement.hasAttribute("data-intro") || embers.length || smoke.length) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      burnGL?.dispose();
      if (ric) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [playing, lite, paperRef]);

  return (
    <>
      <canvas ref={glRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
    </>
  );
}

/**
 * Intro cinematográfica (1x por sessão). A camada só existe quando o script
 * inline marca <html data-intro>; sem JS, um fallback CSS a esconde.
 */
export function Intro() {
  const [phase, setPhase] = useState<"idle" | "play" | "exit" | "done">("idle");
  const [lite, setLite] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const uid = useId().replace(/:/g, "");
  const gold = `g${uid}`;
  const hot = `h${uid}`;
  const sheen = `s${uid}`;
  const sheenMask = `sm${uid}`;
  const brushMask = `bm${uid}`;

  // ensō: um único progresso move o traço e a brasa na ponta dele
  const arc = useMotionValue(0);
  const tip = useTransform(arc, (p) => {
    const el = arcRef.current;
    if (!el) return { x: 92.7, y: 255.8 };
    const pt = el.getPointAtLength(el.getTotalLength() * p);
    return { x: pt.x, y: pt.y };
  });
  const tipX = useTransform(tip, (v) => v.x);
  const tipY = useTransform(tip, (v) => v.y);
  const rise = useMotionValue(70);
  const tipYRise = useTransform([tipY, rise], ([y, r]) => (y as number) + (r as number));
  const brush = useMotionValue(0);
  const arcOpacity = useTransform(arc, [0, 0.02], [0, 1]);

  // inicia
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) {
      const id = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(id);
    }
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => {
      setLite(isLowEndDevice());
      setPhase("play");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // linha do tempo
  useEffect(() => {
    if (phase !== "play") return;
    const ctrls = [
      animate(rise, 0, { duration: 0.6, delay: T.spark, ease: EASE }),
      animate(arc, 1, { duration: T.arcDur, delay: T.arc, ease: DRAW }),
      animate(brush, 1, { duration: T.kanjiDur, delay: T.kanji, ease: [0.45, 0.05, 0.25, 1] }),
    ];
    const t = window.setTimeout(() => setPhase("exit"), T.exit * 1000);
    return () => {
      window.clearTimeout(t);
      ctrls.forEach((c) => c.stop());
    };
  }, [phase, arc, rise, brush]);

  // saída: o site abaixo já pode se preparar (pétalas, medição de fluidez...)
  useEffect(() => {
    if (phase === "exit") signalIntroDone();
  }, [phase]);

  // papel queimado por completo: as últimas fagulhas apagam (0,5 s), a camada some
  // de vez (barato, display:none) e desmonta num momento ocioso
  const burnt = () => {
    window.setTimeout(() => {
      document.documentElement.removeAttribute("data-intro");
      const unmount = () => setPhase("done");
      const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (ric) ric(unmount, { timeout: 1600 });
      else window.setTimeout(unmount, 600);
    }, 500);
  };

  if (phase === "done") return null;
  const playing = phase === "play" || phase === "exit";
  const exiting = phase === "exit";

  return (
    <div className={`mk-intro fixed inset-0 z-[100] ${exiting ? "pointer-events-none" : ""}`} role="presentation">
      {/* o "papel": fundo e logo — é o que queima na saída */}
      <div ref={paperRef} className="absolute inset-0 overflow-hidden bg-sumi">
        {/* brasa ao pé da tela (respira devagar) */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: "radial-gradient(60% 70% at 50% 100%, rgba(168,50,42,0.22), rgba(120,40,20,0.08) 45%, transparent 75%)" }}
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: [0, 1, 0.75, 1] } : {}}
          transition={{ duration: 4.4, ease: "easeInOut", times: [0, 0.35, 0.7, 1] }}
        />
        {/* luz quente atrás do emblema, acende com o ensō */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[40%] size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(198,161,91,0.16), rgba(168,50,42,0.05) 50%, transparent 72%)" }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={playing ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 3, ease: EASE, delay: T.arc }}
        />

        {/* câmera: aproximação lenta e contínua */}
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            className="-mt-[6vh] flex flex-col items-center"
            initial={{ scale: 1.08 }}
            animate={playing ? { scale: 1 } : {}}
            transition={{ duration: T.exit + T.burnDur, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Emblema: ensō em fogo + kanji em pinceladas */}
            <svg data-snap="emblem" viewBox={EMBLEM_VIEWBOX} className="w-[clamp(118px,16vw,190px)] overflow-visible" aria-hidden>
              <defs>
                <GoldGradient id={gold} />
                <linearGradient id={hot} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffe0a0" />
                  <stop offset="0.5" stopColor="#ff9a3c" />
                  <stop offset="1" stopColor="#e2551c" />
                </linearGradient>
                <mask id={brushMask} maskUnits="userSpaceOnUse" x="-20" y="-20" width="320" height="320">
                  <g transform="translate(46 34) scale(1.88 2.12)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d={BRUSH} strokeWidth="24" style={{ pathLength: brush }} />
                    {/* cerdas */}
                    <motion.path d={BRUSH} strokeWidth="5" transform="translate(-3 7)" opacity="0.85" style={{ pathLength: brush }} />
                  </g>
                </mask>
              </defs>
              {/* ensō: traço incandescente que esfria até o ouro */}
              <motion.path
                ref={arcRef}
                d={EMBLEM_ARC}
                fill="none"
                stroke={`url(#${gold})`}
                strokeWidth="5"
                strokeLinecap="round"
                style={{ pathLength: arc, opacity: arcOpacity }}
              />
              <motion.g
                className="[filter:drop-shadow(0_0_6px_#ff6a10)]"
                animate={playing ? { opacity: [1, 1, 0] } : {}}
                transition={{ duration: T.cool + 0.9, times: [0, T.cool / (T.cool + 0.9), 1], ease: "easeOut" }}
              >
                <motion.path
                  d={EMBLEM_ARC}
                  fill="none"
                  stroke={`url(#${hot})`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  style={{ pathLength: arc, opacity: arcOpacity }}
                />
              </motion.g>
              {/* a brasa: sobe do escuro e conduz o traço */}
              <motion.circle
                r="5"
                fill="#fff1c8"
                className="[filter:drop-shadow(0_0_8px_#ff7a1a)_drop-shadow(0_0_18px_#ff5a00)]"
                cx={tipX}
                cy={tipYRise}
                initial={{ opacity: 0 }}
                animate={playing ? { opacity: [0, 1, 1, 0] } : {}}
                transition={{ duration: T.arc + T.arcDur + 0.3, times: [0, 0.18, 0.86, 1], delay: T.spark }}
              />
              {/* kanji: ouro revelado pelo pincel, com uma camada em brasa que esfria */}
              <g mask={`url(#${brushMask})`}>
                <use href={`#${KANJI_ID}`} fill={`url(#${gold})`} />
                <motion.use
                  href={`#${KANJI_ID}`}
                  fill={`url(#${hot})`}
                  initial={{ opacity: 1 }}
                  animate={playing ? { opacity: 0 } : {}}
                  transition={{ duration: 1.2, delay: T.kanji + 0.7, ease: "easeOut" }}
                />
              </g>
            </svg>

            {/* MIKASA: sobe letra a letra; um reflexo de luz corre pelo ouro */}
            <svg data-snap="wordmark" viewBox={WORDMARK_VIEWBOX} className="mt-[clamp(1.6rem,4.2vh,2.9rem)] block w-[clamp(240px,44vw,540px)] overflow-visible" aria-hidden>
              <defs>
                <GoldGradient id={`${gold}w`} />
                <linearGradient id={sheen} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id={sheenMask}>
                  <motion.rect
                    y={-20}
                    height={WORDMARK_H + 40}
                    width={WORDMARK_W * 0.24}
                    fill={`url(#${sheen})`}
                    transform="skewX(-18)"
                    initial={{ x: -WORDMARK_W * 0.35 }}
                    animate={playing ? { x: WORDMARK_W * 1.25 } : {}}
                    transition={{ duration: 1.25, ease: [0.45, 0, 0.2, 1], delay: T.sheen }}
                  />
                </mask>
              </defs>
              <g fill={`url(#${gold}w)`}>
                {LETTER_BOXES.map((l, i) => (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0, y: WORDMARK_H * 0.42 }}
                    animate={playing ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.25, ease: EASE, delay: T.word + i * 0.07 }}
                  >
                    <use href={`#${letterId(i)}`} />
                  </motion.g>
                ))}
              </g>
              <g fill="#fff6dc" mask={`url(#${sheenMask})`} opacity="0.9">
                {LETTER_BOXES.map((_, i) => (
                  <use key={i} href={`#${letterId(i)}`} />
                ))}
              </g>
            </svg>

            {/* legenda: o espaçamento fecha devagar até assentar */}
            <motion.p
              data-snap="tagline"
              className="mt-6 whitespace-nowrap font-sans text-[clamp(0.68rem,1.05vw,0.8rem)] uppercase text-ouro-claro"
              initial={{ opacity: 0, letterSpacing: "0.9em" }}
              animate={playing ? { opacity: 1, letterSpacing: "0.42em" } : {}}
              transition={{ duration: 1.6, ease: EASE, delay: T.tag }}
            >
              Japanese Nikkei Cuisine
            </motion.p>
            <motion.span
              aria-hidden
              data-snap="line"
              className="mt-5 block h-px w-[clamp(120px,18vw,220px)] bg-gradient-to-r from-transparent via-ouro/70 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={playing ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 1.3, ease: EASE, delay: T.tag + 0.3 }}
            />
          </motion.div>
        </div>
      </div>

      {/* fagulhas + borda em brasa (fora do recorte, por cima do site sendo revelado) */}
      <IntroCanvas playing={playing} exiting={exiting} lite={lite} paperRef={paperRef} onBurnt={burnt} />

      <span className="sr-only" role="status">
        MIKASA — Japanese Nikkei Cuisine
      </span>
    </div>
  );
}
