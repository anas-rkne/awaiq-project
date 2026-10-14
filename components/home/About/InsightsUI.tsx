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
 * scrubbed horizontal belt. Markup and Tailwind values are unchanged so the
 * ported motion math keeps matching.
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
    <div className={`hidden md:block ${className}`}>
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 h-[8vw] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-[6vw]">
        <div className="relative z-50 flex translate-y-[50%] flex-col items-center">
          <h2 className="font-forum text-[1.5625vw] leading-[3.28125vw] font-normal tracking-[0.9375vw] text-white uppercase">
            {heading}
          </h2>
          <p className="font-forum mt-[1.5vw] text-center text-[1.0417vw] leading-[1.40625vw] font-normal text-white/[0.51]">
            {subheading}
          </p>
        </div>

        <div className="relative z-40 w-full overflow-hidden pb-[10vw]">
          <div className="absolute top-0 z-10 h-[5.5vw] w-full rounded-[50%] bg-[#1a3350]" />
          <div
            ref={cardsSliderRef}
            className="mt-[3vw] mb-[3vw] flex w-max items-start gap-[2vw]"
          >
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCardClick ? (e) => onCardClick(item, e) : undefined}
                  data-shared-image-source={item.id}
                  className="pointer-events-auto relative h-[20vw] w-[32vw] flex-shrink-0 overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="relative h-[20vw] w-[32vw] flex-shrink-0 overflow-hidden"
                >
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              ),
            )}
          </div>
          <div className="absolute top-[20.5vw] z-10 h-[5.5vw] w-full rounded-[50%] bg-[#1a3350]" />
          <div
            className="absolute top-[23vw] left-0 z-30 w-full overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 11vw, #000 calc(100% - 11vw), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 11vw, #000 calc(100% - 11vw), transparent 100%)",
            }}
          >
            <div
              ref={textsSliderRef}
              className="flex w-max items-start gap-[2vw]"
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex w-[32vw] flex-shrink-0 justify-center"
                >
                  <p
                    ref={(el) => {
                      if (textRefs) textRefs.current[index] = el;
                    }}
                    className="font-forum w-[18vw] text-center text-[1.25vw] leading-[1.5625vw] font-normal"
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
            className={`group pointer-events-auto absolute bottom-0 mb-[2vw] inline-flex w-full items-center justify-center gap-[1vw] text-white/70 transition-colors hover:text-white${
              hideCtaOnWideRatio ? " [@media(min-aspect-ratio:16/8)]:hidden" : ""
            }`}
          >
            <span className="text-[0.9375vw] tracking-[0.1em]">{ctaLabel}</span>
            <span className="flex h-[3vw] w-[3vw] items-center justify-center rounded-full border border-white/25 bg-white/5 transition-[transform,border-color] duration-300 group-hover:scale-[1.02] group-hover:border-white/75">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-auto w-[1vw]"
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
