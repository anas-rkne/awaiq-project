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
 * ONE `100dvh` section pinned for `1830%` of viewport height, driven by a
 * second `scrub:1` trigger spanning `2030%`. That progress (`drive`) runs:
 *   - the copy reveal (blur + opacity) and the `EXPERTISE` watermark,
 *   - a rotating circular conveyor: each item is a pillar (`blockv2`) carrying
 *     a bottle whose product shot lives in a circular window; the pillars ride a
 *     circle (`place`) and cross-fade their name (left) + summary (right) at
 *     `--watch-center-y`,
 *   - the inset insights belt (cards + captions) sliding in near the end,
 *   - a final 10× push-out of the trailing pillars.
 *
 * Numbers and tailwind values are kept identical to the source; only the data
 * (four perfumes), assets (bottle + product circle) and copy differ.
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

    mm.add("(min-width: 768px)", () => {
      // measured geometry (reference names in comments)
      let stageH = 0; // t
      let base = 0; //     a = min(h, 9/16 w)
      let band = 0; //     n = 0.42 a
      let colH = 0; //     s = 2500/768 * n
      let watchTop = 0; // o = 0.18 a
      let step = 0; //     c = 0.391111 a
      let stepFar = 0; //  u = 0.497778 a
      let stepBack = 0; // d = -0.311111 a

      // Entry timeline (before the pin): the copy re-settles as the chapter
      // approaches — the reference scrolls the title/paragraphs to their final
      // positions over the "top 40% → top -30%" window.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 40%",
            end: "top -30%",
            scrub: true,
          },
        })
        .to(titleRef.current, { top: "28%", left: "15%", ease: "none" }, 0)
        .to(paraOneRef.current, { top: "42%", right: "12%", ease: "none" }, 0)
        .to(paraTwoRef.current, { top: "60%", right: "12%", ease: "none" }, 0);

      const measure = () => {
        stageH = section.clientHeight;
        const w = section.clientWidth;
        base = Math.min(stageH, (9 / 16) * w);
        band = 0.42 * base;
        colH = (2500 / 768) * band;
        watchTop = 0.18 * base;
        step = 0.391111 * base;
        stepFar = 0.497778 * base;
        stepBack = -0.311111 * base;
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

        gsap.set(leadColRef.current, { xPercent: -50, x: -step, opacity: 1 });
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
        const watchCenterY = watchTop + watchMid.y + band / 2;
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

        const beltTotal = Math.max(
          0,
          32 * insights.length + (insights.length - 1) * 2 - 100,
        );
        const ee = clamp01((progress - 0.87 * 0.57) / (1 - 0.87 * 0.57));
        const et = 100 + (-beltTotal - 100) * (1 - (1 - ee) * (1 - ee));
        const tx = `${et}vw`;
        gsap.set(cardsRef.current, { x: tx });
        gsap.set(textsRef.current, { x: tx });
        insights.forEach((_, i) => {
          const el = insightTextRefs.current[i];
          if (!el) return;
          const a = clamp01(1 - Math.abs(34 * i + 16 + et - 50) / 34);
          el.style.fontSize = "1.5625vw";
          el.style.lineHeight = "2.0833vw";
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
        end: "+=1830%",
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
        end: "+=2030%",
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
      };
    });

    return () => mm.revert();
  }, [perfumes, insights]);

  // The reference rebuilds the whole experience when the layout breakpoint
  // flips (the pin geometry is measured for one frame only) — it hard-reloads.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onFlip = () => window.location.reload();
    mq.addEventListener("change", onFlip);
    return () => mq.removeEventListener("change", onFlip);
  }, []);

  return (
    <section
      ref={sectionRef}
      id={aboutConfig.sectionId}
      className="relative w-full md:h-[100dvh] md:overflow-hidden"
      aria-labelledby="home-about-title"
    >
      {/* ─────────────── Desktop composition ─────────────── */}
      <div className="hidden md:block">
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
          className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[min(42dvh,23.625vw)] opacity-0"
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
            className="absolute top-[min(18%,10.125vw)] left-1/2 z-0 w-full will-change-transform"
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
          className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[min(42dvh,23.625vw)] opacity-0"
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
            className="absolute top-[min(18%,10.125vw)] left-1/2 z-0 w-full will-change-transform"
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
            className="pointer-events-none absolute top-0 left-1/2 z-[50] h-full w-[min(42dvh,23.625vw)] opacity-0"
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
              className="absolute top-[min(18%,10.125vw)] left-1/2 z-0 w-full will-change-transform"
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
              className="font-forum absolute top-[var(--watch-center-y,44.74dvh)] left-[22%] w-[18vw] -translate-y-1/2 text-[3.125vw] leading-[105%] font-normal text-white"
            >
              {p.title}
            </div>
            <div
              dir={isArabic ? "rtl" : "ltr"}
              className="font-forum absolute top-[var(--watch-center-y,44.74dvh)] right-[15%] flex w-[22vw] -translate-y-1/2 flex-col text-[1.0417vw] leading-[135%] font-normal text-white"
            >
              <p>{p.summary}</p>
            </div>
          </div>
        ))}

        <h2
          ref={titleRef}
          id="home-about-title"
          className="font-forum absolute top-[15%] z-10 ml-[2.3rem] text-[28px] leading-[78.75%] font-normal tracking-[0.04em] text-white uppercase will-change-[filter] md:top-[18%] md:left-[0%] md:ml-[clamp(1.6rem,3.5vw,13rem)] md:text-[4.1667vw]"
        >
          {content.title}
        </h2>

        <div
          ref={paraOneRef}
          className="font-forum absolute top-[25%] z-10 mr-[2.3rem] flex flex-col gap-[20px] text-[14px] leading-[166.667%] will-change-[filter] md:top-[38%] md:right-[20%] md:left-auto md:w-[38vw] md:gap-[2.5vw] md:text-[1.25vw]"
        >
          <p>
            <GradientText>{content.paragraphOne}</GradientText>
          </p>
        </div>

        <div
          ref={paraTwoRef}
          className="font-forum absolute top-[35%] z-10 mr-[2.3rem] flex flex-col gap-[20px] text-[14px] leading-[166.667%] will-change-[filter] md:top-[55%] md:right-[0%] md:left-auto md:w-[38vw] md:gap-[2.5vw] md:text-[1.25vw]"
        >
          <p>
            <GradientText>{content.paragraphTwo}</GradientText>
          </p>
        </div>

        <Link
          ref={ctaRef}
          href={content.ctaHref}
          className="group absolute right-[0%] bottom-[14%] z-10 inline-flex items-center gap-[14px] text-white/70 transition-colors hover:text-white md:right-[14%] md:gap-[1vw]"
        >
          <span className="font-forum text-[14px] tracking-[0.1em] md:text-[0.9375vw]">
            {content.ctaLabel}
          </span>
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/5 backdrop-blur-md transition-[transform,background-color,border-color] duration-300 group-hover:scale-[1.02] group-hover:border-white/75 md:h-[3.5vw] md:w-[3.5vw]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 14 26"
              fill="none"
              aria-hidden="true"
              className="h-[16px] w-auto md:h-[1.1vw]"
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
      </div>

      {/* ─────────────── Mobile fallback ─────────────── */}
      <div className="flex flex-col gap-16 px-6 py-24 md:hidden">
        <div dir={isArabic ? "rtl" : "ltr"}>
          <h2 className="font-forum text-4xl leading-tight font-normal text-white">
            {content.title}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-beige/75">
            {content.paragraphOne}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-beige/80">
            {content.paragraphTwo}
          </p>
        </div>

        <ul className="flex flex-col gap-12">
          {perfumes.map((p) => (
            <li key={p.id} className="flex flex-col gap-4">
              <Link
                href={p.href}
                className="relative mx-auto block h-64 w-64 overflow-hidden rounded-full"
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="70vw"
                  className="object-cover"
                />
              </Link>
              <div dir={isArabic ? "rtl" : "ltr"} className="text-center">
                <h3 className="font-primary text-2xl font-medium text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-beige/70">
                  {p.summary}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href={content.ctaHref}
          className="mx-auto inline-flex items-center gap-4 text-white/80"
        >
          <span className="font-primary text-base tracking-[0.1em]">
            {content.ctaLabel}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-auto w-4"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
