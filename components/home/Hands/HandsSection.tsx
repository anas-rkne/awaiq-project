"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { handsSideConfig } from "@/config/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HandsCanvas = dynamic(() => import("./HandsCanvas"), { ssr: false });

/**
 * Standalone hands chapter — the 3D finale, rendered directly below the hero.
 *
 * No host element is passed to `HandsCanvas`, so the scene is always active (see
 * the activation gate in `handsScene`). The hero no longer pins it; it is its
 * own `100svh` section in the document flow.
 *
 * The FLANKING SIDE IMAGES (`handsSideConfig` — `left_hero_img.png` left,
 * `right_hero_img.png` right) start OUTSIDE the page and ENTER the scene on
 * scroll: one pure `drive(progress)` (no scrub — Lenis' lerp already smooths,
 * the hero chapter's own doctrine) over the section's approach
 * (`entrance.start` → `entrance.end`), eased fast-in / soft-settle, so each
 * portrait glides in and parks FLUSH against its side AND foot — the trees
 * stand ON the section's floor line, exactly where they rest in the static
 * composition. The section's `overflow-hidden` is what keeps them invisible
 * while parked outside it, and `pointer-events-none` keeps the 3D scene
 * fully interactive underneath. Under `prefers-reduced-motion` they are
 * simply already in place.
 */
export function HandsSection() {
  const t = useTranslations("HandsFinale");
  const locale = useLocale();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLImageElement>(null);
  const rightRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (reduced) return;
      const section = sectionRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      if (!section || !left || !right) return;

      // Pure drive — one ScrollTrigger, no scrub: Lenis' lerp already smooths
      // the scroll position (the hero chapter's doctrine), and every value is
      // a function of progress, so the entrance is perfectly reversible.
      const drive = (progress: number) => {
        // power3.out: swift to enter, soft to land — both portraits land
        // together, as mirrored halves of one gesture.
        const eased = 1 - (1 - progress) ** 3;
        gsap.set(left, { xPercent: handsSideConfig.left.from * (1 - eased) });
        gsap.set(right, { xPercent: handsSideConfig.right.from * (1 - eased) });
      };
      drive(0);

      const st = ScrollTrigger.create({
        trigger: section,
        start: handsSideConfig.entrance.start,
        end: handsSideConfig.entrance.end,
        invalidateOnRefresh: true,
        onUpdate: (self) => drive(self.progress),
        onRefresh: (self) => drive(self.progress),
      });

      return () => {
        st.kill();
        gsap.set([left, right], { clearProps: "transform" });
      };
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-svh w-full overflow-hidden"
      data-hands-section="1"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <HandsCanvas />
      </div>

      {/* The two side portraits — parked OFF the page until the chapter is
          reached (the inline transform is the pre-hydration frame; GSAP owns
          it from `drive(0)` on), then driven in to stand flush on their own
          side's floor line. Under reduced motion the inline offset is
          dropped, so they simply rest in place.

          The NARROW tiers hide both trees outright: on a phone they are the
          full height of the section and swallow the whole scene (the 3D hands
          finale is the chapter there), so they are a `min-[1024px]`-and-up
          layer only. The refs still resolve — the engine simply drives
          `display:none` elements. */}
      <img
        ref={leftRef}
        src={handsSideConfig.left.src}
        alt=""
        aria-hidden="true"
        style={
          reduced
            ? undefined
            : { transform: `translateX(${handsSideConfig.left.from}%)` }
        }
        className="pointer-events-none absolute bottom-0 left-0 h-[88%] w-auto object-contain will-change-transform max-[1023px]:hidden"
      />
      <img
        ref={rightRef}
        src={handsSideConfig.right.src}
        alt=""
        aria-hidden="true"
        style={
          reduced
            ? undefined
            : { transform: `translateX(${handsSideConfig.right.from}%)` }
        }
        className="pointer-events-none absolute bottom-0 right-0 h-[88%] w-auto object-contain will-change-transform max-[1023px]:hidden"
      />

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
