"use client";

import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroSceneConfig } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Canonical Lenis↔GSAP sync (see gsap-scroll-motion skill):
 * 1. every Lenis scroll event calls ScrollTrigger.update
 * 2. ONE clock — Lenis raf is driven by gsap.ticker, so scrub timelines and
 *    the smooth scroll never desync
 * 3. lagSmoothing(0) — no catch-up jumps after a tab stall
 *
 * Resize ownership — WHY we take it away from ScrollTrigger:
 * A viewport change fires Refresh in TWO independent owners. If the gain
 * happens as a breakpoint FLIP (e.g. a phone resized to desktop), React's
 * `[frame]` rebuild reverts the old pin-spacer and builds a new one in the
 * SAME commit — while ScrollTrigger's own `resize` auto-refresh re-pins the
 * already-pinned element. Two pins nest, the spacer doubles, and the
 * document keeps growing until the next section's text enters the hero (the
 * user's resize bug). So `resize` is REMOVED from autoRefreshEvents here;
 * the ONLY refresh path is our single debounced flush below, which skips
 * entirely when the responsive frame flipped (the rebuild IS the refresh).
 */
function LenisGSAPSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    // Belt-and-braces for F1: if any engine restored a scroll position anyway,
    // snap back to the top of the pinned intro before the scrub can misread it.
    if (window.scrollY > 0) {
      lenis.scrollTo(0, { immediate: true });
    }
    // Professional default: never re-measure a pinned intro on the iOS
    // address-bar show/hide (100svh already tracks it); only real width
    // changes and our own flush should re-measure.
    ScrollTrigger.config({
      ignoreMobileResize: true,
      // We own resize (see above); a load refresh is still healthy once.
      autoRefreshEvents: "load,DOMContentLoaded,visibilitychange",
    });

    const isMobileNow = () =>
      window.matchMedia(
        `(max-width: ${heroSceneConfig.breakpoints.desktop - 1}px)`,
      ).matches;
    const isReducedNow = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lastMobile = isMobileNow();
    let lastReduced = isReducedNow();
    let flushQueued = false;

    const flush = () => {
      flushQueued = false;
      const flipped =
        lastMobile !== isMobileNow() || lastReduced !== isReducedNow();
      lastMobile = isMobileNow();
      lastReduced = isReducedNow();
      // Frame flip → the [frame] useGSAP rebuild reverts+re-pins in the same
      // commit; our refresh here would just be the second, nesting pin.
      if (!flipped) ScrollTrigger.refresh();
    };
    const scheduleFlush = () => {
      if (flushQueued) return;
      flushQueued = true;
      requestAnimationFrame(flush);
    };

    window.addEventListener("resize", scheduleFlush);
    window.addEventListener("load", scheduleFlush);

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("resize", scheduleFlush);
      window.removeEventListener("load", scheduleFlush);
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, autoRaf: false }}>
      <LenisGSAPSync />
      {children}
    </ReactLenis>
  );
}