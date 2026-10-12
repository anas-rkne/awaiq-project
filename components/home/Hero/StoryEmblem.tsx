"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { storyEmblemConfig } from "@/config/site";

interface StoryEmblemProps {
  emblemRef: RefObject<HTMLDivElement | null>;
}

/**
 * The story emblem — one brand motif narrated ALONGSIDE each civilization's
 * copy, on the side OPPOSITE the text.
 *
 * The copy sets its own `dir` (it is always `insetInlineStart: 0`, i.e. the
 * right in Arabic), but this layer is a sibling that inherits `<html dir="ltr">`
 * — so it must set `dir` itself for `insetInlineEnd` to land on the LEFT in
 * Arabic and the RIGHT in English.
 *
 * Layout mirrors the copy exactly, so the "gap to the section edge" is the same
 * on both sides:
 *   · the tiled `svg_bg` motif runs the FULL HEIGHT of the half, edge to edge;
 *   · the Lamassu is sized to the copy's own text block (`--emblem-h`) and
 *     shares the copy's edge inset (`px-6 md:px-12`), aligned to the outer edge.
 * The whole layer fades/scales in sync with the copy (see `addBridge`).
 */
export function StoryEmblem({ emblemRef }: StoryEmblemProps) {
  const cfg = storyEmblemConfig;
  const isRtl = useLocale() === "ar";

  return (
    <div
      ref={emblemRef}
      dir={isRtl ? "rtl" : "ltr"}
      aria-hidden="true"
      className="pointer-events-none absolute z-20 hidden min-[1180px]:block"
      style={{
        insetInlineEnd: 0,
        top: 0,
        bottom: 0,
        width: cfg.width,
        opacity: 0,
        visibility: "hidden",
      }}
    >
      {/* The brand motif — FULL height of the half, fading with the copy on
          every transition (this whole layer is what the timeline fades/scales). */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${cfg.pattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: cfg.patternSize,
          backgroundPosition: "center",
          opacity: cfg.patternOpacity,
          WebkitMaskImage: cfg.mask,
          maskImage: cfg.mask,
        }}
      />

      {/* The Lamassu — same edge inset as the copy's text, sized to its block,
          pushed against the outer section edge. */}
      <div className="relative flex h-full items-center px-6 md:px-12">
        <div className="relative w-full" style={{ height: "var(--emblem-h, 52vh)" }}>
          <Image
            src={cfg.symbol}
            alt=""
            fill
            sizes="(min-width: 1180px) 34rem, 0px"
            className="object-contain"
            style={{
              objectPosition: isRtl ? "left center" : "right center",
              filter: "drop-shadow(0 6px 30px rgba(0,0,0,0.4))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
