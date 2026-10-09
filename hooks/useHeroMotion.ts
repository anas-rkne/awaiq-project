"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroSceneConfig, egyptConfig } from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";
import type { HeroCloudsHandle } from "@/components/home/Hero/HeroClouds";
import type { HeroFrame } from "@/hooks/useHeroResponsive";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The hero→Egypt exit as a GSAP ScrollTrigger IMAGE ZOOM — pin + scrub, the
 * professional pattern for scroll-linked camera moves (gsap-scroll-motion
 * skill). One timeline is the single source of truth:
 *
 * [0─ copy fade ─ exit zoom ─ 0.92 ─ world un-zoom ─ Egypt in ─ 1.5]
 *
 * - The lens (perspective holder) is pinned for the whole stage (730vh
 *   desktop / 460vh mobile) — hero AND Egypt in ONE pin.
 * - The world draws `transformOrigin` at the frame's bottle focal point, then
 *   the camera dives INTO it: scale + slight rotateY/tilt, scrubbed by scroll.
 * - The bridge ([0.92, 1.5]) un-zooms the world to identity, fades the hero
 *   artwork/overlays, fades the Egypt plate in, and sends the ONE bottle
 *   traveling from the hero focal down onto the platform — no second pin, no
 *   second element, no cut.
 * - Per-layer parallax (sky/clouds/bottle) is scrubbed in the same timeline,
 *   never in a second rAF loop.
 *
 * RESPONSIVE REBUILD-FREE BY CONSTRUCTION:
 * The ScrollTrigger (and its pin-spacer) is created exactly ONCE — it must
 * never be torn down and re-created on a breakpoint flip. A rebuild runs the
 * revert/un-pin in the same commit as the new pin, and while the user is
 * mid-scroll that reverts-and-recreates a pin-spacer whose old state has not
 * been flushed yet: two spacers nest, the document grows, and the next
 * section's text ends up inside the hero (the resize bug). So `[frame]` is
 * deliberately NOT a useGSAP dependency. Frame changes only:
 *   1. swap `motionRef` — the timeline's VALUES are function-based and read
 *      the ref, so `invalidate()` re-compiles them on the SAME timeline;
 *   2. `ScrollTrigger.refresh()` re-measures travel (`end` re-runs because
 *      `invalidateOnRefresh`), the stage height is already React-set to the
 *      new `stageHeight` in the same commit, and an existing pin re-measures
 *      cleanly (never re-pins).
 *
 * Reduced motion splits into explicit matchMedia branches: full motion under
 * `no-preference` (owns the only ScrollTrigger), static scene under `reduce`
 * (no pin at all).
 */
export function useHeroMotion() {
  const stageRef = useRef<HTMLElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLDivElement | null>(null);
  const bottleRef = useRef<HTMLDivElement | null>(null);
  const cloudsRef = useRef<HeroCloudsHandle | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  /** The single traveling bottle — anchor owns `top` (% of lens), travel
   *  wrapper owns scale/rotation so the two transforms never collide. */
  const pixlrAnchorRef = useRef<HTMLDivElement | null>(null);
  const pixlrTravelRef = useRef<HTMLDivElement | null>(null);
  const pixlrShadowRef = useRef<HTMLDivElement | null>(null);
  /** Egypt half: plate opacity + its copy reveal + the hero overlays that
   *  must clear out so the plate and copy are readable. */
  const egyptRef = useRef<HTMLDivElement | null>(null);
  const egyptCopyRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const frame = useHeroResponsive();
  const motionRef = useRef<HeroFrame["motion"]>(frame.motion);
  const pixlrRef = useRef<HeroFrame["pixlr"]>(frame.pixlr);
  const mobileRef = useRef(frame.isMobile);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const mountedRef = useRef(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const tlWin = heroSceneConfig.motionTimeline;
      const { copyFadeStart, copyFadeEnd } = tlWin;
      const exitWin = tlWin.exit;

      // Reduced motion: static, fully readable scene — no pin, no scrub, no
      // dive. (transformOrigin stays on the elements via React inline style.)
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(copyRef.current, { opacity: 1, y: 0 });
        gsap.set(worldRef.current, { scale: 1, rotation: 0, rotateY: 0 });
        // Egypt half stays inert in reduced motion; HeroSection renders a
        // static Egypt block below the hero instead (see HeroSection).
        gsap.set(pixlrTravelRef.current, { scale: 1, rotation: 0 });
      });

      // Full cinematic scroll-driven zoom. Created ONCE — see "responsive
      // rebuild-free" above; `[frame]` changes are handled by the effect below.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stage = stageRef.current;
        const lens = lensRef.current;
        const world = worldRef.current;
        const copy = copyRef.current;
        if (!stage || !lens || !world || !copy) return;

        const fresh = () => motionRef.current;
        const egyptItems = egyptCopyRef.current
          ? gsap.utils.toArray<HTMLElement>(egyptCopyRef.current.children)
          : [];

        // Initial frame — set, not from-to, so state is declarative and scrub
        // never animates from an undefined start. (will-change is owned by the
        // CSS classes on sky/bottle/world, not duplicated inline here.)
        gsap.set(skyRef.current, { scale: motionRef.current.skyScaleFrom });
        gsap.set(bottleRef.current, { scale: motionRef.current.bottleScaleFrom });
        gsap.set(copy, { opacity: 1, y: 0 });
        // Egypt half initial state (declarative — no from-to surprises).
        gsap.set(pixlrTravelRef.current, { scale: 1, rotation: 0 });
        gsap.set(pixlrShadowRef.current, { opacity: 0 });
        gsap.set(egyptRef.current, { opacity: 0 });
        gsap.set(egyptCopyRef.current, { autoAlpha: 0 });
        gsap.set(egyptItems, { autoAlpha: 0, y: 30 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${stage.offsetHeight - window.innerHeight}`,
            scrub: 1,
            // Pin the LENS (the svh camera), never the stage: the STAGE height
            // is React-owned (340↔520vh) and drives document flow, while
            // pinning the stage makes GSAP px-capture its height at build time
            // and write position:fixed + inline height into the element — so
            // the hydration frame's value survives the flip and the mobile
            // stage keeps desktop height. The lens height never feeds back
            // into flow, so its pin is inert even during a re-measure.
            pin: lens,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tlRef.current = tl;

        // Copy out (fades, drifts up) before the camera moves.
        tl.to(
          copy,
          { opacity: 0, y: -72, duration: copyFadeEnd - copyFadeStart },
          copyFadeStart,
        );

        // Per-layer parallax, scrubbed across the whole stage. Frame-dependent
        // values are FUNCTION-based against `motionRef`, so a breakpoint flip
        // re-compiles them on the SAME timeline via tl.invalidate() — never a
        // rebuild.
        tl.to(skyRef.current, { scale: () => fresh().skyScaleTo, duration: 1 }, 0);
        tl.to(
          bottleRef.current,
          {
            scale: () => fresh().bottleScaleTo,
            y: () => -fresh().bottleRise,
            duration: 1,
          },
          0,
        );
        // Procedural clouds drift with the scroll — GSAP tweens a proxy, the
        // value is pushed into the WebGL shader (single source of truth stays
        // THIS timeline, never a second rAF).
        const cloudDriftProxy = { a: 0, b: 0 };
        tl.to(
          cloudDriftProxy,
          {
            a: () => fresh().cloudDrift,
            b: () => fresh().cloudDriftSecondary,
            duration: 1,
            onUpdate: () =>
              cloudsRef.current?.setDrift(cloudDriftProxy.a, cloudDriftProxy.b),
          },
          0,
        );

        // THE camera zoom into the bottle.
        tl.to(
          world,
          {
            scale: () => fresh().zoomTo,
            rotationY: () => fresh().rotateY,
            rotation: () => fresh().tilt,
            duration: exitWin.end - exitWin.start,
            ease: "power2.in",
          },
          exitWin.start,
        );

        // ── HERO → EGYPT BRIDGE (same pinned lens, same single bottle) ──────
        // Runs in [0.92, 1.5] on the SAME timeline, so scroll speed is steady
        // and there is never a second loop or a second pin.
        const br = tlWin.bridge;
        const pose = () =>
          egyptConfig.travel[mobileRef.current ? "mobile" : "desktop"];

        // 1. Un-zoom the camera: `world` returns to identity so the plate and
        //    copy land in undistorted 1:1 screen space. The bottle's travel
        //    wrapper compensates scale 1→zoomTo across the SAME window, so its
        //    on-screen size is continuous (world.scale × pixlr.scale ≈ const).
        tl.to(
          world,
          {
            scale: 1,
            rotation: 0,
            rotationY: 0,
            duration: br.worldReset.end - br.worldReset.start,
          },
          br.worldReset.start,
        );
        tl.to(
          pixlrTravelRef.current,
          {
            scale: () => fresh().zoomTo,
            duration: br.worldReset.end - br.worldReset.start,
          },
          br.worldReset.start,
        );

        // 2. Clear the hero's overlays + artwork so the plate + copy read.
        tl.to(
          overlayRef.current,
          { opacity: 0, duration: br.overlayFade.end - br.overlayFade.start },
          br.overlayFade.start,
        );
        tl.to(
          bottleRef.current,
          { opacity: 0, duration: br.artworkFade.end - br.artworkFade.start },
          br.artworkFade.start,
        );

        // 3. Fade the regraded Egypt plate in under the top melt.
        tl.to(
          egyptRef.current,
          { opacity: 1, duration: br.egyptFade.end - br.egyptFade.start },
          br.egyptFade.start,
        );

        // 4. The ONE bottle travels: slides down onto the platform, shrinks to
        //    the settled size, leans then rights itself — never over the copy.
        const travelDur = br.bottleTravel.end - br.bottleTravel.start;
        tl.to(
          pixlrAnchorRef.current,
          { top: () => `${pose().toTop}%`, duration: travelDur },
          br.bottleTravel.start,
        );
        tl.to(
          pixlrTravelRef.current,
          { scale: () => pose().scaleTo, duration: travelDur },
          br.bottleTravel.start,
        );
        tl.to(
          pixlrTravelRef.current,
          { rotation: () => egyptConfig.rotateFrom, duration: travelDur * 0.4 },
          br.bottleTravel.start,
        );
        tl.to(
          pixlrTravelRef.current,
          { rotation: 0, duration: travelDur * 0.6 },
          br.bottleTravel.start + travelDur * 0.4,
        );
        tl.to(
          pixlrShadowRef.current,
          { opacity: () => egyptConfig.shadow.maxOpacity, duration: travelDur },
          br.bottleTravel.start,
        );

        // 5. Reveal the Egypt copy last (headline → rule → body → CTA stagger).
        //    `autoAlpha` (opacity + visibility) so the invisible CTA is not
        //    clickable while the hero is on screen.
        tl.to(
          egyptCopyRef.current,
          { autoAlpha: 1, duration: 0.1 },
          br.copyIn.start,
        );
        tl.to(
          egyptItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: br.copyIn.end - br.copyIn.start,
            stagger: 0.09,
            ease: "power2.out",
          },
          br.copyIn.start,
        );

        return () => {
          tlRef.current = null;
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    // Intentionally NO `[frame]`: rebuild-free by construction (see above).
    [],
  );

  // Frame effect: swap motion values, reset the initial layer state, and
  // re-measure the existing pin — never rebuild it. Skipped for the FIRST
  // client render (the timeline was just built with those same values; a
  // refresh here would race the trigger's own creation refresh).
  useEffect(() => {
    motionRef.current = frame.motion;
    pixlrRef.current = frame.pixlr;
    mobileRef.current = frame.isMobile;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (frame.isReduced) return;
    gsap.set(skyRef.current, { scale: frame.motion.skyScaleFrom });
    gsap.set(bottleRef.current, { scale: frame.motion.bottleScaleFrom });
    gsap.set(pixlrAnchorRef.current, { top: `${frame.pixlr.centerY}%` });
    tlRef.current?.invalidate();
    ScrollTrigger.refresh();
  }, [frame]);

  return {
    stageRef,
    lensRef,
    worldRef,
    skyRef,
    bottleRef,
    cloudsRef,
    copyRef,
    pixlrAnchorRef,
    pixlrTravelRef,
    pixlrShadowRef,
    egyptRef,
    egyptCopyRef,
    overlayRef,
  };
}