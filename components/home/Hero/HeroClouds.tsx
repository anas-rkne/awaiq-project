"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { heroSceneConfig } from "@/config/site";
import { heroCloudsVertex, heroCloudsFragment } from "./heroCloudsShader";

export interface HeroCloudsHandle {
  /** Scroll-scrubbed horizontal offset (px) per layer — replaces the old
   *  GSAP `x` transform, fed into the shader as center drift. */
  setDrift: (a: number, b: number) => void;
}

interface HeroCloudsProps {
  /** Switches the layer centers + DPR cap with the viewport frame. The
   *  shader itself is NEVER recompiled on switch — centers are uniforms. */
  isMobile: boolean;
}

type CloudCenter = { x: number; y: number };

/**
 * The section clouds (raw WebGL, see heroCloudsShader). The fragment shader IS
 * the clouds — generated, not uploaded. Lifecycle:
 * - Loop runs ONLY while the element is intersecting (IntersectionObserver)
 *   and ONLY under `prefers-reduced-motion: no-preference`.
 * - DPR is capped (maxDpr / maxDprMobile, viewport-aware) and recomputed on
 *   resize — one small canvas, we draw what is seen, nothing more.
 * - Scroll drift is pushed in from GSAP via `setDrift` (single source of
 *   truth stays the ScrollTrigger timeline).
 * - Layer centers switch with the viewport frame as uniforms — the shader is
 *   compiled once and never recompiled (no flash on breakpoint rotate).
 * - Pure decoration: `aria-hidden`.
 */
export const HeroClouds = forwardRef<HeroCloudsHandle, HeroCloudsProps>(
  function HeroClouds({ isMobile }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const rafRef = useRef<number>(0);
    const runningRef = useRef(false);
    const driftARef = useRef(0);
    const driftBRef = useRef(0);
    const opacityRef = useRef(heroSceneConfig.clouds.opacity);
    const timeRef = useRef(0);
    const lastRef = useRef(0);
    const resizeRef = useRef<(() => void) | null>(null);
    const dprCapRef = useRef<number>(heroSceneConfig.clouds.maxDpr);
    const centerARef = useRef<CloudCenter>({ ...heroSceneConfig.clouds.layerA.desktopPos });
    const centerBRef = useRef<CloudCenter>({ ...heroSceneConfig.clouds.layerB.desktopPos });
    const locationsRef = useRef<{
      res: WebGLUniformLocation | null;
      time: WebGLUniformLocation | null;
      opacity: WebGLUniformLocation | null;
      driftA: WebGLUniformLocation | null;
      driftB: WebGLUniformLocation | null;
      centerA: WebGLUniformLocation | null;
      centerB: WebGLUniformLocation | null;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      setDrift(a, b) {
        driftARef.current = a;
        driftBRef.current = b;
      },
    }));

    const animate = useCallback((t: number) => {
      const gl = glRef.current;
      if (!gl || !runningRef.current) return;
      const dt = Math.min(0.05, (t - lastRef.current) / 1000 || 0);
      lastRef.current = t;
      timeRef.current += dt;
      const loc = locationsRef.current;
      if (loc) {
        gl.uniform2f(loc.res, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(loc.time, timeRef.current);
        gl.uniform1f(loc.opacity, opacityRef.current);
        gl.uniform1f(loc.driftA, driftARef.current);
        gl.uniform1f(loc.driftB, driftBRef.current);
        gl.uniform2f(loc.centerA, centerARef.current.x, centerARef.current.y);
        gl.uniform2f(loc.centerB, centerBRef.current.x, centerBRef.current.y);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(animate);
    }, []);

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
          console.warn("HeroClouds shader error", gl.getShaderInfoLog(sh));
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
        console.warn("HeroClouds program link error", gl.getProgramInfoLog(program));
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
      if (reduced.matches) {
        timeRef.current = 0;
        runningRef.current = false;
        return;
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

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, dprCapRef.current);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      resizeRef.current = resize;
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      // F7: also stop rendering while the tab is hidden (rAF is throttled
      // anyway, but the explicit pause keeps `lastRef` drift out on resume).
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
        document.removeEventListener("visibilitychange", onVisibility);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buffer);
        glRef.current = null;
        locationsRef.current = null;
        resizeRef.current = null;
      };
    }, [animate]);

    /** Viewport-frame switch: new centers + DPR cap as uniforms — the shader
     *  is never recompiled, so the clouds never flash on rotate/breakpoint. */
    useEffect(() => {
      const c = heroSceneConfig.clouds;
      centerARef.current = isMobile ? c.layerA.mobilePos : c.layerA.desktopPos;
      centerBRef.current = isMobile ? c.layerB.mobilePos : c.layerB.desktopPos;
      dprCapRef.current = isMobile ? c.maxDprMobile : c.maxDpr;
      const gl = glRef.current;
      const loc = locationsRef.current;
      if (gl && loc) {
        gl.uniform2f(loc.centerA, centerARef.current.x, centerARef.current.y);
        gl.uniform2f(loc.centerB, centerBRef.current.x, centerBRef.current.y);
      }
      resizeRef.current?.();
    }, [isMobile]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    );
  },
);
