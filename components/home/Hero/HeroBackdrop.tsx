"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { heroSceneConfig } from "@/config/site";
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
 * The shared hero backdrop: sky image + procedural FBM clouds, the exact
 * same composition the hero edits (same image, same filter, same shader) so
 * the brand-story section is consistent by construction, not by re-draw.
 */
export function HeroBackdrop({
  skyRef,
  cloudsRef,
  isMobile,
}: HeroBackdropProps) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        ref={skyRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <Image
          src={heroSceneConfig.images.sky}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "saturate(0.8) contrast(1.1) sepia(0.2)" }}
        />
      </div>
      <HeroClouds ref={cloudsRef} isMobile={isMobile} />
    </div>
  );
}