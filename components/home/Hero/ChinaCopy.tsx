"use client";

import type { RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ChinaCopyProps {
  copyRef: RefObject<HTMLDivElement | null>;
}

/**
 * China copy — the FIFTH half's text, part of the ONE pinned scene. Mirror of
 * `BabylonCopy`: NOT shown at rest — it is narrated DURING THE FLIGHT, flying in
 * the moment the bottle launches toward China and gone the instant it lands.
 *
 * Placed on the SIDE of the screen: right in Arabic, left in English — the
 * inline-start edge via logical properties (`insetInlineStart`) + `items-start`
 * + `text-start`, so `dir` alone flips it. The CTA is sharp and borderless.
 */
export function ChinaCopy({ copyRef }: ChinaCopyProps) {
  const t = useTranslations("ChinaStory");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div
      ref={copyRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="pointer-events-none absolute z-30 flex flex-col items-start gap-5 px-4 text-start bottom-[4vh] md:bottom-[6vh] lg:bottom-[8vh] w-[min(92vw,24rem)] md:w-[min(85vw,28rem)] lg:w-[min(80vw,34rem)] md:px-8 lg:px-12"
      style={{
        insetInlineStart: 0,
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <h2 className="max-w-full font-primary text-2xl font-medium leading-tight md:text-4xl lg:text-5xl">
        {t("headline")}
      </h2>

      <div className="h-px w-16 bg-gold/60" aria-hidden="true" />

      <p
        className="max-w-full whitespace-pre-line text-xs leading-relaxed text-beige/80 md:text-sm lg:text-base"
        style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
      >
        {t("body")}
      </p>

      <Link
        href="/store"
        className="pointer-events-auto mt-1 inline-flex items-center justify-center rounded-none border-0 bg-gold px-5 py-2 text-xs font-medium text-navy transition-colors hover:bg-gold/85 md:px-8 md:py-3 md:text-sm"
      >
        {t("cta")}
      </Link>
    </div>
  );
}