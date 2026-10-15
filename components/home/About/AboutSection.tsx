"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { aboutConfig } from "@/config/about";
import decorLeftArt from "@/public/left.png";
import decorRightArt from "@/public/right.png";
import { GradientText } from "./GradientText";
import { InsightsUI, type AboutInsightItem } from "./InsightsUI";
import { PocketWatch } from "./PocketWatch";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** Intrinsic size of the central bottle frame (used by next/image). */
const BOTTLE_SIZE = { width: 1152, height: 2048 } as const;
/** Intrinsic size of the pillar art (reference `blockv2.png`). */
const BLOCK_SIZE = { width: 768, height: 2500 } as const;

/** Fraction of its own width a corner flourish is tucked off-edge at rest. */
const DECOR_CLIP = 65;

/**
 * The About chapter — a faithful port of the reference
 * (`momentolegal.com`) `HomeExpertiseSection`.
 *
 * ONE `100dvh` section pinned for thousands of percent of viewport height,
 * driven by a second `scrub` trigger. That progress (`drive`) runs:
 *   - the copy reveal (blur + opacity) and the `EXPERTISE` watermark,
 *   - a rotating circular conveyor: each item is a pillar (`blockv2`) carrying
 *     a bottle whose product shot lives in a circular window; the pillars ride a
 *     circle (`place`) and cross-fade their name + summary at
 *     `--watch-center-y`,
 *   - the inset insights belt (cards + captions) sliding in near the end,
 *   - a final 10× push-out of the trailing pillars.
 *
 * Both breakpoints run the SAME experience. The geometry is measured per
 * frame, so the phone simply gets its own `base` (fill-width instead of the
 * landscape `9/16 w` video ratio) and a computed vertical offset that parks the
 * conveyor band at a comfortable height — the conveyor itself, the motion and
 * the copy/cross-fade logic are identical to desktop.
 */
export function AboutSection() {
  const t = useTranslations("About");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const perfumes = useMemo(
    () =>
      aboutConfig.perfumes.map((p) => ({
        id: p.id,
        image: p.image,
        href: p.href,
        slug: p.id,
        title: t(`perfumes.${p.id}.name`),
        summary: t(`perfumes.${p.id}.summary`),
      })),
    [t],
  );

  const insights: AboutInsightItem[] = useMemo(
    () =>
      aboutConfig.insights.map((i) => ({
        id: i.id,
        image: i.image,
        href: i.href,
        title: t(`insightsItems.${i.id}.title`),
      })),
    [t],
  );

  const content = useMemo(
    () => ({
      title: t("title"),
      paragraphOne: t("paragraphOne"),
      paragraphTwo: t("paragraphTwo"),
      ctaLabel: t("ctaLabel"),
      watermark: t("watermark"),
      ctaHref: aboutConfig.ctaHref,
    }),
    [t],
  );

  const count = perfumes.length;

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraOneRef = useRef<HTMLDivElement>(null);
  const paraTwoRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);

  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockRefs = useRef<(HTMLImageElement | null)[]>([]);
  const watchRefs = useRef<(HTMLDivElement | null)[]>([]);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const leadColRef = useRef<HTMLDivElement>(null);
  const leadBlockRef = useRef<HTMLImageElement>(null);
  const leadWatchRef = useRef<HTMLDivElement>(null);
  const trailColRef = useRef<HTMLDivElement>(null);
  const trailBlockRef = useRef<HTMLImageElement>(null);
  const trailWatchRef = useRef<HTMLDivElement>(null);

  const insightsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const textsRef = useRef<HTMLDivElement>(null);
  const insightTextRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const decorLeftRef = useRef<HTMLImageElement>(null);
  const decorRightRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || perfumes.length === 0) return;

    const count = perfumes.length;
    const mm = gsap.matchMedia();

    const build = (isMobile: boolean) => {
      // measured geometry (reference names in comments)
      let stageH = 0; //   t
      let base = 0; //     a = min(h, 9/16 w)  ·  mobile: min(h, w)
      let band = 0; //     n = 0.42 a
      let colH = 0; //     s = 2500/768 * n
      let watchTop = 0; // o = 0.18 a
      let step = 0; //     c = 0.391111 a
      let stepFar = 0; //  u = 0.497778 a
      let stepBack = 0; // d = -0.311111 a
      let vOff = 0; //     mobile only: lift the whole band into view

      // Entry timeline (before the pin): the copy re-settles as the chapter
      // approaches — the reference scrolls the title/paragraphs to their final
      // positions over the "top 40% → top -30%" window.
      const entry = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 40%",
          end: "top -30%",
          scrub: true,
        },
      });
      if (isMobile) {
        entry
          .to(titleRef.current, { top: "19%", ease: "none" }, 0)
          .to(paraOneRef.current, { top: "29%", ease: "none" }, 0)
          .to(paraTwoRef.current, { top: "46%", ease: "none" }, 0);
      } else {
        entry
          .to(titleRef.current, { top: "28%", left: "15%", ease: "none" }, 0)
          .to(paraOneRef.current, { top: "42%", right: "12%", ease: "none" }, 0)
          .to(paraTwoRef.current, { top: "60%", right: "12%", ease: "none" }, 0);
      }

      const measure = () => {
        stageH = section.clientHeight;
        const w = section.clientWidth;
        base = isMobile ? Math.min(stageH, w) : Math.min(stageH, (9 / 16) * w);
        band = 0.42 * base;
        colH = (2500 / 768) * band;
        watchTop = 0.18 * base;
        step = 0.391111 * base;
        stepFar = 0.497778 * base;
        stepBack = -0.311111 * base;

        // Where the label sits with no lift (reference math), then lift the
        // phone band so the conveyor reads at ~56% instead of hugging the very
        // bottom of a tall portrait stage.
        const centerY = stageH - 0.32 * colH - 2 * watchTop + 0.5 * band;
        vOff = isMobile ? Math.max(0, centerY - 0.56 * stageH) : 0;

        section.style.setProperty("--about-band", `${band}px`);
        section.style.setProperty("--about-watch-top", `${watchTop}px`);
      };

      /** Place an item on the circle. `angle` is a % (0–100+), `rot` in deg. */
      const place = (angle: number, rot: number, scaleFactor?: number) => {
        const dist = stageH + (angle / 100) * colH;
        const inner = stageH - colH * (1 - angle / 100) - dist;
        const rad = (rot * Math.PI) / 180;
        const cf = Math.min(1, Math.abs(rot) / 12);
        const s = scaleFactor ?? 3 - 0.4 * cf;
        return {
          x: -inner * Math.sin(rad),
          y: dist + inner * Math.cos(rad) - watchTop * s,
          rotation: rot,
        };
      };

      const reset = () => {
        if (
          !sectionRef.current ||
          !titleRef.current ||
          !paraOneRef.current ||
          !paraTwoRef.current
        )
          return;

        colRefs.current.forEach((el, i) => {
          if (el)
            gsap.set(el, {
              xPercent: -50,
              x: i * step,
              y: -vOff,
              opacity: i === 0 ? 1 : 0,
            });
        });
        blockRefs.current.forEach((el) => {
          if (el)
            gsap.set(el, {
              xPercent: -50,
              transformOrigin: "50% 100%",
              yPercent: 100,
              rotation: 0,
              opacity: 1,
            });
        });
        watchRefs.current.forEach((el) => {
          if (el) {
            const p = place(100, 0);
            gsap.set(el, {
              xPercent: -50,
              x: p.x,
              y: p.y,
              rotation: p.rotation,
              opacity: 0,
              scale: 1,
            });
          }
        });
        labelRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0 });
        });

        gsap.set(leadColRef.current, {
          xPercent: -50,
          x: -step,
          y: -vOff,
          opacity: 1,
        });
        gsap.set(leadBlockRef.current, {
          xPercent: -50,
          transformOrigin: "50% 100%",
          yPercent: 100,
          rotation: 0,
          opacity: 0,
        });
        {
          const p = place(100, 0);
          gsap.set(leadWatchRef.current, {
            xPercent: -50,
            x: p.x,
            y: p.y,
            rotation: p.rotation,
            opacity: 0,
            scale: 1,
          });
        }

        gsap.set(trailColRef.current, {
          xPercent: -50,
          x: count * step,
          y: -vOff,
          opacity: 0,
        });
        gsap.set(trailBlockRef.current, {
          xPercent: -50,
          transformOrigin: "50% 100%",
          yPercent: 100,
          rotation: 0,
        });
        {
          const p = place(100, 0);
          gsap.set(trailWatchRef.current, {
            xPercent: -50,
            x: p.x,
            y: p.y,
            rotation: p.rotation,
            opacity: 1,
            scale: 1,
          });
        }

        gsap.set(insightsRef.current, { opacity: 0 });

        const originAt = (p: number) =>
          `${((stepBack - p + band / 2) / band) * 100}% 50%`;
        gsap.set(colRefs.current[count - 2], {
          transformOrigin: originAt(-stepFar),
        });
        gsap.set(colRefs.current[count - 1], {
          transformOrigin: originAt(0),
        });
        gsap.set(trailColRef.current, { transformOrigin: originAt(stepFar) });

        gsap.set(watermarkRef.current, { opacity: 0 });
        gsap.set(
          [titleRef.current, paraOneRef.current, paraTwoRef.current],
          { filter: "blur(0px)" },
        );

        gsap.set(decorLeftRef.current, {
          xPercent: -DECOR_CLIP,
          opacity: 1,
        });
        gsap.set(decorRightRef.current, {
          xPercent: DECOR_CLIP,
          opacity: 1,
        });
      };

      const drive = (progress: number) => {
        if (!sectionRef.current || !titleRef.current) return;
        measure();

        const watchMid = place(68, 0);
        const watchCenterY = watchTop + watchMid.y + band / 2 - vOff;
        section.style.setProperty("--watch-center-y", `${watchCenterY}px`);

        const d = clamp01(progress / 0.57);
        const x = clamp01(d / 0.1);
        const fv = clamp01((d - 0.1) / 0.08);
        const L = 1 - (1 - x) * (1 - x);
        const K = fv * fv;

        gsap.set(ctaRef.current, { opacity: 1 - clamp01(d / 0.05) });
        gsap.set(watermarkRef.current, { opacity: x });
        gsap.set(
          [titleRef.current, paraOneRef.current, paraTwoRef.current],
          { filter: `blur(${6 * L}px)`, opacity: 1 - K },
        );

        const A = 100 - 54 * L + 22 * K;
        gsap.set(blockRefs.current[0], { yPercent: A });
        const B = place(A, 0, 0.6 + 2.4 * K);
        gsap.set(watchRefs.current[0], {
          x: B.x,
          y: B.y,
          rotation: B.rotation,
          opacity: Math.min(1, 2 * K),
          scale: 0.6 + 0.4 * K,
        });
        gsap.set(labelRefs.current[0], { opacity: fv });

        const G = 100 - 22 * fv;
        const rot1 = 12 * fv;
        gsap.set(colRefs.current[1], { opacity: fv });
        gsap.set(blockRefs.current[1], { rotation: rot1, yPercent: G });
        const q = place(G, rot1);
        gsap.set(watchRefs.current[1], {
          x: q.x,
          y: q.y,
          rotation: q.rotation,
          opacity: fv,
          scale: 1 - 0.4 * fv,
        });

        const Z = 100 - 22 * fv;
        const D = -12 * fv;
        gsap.set(leadBlockRef.current, {
          rotation: D,
          yPercent: Z,
          opacity: fv,
        });
        const X = place(Z, D);
        gsap.set(leadWatchRef.current, {
          x: X.x,
          y: X.y,
          rotation: X.rotation,
          opacity: fv,
          scale: 1 - 0.4 * fv,
        });

        const fade = (a: number) => {
          const l = clamp01((a - 1) * 2);
          return a <= 1 ? 1 : 1 - l * l * (3 - 2 * l);
        };

        if (d > 0.18) {
          const e = clamp01((d - 0.18) / 0.61) * (count - 1);

          for (let i = 0; i < count; i++) {
            const r = i - e;
            const a = Math.abs(r);
            gsap.set(colRefs.current[i], { x: r * step, opacity: fade(a) });

            const rot = Math.max(-12, Math.min(12, 12 * r));
            const yp = 68 + 10 * Math.min(a, 1);
            gsap.set(blockRefs.current[i], { rotation: rot, yPercent: yp });

            const sc = 1 - 0.4 * Math.min(a, 1);
            const p = place(yp, rot);
            gsap.set(watchRefs.current[i], {
              scale: sc,
              x: p.x,
              y: p.y,
              rotation: p.rotation,
              opacity: 1,
            });

            gsap.set(labelRefs.current[i], { opacity: Math.max(0, 1 - 2 * a) });

            const link = linkRefs.current[i];
            if (link) {
              const on = a < 0.5 && d < 0.79;
              link.style.pointerEvents = on ? "auto" : "none";
              link.tabIndex = on ? 0 : -1;
            }
          }

          // leading special
          {
            const r = -1 - e;
            const a = Math.abs(r);
            gsap.set(leadColRef.current, { x: r * step, opacity: fade(a) });
            const rot = Math.max(-12, Math.min(12, 12 * r));
            const yp = 68 + 10 * Math.min(a, 1);
            gsap.set(leadBlockRef.current, {
              rotation: rot,
              yPercent: yp,
              opacity: 1,
            });
            const sc = 1 - 0.4 * Math.min(a, 1);
            const p = place(yp, rot);
            gsap.set(leadWatchRef.current, {
              scale: sc,
              x: p.x,
              y: p.y,
              rotation: p.rotation,
              opacity: 1,
            });
          }

          // trailing special
          {
            const r = count - e;
            const a = Math.abs(r);
            gsap.set(trailColRef.current, { x: r * step, opacity: fade(a) });
            const rot = Math.max(-12, Math.min(12, 12 * r));
            const yp = 68 + 10 * Math.min(a, 1);
            gsap.set(trailBlockRef.current, {
              rotation: rot,
              yPercent: yp,
              opacity: 1,
            });
            const sc = 1 - 0.4 * Math.min(a, 1);
            const p = place(yp, rot);
            gsap.set(trailWatchRef.current, {
              scale: sc,
              x: p.x,
              y: p.y,
              rotation: p.rotation,
              opacity: 1,
            });
          }

          if (d > 0.79) {
            const el = clamp01((d - 0.79) / 0.08);
            const ease = 1 - (1 - el) * (1 - el);
            const nVal = (100 * (colH - stageH + 0.15 * stageH)) / colH;

            gsap.set(colRefs.current[count - 2], {
              x: -step + (-stepFar + step) * ease,
            });
            gsap.set(trailColRef.current, {
              x: step + (stepFar - step) * ease,
            });

            const pushOut = (
              blockEl: HTMLImageElement | null,
              watchEl: HTMLDivElement | null,
              rotDeg: number,
              targetY: number,
              scaleFrom: number,
            ) => {
              if (!blockEl || !watchEl) return;
              const rot = rotDeg * (1 - ease);
              const yp = targetY + (nVal - targetY) * ease;
              gsap.set(blockEl, { rotation: rot, yPercent: yp });
              const dScale = 3 - 0.4 * Math.min(1, Math.abs(rotDeg) / 12);
              const p = place(yp, rot, dScale + (-1.5 - dScale) * ease);
              gsap.set(watchEl, {
                x: p.x,
                y: p.y,
                rotation: p.rotation,
                opacity: 1 - ease,
                scale: scaleFrom + (0.3 - scaleFrom) * ease,
              });
            };

            pushOut(
              blockRefs.current[count - 2],
              watchRefs.current[count - 2],
              -12,
              78,
              0.6,
            );
            pushOut(
              blockRefs.current[count - 1],
              watchRefs.current[count - 1],
              0,
              68,
              1,
            );
            pushOut(trailBlockRef.current, trailWatchRef.current, 12, 78, 0.6);
            gsap.set(labelRefs.current[count - 1], { opacity: 1 - ease });
          }
        } else {
          for (let i = 0; i < count; i++) {
            gsap.set(colRefs.current[i], { x: i * step });
            const link = linkRefs.current[i];
            if (link) {
              link.style.pointerEvents = "none";
              link.tabIndex = -1;
            }
          }
          for (let i = 2; i < count; i++) {
            gsap.set(colRefs.current[i], { opacity: 0 });
            gsap.set(blockRefs.current[i], { yPercent: 100, rotation: 0 });
            const p = place(100, 0);
            gsap.set(watchRefs.current[i], {
              x: p.x,
              y: p.y,
              rotation: p.rotation,
              opacity: 0,
              scale: 1,
            });
            gsap.set(labelRefs.current[i], { opacity: 0 });
          }
          gsap.set(leadColRef.current, { x: -step, opacity: 1 });
          gsap.set(trailColRef.current, { x: count * step, opacity: 0 });
        }

        const J = clamp01((d - 0.87) / 0.13);
        const Q = J * J;
        const V = 1 + 9 * Q;
        gsap.set(colRefs.current[count - 2], { scale: V });
        gsap.set(colRefs.current[count - 1], { scale: V });
        gsap.set(trailColRef.current, { scale: V });
        if (J > 0) {
          const o = 1 - clamp01((Q - 0.75) / 0.25);
          gsap.set(colRefs.current[count - 2], { opacity: o });
          gsap.set(colRefs.current[count - 1], { opacity: o });
          gsap.set(trailColRef.current, { opacity: o });
        }
        gsap.set(insightsRef.current, {
          opacity: Q,
          visibility: Q > 0 ? "visible" : "hidden",
        });
        if (Q > 0) {
          gsap.set(watermarkRef.current, {
            opacity: x * Math.max(0, 1 - Q / 0.2),
          });
        }

        // Corner flourishes — each is parked off its own edge (right art off
        // the right edge, left art off the left edge) and slides inward as the
        // chapter engages until it sits flush against that edge; both
        // dissolve with the insights belt.
        {
          const rt = clamp01(progress / 0.12);
          const rv = 1 - (1 - rt) * (1 - rt);
          gsap.set(decorLeftRef.current, {
            xPercent: -DECOR_CLIP * (1 - rv),
            opacity: 1 - Q,
          });
          gsap.set(decorRightRef.current, {
            xPercent: DECOR_CLIP * (1 - rv),
            opacity: 1 - Q,
          });
        }

        const cardW = isMobile ? 72 : 32;
        const gap = isMobile ? 5 : 2;
        const spacing = cardW + gap;
        const first = cardW / 2;
        const beltTotal = Math.max(
          0,
          cardW * insights.length + gap * (insights.length - 1) - 100,
        );
        const ee = clamp01((progress - 0.87 * 0.57) / (1 - 0.87 * 0.57));
        const et = 100 + (-beltTotal - 100) * (1 - (1 - ee) * (1 - ee));
        const tx = `${et}vw`;
        gsap.set(cardsRef.current, { x: tx });
        gsap.set(textsRef.current, { x: tx });
        insights.forEach((_, i) => {
          const el = insightTextRefs.current[i];
          if (!el) return;
          const a = clamp01(1 - Math.abs(spacing * i + first + et - 50) / spacing);
          el.style.fontSize = isMobile ? "3.4vw" : "1.5625vw";
          el.style.lineHeight = isMobile ? "4.4vw" : "2.0833vw";
          el.style.transformOrigin = "center center";
          el.style.transform = `scale(${0.92 + 0.23 * a})`;
          el.style.color = `rgba(255, 255, 255, ${0.59 + 0.41 * a})`;
        });
      };

      measure();
      reset();
      drive(0);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? "+=380%" : "+=1830%",
        pin: true,
        // The Lenis root is `display:flex`, and ScrollTrigger silently disables
        // pinSpacing when the pin's parent is flex — which would leave the page
        // with zero scroll distance here (the whole chapter would never play).
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      const scrub = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? "+=420%" : "+=2030%",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => drive(self.progress),
        onRefresh: (self) => {
          measure();
          reset();
          drive(self.progress);
        },
      });

      let raf = 0;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (!sectionRef.current) return;
          measure();
          reset();
          drive(scrub.progress);
        });
      });
      ro.observe(section);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        entry.scrollTrigger?.kill();
        entry.kill();
      };
    };

    mm.add("(max-width: 1023px)", () => build(true));
    mm.add("(min-width: 1024px)", () => build(false));

    return () => mm.revert();
  }, [perfumes, insights]);

  return (
    <section
      ref={sectionRef}
      id={aboutConfig.sectionId}
      className="relative h-[100dvh] w-full overflow-hidden"
      aria-labelledby="home-about-title"
    >
      {/* Corner flourishes: left slides in from the left edge, right from the right. */}
      <Image
        ref={decorLeftRef}
        src={decorLeftArt}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[8%] left-0 z-[3] h-auto w-[38vw] will-change-transform"
      />
      <Image
        ref={decorRightRef}
        src={decorRightArt}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[5%] right-0 z-[3] h-auto w-[38vw] will-change-transform"
      />
      <div
        ref={insightsRef}
        aria-hidden="true"
        data-page-exit-delay="250"
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        <InsightsUI
          items={insights}
          heading={t("insightsHeading")}
          subheading={t("insightsSubheading")}
          ctaLabel={t("insightsCta")}
          ctaHref={aboutConfig.ctaHref}
          hideCtaOnWideRatio
          cardsSliderRef={cardsRef}
          textsSliderRef={textsRef}
          textRefs={insightTextRefs}
        />
      </div>

      <span
        ref={watermarkRef}
        aria-hidden="true"
        className="font-forum pointer-events-none absolute bottom-[5%] left-0 z-0 w-full text-center whitespace-nowrap uppercase opacity-0"
        style={{
          color: "rgba(255, 255, 255, 0.05)",
          fontSize: "13.825vw",
          fontWeight: 400,
          lineHeight: "71.333%",
          letterSpacing: isArabic ? "0" : "4.21875vw",
        }}
      >
        {content.watermark}
      </span>

      {/* Leading pillar — carries the last perfume around the seam. */}
      <div
        ref={leadColRef}
        className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[var(--about-band,23.625vw)] opacity-0"
      >
        <Image
          ref={leadBlockRef}
          src={aboutConfig.blockColumn}
          alt=""
          width={BLOCK_SIZE.width}
          height={BLOCK_SIZE.height}
          priority
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 z-[1] h-auto w-full will-change-transform"
        />
        <div
          ref={leadWatchRef}
          className="absolute top-[var(--about-watch-top,10.125vw)] left-1/2 z-0 w-full will-change-transform"
        >
          <PocketWatch
            frameSrc={aboutConfig.bottle}
            frameWidth={BOTTLE_SIZE.width}
            frameHeight={BOTTLE_SIZE.height}
            imageSrc={perfumes[count - 1].image}
            className="w-full"
          />
        </div>
      </div>

      {/* Trailing pillar — carries the first perfume around the seam. */}
      <div
        ref={trailColRef}
        className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[var(--about-band,23.625vw)] opacity-0"
      >
        <Image
          ref={trailBlockRef}
          src={aboutConfig.blockColumn}
          alt=""
          width={BLOCK_SIZE.width}
          height={BLOCK_SIZE.height}
          priority
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 z-[1] h-auto w-full will-change-transform"
        />
        <div
          ref={trailWatchRef}
          className="absolute top-[var(--about-watch-top,10.125vw)] left-1/2 z-0 w-full will-change-transform"
        >
          <PocketWatch
            frameSrc={aboutConfig.bottle}
            frameWidth={BOTTLE_SIZE.width}
            frameHeight={BOTTLE_SIZE.height}
            imageSrc={perfumes[0].image}
            className="w-full"
          />
        </div>
      </div>

      {/* Per-perfume pillars */}
      {perfumes.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => {
            colRefs.current[i] = el;
          }}
          className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[var(--about-band,23.625vw)] opacity-0"
        >
          <Image
            ref={(el) => {
              blockRefs.current[i] = el;
            }}
            src={aboutConfig.blockColumn}
            alt=""
            width={BLOCK_SIZE.width}
            height={BLOCK_SIZE.height}
            priority
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 z-[1] h-auto w-full will-change-transform"
          />
          <div
            ref={(el) => {
              watchRefs.current[i] = el;
            }}
            className="absolute top-[var(--about-watch-top,10.125vw)] left-1/2 z-0 w-full will-change-transform"
          >
            <Link
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              href={p.href}
              aria-label={p.title}
              data-page-exit-delay="250"
              tabIndex={-1}
              className="block w-full cursor-pointer transition-transform duration-300 will-change-transform hover:scale-[1.04]"
              style={{ pointerEvents: "none" }}
            >
              <PocketWatch
                frameSrc={aboutConfig.bottle}
                frameWidth={BOTTLE_SIZE.width}
                frameHeight={BOTTLE_SIZE.height}
                imageSrc={p.image}
                sourceId={p.slug}
                className="w-full"
              />
            </Link>
          </div>
        </div>
      ))}

      {/* Name + summary labels, cross-faded at the bottle centre. */}
      {perfumes.map((p, i) => (
        <div
          key={`text-${p.id}`}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className="pointer-events-none absolute inset-0 z-[15] opacity-0 will-change-[opacity]"
        >
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="font-forum absolute top-[var(--watch-center-y,44.74dvh)] left-0 w-full -translate-y-[165%] text-center text-[clamp(1.4rem,6.5vw,2.2rem)] leading-[110%] font-normal text-white lg:left-[22%] lg:w-[18vw] lg:-translate-y-1/2 lg:text-left lg:text-[3.125vw] lg:leading-[105%]"
          >
            {p.title}
          </div>
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="font-forum absolute top-[var(--watch-center-y,44.74dvh)] left-0 w-full translate-y-[55%] text-center text-[clamp(0.85rem,3.6vw,1.05rem)] leading-[150%] font-normal text-white lg:left-auto lg:right-[15%] lg:w-[22vw] lg:-translate-y-1/2 lg:text-left lg:text-[1.0417vw] lg:leading-[135%]"
          >
            <p>{p.summary}</p>
          </div>
        </div>
      ))}

      <h2
        ref={titleRef}
        id="home-about-title"
        className="font-forum absolute top-[13%] left-0 z-10 w-full px-[1.6rem] text-[clamp(1.6rem,7vw,2.4rem)] leading-[85%] font-normal tracking-[0.04em] text-white uppercase will-change-[filter] lg:top-[18%] lg:left-0 lg:ml-[clamp(1.6rem,3.5vw,13rem)] lg:w-auto lg:px-0 lg:text-[4.1667vw]"
      >
        {content.title}
      </h2>

      <div
        ref={paraOneRef}
        className="font-forum absolute top-[24%] left-0 z-10 flex w-full flex-col gap-[20px] px-[1.6rem] text-[clamp(0.9rem,3.6vw,1.05rem)] leading-[150%] will-change-[filter] lg:top-[38%] lg:right-[20%] lg:left-auto lg:w-[38vw] lg:gap-[2.5vw] lg:px-0 lg:text-[1.25vw] lg:leading-[166.667%]"
      >
        <p>
          <GradientText>{content.paragraphOne}</GradientText>
        </p>
      </div>

      <div
        ref={paraTwoRef}
        className="font-forum absolute top-[42%] left-0 z-10 flex w-full flex-col gap-[20px] px-[1.6rem] text-[clamp(0.9rem,3.6vw,1.05rem)] leading-[150%] will-change-[filter] lg:top-[55%] lg:right-[0%] lg:left-auto lg:w-[38vw] lg:gap-[2.5vw] lg:px-0 lg:text-[1.25vw] lg:leading-[166.667%]"
      >
        <p>
          <GradientText>{content.paragraphTwo}</GradientText>
        </p>
      </div>

      <Link
        ref={ctaRef}
        href={content.ctaHref}
        className="group absolute right-[6%] bottom-[12%] z-10 inline-flex items-center gap-[14px] text-white/70 transition-colors hover:text-white lg:right-[14%] lg:bottom-[14%] lg:gap-[1vw]"
      >
        <span className="font-forum text-[14px] tracking-[0.1em] lg:text-[0.9375vw]">
          {content.ctaLabel}
        </span>
        <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur-md transition-[transform,background-color,border-color] duration-300 group-hover:scale-[1.02] group-hover:border-white/75 lg:h-[3.5vw] lg:w-[3.5vw]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 14 26"
            fill="none"
            aria-hidden="true"
            className="h-[16px] w-auto lg:h-[1.1vw]"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.2925 1.7065L10.8785 12.2925C11.2685 12.6825 11.2685 13.3165 10.8785 13.7065L0.2925 24.2925C-0.0975 24.6825 -0.0975 25.3165 0.2925 25.7065C0.6825 26.0965 1.3165 26.0965 1.7065 25.7065C1.7065 25.7065 9.1185 18.2945 12.2925 15.1205C13.4635 13.9495 13.4635 12.0495 12.2925 10.8785L1.7065 0.2925C1.3165 -0.0975 0.6825 -0.0975 0.2925 0.2925C-0.0975 0.6825 -0.0975 1.3165 0.2925 1.7065Z"
              fill="white"
              className="[fill-opacity:0.3] transition-[fill-opacity] duration-300 group-hover:[fill-opacity:0.7]"
            />
          </svg>
        </span>
      </Link>
    </section>
  );
}
