"use client";

import type { ReactNode, RefObject } from "react";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

interface HeroStageProps {
  stageRef: RefObject<HTMLElement | null>;
  lensRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  /**
   * Overlays that must live in SCREEN space, not world space. They render in
   * the lens (which the camera never scales) so the narration copy always sits
   * at the exact screen edge — while the world plane behind it may still be
   * mid-zoom. Putting them in `worldRef` made the copy drift off-screen while
   * the camera leaned in on the first (hero→Egypt) handoff.
   */
  screenLayer?: ReactNode;
  className?: string;
}

/**
 * Scroll-driven stage — the merged hero→Egypt→Babylon section (982vh desktop
 * / 604vh mobile) whose lens is PINNED by GSAP ScrollTrigger (no CSS sticky;
 * ScrollTrigger owns the pin so scrub timing and refresh stay consistent).
 *
 * Camera architecture:
 * - `lensRef` is the camera eye: it carries `perspective` and the focal
 *   point, and it is what ScrollTrigger pins. Clipping lives here too —
 *   the rotated plane never overflows the viewport, so no horizontal scroll.
 * - `worldRef` is one composited plane; GSAP aims its `transformOrigin` at
 *   the bottle and scrubs the gentle zoom on exit (scale only — no rotation).
 *
 * The SAME pinned scene continues into the Egypt and Babylon halves (the
 * single bottle travels onto each platform) — there is no second section or
 * second pin.
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
  screenLayer,
  className = "",
}: HeroStageProps) {
  const frame = useHeroResponsive();
  const focal = `${frame.exit.originX}% ${frame.exit.originY}%`;

  return (
    <section
      ref={stageRef}
      id="hero"
      className={`relative text-beige ${className}`}
      style={{
        height: frame.stageHeight,
        // F2: an explicit scene base (brand navy) so the hero can never flash
        // the wrong tone before the clouds paint. Tokens only.
        background:
          "linear-gradient(180deg, var(--color-navy) 0%, var(--color-navy-deep) 55%, var(--color-navy-ink) 100%)",
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
        {screenLayer}
      </div>
    </section>
  );
}