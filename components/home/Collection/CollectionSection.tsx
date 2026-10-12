"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/useHeroResponsive";
import { collectionConfig, heroSceneConfig } from "@/config/site";
import { HeroMist, type HeroMistHandle } from "@/components/home/Hero/HeroMist";
import { UnwovenScene } from "./UnwovenScene";

/**
 * Collection — the "unwoven" product strip.
 *
 * The background reuses the SAME mist component as the hero section→section
 * transitions (`HeroMist`), pinned at its peak so it reads as a foggy backdrop
 * instead of the clouds — one continuous identity, a different atmosphere.
 * The cards themselves are the unwoven ribbon strip (see UnwovenScene),
 * taller than the source demo.
 */
export function CollectionSection() {
  const t = useTranslations("CollectionSection");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const isMobile = useMediaQuery(
    `(max-width: ${heroSceneConfig.breakpoints.desktop - 1}px)`,
  );
  const mistRef = useRef<HeroMistHandle>(null);

  // Pin the mist at its peak so it sits as a constant foggy backdrop.
  useEffect(() => {
    mistRef.current?.setProgress(0.5);
  }, []);

  return (
    <section
      id={collectionConfig.sectionId}
      className="relative h-svh w-full overflow-hidden text-beige"
      aria-label={t("title")}
    >
      <HeroMist ref={mistRef} isMobile={isMobile} />
      <UnwovenScene />

      {/* Heading — floats over the mist, above the cards. */}
      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="pointer-events-none absolute inset-x-0 top-[7%] z-10 flex flex-col items-center gap-3 px-6 text-center"
      >
        <p className="text-[0.7rem] font-medium tracking-[0.35em] text-gold/80 uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="font-primary text-3xl leading-tight font-medium md:text-5xl">
          {t("title")}
        </h2>
        <p
          className="max-w-md text-sm leading-relaxed text-beige/75 md:text-base"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.45)" }}
        >
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
