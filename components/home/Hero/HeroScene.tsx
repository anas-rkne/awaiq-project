import type { RefObject } from "react";
import Image from "next/image";
import { heroSceneConfig, egyptConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";
import { HeroBackdrop } from "./HeroBackdrop";
import { HeroRadar } from "./HeroRadar";
import type { HeroCloudsHandle } from "./HeroClouds";

interface HeroSceneProps {
  skyRef: RefObject<HTMLDivElement | null>;
  bottleRef: RefObject<HTMLDivElement | null>;
  cloudsRef: RefObject<HeroCloudsHandle | null>;
  pixlrAnchorRef: RefObject<HTMLDivElement | null>;
  pixlrTravelRef: RefObject<HTMLDivElement | null>;
  pixlrShadowRef: RefObject<HTMLDivElement | null>;
  egyptRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
}

/**
 * The single pinned scene — hero AND Egypt in one stacking context.
 *
 * PAINT ORDER (DOM order, no z fights): backdrop → radar → Egypt plate →
 * THE bottle → hero artwork → overlays. The one bottle sits ABOVE the plate
 * and BELOW the artwork: during the hero it reads as standing inside the
 * panorama; when the artwork fades in the bridge, the SAME bottle is revealed
 * on the plate — no reorder, no duplicate, no second element.
 */
export function HeroScene({
  skyRef,
  bottleRef,
  cloudsRef,
  pixlrAnchorRef,
  pixlrTravelRef,
  pixlrShadowRef,
  egyptRef,
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
          bottle so the rings appear to radiate from behind the product. */}
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

      {/* Egypt plate — the SECOND half's stage. Regraded to the hero palette,
          tied to the sky by a navy veil, with a top melt so the seam between
          hero and Egypt never reads as a cut. Starts invisible; the bridge
          fades it in (GSAP owns its opacity). */}
      <div
        ref={egyptRef}
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <Image
          src={heroSceneConfig.images.egypt2}
          alt="Amber plateau where 3WEEQ is crafted"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter: egyptConfig.imageFilter }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundColor: egyptConfig.veil }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[45%]"
          style={{ backgroundImage: egyptConfig.topFade }}
        />
      </div>

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
              alt="3WEEQ bottle"
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
            alt="3WEEQ hero artwork"
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
