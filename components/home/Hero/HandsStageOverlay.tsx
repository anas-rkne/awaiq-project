"use client";

import dynamic from "next/dynamic";
import type { Ref, RefObject } from "react";
import type { HandsSceneHandle } from "@/components/home/Hands/handsScene";

const HandsCanvas = dynamic(() => import("@/components/home/Hands/HandsCanvas"), {
  ssr: false,
});

interface HandsStageOverlayProps {
  stageRef: Ref<HTMLDivElement>;
  handleRef?: RefObject<HandsSceneHandle | null>;
}

/**
 * The HANDS FINALE, living INSIDE the hero's pinned lens.
 *
 * Previously the story's tail (after the China plate dissolved) drifted
 * against clouds with only the bottle left — see the `hands` window in the
 * motion timeline. This overlay is that FINALE: the hero timeline fades it in
 * (GSAP autoAlpha) right where the emptiness used to be and flips
 * `data-hands-active` to "1", which is the WebGL scene's cue to start its
 * orbit. The 3D canvas owns its own navy+clouds background, so the reveal is
 * a seamless crossfade out of the hero sky and the whole story — Egypt →
 * Babylon → Greece → China → HANDS — reads as ONE pin.
 *
 * It stays hidden under `prefers-reduced-motion` (the hero timeline never
 * reveals it); those users get the standalone `HandsSection` chapter instead.
 */
export function HandsStageOverlay({ stageRef, handleRef }: HandsStageOverlayProps) {
  return (
    <div
      ref={stageRef}
      id="hands"
      data-hands-active="0"
      data-hands-overlay="1"
      className="pointer-events-none absolute inset-0"
      style={{ opacity: 0, visibility: "hidden", willChange: "opacity" }}
      aria-hidden="true"
    >
      <HandsCanvas
        hostRef={stageRef as RefObject<HTMLDivElement | null>}
        handleRef={handleRef}
      />
    </div>
  );
}