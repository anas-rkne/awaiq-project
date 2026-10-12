"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  heroSceneConfig,
  egyptConfig,
  babylonConfig,
  greeceConfig,
  chinaConfig,
} from "@/config/site";
import { useHeroResponsive } from "@/hooks/useHeroResponsive";
import type { HeroCloudsHandle } from "@/components/home/Hero/HeroClouds";
import type { HeroMistHandle } from "@/components/home/Hero/HeroMist";
import type { HandsSceneHandle } from "@/components/home/Hands/handsScene";
import type { HeroFrame } from "@/hooks/useHeroResponsive";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Window {
  start: number;
  end: number;
}

interface BridgeWindows {
  fade: Window;
  bottleUp: Window;
  bottleDown: Window;
  worldSweepIn: Window;
  worldSweepOut: Window;
  reveal: Window;
  mist: Window;
}

interface BridgePose {
  toTop: number;
  scaleTo: number;
}

interface BridgeMotion {
  hop: { readonly desktop: BridgePose; readonly mobile: BridgePose };
  travel: { readonly desktop: BridgePose; readonly mobile: BridgePose };
}

type Ref<T> = React.RefObject<T | null>;

/**
 * The hero→Egypt exit as a GSAP ScrollTrigger IMAGE ZOOM — pin + scrub, the
 * professional pattern for scroll-linked camera moves (gsap-scroll-motion
 * skill). One timeline is the single source of truth:
 *
 * [0─ copy fade ─ exit zoom ─ 0.92 ─ Egypt in ─ 1.72 ─ Babylon in ─ 2.52
 *                                   ─ Greece in ─ 3.32 ─ China in ─ 4.12
 *                                   ─ China+HANDS swap ─ hold ─ 4.5]
 *
 * - The lens (perspective holder) is pinned for the whole stage (derived by
 *   `heroStageHeight`) — hero, Egypt, Babylon, Greece AND China in ONE pin.
 * - The world draws `transformOrigin` at the frame's bottle focal point, then
 *   the camera pushes IN gently: a small scale, scrubbed by scroll (no
 *   rotation/tilt — the scene never twists).
 * - The hero→Egypt bridge ([0.92, 1.72]) is the SAME 0.8 block as every
 *   section→section one: it fades the hero artwork/tint, raises the Egypt plate
 *   from the bottom edge like a curtain, and sends the ONE bottle on the same
 *   arc — up to the fog, down onto the platform. No second pin, no second
 *   element, no cut.
 * - Every SECTION → SECTION handoff (Egypt→Babylon→Greece→China) is driven by
 *   ONE reusable builder (`addBridge`): the exact same motion for every
 *   civilization, only shifted in time — the user's consistency rule. The
 *   bottle flies a long arc over the open sky, the next plate rises as a
 *   curtain under its descent, a mist bank peaks with altitude, the contact
 *   shadow dissolves on lift and re-blooms on landing, and a camera sweep
 *   keeps the shot alive.
 * - Per-layer parallax (sky/clouds/bottle) is scrubbed in the same timeline,
 *   never in a second rAF loop.
 *
 * RESPONSIVE REBUILD-FREE BY CONSTRUCTION:
 * The ScrollTrigger (and its pin-spacer) is created exactly ONCE — it must
 * never be torn down and re-created on a breakpoint flip. So `[frame]` is
 * deliberately NOT a useGSAP dependency. Frame changes only swap `motionRef`
 * (function-based timeline values re-compile via `invalidate()`) and call
 * `ScrollTrigger.refresh()`.
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
  /** Babylon half (the THIRD plate): its copy reveal + the Egypt exit that
   *  hands off to it. */
  const babylonRef = useRef<HTMLDivElement | null>(null);
  const babylonCopyRef = useRef<HTMLDivElement | null>(null);
  /** Greece half (the FOURTH plate) and China half (the FIFTH) — the journey
   *  continues with the SAME bridge motion, one plate + one copy per civ. */
  const greeceRef = useRef<HTMLDivElement | null>(null);
  const greeceCopyRef = useRef<HTMLDivElement | null>(null);
  const chinaRef = useRef<HTMLDivElement | null>(null);
  const chinaCopyRef = useRef<HTMLDivElement | null>(null);
  /** Story emblems — one per civilization, on the side OPPOSITE its copy.
   *  All four are identical (Lamassu + motif); the timeline reveals each in
   *  sync with its own copy (fade + scale). */
  const egyptEmblemRef = useRef<HTMLDivElement | null>(null);
  const babylonEmblemRef = useRef<HTMLDivElement | null>(null);
  const greeceEmblemRef = useRef<HTMLDivElement | null>(null);
  const chinaEmblemRef = useRef<HTMLDivElement | null>(null);
  /** The HANDS finale overlay inside the pinned lens — hidden until the
   *  `hands` window, when it fades in over the clouds and its WebGL activates.
   *  The finale product is the bottle INSIDE that WebGL scene (so the hands can
   *  occlude it) — there is no separate DOM product layer any more. */
  const handsStageRef = useRef<HTMLDivElement | null>(null);
  /** The hands WebGL scene handle — drives the scroll-scrubbed camera dolly. */
  const handsHandleRef = useRef<HandsSceneHandle | null>(null);
  /** The finale's closing line — revealed over the hands once they settle. */
  const handsCopyRef = useRef<HTMLDivElement | null>(null);
  /** Mist-wall canvas handle: every section→section swap passes through one
   *  bank of fog driven by the same timeline. */
  const mistRef = useRef<HeroMistHandle | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  /** Wrapper around the radar halo. The rings accompany the bottle through the
   *  whole journey, then this fades out at the China handoff — the halo never
   *  reaches the hands finale. */
  const radarRef = useRef<HTMLDivElement | null>(null);

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
        gsap.set(egyptRef.current, { y: 0, yPercent: 100 });
        // Babylon/Greece/China halves stay hidden in reduced motion.
        gsap.set(babylonRef.current, { y: 0, yPercent: 100 });
        gsap.set(greeceRef.current, { y: 0, yPercent: 100 });
        gsap.set(chinaRef.current, { y: 0, yPercent: 100 });
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
        const mode = (): "mobile" | "desktop" =>
          mobileRef.current ? "mobile" : "desktop";
        const itemsOf = (ref: Ref<HTMLDivElement>) =>
          ref.current
            ? gsap.utils.toArray<HTMLElement>(ref.current.children)
            : [];
        const egyptItems = itemsOf(egyptCopyRef);
        const babylonItems = itemsOf(babylonCopyRef);
        const greeceItems = itemsOf(greeceCopyRef);
        const chinaItems = itemsOf(chinaCopyRef);

        // Size each emblem's box to the footprint of the copy on the opposite
        // side (heading + body + CTA). The copy is a full-height centered
        // column, so its CONTENT extent is first-child-top → last-child-bottom,
        // published as `--emblem-h` on the emblem layer.
        const emblemPairs = [
          [egyptCopyRef, egyptEmblemRef],
          [babylonCopyRef, babylonEmblemRef],
          [greeceCopyRef, greeceEmblemRef],
          [chinaCopyRef, chinaEmblemRef],
        ] as const;
        const syncEmblemHeights = () => {
          for (const [copyR, emblemR] of emblemPairs) {
            const copy = copyR.current;
            const emblem = emblemR.current;
            if (!copy || !emblem) continue;
            const kids = gsap.utils.toArray<HTMLElement>(copy.children);
            if (!kids.length) continue;
            const top = kids[0].getBoundingClientRect().top;
            const bottom = kids[kids.length - 1].getBoundingClientRect().bottom;
            emblem.style.setProperty("--emblem-h", `${Math.round(bottom - top)}px`);
          }
        };
        syncEmblemHeights();
        window.addEventListener("resize", syncEmblemHeights);
        if (document.fonts) void document.fonts.ready.then(syncEmblemHeights);
        // Webfont swap re-wraps the copy a beat after first paint; observe the
        // copy's children so the emblem box is re-measured the moment any line
        // re-flows (and never lags the text).
        const emblemRO = new ResizeObserver(() => syncEmblemHeights());
        for (const [copyR] of emblemPairs) {
          const copy = copyR.current;
          if (copy) for (const kid of Array.from(copy.children)) emblemRO.observe(kid);
        }

        // Initial frame — set, not from-to, so state is declarative and scrub
        // never animates from an undefined start. (will-change is owned by the
        // CSS classes on sky/bottle/world, not duplicated inline here.)
        gsap.set(skyRef.current, { scale: motionRef.current.skyScaleFrom });
        gsap.set(bottleRef.current, { scale: motionRef.current.bottleScaleFrom });
        gsap.set(copy, { opacity: 1, y: 0 });
        // Egypt half initial state (declarative — no from-to surprises).
        gsap.set(pixlrTravelRef.current, { scale: 1, rotation: 0 });
        gsap.set(pixlrShadowRef.current, { opacity: 0 });
        // Every plate starts ONE SCREEN BELOW (offscreen) and RISES like a
        // curtain in its bridge — a slide, not a crossfade.
        gsap.set(egyptRef.current, { y: 0, yPercent: 100 });
        gsap.set(egyptCopyRef.current, { autoAlpha: 0 });
        gsap.set(egyptItems, { autoAlpha: 0, y: 30 });
        gsap.set(egyptEmblemRef.current, { autoAlpha: 0, scale: 0.92 });
        gsap.set(babylonRef.current, { y: 0, yPercent: 100 });
        gsap.set(babylonCopyRef.current, { autoAlpha: 0 });
        gsap.set(babylonItems, { autoAlpha: 0, y: 30 });
        gsap.set(babylonEmblemRef.current, { autoAlpha: 0, scale: 0.92 });
        gsap.set(greeceRef.current, { y: 0, yPercent: 100 });
        gsap.set(greeceCopyRef.current, { autoAlpha: 0 });
        gsap.set(greeceItems, { autoAlpha: 0, y: 30 });
        gsap.set(greeceEmblemRef.current, { autoAlpha: 0, scale: 0.92 });
        gsap.set(chinaRef.current, { y: 0, yPercent: 100 });
        gsap.set(chinaCopyRef.current, { autoAlpha: 0 });
        gsap.set(chinaItems, { autoAlpha: 0, y: 30 });
        gsap.set(chinaEmblemRef.current, { autoAlpha: 0, scale: 0.92 });
        gsap.set(radarRef.current, { autoAlpha: 1 });
        gsap.set(handsStageRef.current, { autoAlpha: 0 });
        gsap.set(handsCopyRef.current, { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${stage.offsetHeight - window.innerHeight}`,
            scrub: 1,
            // Pin the LENS (the svh camera), never the stage: the STAGE height
            // is React-owned and drives document flow, while pinning the stage
            // makes GSAP px-capture its height at build time. The lens height
            // never feeds back into flow, so its pin is inert even on refresh.
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
        // re-compiles them on the SAME timeline via tl.invalidate().
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
        // value is pushed into the WebGL shader.
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

        // THE camera zoom into the bottle (reduced — a gentle push, NO twist).
        tl.to(
          world,
          {
            scale: () => fresh().zoomTo,
            duration: exitWin.end - exitWin.start,
            ease: "power2.in",
          },
          exitWin.start,
        );

        // The bottle SHRINKS on its own axis across the SAME window.
        tl.to(
          pixlrTravelRef.current,
          {
            scale: () => fresh().exitBottleScale,
            duration: exitWin.end - exitWin.start,
            ease: "power2.in",
          },
          exitWin.start,
        );

        // ── BRIDGES: hero→Egypt and Egypt→…→China (ONE builder) ─────────────
        // The hero→Egypt handoff is NO LONGER bespoke: it is driven by the SAME
        // `addBridge` builder as every section→section handoff (see the call
        // right after the builder is defined below). One code path, one feel —
        // and because every block is the SAME 0.8 length and contiguous, the
        // scroll gap between ANY two sections (hero→Egypt included) is equal.
        // Egypt→Babylon→Greece→China all use the EXACT same motion; each call
        // only shifts the windows in time and swaps the plate/copy refs. This
        // is the consistency rule enforced in code: one code path, one feel.

        // A mist pass: a fresh 0→1 proxy per pass (the shader derives the
        // bell-shaped intensity from it), so passes on the same canvas can
        // never contaminate each other and the bank clears at both ends.
        const addMistPass = (w: Window) => {
          const proxy = { p: 0 };
          tl.fromTo(
            proxy,
            { p: 0 },
            {
              p: 1,
              duration: w.end - w.start,
              ease: "none",
              immediateRender: false,
              onUpdate: () => mistRef.current?.setProgress(proxy.p),
            },
            w.start,
          );
        };

        const addBridge = (
          w: BridgeWindows,
          from: { plate: Ref<HTMLDivElement> },
          to: {
            plate: Ref<HTMLDivElement>;
            copy: Ref<HTMLDivElement>;
            emblem: Ref<HTMLDivElement>;
            items: HTMLElement[];
            hop: () => BridgePose;
            travel: () => BridgePose;
            rotateFrom: number;
            shadowMax: number;
          },
        ) => {
          // 1. Current background disappears IMMEDIATELY. (The outgoing copy is
          //    already gone — it cleared at its own landing — nothing to fade.)
          tl.to(
            from.plate.current,
            {
              autoAlpha: 0,
              duration: w.fade.end - w.fade.start,
              ease: "power1.inOut",
            },
            w.fade.start,
          );

          // 2. Next plate RISES from the bottom edge — the SAME curtain reveal.
          tl.to(
            to.plate.current,
            {
              yPercent: 0,
              duration: w.reveal.end - w.reveal.start,
              ease: "power2.inOut",
            },
            w.reveal.start,
          );

          // 3. Neutral mist bank across the flight/landing.
          addMistPass(w.mist);

          // 3b. Camera sweep: lean in during the flight, settle on land.
          tl.to(
            world,
            {
              scale: 1.06,
              duration: w.worldSweepIn.end - w.worldSweepIn.start,
              ease: "power1.in",
            },
            w.worldSweepIn.start,
          );
          tl.to(
            world,
            {
              scale: 1,
              duration: w.worldSweepOut.end - w.worldSweepOut.start,
              ease: "power1.out",
            },
            w.worldSweepOut.start,
          );

          // 4. The ONE bottle FLIES: lifts to the apex, then lands — windows
          //    ADJACENT at the apex and an EXPLICIT fromTo on landing, so
          //    scrubbing up replays a smooth arc with NO jump.
          const apexTop = () => `${to.hop().toTop}%`;
          const apexScale = () => to.hop().scaleTo;
          const apexRot = () => to.rotateFrom;
          const upDur = w.bottleUp.end - w.bottleUp.start;
          const downDur = w.bottleDown.end - w.bottleDown.start;
          const upAt = w.bottleUp.start;
          tl.to(
            pixlrAnchorRef.current,
            { top: apexTop, duration: upDur, ease: "power1.inOut" },
            upAt,
          );
          tl.to(
            pixlrTravelRef.current,
            { scale: apexScale, duration: upDur, ease: "power1.inOut" },
            upAt,
          );
          tl.to(
            pixlrTravelRef.current,
            { rotation: apexRot, duration: upDur, ease: "power1.inOut" },
            upAt,
          );
          const downAt = w.bottleDown.start;
          tl.fromTo(
            pixlrAnchorRef.current,
            { top: apexTop },
            {
              top: () => `${to.travel().toTop}%`,
              duration: downDur,
              ease: "power1.inOut",
              immediateRender: false,
            },
            downAt,
          );
          tl.fromTo(
            pixlrTravelRef.current,
            { scale: apexScale },
            {
              scale: () => to.travel().scaleTo,
              duration: downDur,
              ease: "power1.inOut",
              immediateRender: false,
            },
            downAt,
          );
          tl.fromTo(
            pixlrTravelRef.current,
            { rotation: apexRot },
            { rotation: 0, duration: downDur, ease: "power1.inOut", immediateRender: false },
            downAt,
          );

          // Contact shadow = ground owner: dissolves on lift, re-blooms on land.
          tl.to(
            pixlrShadowRef.current,
            { opacity: 0, duration: upDur, ease: "power1.inOut" },
            upAt,
          );
          tl.to(
            pixlrShadowRef.current,
            { opacity: to.shadowMax, duration: downDur, ease: "power1.inOut" },
            downAt,
          );

          // 5. The next section's copy is NARRATED DURING THE FLIGHT: it flies
          //    in as the bottle launches toward this section (alone in the air)
          //    and is gone the instant the bottle LANDS — the text lives only in
          //    the "extra distance" of the transition, on the side of the screen.
          const stagger = 0.08;
          const inDur = Math.max(
            0.05,
            upDur * 0.9 - stagger * Math.max(0, to.items.length - 1),
          );
          tl.fromTo(
            to.copy.current,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: upDur * 0.9, ease: "power2.out" },
            upAt,
          );
          tl.fromTo(
            to.items,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: inDur,
              stagger,
              ease: "power2.out",
            },
            upAt,
          );
          //    It is FULL by the apex and clears the moment the DESCENT begins
          //    (option أ): gone a beat into the landing, never shown at rest.
          const outDur = Math.min(0.1, downDur * 0.5);
          tl.to(
            to.copy.current,
            { autoAlpha: 0, y: -20, duration: outDur, ease: "power2.in" },
            downAt,
          );

          // 5b. The story emblem narrates WITH the copy — the same side-agnostic
          //     motif (Lamassu + svg_bg) rises on the OPPOSITE side of the
          //     screen, fading + scaling in as the bottle flies and clearing the
          //     instant it lands. Desktop only (the element is `hidden lg:block`).
          tl.fromTo(
            to.emblem.current,
            { autoAlpha: 0, scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: upDur * 0.9, ease: "power2.out" },
            upAt,
          );
          tl.to(
            to.emblem.current,
            { autoAlpha: 0, scale: 0.96, duration: outDur, ease: "power2.in" },
            downAt,
          );
        };

        const hopOf = (cfg: BridgeMotion) => () => cfg.hop[mode()];
        const travelOf = (cfg: BridgeMotion) => () => cfg.travel[mode()];

        // Hero → Egypt — the EXACT same block as every section→section bridge.
        // The hero artwork is this block's "current background" (it fades like
        // any section's plate) and the hero tint fades with it; the world
        // un-zooms through the SAME camera sweep (its scale simply starts at
        // `zoomTo`), then the bottle flies the SAME arc and Egypt's copy is
        // narrated the SAME way. Nothing bespoke remains.
        tl.to(
          overlayRef.current,
          {
            opacity: 0,
            duration:
              tlWin.bridge.overlayFade.end - tlWin.bridge.overlayFade.start,
          },
          tlWin.bridge.overlayFade.start,
        );
        addBridge(tlWin.bridge, { plate: bottleRef }, {
          plate: egyptRef,
          copy: egyptCopyRef,
          emblem: egyptEmblemRef,
          items: egyptItems,
          hop: hopOf(egyptConfig),
          travel: travelOf(egyptConfig),
          rotateFrom: egyptConfig.rotateFrom,
          shadowMax: egyptConfig.shadow.maxOpacity,
        });

        // Egypt → Babylon.
        addBridge(
          tlWin.babylonBridge,
          { plate: egyptRef },
          {
            plate: babylonRef,
            copy: babylonCopyRef,
            emblem: babylonEmblemRef,
            items: babylonItems,
            hop: hopOf(babylonConfig),
            travel: travelOf(babylonConfig),
            rotateFrom: babylonConfig.rotateFrom,
            shadowMax: babylonConfig.shadow.maxOpacity,
          },
        );

        // Babylon → Greece (exact clone).
        addBridge(
          tlWin.greeceBridge,
          { plate: babylonRef },
          {
            plate: greeceRef,
            copy: greeceCopyRef,
            emblem: greeceEmblemRef,
            items: greeceItems,
            hop: hopOf(greeceConfig),
            travel: travelOf(greeceConfig),
            rotateFrom: greeceConfig.rotateFrom,
            shadowMax: greeceConfig.shadow.maxOpacity,
          },
        );

        // Greece → China (exact clone).
        addBridge(
          tlWin.chinaBridge,
          { plate: greeceRef },
          {
            plate: chinaRef,
            copy: chinaCopyRef,
            emblem: chinaEmblemRef,
            items: chinaItems,
            hop: hopOf(chinaConfig),
            travel: travelOf(chinaConfig),
            rotateFrom: chinaConfig.rotateFrom,
            shadowMax: chinaConfig.shadow.maxOpacity,
          },
        );

        // ── CHINA → FINAL DISSOLVE ──────────────────────────────────────────
        // After the bottle has settled, continued scroll dissolves the last
        // section through a second mist pass: the plate fades out smoothly and
        // the copy clears last — the journey sinks into the clouds and the
        // bottle stays as the one constant. The mist clears at both ends, so
        // the handoff is seamless and reverses cleanly on scroll-back.
        const out = tlWin.chinaOut;
        tl.to(
          chinaRef.current,
          {
            autoAlpha: 0,
            duration: out.plateFade.end - out.plateFade.start,
            ease: "power1.inOut",
          },
          out.plateFade.start,
        );
        tl.to(
          chinaCopyRef.current,
          {
            autoAlpha: 0,
            duration: out.copyFade.end - out.copyFade.start,
            ease: "power1.inOut",
          },
          out.copyFade.start,
        );
        // The radar halo leaves with the China plate: the rings accompany the
        // bottle only UP TO China, then clear before the hands finale — so the
        // finale never shows the circles (and the seamless cross-fade into the
        // 3D scene is clean).
        tl.to(
          radarRef.current,
          {
            autoAlpha: 0,
            duration: out.plateFade.end - out.plateFade.start,
            ease: "power1.inOut",
          },
          out.plateFade.start,
        );
        addMistPass(out.mist);

        // ── CHINA → HANDS FINALE (same pin) ─────────────────────────────────
        // The traveling product fades out the instant it lands (4.12) while the
        // hands canvas — which carries the bottle INSIDE its own WebGL scene,
        // so the hands genuinely occlude it — fades in over the same window and
        // activates. The story closes on the one constant: the bottle, held
        // between the hands.
        const handWin = tlWin.hands;
        tl.to(
          handsStageRef.current,
          {
            autoAlpha: 1,
            duration: handWin.in.end - handWin.in.start,
            ease: "power2.inOut",
            onStart: () => {
              const el = handsStageRef.current;
              if (el) el.dataset.handsActive = "1";
              // Open at the slightly pulled-back entrance; the pull-back window
              // below pushes in to the close inspection view.
              handsHandleRef.current?.setBaseZoom(1.3);
            },
          },
          handWin.in.start,
        );

        // The scroll-scrubbed camera dolly. Forward (scroll down) pushes the
        // camera IN to the close view (1.3 → 1.0); reversed (scroll up) it
        // PULLS BACK a little (1.0 → 1.3) — the "inspect" beat before the
        // handoff, so the section no longer vanishes the instant you scroll.
        const pullback = handWin.pullback;
        const zoomProxy = { z: 1.3 };
        tl.to(
          zoomProxy,
          {
            z: 1.0,
            duration: pullback.end - pullback.start,
            ease: "none",
            onUpdate: () => handsHandleRef.current?.setBaseZoom(zoomProxy.z),
          },
          pullback.start,
        );

        const handoffDur = handWin.bottleHandoff.end - handWin.bottleHandoff.start;
        tl.to(
          pixlrAnchorRef.current,
          { autoAlpha: 0, duration: handoffDur, ease: "power1.in" },
          handWin.bottleHandoff.start,
        );

        // The finale's closing line rises in once the scene has settled (the
        // product has descended into the gap between the hands) and holds to
        // the end of the pin.
        tl.to(
          handsCopyRef.current,
          { autoAlpha: 1, y: 0, duration: 0.18, ease: "power1.out" },
          handWin.product.end,
        );

        return () => {
          window.removeEventListener("resize", syncEmblemHeights);
          emblemRO.disconnect();
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
    babylonRef,
    babylonCopyRef,
    greeceRef,
    greeceCopyRef,
    chinaRef,
    chinaCopyRef,
    egyptEmblemRef,
    babylonEmblemRef,
    greeceEmblemRef,
    chinaEmblemRef,
    mistRef,
    overlayRef,
    radarRef,
    handsStageRef,
    handsHandleRef,
    handsCopyRef,
  };
}
