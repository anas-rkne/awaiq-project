"use client";

import { useEffect, useRef } from "react";
import { createHeroBottleScene, type HeroBottleHandle } from "./heroBottleScene";

/**
 * The hero's 3D bottle overlay (WebGL, `heroBottleScene`). Loaded through
 * `next/dynamic` with `ssr: false` from `HeroSection`, so the three.js module
 * stays out of the initial hero bundle — same pattern as the finale's
 * `HandsCanvas`. Purely decorative + pointer-interactive: the canvas opts
 * itself into mouse events, touch keeps scrolling.
 */
export default function HeroBottle() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let handle: HeroBottleHandle | null = null;
    try {
      handle = createHeroBottleScene(container);
    } catch (err) {
      console.error("[hero-bottle] init failed", err);
    }
    return () => {
      handle?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      aria-hidden="true"
      data-hero-bottle="1"
    />
  );
}
