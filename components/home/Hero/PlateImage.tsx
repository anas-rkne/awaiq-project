"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { heroSceneConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

interface PlateImageProps {
  /** The plate artwork (a 16:9 PNG with a transparent sky). */
  src: string;
  /** The shared hero regrade. */
  filter: string;
  /** Rendered INSIDE the plate's box (the alpha-masked veil + top melt), so
   *  the tint tracks the artwork exactly at every scale. */
  children?: ReactNode;
}

/**
 * One civilization plate's artwork, fit to the lens.
 *
 * DESKTOP keeps the ported behaviour unchanged: `object-cover` over the full
 * lens (a 16:9 art in a ~16:10 lens crops ~5% off each side and shows the whole
 * height).
 *
 * PHONE cannot use that fit: the art is 16:9 and the lens is ~1:2.2, so cover
 * scales the plate ~3.8x and centre-crops it to ~26% of its width — the
 * monuments fill the screen so hugely that only a small centre slice survives,
 * which is why the backdrop read as "too big and unclear". Instead the plate is
 * drawn at `plate.mobileWidthVw`, BOTTOM-anchored (the painted floor still
 * reaches the fold, so the bottle still lands on the artwork) and its flat top
 * edge — where the art is cut — is dissolved into the sky by
 * `plate.mobileFade`, so no horizontal seam appears against the clouds.
 *
 * The box keeps the art's own 16:9 ratio, so the inner `object-cover` crops
 * nothing and a veil masked with `mask-size: cover` stays pixel-aligned with
 * the artwork at both breakpoints.
 */
export function PlateImage({ src, filter, children }: PlateImageProps) {
  const { isMobile } = useHeroResponsive();

  if (!isMobile) {
    return (
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ filter }}
        />
        {children}
      </div>
    );
  }

  const { mobileWidthVw, mobileFade } = heroSceneConfig.plate;
  return (
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{
        width: `${mobileWidthVw}vw`,
        aspectRatio: "16 / 9",
        WebkitMaskImage: mobileFade,
        maskImage: mobileFade,
      }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${mobileWidthVw}vw`}
        className="object-cover"
        style={{ filter }}
      />
      {children}
    </div>
  );
}
