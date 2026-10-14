"use client";

import Image from "next/image";

interface PocketWatchProps {
  /** The central object — the reference draws a pocket-watch face here; we
   *  draw the brand bottle. */
  frameSrc: string;
  frameWidth: number;
  frameHeight: number;
  /** Image shown inside the circular window (a product shot, one per item). */
  imageSrc: string;
  alt?: string;
  className?: string;
  /** Marks the circle as the shared-image source for a page transition. */
  sourceId?: string;
}

/**
 * Ported from the reference `PocketWatch`: a framed central object with a
 * circular product window sitting slightly above its centre. Identical markup
 * (`data-shared-image-source`, 52% circle, −33% lift) so the section's motion
 * math positions it exactly as the original.
 */
export function PocketWatch({
  frameSrc,
  frameWidth,
  frameHeight,
  imageSrc,
  alt = "",
  className = "",
  sourceId,
}: PocketWatchProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={frameSrc}
        alt=""
        width={frameWidth}
        height={frameHeight}
        aria-hidden="true"
        className="aspect-square w-full object-contain"
      />
      <div
        data-shared-image-source={sourceId}
        className="absolute top-1/2 left-1/2 aspect-square w-[52%] -translate-x-1/2 -translate-y-1/3 transform overflow-hidden rounded-full"
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="23vw"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
