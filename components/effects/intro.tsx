"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { EMBLEM_ARC, GoldGradient } from "@/components/brand/logo";
import { EMBLEM_VIEWBOX, KANJI_ID, LETTER_BOXES, letterId, WORDMARK_H, WORDMARK_VIEWBOX, WORDMARK_W } from "@/components/brand/logo-meta";
import { Fire } from "@/components/effects/fire";
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
 * Linha do tempo (s) — ≈ 7,7 s no total:
 *  - uma brasa sobe no escuro e desenha o círculo do emblema (ensō) em fogo, que
 *    esfria até o ouro; o kanji surge em pinceladas, ainda incandescente;
 *  - MIKASA sobe letra a letra, um reflexo de luz corre pelo ouro; a legenda assenta;
 *  - o fogo da base (com o torii em silhueta) cresce e QUEIMA as letras de baixo
 *    para cima: o ouro tosta, carboniza, vira brasa e abre buracos, com chamas;
 *  - saída: a tela fecha numa fenda horizontal e revela o site.
 */
const T = {
  spark: 0.2,
  arc: 0.6,
  arcDur: 1.2,
  kanji: 1.45,
  kanjiDur: 1.0,
  cool: 2.1,
  word: 2.2,
  sheen: 2.95,
  tag: 2.8,
  /** o fogo sobe e queima as letras de MIKASA de baixo para cima */
  lburn: 4.1,
  lburnDur: 2.3,
  /** saída: a tela fecha numa fenda horizontal (como na intro antiga) */
  exit: 6.45,
  exitDelay: 0.15,
  exitDur: 1.1,
};

/** Torii em silhueta contra o fogo (viewBox 600×400). */
const TORII = [
  "M0 50 Q300 100 600 50 L594 78 Q300 120 6 78 Z",
  "M42 96 L558 96 L552 116 L48 116 Z",
  "M286 116 L314 116 L314 164 L286 164 Z",
  "M58 164 L542 164 L542 186 L58 186 Z",
  "M140 116 L170 116 L180 400 L126 400 Z",
  "M430 116 L460 116 L474 400 L420 400 Z",
];
function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 400" className={className} aria-hidden>
      <g fill="#060405" stroke="rgba(240,150,70,0.55)" strokeWidth="1.2" strokeLinejoin="round">
        {TORII.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Fagulhas pedidas pela queima das letras; o canvas da intro as solta (coordenadas da tela). */
const emberQueue: { x: number; y: number }[] = [];


/** Zigue-zague largo do pincel que revela o kanji (de cima para baixo), em 0–100. */
const BRUSH = "M4 8 L96 4 L6 24 L96 20 L4 42 L96 38 L6 60 L96 56 L4 78 L96 74 L8 96 L96 94";

/* ───────────── queima realista das letras (WebGL) ───────────── */

/** Mesmo ruído do shader, em JS: para soltar fagulhas de onde o ouro está queimando. */
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
/** Campo de queima (igual ao shader): <0 ainda inteiro; >0 já queimou. */
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
  vec4 paper=texture2D(u_tex,uv); // letras em ouro sobre fundo transparente
  // material onde pode haver brasa/chamas: só o ouro das letras
  float mat=paper.a;
  // campo de queima pré-calculado (estático) + um serrilhado fino por pixel
  float f=(1.-uv.y)*.85+texture2D(u_field,uv).r*.62+(n(p*44.)-.5)*.01;
  float d=u_t*1.62-.06-f;            // >0: já queimou
  if(d>0.){                          // buraco, com a borda de cinza preta se desfazendo
    float rim=(1.-smoothstep(0.,.022,d+(n(p*60.)-.5)*.01))*mat;
    gl_FragColor=vec4(vec3(.018,.011,.007)*rim,rim*.96);return;}
  float e=-d;                        // distância (no campo) até a borda, do lado do material
  if(e>.2){gl_FragColor=paper;return;}
  vec3 col=paper.rgb;
  // ouro chamuscado: tosta, escurece e ganha um marrom quente antes de pegar fogo
  float scorch=smoothstep(.11,.0,e);
  col=mix(col,col*.18+vec3(.085,.032,.012)*mat,scorch*.9);
  float charB=smoothstep(.035,.0,e);
  col=mix(col,vec3(.03,.014,.008)*mat,charB*.85);
  // brasa: linha incandescente que tremula (branco-amarelado no fio, vermelho ao esfriar)
  float flick=.6+.4*n(p*26.+vec2(0.,-u_time*7.));
  float glow=exp(-e/.0168)*flick;
  vec3 hot=mix(vec3(.95,.22,.03),vec3(1.,.93,.72),exp(-e/.0042));
  // pontos de brasa espalhados na faixa chamuscada
  float speck=smoothstep(.78,.95,n(p*90.+u_time*.6))*smoothstep(.06,.0,e)*.8;
  // chamas: línguas turbulentas subindo da borda (nas letras, saem do próprio ouro)
  float tq=fbm3(vec2(p.x*6.5,p.y*3.4+u_time*2.6));
  // (some suave antes do corte em e=.2 — sem "caixa" dura nas chamas)
  float fl=exp(-e/(.035+.07*tq))*smoothstep(.32,.78,tq)*smoothstep(.2,.12,e);
  float fmat=max(mat,max(texture2D(u_tex,uv+vec2(0.,.05)).a,texture2D(u_tex,uv+vec2(0.,.11)).a*.6));
  vec3 flame=mix(vec3(.85,.16,.02),vec3(1.,.72,.28),fl);
  vec3 emit=(hot*glow*2.1+vec3(1.,.45,.12)*speck)*mat+flame*fl*1.75*fmat;
  col+=emit;
  float al=max(paper.a,clamp(max(emit.r,max(emit.g,emit.b)),0.,1.));
  gl_FragColor=vec4(col,al);
}`;

/** Prepara a queima em WebGL sobre a "foto" das letras. Devolve null sem WebGL. */
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

type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hot: boolean };

/**
 * Fagulhas num único <canvas> 2D: sobem devagar do fogo durante toda a intro e,
 * na queima das letras, saem de onde o ouro está queimando (fila `emberQueue`).
 */
function EmberCanvas({ playing, lite }: { playing: boolean; lite: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!playing) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0;
    let h = 0;
    const size = () => {
      // tamanho real da camada (a faixa reservada da barra de rolagem fica de fora)
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      // fagulhas são macias: 1x basta (e custa 1/4 num retina)
      canvas.width = w;
      canvas.height = h;
    };
    size();
    window.addEventListener("resize", size);

    const embers: Ember[] = [];
    const MAX = lite ? 70 : 170;
    const spawn = (x: number, y: number, hot: boolean, speed: number) => {
      if (embers.length >= MAX) return;
      const max = hot ? 0.7 + Math.random() * 0.9 : 2.2 + Math.random() * 2;
      embers.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (hot ? 70 : 22),
        vy: -(speed * (0.6 + Math.random() * 0.8)),
        life: 0,
        max,
        r: hot ? 0.8 + Math.random() * 1.9 : 0.6 + Math.random() * 1.4,
        hot,
      });
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      // fagulhas pedidas pela queima das letras
      while (embers.length < MAX && emberQueue.length) {
        const q = emberQueue.pop()!;
        spawn(q.x, q.y, true, 60 + Math.random() * 110);
      }
      emberQueue.length = 0;
      // fagulhas soltas pelo fogo da base
      acc += dt * (lite ? 6 : 14);
      while (acc > 1) {
        acc -= 1;
        spawn(w * (0.1 + Math.random() * 0.8), h * (0.78 + Math.random() * 0.2), false, 40 + Math.random() * 50);
      }
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
        ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, k * 1.15)) * (m.hot ? 1 : 0.6);
        ctx.fillStyle = m.hot ? (k < 0.35 ? "#ffe2a8" : "#ff9a42") : "#ffb05c";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (document.documentElement.hasAttribute("data-intro")) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [playing, lite]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

/** Área da queima das letras, em unidades do viewBox do wordmark (folga em cima para as chamas). */
const LBOX = { x: -60, y: -WORDMARK_H * 0.62, w: WORDMARK_W + 120, h: WORDMARK_H * 1.8 };

/**
 * Queima das letras de MIKASA em WebGL:
 * o ouro tosta, carboniza, vira brasa e abre buracos de baixo para cima, com chamas
 * saindo das próprias letras. Assume no quadro em que esconde as letras SVG.
 */
function LetterBurn({ start, lite, hideRef }: { start: boolean; lite: boolean; hideRef: React.RefObject<SVGGElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!start) return;
    const canvas = ref.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    // "foto" das letras em ouro, no mesmo enquadramento do canvas
    const snap = document.createElement("canvas");
    snap.width = canvas.width;
    snap.height = canvas.height;
    const g = snap.getContext("2d", { willReadFrequently: true });
    if (!g) return;
    const k = snap.width / LBOX.w;
    g.setTransform(k, 0, 0, k, -LBOX.x * k, -LBOX.y * k);
    const gr = g.createLinearGradient(0, 0, 0, WORDMARK_H);
    gr.addColorStop(0, "#f0dca6");
    gr.addColorStop(0.45, "#d4b06a");
    gr.addColorStop(1, "#a8823f");
    g.fillStyle = gr;
    LETTER_BOXES.forEach((_, i) => {
      const d = document.getElementById(letterId(i))?.getAttribute("d");
      if (d) g.fill(new Path2D(d), "evenodd");
    });
    const burn = createBurnGL(canvas, snap, buildField(r.width, r.height));
    if (!burn) return; // sem WebGL: as letras ficam e saem com a fenda
    const alpha = g.getImageData(0, 0, snap.width, snap.height).data;
    const aspect = r.width / r.height;
    let raf = 0;
    let t0 = 0;
    const loop = (now: number) => {
      if (!t0) {
        t0 = now;
        burn.render(0.08, 0);
        if (hideRef.current) hideRef.current.style.visibility = "hidden";
      }
      const sec = (now - t0) / 1000;
      const p = Math.min(1, sec / T.lburnDur);
      const t = 0.08 + Math.pow(p, 1.1) * 0.9;
      burn.render(t, sec);
      // fagulhas só onde há ouro queimando agora
      const box = canvas.getBoundingClientRect();
      for (let i = 0; i < (lite ? 10 : 26); i++) {
        const u = Math.random();
        const v = Math.random();
        const d = burnField(u, v, aspect, t);
        if (d >= 0 || d < -0.016) continue;
        const px = Math.floor(u * snap.width);
        const py = Math.floor(v * snap.height);
        if (alpha[(py * snap.width + px) * 4 + 3] > 120 && Math.random() < 0.6) {
          emberQueue.push({ x: box.left + u * box.width, y: box.top + v * box.height });
        }
      }
      if (p < 1 && document.documentElement.hasAttribute("data-intro")) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      burn.dispose();
    };
  }, [start, lite, hideRef]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${(LBOX.x / WORDMARK_W) * 100}%`,
        top: `${(LBOX.y / WORDMARK_H) * 100}%`,
        width: `${(LBOX.w / WORDMARK_W) * 100}%`,
        height: `${(LBOX.h / WORDMARK_H) * 100}%`,
      }}
    />
  );
}

/**
 * Intro cinematográfica (1x por sessão). A camada só existe quando o script
 * inline marca <html data-intro>; sem JS, um fallback CSS a esconde.
 */
export function Intro() {
  const [phase, setPhase] = useState<"idle" | "play" | "exit" | "done">("idle");
  const [lite, setLite] = useState(false);
  const arcRef = useRef<SVGPathElement>(null);
  const lettersRef = useRef<SVGGElement>(null);
  const fireK = useRef(0);
  const fireOn = useRef(true);
  const [lburn, setLburn] = useState(false);
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
      // fogo da base (o da intro antiga): acende, cresce e sobe junto com a queima das letras
      animate(0, 0.42, { duration: 1.6, delay: 0.2, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
      animate(0.42, 0.7, { duration: 1.4, delay: 2.0, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
      animate(0.7, 1.12, { duration: T.lburnDur, delay: T.lburn, ease: [0.4, 0, 0.6, 1], onUpdate: (v) => (fireK.current = v) }),
      animate(1.12, 1.25, { duration: 0.5, delay: T.exit - 0.2, ease: EASE, onUpdate: (v) => (fireK.current = v) }),
    ];
    const lb = window.setTimeout(() => setLburn(true), T.lburn * 1000);
    const t = window.setTimeout(() => setPhase("exit"), T.exit * 1000);
    return () => {
      window.clearTimeout(lb);
      window.clearTimeout(t);
      ctrls.forEach((c) => c.stop());
    };
  }, [phase, arc, rise, brush]);

  // saída (a da intro antiga): o fogo cresce e a tela fecha numa fenda horizontal.
  // O site abaixo já pode se preparar (pétalas, medição de fluidez...).
  useEffect(() => {
    if (phase !== "exit") return;
    signalIntroDone();
    let idle = 0;
    let late = 0;
    // só quando a fenda fechou de vez
    const t = window.setTimeout(() => {
      // 1º passo, barato: a camada vira display:none (CSS) e o fogo para de desenhar
      fireOn.current = false;
      document.documentElement.removeAttribute("data-intro");
      // 2º passo, num momento ocioso: desmontar a árvore da intro e os contextos WebGL
      const unmount = () => setPhase("done");
      const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
      if (ric) idle = ric(unmount, { timeout: 1200 });
      else late = window.setTimeout(unmount, 400);
    }, (T.exitDelay + T.exitDur) * 1000 + 40);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(late);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [phase]);

  if (phase === "done") return null;
  const playing = phase === "play" || phase === "exit";
  const exiting = phase === "exit";

  return (
    <motion.div
      className="mk-intro fixed inset-0 z-[100] overflow-hidden bg-sumi"
      role="presentation"
      initial={false}
      animate={exiting ? { clipPath: "inset(50% 0% 50% 0%)" } : { clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: T.exitDur, ease: [0.76, 0, 0.24, 1], delay: exiting ? T.exitDelay : 0 }}
    >
      <div className="absolute inset-0">
        {/* fogo subindo por baixo (o da intro antiga) */}
        {playing ? (
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[58%] mix-blend-screen">
            <Fire intensityRef={fireK} activeRef={fireOn} className="h-full w-full" />
          </div>
        ) : null}
        {/* torii em silhueta contra o fogo */}
        <motion.div
          aria-hidden
          className="absolute bottom-0 left-1/2 w-[min(78vw,520px)] -translate-x-1/2"
          initial={{ opacity: 0, y: 40 }}
          animate={playing ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 3.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          <Torii className="w-full" />
        </motion.div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sumi to-transparent" />
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
            className="-mt-[12vh] flex flex-col items-center"
            initial={{ scale: 1.08 }}
            animate={exiting ? { scale: 1.04, y: -10, opacity: 0 } : playing ? { scale: 1 } : {}}
            transition={exiting ? { duration: 0.9, ease: EASE } : { duration: T.exit, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Emblema: ensō em fogo + kanji em pinceladas */}
            <svg viewBox={EMBLEM_VIEWBOX} className="w-[clamp(118px,16vw,190px)] overflow-visible" aria-hidden>
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
            <div className="relative mt-[clamp(1.6rem,4.2vh,2.9rem)] w-[clamp(240px,44vw,540px)]">
            <svg viewBox={WORDMARK_VIEWBOX} className="block w-full overflow-visible" aria-hidden>
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
              <g ref={lettersRef}>
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
              </g>
            </svg>
            <LetterBurn start={lburn} lite={lite} hideRef={lettersRef} />
            </div>

            {/* legenda: o espaçamento fecha devagar até assentar */}
            <motion.p
              className="mt-6 whitespace-nowrap font-sans text-[clamp(0.68rem,1.05vw,0.8rem)] uppercase text-ouro-claro"
              initial={{ opacity: 0, letterSpacing: "0.9em" }}
              animate={playing ? { opacity: 1, letterSpacing: "0.42em" } : {}}
              transition={{ duration: 1.6, ease: EASE, delay: T.tag }}
            >
              Japanese Nikkei Cuisine
            </motion.p>
            <motion.span
              aria-hidden
              className="mt-5 block h-px w-[clamp(120px,18vw,220px)] bg-gradient-to-r from-transparent via-ouro/70 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={playing ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 1.3, ease: EASE, delay: T.tag + 0.3 }}
            />
          </motion.div>
        </div>
      </div>

      {/* fagulhas do fogo e das letras queimando */}
      <EmberCanvas playing={playing} lite={lite} />

      <span className="sr-only" role="status">
        MIKASA — Japanese Nikkei Cuisine
      </span>
    </motion.div>
  );
}
