"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp } from "@/lib/clamp";

/**
 * Tracks the hero stage scroll progress in a ref (0..1). A ref is used on
 * purpose: consumers read it inside a rAF loop, so React never re-renders
 * during scrolling. Callers must schedule their own animation frame.
 */
export function useHeroScroll(stageRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      progressRef.current = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [stageRef]);

  return progressRef;
}
