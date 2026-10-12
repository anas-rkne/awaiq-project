"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/useHeroResponsive";

const HandsCanvas = dynamic(() => import("./HandsCanvas"), { ssr: false });

/**
 * Standalone hands chapter — for `prefers-reduced-motion` users ONLY.
 *
 * With full motion, the hands are the FINALE of the hero's single pin (see
 * `HandsStageOverlay` + the `hands` window in the motion timeline), so this
 * section renders nothing. Reduced-motion users have no pin: the hero
 * collapses to one viewport and the story is told as plain stacked sections
 * (……ChinaStatic), followed by this static hands chapter. The canvas itself
 * never animates under reduced motion (see handsScene), so it lands as one
 * composed frame.
 */
export function HandsSection() {
  const t = useTranslations("HandsFinale");
  const locale = useLocale();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (!reduced) return null;

  return (
    <section
      className="relative h-svh w-full overflow-hidden"
      data-hands-section="1"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <HandsCanvas />
      </div>
      <p
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="pointer-events-none absolute inset-x-0 top-[16%] z-10 px-6 text-center font-primary text-2xl font-medium leading-snug text-beige md:text-4xl"
        style={{ textShadow: "0 2px 18px rgba(15,26,46,0.65)" }}
      >
        {t("line")}
      </p>
    </section>
  );
}