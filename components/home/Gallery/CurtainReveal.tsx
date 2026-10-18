"use client";

import { useEffect, useRef } from "react";
import { createGalleryCurtain, type GalleryCurtainHandle } from "./curtainScene";

interface CurtainRevealProps {
  /** The scene's imperative API — `GallerySection`'s scrub calls `setOpen`. */
  curtainRef: { current: GalleryCurtainHandle | null };
  /** The centred gold seam light — GSAP drives its `opacity` (a bell). */
  seamRef: React.RefObject<HTMLDivElement | null>;
  /** Where the chapter's opening is right now (the scene syncs on init). */
  getOpen: () => number;
  /**
   * Reduced-motion: keep the wrapper MOUNTED but `display:none`, so the pinned
   * section's children are never removed/inserted after ScrollTrigger has
   * wrapped it in a pin-spacer (a structural swap there breaks React's commit).
   * The scene is not created at all in that mode.
   */
  hidden?: boolean;
}

/**
 * The gallery's theatre curtain (WebGL, `curtainScene`) — loaded through
 * `next/dynamic` with `ssr: false` from `GallerySection` (the `HeroBottle`
 * pattern): three.js never lands in the initial page bundle. This wrapper owns
 * the mount/dispose of the scene, the gold seam light that swells as the
 * velvet parts, and a solid navy backdrop sitting UNDER the canvas until the
 * first frame is painted (or dropped for good if WebGL is unavailable) — so
 * the belt behind is never glimpsed through an empty canvas on a deep link.
 */
export function CurtainReveal({
  curtainRef,
  seamRef,
  getOpen,
  hidden = false,
}: CurtainRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hidden) return;
    const container = containerRef.current;
    if (!container) return;
    // `visibility` is written imperatively (not via state) so the effect body
    // only ever talks to external systems: the scene render is synchronous, so
    // by the time the first velvet frame exists the backdrop is already stale.
    const dropPlaceholder = () => placeholderRef.current?.classList.add("invisible");
    let handle: GalleryCurtainHandle | null = null;
    try {
      handle = createGalleryCurtain(container, getOpen, dropPlaceholder);
    } catch (err) {
      // No WebGL: degrade to "no curtain" — the chapter stays fully usable.
      console.error("[gallery-curtain] init failed", err);
      dropPlaceholder();
    }
    curtainRef.current = handle;
    return () => {
      if (curtainRef.current === handle) curtainRef.current = null;
      handle?.dispose();
    };
    // `getOpen` is a stable reader over a ref — it never needs to retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, curtainRef]);

  return (
    <div
      aria-hidden="true"
      className={
        hidden
          ? "hidden"
          : "pointer-events-none absolute inset-0 z-20 overflow-hidden"
      }
    >
      {/* Navy backdrop UNDER the canvas, hidden once the velvet has painted. */}
      <div ref={placeholderRef} className="absolute inset-0 bg-[#2d4b70]" />

      <div ref={containerRef} data-gallery="curtain" className="absolute inset-0" />

      {/* Gold seam light — invisible at rest, swells as the gap widens. */}
      <div
        ref={seamRef}
        data-gallery="seam"
        className="absolute inset-y-0 left-1/2 w-[26vw] max-w-[420px] -translate-x-1/2 opacity-0"
      >
        <div
          className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, rgba(205,158,97,0) 0%, rgba(205,158,97,0.9) 22%, rgba(246,230,214,0.95) 50%, rgba(205,158,97,0.9) 78%, rgba(205,158,97,0) 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 left-1/2 w-full -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 38% 58% at 50% 50%, rgba(205,158,97,0.34), rgba(205,158,97,0) 70%)",
          }}
        />
      </div>
    </div>
  );
}
