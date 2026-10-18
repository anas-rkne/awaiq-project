"use client";

import { useEffect, useRef } from "react";
import { heroSceneConfig } from "@/config/site";
import { heroIncenseVertex, heroIncenseFragment } from "./heroIncenseShader";

/**
 * The HERO's incense sky — a golden dust horizon and two slow rising smoke
 * threads (`incense` in `heroSceneConfig`, drawn by `heroIncenseFragment`):
 * raw WebGL, one fullscreen triangle, BEHIND the resting art — the plate
 * occludes it, so the glow reads as depth around and through the artwork.
 * The threads advect upward continuously and their columns bend as they rise
 * (anchored at a breathing ember at the foot), and a sparse field of gold
 * motes drifts + twinkles across the whole stage. No scroll input needed.
 *
 * It is the hero's OWN atmosphere — separate
 * from `GlobalSkyLayer` (which draws the quiet cloud base variant page-wide
 * AFTER the hero): the engine (`useHeroGate`) owns the wrapper's `autoAlpha`
 * and fades it out with the resting art, so it exists in the main hero only.
 *
 * Budget (the proven WebGL pattern):
 * - One triangle, one program, DPR-capped (`maxDpr` / `maxDprMobile`).
 * - The loop runs ONLY while the canvas intersects the viewport (the
 *   faded-out wrapper stops it naturally), not while the tab is hidden, and
 *   only under `prefers-reduced-motion: no-preference` (the wrapper is not
 *   even rendered otherwise).
 * - Thread centers + radii and the haze line are uniforms: a breakpoint
 *   switch swaps them on the live program — never a recompile, never a flash.
 * - Pure decoration: `aria-hidden`, `pointer-events-none`.
 */
export function HeroIncense() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const timeRef = useRef(0);
  const lastRef = useRef(0);

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

    const compile = (type: number, source: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("HeroIncense shader error", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, heroIncenseVertex);
    const fs = compile(gl.FRAGMENT_SHADER, heroIncenseFragment());
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("HeroIncense program link error", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const c = heroSceneConfig.incense;

    const loc = {
      res: gl.getUniformLocation(program, "uResolution"),
      time: gl.getUniformLocation(program, "uTime"),
      opacity: gl.getUniformLocation(program, "uOpacity"),
      hazeY: gl.getUniformLocation(program, "uHazeY"),
    };

    // One uniform pair per thread (uCenterA/uRadiusA, …) — the shader bakes
    // its constants in the same order as `incense.threads`, letter by letter.
    const threads = c.threads.map((_, i) => {
      const s = String.fromCharCode(65 + i);
      return {
        center: gl.getUniformLocation(program, `uCenter${s}`),
        radius: gl.getUniformLocation(program, `uRadius${s}`),
      };
    });

    // The live values each uniform carries (refilled from the mobile /
    // desktop frame on every resize, then uploaded every frame).
    const frame = c.threads.map((t) => {
      const mobile = mobileQuery.matches;
      const p = mobile ? t.mobilePos : t.desktopPos;
      return { x: p.x, y: p.y, radius: t.radius };
    });

    /** Viewport frame → uniforms + DPR cap, on the LIVE program (never a
     *  recompile, so the incense never flashes on rotate / breakpoint). */
    const resize = () => {
      const mobile = mobileQuery.matches;
      for (let i = 0; i < frame.length; i++) {
        const t = c.threads[i];
        const p = mobile ? t.mobilePos : t.desktopPos;
        frame[i].x = p.x;
        frame[i].y = p.y;
        frame[i].radius = t.radius;
        gl.uniform2f(threads[i].center, frame[i].x, frame[i].y);
        gl.uniform1f(threads[i].radius, frame[i].radius);
      }
      gl.uniform1f(loc.hazeY, mobile ? c.haze.mobileY : c.haze.desktopY);
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        mobile ? c.maxDprMobile : c.maxDpr,
      );
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    mobileQuery.addEventListener("change", resize);

    const animate = (t: number) => {
      const dt = Math.min(0.05, (t - lastRef.current) / 1000 || 0);
      lastRef.current = t;
      timeRef.current += dt;
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, timeRef.current);
      gl.uniform1f(loc.opacity, c.opacity);
      gl.uniform1f(loc.hazeY, mobileQuery.matches ? c.haze.mobileY : c.haze.desktopY);
      for (let i = 0; i < frame.length; i++) {
        gl.uniform2f(threads[i].center, frame[i].x, frame[i].y);
        gl.uniform1f(threads[i].radius, frame[i].radius);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(animate);
    };

    if (reduced.matches) {
      timeRef.current = 0;
      runningRef.current = false;
      return () => {
        ro.disconnect();
        mobileQuery.removeEventListener("change", resize);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buffer);
      };
    }

    const first = (timeRef.current = performance.now() / 1000);
    lastRef.current = first;
    runningRef.current = true;

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        const was = visible;
        visible = entries[0]?.isIntersecting ?? false;
        if (was && !visible && runningRef.current) {
          runningRef.current = false;
          cancelAnimationFrame(rafRef.current);
        } else if (!was && visible && !reduced.matches) {
          runningRef.current = true;
          lastRef.current = performance.now();
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    // The engine fades the wrapper (autoAlpha) — this listener keeps the
    // explicit pause on hidden tabs so lastRef never drifts on resume.
    const onVisibility = () => {
      if (document.hidden && runningRef.current) {
        runningRef.current = false;
        cancelAnimationFrame(rafRef.current);
      } else if (!document.hidden && !runningRef.current && !reduced.matches) {
        runningRef.current = true;
        lastRef.current = performance.now();
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      io.disconnect();
      ro.disconnect();
      mobileQuery.removeEventListener("change", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-hero-incense="1"
      className="absolute inset-0 h-full w-full"
    />
  );
}
