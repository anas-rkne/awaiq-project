"use client";

import type { RefObject } from "react";
import { useLocale, useTranslations } from "next-intl";

interface HandsCopyProps {
  copyRef: RefObject<HTMLDivElement | null>;
}

/**
 * The HANDS FINALE line — the story's closing beat, revealed over the 3D hands.
 * Lives in the hero's SCREEN layer (like every other narration copy) so it never
 * scales with the camera; the timeline fades it in once the finale settles and it
 * holds to the end of the pin. RTL-safe via `dir` + centering.
 */
export function HandsCopy({ copyRef }: HandsCopyProps) {
  const t = useTranslations("HandsFinale");
  const locale = useLocale();

  return (
    <div
      ref={copyRef}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="pointer-events-none absolute inset-x-0 top-[16%] z-30 flex justify-center px-6"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <p
        className="max-w-[min(92vw,48rem)] text-center font-primary text-2xl font-medium leading-snug text-beige md:text-4xl"
        style={{ textShadow: "0 2px 18px rgba(15,26,46,0.65)" }}
      >
        {t("line")}
      </p>
    </div>
  );
}
