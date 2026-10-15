import type { RefObject } from "react";
import Image from "next/image";
import { heroSceneConfig, egyptConfig, babylonConfig, greeceConfig, chinaConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroRadar } from "./HeroRadar";
import { HeroMist } from "./HeroMist";
import { PlateImage } from "./PlateImage";
import type { HeroCloudsHandle } from "./HeroClouds";
import type { HeroMistHandle } from "./HeroMist";

interface HeroSceneProps {
  skyRef: RefObject<HTMLDivElement | null>;
  bottleRef: RefObject<HTMLDivElement | null>;
  cloudsRef: RefObject<HeroCloudsHandle | null>;
  pixlrAnchorRef: RefObject<HTMLDivElement | null>;
  pixlrTravelRef: RefObject<HTMLDivElement | null>;
  pixlrShadowRef: RefObject<HTMLDivElement | null>;
  egyptRef: RefObject<HTMLDivElement | null>;
  babylonRef: RefObject<HTMLDivElement | null>;
  greeceRef: RefObject<HTMLDivElement | null>;
  chinaRef: RefObject<HTMLDivElement | null>;
  mistRef: RefObject<HeroMistHandle | null>;
  radarRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
}

interface PlateProps {
  plateRef: RefObject<HTMLDivElement | null>;
  src: string;
  filter: string;
  veil: string;
  topFade: string;
}

/**
 * One civilization plate — the shared stage every section hands off to.
 *
 * Same curtain mechanic throughout: it starts ONE SCREEN BELOW (`translateY
 * 100%`) and the bridge RAISES it like a curtain (GSAP owns its yPercent).
 * The veil + top melt are MASKED to the plate's OWN alpha (the sky region of
 * each plate is transparent), so the navy tint lands only on the artwork while
 * the shared clouds show through UNMODIFIED — every section reads as one
 * continuous background layer under one constructed sky.
 */
function Plate({ plateRef, src, filter, veil, topFade }: PlateProps) {
  return (
    <div
      ref={plateRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ transform: "translateY(100%)" }}
      aria-hidden="true"
    >
      <PlateImage src={src} filter={filter}>
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: veil,
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskSize: "cover",
            maskSize: "cover",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-[45%]"
            style={{ backgroundImage: topFade }}
          />
        </div>
      </PlateImage>
    </div>
  );
}

/**
 * The single pinned scene — hero AND Egypt in one stacking context.
 *
 * PAINT ORDER (DOM order, no z fights): backdrop → radar → Egypt plate →
 * Babylon plate → THE bottle → hero artwork → overlays. The one bottle sits
 * ABOVE both plates and BELOW the artwork: during the hero it reads as
 * standing inside the panorama; when the artwork fades in the bridge, the SAME
 * bottle is revealed on the Egypt plate, and the Egypt→Babylon bridge hands
 * off to the Babylon plate the same way — no reorder, no duplicate, no second
 * element.
 */
export function HeroScene({
  skyRef,
  bottleRef,
  cloudsRef,
  pixlrAnchorRef,
  pixlrTravelRef,
  pixlrShadowRef,
  egyptRef,
  babylonRef,
  greeceRef,
  chinaRef,
  mistRef,
  radarRef,
  overlayRef,
}: HeroSceneProps) {
  const frame = useHeroResponsive();

  return (
    <div className="absolute inset-0">
      <HeroBackdrop
        skyRef={skyRef}
        cloudsRef={cloudsRef}
        isMobile={frame.isMobile}
      />

      {/* Radar halo — centered on the frame's focal point, drawn UNDER the
          bottle so the rings appear to radiate from behind the product. The
          WRAPPER (radarRef) is the GSAP target that fades the halo out at the
          China handoff, so the rings accompany the bottle only UP TO China and
          never reach the hands finale. The inner element keeps its own
          per-viewport opacity, so the two never fight. */}
      <div ref={radarRef} className="pointer-events-none absolute inset-0">
        <HeroRadar
          className="absolute"
          style={{
            left: `${frame.exit.originX}%`,
            top: `calc(${frame.radar.y}%)`,
            transform: "translate(-50%, -50%)",
            opacity: frame.radar.opacity,
          }}
          width={frame.radar.width}
        />
      </div>

      {/* Egypt plate — the SECOND half's stage. */}
      <Plate
        plateRef={egyptRef}
        src={heroSceneConfig.images.egypt2}
        filter={egyptConfig.imageFilter}
        veil={egyptConfig.veil}
        topFade={egyptConfig.topFade}
      />

      {/* Babylon plate — the THIRD half's stage, painted ABOVE Egypt so it
          hands off when both are on screen. */}
      <Plate
        plateRef={babylonRef}
        src={heroSceneConfig.images.babylon}
        filter={babylonConfig.imageFilter}
        veil={babylonConfig.veil}
        topFade={babylonConfig.topFade}
      />

      {/* Greece plate — the FOURTH half's stage, painted ABOVE Babylon. */}
      <Plate
        plateRef={greeceRef}
        src={heroSceneConfig.images.greece}
        filter={greeceConfig.imageFilter}
        veil={greeceConfig.veil}
        topFade={greeceConfig.topFade}
      />

      {/* China plate — the FIFTH half's stage, painted ABOVE Greece. */}
      <Plate
        plateRef={chinaRef}
        src={heroSceneConfig.images.china}
        filter={chinaConfig.imageFilter}
        veil={chinaConfig.veil}
        topFade={chinaConfig.topFade}
      />

      {/* The MIST WALL — a front-layer FBM bank (same family as the hero
          clouds) that thickens at every section→section swap, rolling upward
          with the conveyor: the current plate sinks into it and the next
          emerges from it — one atmosphere, no curtain seam. Painted ABOVE the
          plates, BELOW the bottle so the product stays sharp through the fog. */}
      <HeroMist ref={mistRef} isMobile={frame.isMobile} />

      {/* THE single traveling bottle. The ANCHOR owns `top` (% of the lens) so
          GSAP slides it hero→platform; the TRAVEL wrapper owns scale/rotation;
          the INNER element owns the CSS float — three layers, three
          transforms, zero collisions (GSAP never neutralises a sibling's
          Tailwind translate). RTL-safe: left-1/2 + -translate-x-1/2 only. */}
      <div
        ref={pixlrAnchorRef}
        className="pointer-events-none absolute left-1/2 z-0"
        style={{
          width: frame.pixlr.width,
          top: `${frame.pixlr.centerY}%`,
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden="true"
      >
        <div ref={pixlrTravelRef} className="relative will-change-transform">
          {/* Contact shadow — blooms as the bottle lands on the platform. */}
          <div
            ref={pixlrShadowRef}
            className="absolute bottom-[4%] left-1/2 h-[3%] w-[52%] -translate-x-1/2 rounded-[50%] bg-black blur-2xl"
            style={{ opacity: 0 }}
          />
          <div className="animate-hero-float will-change-transform">
            <Image
              src={heroSceneConfig.images.pixlr}
              alt=""
              width={1152}
              height={2048}
              priority
              className="h-auto w-full"
              style={{
                filter:
                  "drop-shadow(0 0 50px rgba(205, 158, 97, 0.4)) drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Positioning wrapper (frame.bottleClassName) must stay OUTSIDE the
          GSAP target: GSAP writes `translate: none` while normalizing the
          transform, which would neutralize the Tailwind `-translate-x-1/2`
          centering on mobile. The ref lives on the inner animated element. */}
      <div className={frame.bottleClassName}>
        <div ref={bottleRef} className="will-change-transform">
          <Image
            src={heroSceneConfig.images.bottle}
            alt=""
            width={1672}
            height={941}
            priority
            className="h-auto w-full"
            style={{ filter: "saturate(0.8) contrast(1.1) sepia(0.2)" }}
          />
        </div>
      </div>

      {/* Hero overlays (tint + mist) — wrapped so the bridge can fade them out
          as one unit, letting the Egypt plate and copy read cleanly. */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${frame.overlay}`} />
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent ${frame.mist}`}
        />
      </div>
    </div>
  );
}
