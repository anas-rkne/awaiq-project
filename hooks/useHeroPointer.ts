"use client";

import { useEffect, useRef, type RefObject } from "react";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Normalized pointer position relative to the stage (-1..1 on both axes),
 * stored in a ref so pointer movement never triggers a React render.
 * Disabled under prefers-reduced-motion.
 */
export function useHeroPointer(stageRef: RefObject<HTMLElement | null>) {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerMove = (event: PointerEvent) => {
      if (prefersReducedMotion()) return;
      const rect = stage.getBoundingClientRect();
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: 0, y: 0 };
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [stageRef]);

  return pointerRef;
}
