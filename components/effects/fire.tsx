"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Fogo procedural (fbm) com faíscas: vermelho Torii → âmbar → ouro → núcleo claro.
const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform float k;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
vec3 ramp(float x){
  vec3 c=mix(vec3(.10,.01,.0),vec3(.50,.06,.04),smoothstep(.0,.25,x));
  c=mix(c,vec3(.80,.24,.08),smoothstep(.2,.5,x));
  c=mix(c,vec3(.95,.60,.22),smoothstep(.45,.75,x));
  c=mix(c,vec3(1.,.90,.66),smoothstep(.75,1.,x));
  return c;
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float asp=r.x/r.y;
  vec2 p=vec2(uv.x*asp,uv.y);
  float n=fbm(vec2(p.x*2.6,p.y*1.7-t*1.15));
  float n2=fbm(vec2(p.x*5.2+n*1.6,p.y*3.4-t*2.1));
  float center=1.-smoothstep(.0,.62,abs(uv.x-.5));
  float h=(.22+.62*center)*k;
  float f=(h-uv.y)/max(h,.001);
  f+=(n2-.5)*1.05+(n-.5)*.35;
  f=clamp(f,0.,1.);
  f=pow(f,1.25);
  vec3 col=ramp(f);
  float a=smoothstep(.0,.35,f);
  // faíscas subindo
  vec2 sp=vec2(p.x*14.,p.y*7.-t*1.7);
  vec2 id=floor(sp);vec2 fr=fract(sp)-.5;
  vec2 o=vec2(hash(id+3.1)-.5,hash(id+7.7)-.5)*.6;
  float s=smoothstep(.07,.0,length(fr-o))*step(.86,hash(id))*smoothstep(1.,.15,uv.y)*k;
  col+=vec3(1.,.72,.35)*s*1.4;a=max(a,s);
  gl_FragColor=vec4(col*a,a);
}`;

/**
 * Fogo em WebGL, renderizado em meia resolução (é suave por natureza).
 * `intensity` (0–1) controla a altura das chamas e pode ser animado de fora via ref.
 */
export function Fire({
  className,
  intensityRef,
  scale = 0.5,
}: {
  className?: string;
  intensityRef: React.RefObject<number>;
  scale?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!canvas || !gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uK = gl.getUniformLocation(prog, "k");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * scale;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (now - start) / 1000);
      gl.uniform1f(uK, intensityRef.current ?? 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [intensityRef, scale]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none block size-full", className)} />;
}
