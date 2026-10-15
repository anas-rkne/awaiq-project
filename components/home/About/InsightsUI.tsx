"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface AboutInsightItem {
  id: string;
  image: string;
  href: string;
  title: string;
}

interface InsightsUIProps {
  items: AboutInsightItem[];
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref: string;
  hideCta?: boolean;
  hideCtaOnWideRatio?: boolean;
  onCardClick?: (
    item: AboutInsightItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  /** The cards strip — translated horizontally by the section's GSAP. */
  cardsSliderRef?: RefObject<HTMLDivElement | null>;
  /** The captions strip — translated in lock-step with the cards. */
  textsSliderRef?: RefObject<HTMLDivElement | null>;
  /** One ref per caption, so the section can scale/brighten the centred one. */
  textRefs?: RefObject<(HTMLParagraphElement | null)[]>;
  className?: string;
}

/**
 * Ported from the reference `InsightsUI`: a centred eyebrow, a full-bleed card
 * strip clipped by two ellipse gradients, and a caption row masked at both
 * edges. The section drives `cardsSliderRef`/`textsSliderRef`/`textRefs` as one
 * scrubbed horizontal belt.
 *
 * Every vw value carries a phone-sized base and `lg:` desktop override so the
 * belt reads the same on a phone (cards ~72vw wide, readable type) as it does
 * on desktop (cards 32vw). The section's belt math is parameterised to match
 * (`cardW`/`gap`), keeping the ported motion identical.
 */
export function InsightsUI({
  items,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  hideCta = false,
  hideCtaOnWideRatio = false,
  onCardClick,
  cardsSliderRef,
  textsSliderRef,
  textRefs,
  className = "",
}: InsightsUIProps) {
  return (
    <div className={className}>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[13vw] w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] lg:h-[8vw] lg:w-[110vw]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[9vw] lg:pt-[6vw]">
        <div className="relative z-50 flex translate-y-[50%] flex-col items-center">
          <h2 className="font-forum text-[4.4vw] leading-[140%] font-normal tracking-[0.18em] text-white uppercase lg:text-[1.5625vw] lg:leading-[3.28125vw] lg:tracking-[0.9375vw]">
            {heading}
          </h2>
          <p className="font-forum mt-[2.5vw] text-center text-[3.2vw] leading-[150%] font-normal text-white/[0.51] lg:mt-[1.5vw] lg:text-[1.0417vw] lg:leading-[1.40625vw]">
            {subheading}
          </p>
        </div>

        <div className="relative z-40 w-full overflow-hidden pb-[10vw]">
          <div className="absolute top-0 z-10 h-[13vw] w-full rounded-[50%] bg-[#1a3350] lg:h-[5.5vw]" />
          <div
            ref={cardsSliderRef}
            className="mt-[3vw] mb-[3vw] flex w-max items-start gap-[5vw] lg:gap-[2vw]"
          >
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCardClick ? (e) => onCardClick(item, e) : undefined}
                  data-shared-image-source={item.id}
                  className="pointer-events-auto relative h-[46vw] w-[72vw] flex-shrink-0 overflow-hidden lg:h-[20vw] lg:w-[32vw]"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 72vw"
                    className="object-cover"
                  />
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="relative h-[46vw] w-[72vw] flex-shrink-0 overflow-hidden lg:h-[20vw] lg:w-[32vw]"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, 72vw"
                    className="object-cover"
                  />
                </div>
              ),
            )}
          </div>
          <div className="absolute top-[49vw] z-10 h-[13vw] w-full rounded-[50%] bg-[#1a3350] lg:top-[20.5vw] lg:h-[5.5vw]" />
          <div
            className="absolute top-[52vw] left-0 z-30 w-full overflow-hidden lg:top-[23vw]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 11vw, #000 calc(100% - 11vw), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 11vw, #000 calc(100% - 11vw), transparent 100%)",
            }}
          >
            <div
              ref={textsSliderRef}
              className="flex w-max items-start gap-[5vw] lg:gap-[2vw]"
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex w-[72vw] flex-shrink-0 justify-center lg:w-[32vw]"
                >
                  <p
                    ref={(el) => {
                      if (textRefs) textRefs.current[index] = el;
                    }}
                    className="font-forum w-[58vw] text-center text-[1.25vw] leading-[1.5625vw] font-normal lg:w-[18vw]"
                    style={{ color: "rgba(255, 255, 255, 0.59)" }}
                  >
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!hideCta && (
          <Link
            href={ctaHref}
            className={`group pointer-events-auto absolute bottom-0 mb-[4vw] inline-flex w-full items-center justify-center gap-[2.5vw] text-white/70 transition-colors hover:text-white lg:mb-[2vw] lg:gap-[1vw]${
              hideCtaOnWideRatio ? " [@media(min-aspect-ratio:16/8)]:hidden" : ""
            }`}
          >
            <span className="text-[3.4vw] tracking-[0.1em] lg:text-[0.9375vw]">
              {ctaLabel}
            </span>
            <span className="flex h-[11vw] w-[11vw] items-center justify-center rounded-full border border-white/25 bg-white/5 transition-[transform,border-color] duration-300 group-hover:scale-[1.02] group-hover:border-white/75 lg:h-[3vw] lg:w-[3vw]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-auto w-[3.6vw] lg:w-[1vw]"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
