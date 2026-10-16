"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { galleryConfig } from "@/config/gallery";
import { useMediaQuery } from "@/hooks/useHeroResponsive";
import { CurtainVeil } from "./CurtainVeil";
import { GalleryStrip, type GalleryStripItem } from "./GalleryStrip";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Gallery chapter — the curtained bottle gallery between About and the footer.
 *
 * ONE pinned `100dvh` section driven by a single `scrub` trigger. As the scroll
 * advances: the two velvet panels part from the centre (transform-only, see
 * `CurtainVeil`), a gold seam light swells and fades, and the bottle belt behind
 * them slides past while the bottle nearest the centre scales up and its caption
 * fades in. Scrolling back up runs the whole thing in reverse.
 *
 * Geometry is viewport-relative, so nothing is measured per frame: the cards are
 * sized in vw, the belt is translated in vw, and a resize re-reads itself. On
 * `prefers-reduced-motion` there is no pin and no curtain — the chapter is a
 * plain heading over a native, swipeable snap strip.
 */
export function GallerySection() {
  const t = useTranslations("Gallery");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const perfumes: GalleryStripItem[] = useMemo(
    () =>
      galleryConfig.items.map((item) => ({
        id: item.id,
        image: item.image,
        href: item.href,
        name: t(`items.${item.id}.name`),
        tag: t(`items.${item.id}.tag`),
      })),
    [t],
  );

  const sectionRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const veilRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || perfumes.length === 0 || reduced) return;

    const items = galleryConfig.items;
    const N = items.length;
    const c = galleryConfig.card;
    const m = galleryConfig.motion;
    const pin = galleryConfig.pin;
    const cards = cardRefs.current;

    const mm = gsap.matchMedia();

    const build = (isMobile: boolean) => {
      const geo = isMobile ? c.mobile : c.desktop;
      const spacing = geo.width + geo.gap;
      const first = geo.width / 2;
      // Start with the first bottle centred; end with the last one centred.
      const etStart = 50 - first;
      const etEnd = 50 - (spacing * (N - 1) + first);

      const drive = (progress: number) => {
        // 1. Curtain parts from the centre (transform only).
        const openRaw = clamp01(
          (progress - m.open.start) / (m.open.end - m.open.start),
        );
        const open = openRaw * openRaw * (3 - 2 * openRaw);
        gsap.set(leftPanelRef.current, { xPercent: -100 * open });
        gsap.set(rightPanelRef.current, { xPercent: 100 * open });

        // 2. Gold seam light — a bell that peaks as the gap widens.
        const seamT = clamp01(
          (progress - m.seam.start) / (m.seam.end - m.seam.start),
        );
        gsap.set(seamRef.current, { opacity: Math.sin(Math.PI * seamT) });

        // 3. Copy fades up once the curtain is clear.
        const copyT = clamp01(
          (progress - m.copy.start) / (m.copy.end - m.copy.start),
        );
        gsap.set(copyRef.current, { opacity: copyT, y: (1 - copyT) * 28 });
        gsap.set(ctaRef.current, { opacity: copyT });

        // 4. The belt travels; the bottle nearest the centre grows.
        const beltT = clamp01(
          (progress - m.belt.start) / (m.belt.end - m.belt.start),
        );
        const eased = 1 - (1 - beltT) * (1 - beltT);
        const et = etStart + (etEnd - etStart) * eased;
        gsap.set(stripRef.current, { x: `${et}vw` });

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = clamp01(
          1 - Math.abs(spacing * i + first + et - 50) / spacing,
        );
        gsap.set(el, {
          scale: c.scaleMin + (c.scaleMax - c.scaleMin) * a,
        });
        const veil = veilRefs.current[i];
        if (veil) gsap.set(veil, { opacity: c.veilMax * (1 - a) });
        const caption = captionRefs.current[i];
        if (caption) gsap.set(caption, { opacity: a });

        const on = open > 0.85 && a > 0.6;
        el.style.pointerEvents = on ? "auto" : "none";
        el.tabIndex = on ? 0 : -1;
      });
    };

      drive(0);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? pin.mobile : pin.desktop,
        pin: true,
        // The Lenis root is `display:flex`, and ScrollTrigger silently disables
        // pinSpacing when the pin's parent is flex — which would leave the page
        // with zero scroll distance here. Keep it explicit.
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? pin.mobile : pin.desktop,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => drive(self.progress),
        onRefresh: (self) => drive(self.progress),
      });
    };

    mm.add("(max-width: 1023px)", () => build(true));
    mm.add("(min-width: 1024px)", () => build(false));

    return () => {
      // `pointer-events` is written imperatively (not via `gsap.set`), so
      // `mm.revert()` will not undo it. Clear it so the class wins again —
      // `pointer-events-auto` in native/reduced mode, `none` in motion mode.
      cards.forEach((el) => {
        if (el) el.style.pointerEvents = "";
      });
      mm.revert();
    };
  }, [perfumes, reduced]);

  const heading = (id: string) => (
    <>
      <span className="font-forum text-[3vw] tracking-[0.34em] text-[#cd9e61] uppercase lg:text-[0.9vw]">
        {t("eyebrow")}
      </span>
      <h2
        id={id}
        className="font-forum mt-[2.4vw] text-[7.4vw] leading-[1.05] font-normal tracking-[0.02em] text-white uppercase lg:mt-[0.9vw] lg:text-[3.4vw]"
      >
        {t("title")}
      </h2>
      <p className="font-secondary mt-[2.8vw] max-w-[82vw] text-[3.5vw] leading-[1.55] text-white/55 lg:mt-[1vw] lg:max-w-[34vw] lg:text-[1.05vw]">
        {t("subheading")}
      </p>
    </>
  );

  /**
   * ONE tree for every mode. `reduced` only toggles classes/attributes — never
   * mounts or unmounts a child of the pinned `<section>`. Removing a child after
   * ScrollTrigger has wrapped the section in a pin-spacer makes React's commit
   * fail (`removeChild` on a node whose parent changed); keeping the tree
   * identical avoids that entirely.
   */
  return (
    <section
      ref={sectionRef}
      id={galleryConfig.sectionId}
      aria-labelledby="home-gallery-title"
      className={`relative w-full overflow-hidden ${
        reduced ? "py-[14vh]" : "h-[100dvh]"
      }`}
    >
      {/* Heading / subheading */}
      <div
        ref={copyRef}
        data-gallery="copy"
        dir={isArabic ? "rtl" : "ltr"}
        className={
          reduced
            ? "mx-auto flex max-w-[92vw] flex-col items-center text-center"
            : "pointer-events-none absolute inset-x-0 top-[9%] z-10 flex flex-col items-center px-[6vw] text-center opacity-0"
        }
      >
        {heading("home-gallery-title")}
      </div>

      {/* Bottle belt (revealed behind the curtain) */}
      <div
        className={
          reduced ? "mt-[10vw] lg:mt-[4vw]" : "absolute inset-0 z-[1]"
        }
      >
        <GalleryStrip
          items={perfumes}
          stripRef={stripRef}
          cardRefs={cardRefs}
          veilRefs={veilRefs}
          captionRefs={captionRefs}
          native={reduced}
        />
      </div>

      {/* CTA */}
      <Link
        ref={ctaRef}
        href={galleryConfig.ctaHref}
        className={
          reduced
            ? "group mx-auto mt-[10vw] flex w-fit items-center gap-[3vw] text-white/70 transition-colors hover:text-white lg:mt-[4vw] lg:gap-[1vw]"
            : "group absolute bottom-[7%] left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-[3vw] text-white/70 opacity-0 transition-colors hover:text-white lg:bottom-[8%] lg:gap-[1vw]"
        }
      >
        <span className="font-forum text-[3.6vw] tracking-[0.16em] uppercase lg:text-[0.94vw]">
          {t("ctaLabel")}
        </span>
        <span className="flex h-[10vw] w-[10vw] items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur-md transition-[transform,border-color] duration-300 group-hover:scale-[1.04] group-hover:border-[#cd9e61]/70 lg:h-[3vw] lg:w-[3vw]">
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

      {/* Backdrop vignette so the belt reads against the sky. */}
      <div
        aria-hidden="true"
        className={
          reduced ? "hidden" : "pointer-events-none absolute inset-0 z-0"
        }
        style={{
          background:
            "radial-gradient(ellipse 72% 62% at 50% 50%, rgba(10,18,30,0.55), rgba(10,18,30,0.14) 70%, rgba(10,18,30,0) 100%)",
        }}
      />

      {/* The velvet curtain (kept mounted under reduced motion). */}
      <CurtainVeil
        leftRef={leftPanelRef}
        rightRef={rightPanelRef}
        seamRef={seamRef}
        hidden={reduced}
      />
    </section>
  );
}
