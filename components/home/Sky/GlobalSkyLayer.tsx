"use client";

import { useEffect, useRef } from "react";
import { heroSceneConfig } from "@/config/site";
import { heroCloudsVertex, heroCloudsFragment } from "@/components/home/Hero/heroCloudsShader";

/**
 * The fixed page-wide atmosphere: the SAME procedural clouds over the page's
 * navy base, glued to the viewport behind every section (z-index: -10). The
 * former `sky.webp` image layer was removed site-wide; the sky is now
 * generated entirely (clouds). The mist is reserved for section→section
 * transitions only.
 *
 * Design contract (approved): the site reads as ONE continuous layer. The hero
 * keeps its own cinematic giant; this layer drives the continuation — it stays
 * hidden behind opaque content (the hero box, the hands 3D canvas) and becomes
 * visible wherever a section is transparent, so every future product/service
 * section automatically inherits the brand sky.
 *
 * Budget mirrors HeroClouds: DPR-capped, IntersectionObserver/visibility
 * aware, static under `prefers-reduced-motion`. Rendering only starts once
 * the hero is scrolled past (scroll gate) so it costs nothing on the epic.
 */

/**
 * The gate: the fixed sky only starts rendering once the viewport has scrolled
 * level with the BOTTOM of the hero pin (i.e. the hero no longer covers the
 * screen). On pages without a hero it runs immediately.
 */
const GATE_LOOKUP = () => {
  const el = document.getElementById("hero");
  if (!el) return 0;
  return el.offsetTop + el.offsetHeight;
};

export function GlobalSkyLayer() {
  const topRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const timeRef = useRef(0);
  const lastRef = useRef(0);
  const gateRef = useRef<number | null>(null);
  const locationsRef = useRef<{
    res: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    opacity: WebGLUniformLocation | null;
    driftA: WebGLUniformLocation | null;
    driftB: WebGLUniformLocation | null;
    centerA: WebGLUniformLocation | null;
    centerB: WebGLUniformLocation | null;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;
    glRef.current = gl;

    const compile = (type: number, source: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("GlobalSkyLayer shader error", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, heroCloudsVertex);
    const fs = compile(gl.FRAGMENT_SHADER, heroCloudsFragment());
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("GlobalSkyLayer program link error", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    locationsRef.current = {
      res: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      opacity: gl.getUniformLocation(program, "uOpacity"),
      driftA: gl.getUniformLocation(program, "uDriftA"),
      driftB: gl.getUniformLocation(program, "uDriftB"),
      centerA: gl.getUniformLocation(program, "uCenterA"),
      centerB: gl.getUniformLocation(program, "uCenterB"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const c = heroSceneConfig.clouds;

    const draw = (t: number, force = false) => {
      const ctx = glRef.current;
      const loc = locationsRef.current;
      if (!ctx || !loc) return;
      const dt = Math.min(0.05, (t - lastRef.current) / 1000 || 0);
      lastRef.current = t;
      if (!reduced.matches) timeRef.current += dt;
      ctx.uniform2f(loc.res, ctx.canvas.width, ctx.canvas.height);
      ctx.uniform1f(loc.time, timeRef.current);
      ctx.uniform1f(loc.opacity, c.opacity);
      ctx.uniform1f(loc.driftA, 0);
      ctx.uniform1f(loc.driftB, 0);
      const centerA = mobileQuery.matches ? c.layerA.mobilePos : c.layerA.desktopPos;
      const centerB = mobileQuery.matches ? c.layerB.mobilePos : c.layerB.desktopPos;
      ctx.uniform2f(loc.centerA, centerA.x, centerA.y);
      ctx.uniform2f(loc.centerB, centerB.x, centerB.y);
      ctx.drawArrays(ctx.TRIANGLES, 0, 3);
      if (force) runningRef.current = true;
    };

    const setGate = (enabled: boolean) => {
      if (runningRef.current === enabled) return;
      runningRef.current = enabled;
      canvas.dataset.skyRunning = enabled ? "1" : "0";
      if (enabled && !reduced.matches) {
        lastRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      } else if (!enabled) {
        cancelAnimationFrame(rafRef.current);
      }
    };

    const tick = (t: number) => {
      if (!runningRef.current) return;
      draw(t);
      rafRef.current = requestAnimationFrame(tick);
    };

    const updateGate = () => {
      const passed = window.scrollY + window.innerHeight >= (gateRef.current ?? 0);
      setGate(passed || reduced.matches);
      if (reduced.matches && !runningRef.current) {
        runningRef.current = true;
        draw(performance.now(), true);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        mobileQuery.matches ? c.maxDprMobile : c.maxDpr,
      );
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const loc = locationsRef.current;
      if (loc) gl.uniform2f(loc.res, canvas.width, canvas.height);
      lastRef.current = performance.now();
      if (runningRef.current) draw(performance.now());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    gateRef.current = GATE_LOOKUP();
    window.addEventListener("scroll", updateGate, { passive: true });
    window.addEventListener("resize", updateGate);
    const onVisibility = () => {
      if (document.hidden && runningRef.current && !reduced.matches) {
        cancelAnimationFrame(rafRef.current);
      } else if (!document.hidden) {
        updateGate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    updateGate();

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", updateGate);
      window.removeEventListener("resize", updateGate);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      glRef.current = null;
      locationsRef.current = null;
    };
  }, []);

  return (
    <div ref={topRef} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" data-global-sky="1">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" data-sky-running="0" />
    </div>
  );
}
