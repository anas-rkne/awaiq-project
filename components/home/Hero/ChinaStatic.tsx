"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { heroSceneConfig, chinaConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";

/**
 * Reduced-motion fallback for the China half — mirror of `BabylonStatic`. The
 * merged scene is inert (no pin, no scrub) and collapses to the hero, so the
 * China plate + copy are rendered here as a plain static section below it:
 * everything readable at rest, no motion, no hidden content.
 */
export function ChinaStatic() {
  const frame = useHeroResponsive();
  const t = useTranslations("ChinaStory");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const travel = chinaConfig.travel[frame.isMobile ? "mobile" : "desktop"];

  return (
    <section
      id={chinaConfig.sectionId}
      className="relative h-[100svh] w-full overflow-hidden bg-navy text-beige"
    >
      <Image
        src={heroSceneConfig.images.china}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ filter: chinaConfig.imageFilter }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: chinaConfig.veil }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[42%]"
        style={{ backgroundImage: chinaConfig.topFade }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${travel.toTop}%`, width: frame.pixlr.width }}
        aria-hidden="true"
      >
        <Image
          src={heroSceneConfig.images.pixlr}
          alt=""
          width={1152}
          height={2048}
          className="h-auto w-full"
          style={{
            transform: `scale(${travel.scaleTo})`,
            filter:
              "drop-shadow(0 0 50px rgba(205, 158, 97, 0.4)) drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5))",
          }}
        />
      </div>

      <div
        dir={isArabic ? "rtl" : "ltr"}
        className="pointer-events-none absolute inset-x-0 z-30 flex flex-col items-center gap-5 px-6 text-center md:px-12"
        style={{ top: frame.copyOffset }}
      >
        <h2 className="max-w-3xl font-primary text-4xl font-medium leading-tight md:text-5xl">
          {t("headline")}
        </h2>
        <div className="h-px w-16 bg-gold/60" aria-hidden="true" />
        <p
          className="max-w-xl whitespace-pre-line text-sm leading-relaxed text-beige/80 md:text-base"
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
    </section>
  );
}
