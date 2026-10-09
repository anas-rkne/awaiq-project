"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RefObject } from "react";
import { siteConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

interface HeroCopyProps {
  copyRef: RefObject<HTMLDivElement | null>;
}

const ARABIC_HEADLINE = "text-[clamp(2.6rem,9vw,5.05rem)]";
const ARABIC_MOBILE_HEADLINE = "text-[clamp(2rem,8.5vw,2.85rem)]";
const LATIN_HEADLINE = "text-[clamp(2.3rem,5vw,3.75rem)]";
const LATIN_MOBILE_HEADLINE = "text-[clamp(1.3rem,5.5vw,1.85rem)]";

/**
 * Hero copy block.
 *
 * Layout rule: the hero is a CENTERED portrait in every frame — copy, product
 * and radar all share the horizontal axis. `dir="rtl"` is applied on the
 * wrapper only so Arabic reads correctly (connected glyphs, punctuation on the
 * right) without breaking the centered flex layout. No `letter-spacing` on
 * Arabic text ever (RTL rule).
 */
export function HeroCopy({ copyRef }: HeroCopyProps) {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const frame = useHeroResponsive();

  const headlineSize = frame.isMobile
    ? isArabic
      ? ARABIC_MOBILE_HEADLINE
      : LATIN_MOBILE_HEADLINE
    : isArabic
      ? ARABIC_HEADLINE
      : LATIN_HEADLINE;

  return (
    <div
      ref={copyRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="absolute inset-x-0 z-30 mx-auto flex w-full flex-col items-center px-6 text-center"
      style={{
        maxWidth: frame.copyMaxWidth,
        top: frame.copyOffset,
      }}
    >
      <p className="mb-4 font-primary text-lg font-medium uppercase tracking-[0.32em] text-beige/95">
        {siteConfig.name}
      </p>
      <h1
        className={`font-primary font-medium text-beige leading-[1.3] ${headlineSize}`}
        style={{
          textShadow:
            "0 4px 12px rgba(0, 0, 0, 0.5), 0 0 28px rgba(205, 158, 97, 0.45)",
        }}
      >
        {t("headline")}
      </h1>
    </div>
  );
}