"use client";

import type { RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface GreeceCopyProps {
  copyRef: RefObject<HTMLDivElement | null>;
}

/**
 * Greece copy — the FOURTH half's text, part of the ONE pinned scene. Mirror of
 * `BabylonCopy`: NOT shown at rest — it is narrated DURING THE FLIGHT, flying in
 * the moment the bottle launches toward Greece and gone the instant it lands.
 *
 * Placed on the SIDE of the screen: right in Arabic, left in English — the
 * inline-start edge via logical properties (`insetInlineStart`) + `items-start`
 * + `text-start`, so `dir` alone flips it. The CTA is sharp and borderless.
 */
export function GreeceCopy({ copyRef }: GreeceCopyProps) {
  const t = useTranslations("GreeceStory");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div
      ref={copyRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="pointer-events-none absolute z-30 flex flex-col items-start justify-center gap-5 px-6 text-start md:px-12"
      style={{
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "min(90vw, 34rem)",
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <h2 className="max-w-full font-primary text-4xl font-medium leading-tight md:text-5xl">
        {t("headline")}
      </h2>

      <div className="h-px w-16 bg-gold/60" aria-hidden="true" />

      <p
        className="max-w-full whitespace-pre-line text-sm leading-relaxed text-beige/80 md:text-base"
        style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
      >
        {t("body")}
      </p>

      <Link
        href="/store"
        className="pointer-events-auto mt-1 inline-flex items-center justify-center rounded-none border-0 bg-gold px-8 py-3 text-sm font-medium text-navy transition-colors hover:bg-gold/85"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
