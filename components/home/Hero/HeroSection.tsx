"use client";

import { useHeroMotion } from "@/hooks/useHeroMotion";
import {
  HeroResponsiveProvider,
  useHeroResponsive,
} from "@/hooks/useHeroResponsive";
import { EgyptCopy } from "./EgyptCopy";
import { EgyptStatic } from "./EgyptStatic";
import { HeroCopy } from "./HeroCopy";
import { HeroLoader } from "./HeroLoader";
import { HeroScene } from "./HeroScene";
import { HeroStage } from "./HeroStage";

interface HeroSectionProps {
  className?: string;
}

/**
 * ONE pinned scene: hero → Egypt is a single scroll-driven shot (same lens,
 * same single bottle). `EgyptStatic` only exists for reduced-motion users,
 * whose scene collapses to a lone viewport.
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <HeroResponsiveProvider>
      <HeroContent className={className} />
    </HeroResponsiveProvider>
  );
}

function HeroContent({ className }: { className?: string }) {
  const {
    stageRef,
    lensRef,
    worldRef,
    skyRef,
    bottleRef,
    cloudsRef,
    copyRef,
    pixlrAnchorRef,
    pixlrTravelRef,
    pixlrShadowRef,
    egyptRef,
    egyptCopyRef,
    overlayRef,
  } = useHeroMotion();
  const frame = useHeroResponsive();

  return (
    <>
      <HeroLoader />
      <HeroStage
        stageRef={stageRef}
        lensRef={lensRef}
        worldRef={worldRef}
        className={className}
      >
        <HeroScene
          skyRef={skyRef}
          bottleRef={bottleRef}
          cloudsRef={cloudsRef}
          pixlrAnchorRef={pixlrAnchorRef}
          pixlrTravelRef={pixlrTravelRef}
          pixlrShadowRef={pixlrShadowRef}
          egyptRef={egyptRef}
          overlayRef={overlayRef}
        />
        <HeroCopy copyRef={copyRef} />
        <EgyptCopy copyRef={egyptCopyRef} />
      </HeroStage>
      {frame.isReduced ? <EgyptStatic /> : null}
    </>
  );
}
