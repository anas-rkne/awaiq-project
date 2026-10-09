"use client";

import type { ReactNode, RefObject } from "react";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

interface HeroStageProps {
  stageRef: RefObject<HTMLElement | null>;
  lensRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
}

/**
 * Scroll-driven stage — the 730vh (desktop) / 460vh (mobile) section whose
 * lens is PINNED by GSAP ScrollTrigger (no CSS sticky; ScrollTrigger owns the
 * pin so scrub timing and refresh stay consistent).
 *
 * Camera architecture:
 * - `lensRef` is the camera eye: it carries `perspective` and the focal
 *   point, and it is what ScrollTrigger pins. Clipping lives here too —
 *   the rotated plane never overflows the viewport, so no horizontal scroll.
 * - `worldRef` is one composited plane; GSAP aims its `transformOrigin` at
 *   the bottle and scrubs the dive (scale + rotateY + tilt) on exit.
 *
 * The SAME pinned scene continues into the Egypt half (the single bottle
 * travels onto the platform) — there is no second section or second pin.
 *
 * Responsive: every number comes from the RESOLVED hero frame — the same
 * frame `useHeroMotion` consumes, so the DOM's transform-origin/perspective
 * and GSAP's tween values can never disagree.
 */
export function HeroStage({
  stageRef,
  lensRef,
  worldRef,
  children,
  className = "",
}: HeroStageProps) {
  const frame = useHeroResponsive();
  const focal = `${frame.exit.originX}% ${frame.exit.originY}%`;

  return (
    <section
      ref={stageRef}
      className={`relative text-beige ${className}`}
      style={{
        height: frame.stageHeight,
        // F2: an explicit scene base matching the sky's navy so the hero can
        // never flash pure black (Globals body is #000) while sky.webp decodes.
        background:
          "linear-gradient(180deg, #2f4e78 0%, #27466b 55%, #1a3350 100%)",
      }}
    >
      <div
        ref={lensRef}
        className="relative w-full overflow-hidden"
        style={{
          height: "100svh",
          perspective: `${frame.perspective}px`,
          perspectiveOrigin: focal,
        }}
      >
        <div
          ref={worldRef}
          className="absolute inset-0 will-change-transform"
          style={{ transformOrigin: focal }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}