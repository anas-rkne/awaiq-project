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
  egyptPedestalRef: RefObject<HTMLImageElement | null>;
  babylonRef: RefObject<HTMLDivElement | null>;
  babylonPedestalRef: RefObject<HTMLImageElement | null>;
  greeceRef: RefObject<HTMLDivElement | null>;
  greecePedestalRef: RefObject<HTMLImageElement | null>;
  chinaRef: RefObject<HTMLDivElement | null>;
  chinaPedestalRef: RefObject<HTMLImageElement | null>;
  mistRef: RefObject<HeroMistHandle | null>;
  radarRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  egyptCheetahRef: RefObject<HTMLImageElement | null>;
  babylonCheetahRef: RefObject<HTMLImageElement | null>;
  greeceCheetahRef: RefObject<HTMLImageElement | null>;
  chinaCheetahRef: RefObject<HTMLImageElement | null>;
}

interface PlateProps {
  plateRef: RefObject<HTMLDivElement | null>;
  src: string;
  filter: string;
  veil: string;
  topFade: string;
}

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

export function HeroScene({
  skyRef,
  bottleRef,
  cloudsRef,
  pixlrAnchorRef,
  pixlrTravelRef,
  pixlrShadowRef,
  egyptRef,
  egyptPedestalRef,
  babylonRef,
  babylonPedestalRef,
  greeceRef,
  greecePedestalRef,
  chinaRef,
  chinaPedestalRef,
  mistRef,
  radarRef,
  overlayRef,
  egyptCheetahRef,
  babylonCheetahRef,
  greeceCheetahRef,
  chinaCheetahRef,
}: HeroSceneProps) {
  const frame = useHeroResponsive();

  return (
    <div className="absolute inset-0">
      <HeroBackdrop
        skyRef={skyRef}
        cloudsRef={cloudsRef}
        isMobile={frame.isMobile}
      />

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

      {/* Egypt plate */}
      <Plate
        plateRef={egyptRef}
        src={heroSceneConfig.images.egypt2}
        filter={egyptConfig.imageFilter}
        veil={egyptConfig.veil}
        topFade={egyptConfig.topFade}
      />

      {/* Egypt pedestal (garland) — on mobile it sits in the MIDDLE of the
          screen (top-1/2 -translate-y-1/2); on desktop it stays bottom-anchored. */}
      <Image
        ref={egyptPedestalRef}
        src="/images/sections/1.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
  className="pointer-events-none object-contain object-center md:object-cover md:object-[center_50%]"
      />

      {/* Egypt cheetah — pinned to bottom-right corner */}
      <Image
        ref={egyptCheetahRef}
        src="/images/sections/ch_1.png"
        alt=""
        width={300}
        height={400}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-[clamp(100px,30vw,180px)] md:w-[clamp(120px,18vw,250px)] lg:w-[clamp(150px,20vw,300px)] h-auto object-contain object-bottom"
      />

      {/* Babylon plate */}
      <Plate
        plateRef={babylonRef}
        src={heroSceneConfig.images.babylon}
        filter={babylonConfig.imageFilter}
        veil={babylonConfig.veil}
        topFade={babylonConfig.topFade}
      />

      {/* Babylon pedestal — mobile: centered; desktop: bottom-anchored */}
      <Image
        ref={babylonPedestalRef}
        src="/images/sections/2.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
  className="pointer-events-none object-contain object-center md:object-cover md:object-[center_50%]"
      />

      {/* Babylon cheetah — pinned to bottom-right corner */}
      <Image
        ref={babylonCheetahRef}
        src="/images/sections/ch_1.png"
        alt=""
        width={300}
        height={400}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-[clamp(100px,30vw,180px)] md:w-[clamp(120px,18vw,250px)] lg:w-[clamp(150px,20vw,300px)] h-auto object-contain object-bottom"
      />

      {/* Greece plate */}
      <Plate
        plateRef={greeceRef}
        src={heroSceneConfig.images.greece}
        filter={greeceConfig.imageFilter}
        veil={greeceConfig.veil}
        topFade={greeceConfig.topFade}
      />

      {/* Greece pedestal — mobile: centered; desktop: bottom-anchored */}
      <Image
        ref={greecePedestalRef}
        src="/images/sections/3.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
  className="pointer-events-none object-contain object-center md:object-cover md:object-[center_50%]"
      />

      {/* Greece cheetah — pinned to bottom-right corner */}
      <Image
        ref={greeceCheetahRef}
        src="/images/sections/ch_1.png"
        alt=""
        width={300}
        height={400}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-[clamp(100px,30vw,180px)] md:w-[clamp(120px,18vw,250px)] lg:w-[clamp(150px,20vw,300px)] h-auto object-contain object-bottom"
      />

      {/* China plate */}
      <Plate
        plateRef={chinaRef}
        src={heroSceneConfig.images.china}
        filter={chinaConfig.imageFilter}
        veil={chinaConfig.veil}
        topFade={chinaConfig.topFade}
      />

      {/* China pedestal — mobile: centered; desktop: bottom-anchored */}
      <Image
        ref={chinaPedestalRef}
        src="/images/sections/4.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
  className="pointer-events-none object-contain object-center md:object-cover md:object-[center_50%]"
      />

      {/* China cheetah — pinned to bottom-right corner */}
      <Image
        ref={chinaCheetahRef}
        src="/images/sections/ch_1.png"
        alt=""
        width={300}
        height={400}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-10 w-[clamp(100px,30vw,180px)] md:w-[clamp(120px,18vw,250px)] lg:w-[clamp(150px,20vw,300px)] h-auto object-contain object-bottom"
      />

      {/* ── The MIST WALL ────────────────────────────────────────────────── */}
      <HeroMist ref={mistRef} isMobile={frame.isMobile} />

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

      <div ref={overlayRef} className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-b ${frame.overlay}`} />
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent ${frame.mist}`}
        />
      </div>
    </div>
  );
}