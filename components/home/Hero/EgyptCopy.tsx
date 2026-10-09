"use client";

import type { RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

interface EgyptCopyProps {
  copyRef: RefObject<HTMLDivElement | null>;
}

/**
 * Egypt copy — the SECOND half's text, part of the ONE pinned scene (it lives
 * inside the hero `world`, not in a separate section). GSAP reveals its direct
 * children (headline → rule → body → CTA) with a scrubbed stagger; the
 * container starts at opacity 0 so nothing flashes before the bridge.
 *
 * Sits in the upper band (`copyOffset`) so the settled bottle on the platform
 * never covers it. RTL-safe: `dir` follows the locale, text is beige (never
 * hard white), and no letter-spacing is applied to Arabic.
 */
export function EgyptCopy({ copyRef }: EgyptCopyProps) {
  const frame = useHeroResponsive();
  const t = useTranslations("BrandStory");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div
      ref={copyRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="pointer-events-none absolute inset-x-0 z-30 flex flex-col items-center gap-5 px-6 text-center md:px-12"
      style={{ top: frame.copyOffset, opacity: 0, visibility: "hidden" }}
    >
      <h2 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
        {t("headline")}
      </h2>

      <div className="h-px w-16 bg-gold/60" aria-hidden="true" />

      <p
        className="max-w-xl whitespace-pre-line text-sm leading-relaxed text-beige/80 md:text-base"
        style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
      >
        {t("body")}
      </p>

      <a
        href="#bottle"
        className="pointer-events-auto mt-1 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/85"
      >
        {t("cta")}
      </a>
    </div>
  );
}
