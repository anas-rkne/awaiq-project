"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import lottie from "lottie-web";
import { heroSceneConfig } from "@/config/site";

interface HeroRadarProps {
  className?: string;
  style?: CSSProperties;
  /** Square container size (clamp resolved per viewport by the hero frame). */
  width: string;
}

/**
 * Radial radar halo behind the bottle (lottie-rive skill).
 *
 * Decision:
 * - This is a DESIGNED, RECORDED animation (rotating elliptical rings) with
 *   no interaction → Lottie, not Rive.
 * - Above the fold → loads immediately (32KB, well under the 200KB line).
 * - `loop` is the intended behavior of a radar halo, but the animation pauses
 *   the moment it leaves / is clipped from the viewport (IntersectionObserver)
 *   and never runs under `prefers-reduced-motion`.
 * - `aria-hidden`: pure decoration. The bottle's own alt text carries meaning.
 */
export function HeroRadar({ className = "", style, width }: HeroRadarProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReduced = () => reduced.matches;

    if (prefersReduced()) return;

    const anim = lottie.loadAnimation({
      container: host,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: heroSceneConfig.radar.path,
    });
    animRef.current = anim;

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        const wasVisible = visible;
        visible = entries[0]?.isIntersecting ?? false;
        if (!wasVisible && visible) anim.play();
        if (wasVisible && !visible) anim.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      anim.destroy();
      animRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ width, aspectRatio: "1 / 1", ...style }}
    />
  );
}