"use client";

import { useHeroMotion } from "@/hooks/useHeroMotion";
import {
  HeroResponsiveProvider,
  useHeroResponsive,
} from "@/hooks/useHeroResponsive";
import { BabylonCopy } from "./BabylonCopy";
import { BabylonStatic } from "./BabylonStatic";
import { ChinaCopy } from "./ChinaCopy";
import { ChinaStatic } from "./ChinaStatic";
import { EgyptCopy } from "./EgyptCopy";
import { EgyptStatic } from "./EgyptStatic";
import { GreeceCopy } from "./GreeceCopy";
import { GreeceStatic } from "./GreeceStatic";
import { HandsCopy } from "./HandsCopy";
import { HeroCopy } from "./HeroCopy";
import { HeroLoader } from "./HeroLoader";
import { HeroScene } from "./HeroScene";
import { HeroStage } from "./HeroStage";
import { HandsStageOverlay } from "./HandsStageOverlay";

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
    egyptPedestalRef,
    egyptCopyRef,
    babylonRef,
    babylonPedestalRef,
    babylonCopyRef,
    greeceRef,
    greecePedestalRef,
    greeceCopyRef,
    chinaRef,
    chinaPedestalRef,
    chinaCopyRef,
    mistRef,
    overlayRef,
    radarRef,
    handsStageRef,
    handsHandleRef,
    handsCopyRef,
    egyptCheetahRef,
  babylonCheetahRef,
  greeceCheetahRef,
  chinaCheetahRef,
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
        screenLayer={
          <>
            <EgyptCopy copyRef={egyptCopyRef} />
            <BabylonCopy copyRef={babylonCopyRef} />
            <GreeceCopy copyRef={greeceCopyRef} />
            <ChinaCopy copyRef={chinaCopyRef} />
            {/* The HANDS finale of the pin — appended LAST so it paints over
                the world when the timeline reveals it (see the `hands` window
                in useHeroMotion / config). */}
            <HandsStageOverlay
              stageRef={handsStageRef}
              handleRef={handsHandleRef}
            />
            <HandsCopy copyRef={handsCopyRef} />
          </>
        }
      >
        <HeroScene
          skyRef={skyRef}
          bottleRef={bottleRef}
          cloudsRef={cloudsRef}
          pixlrAnchorRef={pixlrAnchorRef}
          pixlrTravelRef={pixlrTravelRef}
          pixlrShadowRef={pixlrShadowRef}
          egyptRef={egyptRef}
          egyptPedestalRef={egyptPedestalRef}
          babylonRef={babylonRef}
          babylonPedestalRef={babylonPedestalRef}
          greeceRef={greeceRef}
          greecePedestalRef={greecePedestalRef}
          chinaRef={chinaRef}
          chinaPedestalRef={chinaPedestalRef}
          mistRef={mistRef}
          overlayRef={overlayRef}
          radarRef={radarRef}
          egyptCheetahRef={egyptCheetahRef}
  babylonCheetahRef={babylonCheetahRef}
  greeceCheetahRef={greeceCheetahRef}
  chinaCheetahRef={chinaCheetahRef}
        />
        <HeroCopy copyRef={copyRef} />
      </HeroStage>
      {frame.isReduced ? (
        <>
          <EgyptStatic />
          <BabylonStatic />
          <GreeceStatic />
          <ChinaStatic />
        </>
      ) : null}
    </>
  );
}
