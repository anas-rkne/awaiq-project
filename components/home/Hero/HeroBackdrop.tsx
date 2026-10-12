"use client";

import type { RefObject } from "react";
import { HeroClouds, type HeroCloudsHandle } from "./HeroClouds";

interface HeroBackdropProps {
  /** Optional — the hero passes its ref so GSAP parallax can scrub the sky.
   *  Omitted for sections that do not parallax it. */
  skyRef?: RefObject<HTMLDivElement | null>;
  /** Optional — the hero passes its ref so the scroll timeline can push the
   *  cloud drift into the shader. Omitted elsewhere (clouds still animate on
   *  their internal clock). */
  cloudsRef?: RefObject<HeroCloudsHandle | null>;
  isMobile: boolean;
}

/**
 * The shared hero backdrop: the navy base + procedural FBM clouds. The
 * `sky.webp` image was removed site-wide — the sky is generated (clouds).
 * The mist is reserved for section→section transitions only.
 */
export function HeroBackdrop({ skyRef, cloudsRef, isMobile }: HeroBackdropProps) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        ref={skyRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      />
      <HeroClouds ref={cloudsRef} isMobile={isMobile} />
    </div>
  );
}
