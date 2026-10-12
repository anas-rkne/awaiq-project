"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { createHandsScene, type HandsSceneHandle } from "./handsScene";

interface HandsCanvasProps {
  /**
   * Optional host element carrying `data-hands-active`. When provided (the
   * hero-pin finale), the scene only renders once the host flips the flag —
   * so the hidden overlay costs nothing until the timeline reveals it.
   */
  hostRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional ref that receives the scene handle — the hero timeline drives
   *  the scroll-scrubbed camera dolly through it (see useHeroMotion). */
  handleRef?: RefObject<HandsSceneHandle | null>;
}

export default function HandsCanvas({ hostRef, handleRef }: HandsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalRef = useRef<HandsSceneHandle | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let handle: HandsSceneHandle | null = null;
    try {
      handle = createHandsScene(container, {
        handsUrl: "/models/two_hands_01.fbx",
        displacementUrl: "/textures/displacement-glass.jpg",
        roughnessUrl: "/textures/surf_imp_02.jpg",
        host: hostRef?.current ?? null,
      });
      internalRef.current = handle;
      if (handleRef) handleRef.current = handle;
    } catch (err) {
      console.error("[hands] init failed", err);
    }
    return () => {
      handle?.dispose();
      internalRef.current = null;
      if (handleRef) handleRef.current = null;
    };
  }, [hostRef, handleRef]);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" data-hands-section="1" />;
}