"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface GalleryStripItem {
  id: string;
  image: string;
  href: string;
  name: string;
  tag: string;
}

interface GalleryStripProps {
  items: GalleryStripItem[];
  /** The belt wrapper — GSAP translates it horizontally (`x` in vw). */
  stripRef?: RefObject<HTMLDivElement | null>;
  /** One ref per card, so the section can scale/dim the one at the centre. */
  cardRefs?: RefObject<(HTMLAnchorElement | null)[]>;
  /** One ref per card's darkening veil (opacity follows distance from centre). */
  veilRefs?: RefObject<(HTMLDivElement | null)[]>;
  /** One ref per card's caption (name + tag), shown only near the centre. */
  captionRefs?: RefObject<(HTMLDivElement | null)[]>;
  /** Reduced-motion / no-pin mode — the belt becomes a native scroll strip. */
  native?: boolean;
}

/**
 * The horizontal bottle belt revealed behind the curtain. Each card is a
 * portrait product shot with a darkening veil and a caption; the section's
 * GSAP slides the belt and lifts the bottle nearest the centre. In `native`
 * mode (reduced motion) it degrades to a plain, swipeable snap strip.
 */
export function GalleryStrip({
  items,
  stripRef,
  cardRefs,
  veilRefs,
  captionRefs,
  native = false,
}: GalleryStripProps) {
  return (
    <div
      className={
        native
          ? "flex w-full snap-x snap-mandatory items-center gap-[7vw] overflow-x-auto px-[18vw] lg:gap-[3.5vw] lg:px-[37vw]"
          : "flex h-full w-full items-center overflow-hidden"
      }
    >
      <div
        ref={stripRef}
        data-gallery="strip"
        className="flex w-max items-center gap-[7vw] lg:gap-[3.5vw]"
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            ref={(el) => {
              if (cardRefs) cardRefs.current[index] = el;
            }}
            href={item.href}
            aria-label={item.name}
            data-shared-image-source={item.id}
            data-gallery-card={item.id}
            tabIndex={native ? 0 : -1}
            className={`group relative block w-[64vw] flex-shrink-0 will-change-transform lg:w-[26vw] ${
              native ? "pointer-events-auto snap-center" : "pointer-events-none"
            }`}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px] border border-white/10 bg-white/5">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 26vw, 64vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                ref={(el) => {
                  if (veilRefs) veilRefs.current[index] = el;
                }}
                className="pointer-events-none absolute inset-0 bg-[#060b14]"
                style={{ opacity: native ? 0 : 0.6 }}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgba(6,11,20,0.72) 0%, rgba(6,11,20,0) 42%)",
                }}
              />
              <div
                ref={(el) => {
                  if (captionRefs) captionRefs.current[index] = el;
                }}
                className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-[1vw] px-[4vw] pb-[4vw] text-center lg:gap-[0.4vw] lg:px-[1.5vw] lg:pb-[1.5vw]"
                style={{ opacity: native ? 1 : 0 }}
              >
                <span className="font-forum text-[4.4vw] leading-[1.1] font-normal tracking-[0.04em] text-white uppercase lg:text-[1.5vw]">
                  {item.name}
                </span>
                <span className="font-secondary text-[3vw] leading-[1.3] text-white/60 lg:text-[0.9vw]">
                  {item.tag}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
