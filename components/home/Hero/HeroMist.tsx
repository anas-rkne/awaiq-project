"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { heroSceneConfig } from "@/config/site";
import { heroMistTransitionFragment } from "./heroMistShader";

export interface HeroMistHandle {
  /**
   * Normalized progress (0→1) across a section→section mist window, fed by the
   * SAME GSAP ScrollTrigger timeline that slides the plates. The shader DERIVES
   * the bank's intensity (a peak at the swap) and its upward roll from this one
   * value — the mist only exists during transitions, never at rest.
   */
  setProgress: (p: number) => void;
}

interface HeroMistProps {
  isMobile: boolean;
}

const VERTEX = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;


/**
 * The section→section mist bank. Lifecycle mirrors the old cloud layer:
 * - No WebGL under `prefers-reduced-motion: reduce` (transitions block instead).
 * - The loop runs ONLY while the bank is on screen (IntersectionObserver); it
 *   idles itself once the progress settles at an endpoint (0 or 1).
 * - DPR capped (soft mist — cheap); `preserveDrawingBuffer` keeps the last
 *   frame alive while frozen.
 * - Pure decoration: `aria-hidden`, `pointer-events-none`.
 */
export const HeroMist = forwardRef<HeroMistHandle, HeroMistProps>(
  function HeroMist({ isMobile }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const rafRef = useRef<number>(0);
    const runningRef = useRef(false);
    const visibleRef = useRef(true);
    const progressRef = useRef(0);
    const settledRef = useRef(-9);
    const readyRef = useRef(false);
    const timeRef = useRef(0);
    const lastRef = useRef(0);
    const dprCapRef = useRef<number>(heroSceneConfig.mist.maxDpr);
    const resizeRef = useRef<(() => void) | null>(null);
    const locationsRef = useRef<{
      res: WebGLUniformLocation | null;
      time: WebGLUniformLocation | null;
      progress: WebGLUniformLocation | null;
    } | null>(null);

    const start = useCallback(() => {
      if (runningRef.current || !readyRef.current || !visibleRef.current) return;
      runningRef.current = true;
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(function step(t: number) {
        const gl = glRef.current;
        const loc = locationsRef.current;
        if (!gl || !loc || !runningRef.current) return;
        const dt = Math.min(0.05, (t - lastRef.current) / 1000 || 0);
        lastRef.current = t;
        timeRef.current += dt;

        gl.uniform2f(loc.res, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(loc.time, timeRef.current);
        gl.uniform1f(loc.progress, progressRef.current);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        const p = progressRef.current;
        if (p <= 0 || p >= 1) {
          if (p === settledRef.current) {
            runningRef.current = false;
            return;
          }
          settledRef.current = p;
        }
        rafRef.current = requestAnimationFrame(step);
      });
    }, []);

    useImperativeHandle(ref, () => ({
      setProgress(p) {
        progressRef.current = p;
        settledRef.current = -9;
        start();
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) return;
      glRef.current = gl;

      const compile = (type: number, source: string) => {
        const sh = gl.createShader(type);
        if (!sh) return null;
        gl.shaderSource(sh, source);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.warn("HeroMist shader error", gl.getShaderInfoLog(sh));
          gl.deleteShader(sh);
          return null;
        }
        return sh;
      };

      const vs = compile(gl.VERTEX_SHADER, VERTEX);
      const fs = compile(gl.FRAGMENT_SHADER, heroMistTransitionFragment());
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn("HeroMist link error", gl.getProgramInfoLog(program));
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
        progress: gl.getUniformLocation(program, "uProgress"),
      };

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

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);

      readyRef.current = true;
      start();

      const io = new IntersectionObserver(
        (entries) => {
          visibleRef.current = entries[0]?.isIntersecting ?? false;
          if (visibleRef.current) {
            start();
          } else {
            runningRef.current = false;
            cancelAnimationFrame(rafRef.current);
          }
        },
        { threshold: 0.01 },
      );
      io.observe(canvas);

      const onVisibility = () => {
        visibleRef.current = !document.hidden;
        if (visibleRef.current) start();
        else {
          runningRef.current = false;
          cancelAnimationFrame(rafRef.current);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

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
        readyRef.current = false;
      };
    }, [start]);

    /** Viewport-frame switch: new DPR cap only — the shader is never
     *  recompiled (the mist has no centers or textures to worry about). */
    useEffect(() => {
      dprCapRef.current = isMobile
        ? heroSceneConfig.mist.maxDprMobile
        : heroSceneConfig.mist.maxDpr;
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
