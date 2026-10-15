"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Locks page scroll while an overlay (menu, drawer, modal) is open.
 *
 * `overflow: hidden` alone does not stop iOS Safari's rubber-band scroll, and
 * Lenis ignores plain wheel/touch once the page is position-fixed — so we use
 * the classic iOS technique (fix the body at the current offset) AND pause the
 * Lenis instance, then restore both the exact scroll position and Lenis on
 * unlock. Keeps the offset so opening/closing an overlay never jumps the page.
 */
export function useBodyScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
    lenis?.stop();

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
      lenis?.scrollTo(scrollY, { immediate: true });
      lenis?.start();
    };
  }, [locked, lenis]);
}
