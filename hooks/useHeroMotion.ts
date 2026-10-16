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

export function useHeroMotion() {
  const stageRef = useRef<HTMLElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLDivElement | null>(null);
  const bottleRef = useRef<HTMLDivElement | null>(null);
  const cloudsRef = useRef<HeroCloudsHandle | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);

  const pixlrAnchorRef = useRef<HTMLDivElement | null>(null);
  const pixlrTravelRef = useRef<HTMLDivElement | null>(null);
  const pixlrShadowRef = useRef<HTMLDivElement | null>(null);

  const egyptRef = useRef<HTMLDivElement | null>(null);
  const egyptPedestalRef = useRef<HTMLImageElement | null>(null);
  const egyptCheetahRef = useRef<HTMLImageElement | null>(null);
  const egyptCopyRef = useRef<HTMLDivElement | null>(null);

  const babylonRef = useRef<HTMLDivElement | null>(null);
  const babylonPedestalRef = useRef<HTMLImageElement | null>(null);
  const babylonCheetahRef = useRef<HTMLImageElement | null>(null);
  const babylonCopyRef = useRef<HTMLDivElement | null>(null);

  const greeceRef = useRef<HTMLDivElement | null>(null);
  const greecePedestalRef = useRef<HTMLImageElement | null>(null);
  const greeceCheetahRef = useRef<HTMLImageElement | null>(null);
  const greeceCopyRef = useRef<HTMLDivElement | null>(null);

  const chinaRef = useRef<HTMLDivElement | null>(null);
  const chinaPedestalRef = useRef<HTMLImageElement | null>(null);
  const chinaCheetahRef = useRef<HTMLImageElement | null>(null);
  const chinaCopyRef = useRef<HTMLDivElement | null>(null);

  const handsStageRef = useRef<HTMLDivElement | null>(null);
  const handsHandleRef = useRef<HandsSceneHandle | null>(null);
  const handsCopyRef = useRef<HTMLDivElement | null>(null);

  const mistRef = useRef<HeroMistHandle | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
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

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(copyRef.current, { opacity: 1, y: 0 });
        gsap.set(worldRef.current, { scale: 1, rotation: 0, rotateY: 0 });
        gsap.set(pixlrTravelRef.current, { scale: 1, rotation: 0 });
        gsap.set(egyptRef.current, { y: 0, yPercent: 100 });
        gsap.set(babylonRef.current, { y: 0, yPercent: 100 });
        gsap.set(greeceRef.current, { y: 0, yPercent: 100 });
        gsap.set(chinaRef.current, { y: 0, yPercent: 100 });
      });

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

        gsap.set(skyRef.current, { scale: motionRef.current.skyScaleFrom });
        gsap.set(bottleRef.current, { scale: motionRef.current.bottleScaleFrom });
        gsap.set(copy, { opacity: 1, y: 0 });
        gsap.set(pixlrTravelRef.current, { scale: 1, rotation: 0 });
        gsap.set(pixlrShadowRef.current, { opacity: 0 });

        gsap.set(egyptRef.current, { y: 0, yPercent: 100 });
        gsap.set(egyptPedestalRef.current, { autoAlpha: 0 });
        gsap.set(egyptCheetahRef.current, { autoAlpha: 0 });
        gsap.set(egyptCopyRef.current, { autoAlpha: 0 });
        gsap.set(egyptItems, { autoAlpha: 0, y: 30 });

        gsap.set(babylonRef.current, { y: 0, yPercent: 100 });
        gsap.set(babylonPedestalRef.current, { autoAlpha: 0 });
        gsap.set(babylonCheetahRef.current, { autoAlpha: 0 });
        gsap.set(babylonCopyRef.current, { autoAlpha: 0 });
        gsap.set(babylonItems, { autoAlpha: 0, y: 30 });

        gsap.set(greeceRef.current, { y: 0, yPercent: 100 });
        gsap.set(greecePedestalRef.current, { autoAlpha: 0 });
        gsap.set(greeceCheetahRef.current, { autoAlpha: 0 });
        gsap.set(greeceCopyRef.current, { autoAlpha: 0 });
        gsap.set(greeceItems, { autoAlpha: 0, y: 30 });

        gsap.set(chinaRef.current, { y: 0, yPercent: 100 });
        gsap.set(chinaPedestalRef.current, { autoAlpha: 0 });
        gsap.set(chinaCheetahRef.current, { autoAlpha: 0 });
        gsap.set(chinaCopyRef.current, { autoAlpha: 0 });
        gsap.set(chinaItems, { autoAlpha: 0, y: 30 });

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
            pin: lens,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tlRef.current = tl;

        tl.to(
          copy,
          { opacity: 0, y: -72, duration: copyFadeEnd - copyFadeStart },
          copyFadeStart,
        );

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

        tl.to(
          world,
          {
            scale: () => fresh().zoomTo,
            duration: exitWin.end - exitWin.start,
            ease: "power2.in",
          },
          exitWin.start,
        );

        tl.to(
          pixlrTravelRef.current,
          {
            scale: () => fresh().exitBottleScale,
            duration: exitWin.end - exitWin.start,
            ease: "power2.in",
          },
          exitWin.start,
        );

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
            items: HTMLElement[];
            hop: () => BridgePose;
            travel: () => BridgePose;
            rotateFrom: number;
            shadowMax: number;
          },
        ) => {
          tl.to(
            from.plate.current,
            {
              autoAlpha: 0,
              duration: w.fade.end - w.fade.start,
              ease: "power1.inOut",
            },
            w.fade.start,
          );

          tl.to(
            to.plate.current,
            {
              yPercent: 0,
              duration: w.reveal.end - w.reveal.start,
              ease: "power2.inOut",
            },
            w.reveal.start,
          );

          addMistPass(w.mist);

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
          const outDur = Math.min(0.1, downDur * 0.5);
          tl.to(
            to.copy.current,
            { autoAlpha: 0, y: -20, duration: outDur, ease: "power2.in" },
            downAt,
          );
        };

        const hopOf = (cfg: BridgeMotion) => () => cfg.hop[mode()];
        const travelOf = (cfg: BridgeMotion) => () => cfg.travel[mode()];

        const narratePedestal = (
          w: BridgeWindows,
          ref: Ref<HTMLImageElement>,
        ) => {
          tl.to(
            ref.current,
            {
              autoAlpha: 1,
              duration: w.bottleUp.end - w.bottleUp.start,
              ease: "power2.out",
            },
            w.bottleUp.start,
          );
          tl.to(
            ref.current,
            {
              autoAlpha: 0,
              duration: Math.min(
                0.1,
                (w.bottleDown.end - w.bottleDown.start) * 0.5,
              ),
              ease: "power2.in",
            },
            w.bottleDown.start,
          );
        };

        const narrateCheetah = (
          w: BridgeWindows,
          ref: Ref<HTMLImageElement>,
        ) => {
          tl.to(
            ref.current,
            {
              autoAlpha: 1,
              duration: w.bottleUp.end - w.bottleUp.start,
              ease: "power2.out",
            },
            w.bottleUp.start,
          );
          tl.to(
            ref.current,
            {
              autoAlpha: 0,
              duration: Math.min(
                0.1,
                (w.bottleDown.end - w.bottleDown.start) * 0.5,
              ),
              ease: "power2.in",
            },
            w.bottleDown.start,
          );
        };

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
          items: egyptItems,
          hop: hopOf(egyptConfig),
          travel: travelOf(egyptConfig),
          rotateFrom: egyptConfig.rotateFrom,
          shadowMax: egyptConfig.shadow.maxOpacity,
        });
        narratePedestal(tlWin.bridge, egyptPedestalRef);
        narrateCheetah(tlWin.bridge, egyptCheetahRef);

        addBridge(
          tlWin.babylonBridge,
          { plate: egyptRef },
          {
            plate: babylonRef,
            copy: babylonCopyRef,
            items: babylonItems,
            hop: hopOf(babylonConfig),
            travel: travelOf(babylonConfig),
            rotateFrom: babylonConfig.rotateFrom,
            shadowMax: babylonConfig.shadow.maxOpacity,
          },
        );
        narratePedestal(tlWin.babylonBridge, babylonPedestalRef);
        narrateCheetah(tlWin.babylonBridge, babylonCheetahRef);

        addBridge(
          tlWin.greeceBridge,
          { plate: babylonRef },
          {
            plate: greeceRef,
            copy: greeceCopyRef,
            items: greeceItems,
            hop: hopOf(greeceConfig),
            travel: travelOf(greeceConfig),
            rotateFrom: greeceConfig.rotateFrom,
            shadowMax: greeceConfig.shadow.maxOpacity,
          },
        );
        narratePedestal(tlWin.greeceBridge, greecePedestalRef);
        narrateCheetah(tlWin.greeceBridge, greeceCheetahRef);

        addBridge(
          tlWin.chinaBridge,
          { plate: greeceRef },
          {
            plate: chinaRef,
            copy: chinaCopyRef,
            items: chinaItems,
            hop: hopOf(chinaConfig),
            travel: travelOf(chinaConfig),
            rotateFrom: chinaConfig.rotateFrom,
            shadowMax: chinaConfig.shadow.maxOpacity,
          },
        );
        narratePedestal(tlWin.chinaBridge, chinaPedestalRef);
        narrateCheetah(tlWin.chinaBridge, chinaCheetahRef);

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
              handsHandleRef.current?.setBaseZoom(1.3);
            },
          },
          handWin.in.start,
        );

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

        tl.to(
          handsCopyRef.current,
          { autoAlpha: 1, y: 0, duration: 0.18, ease: "power1.out" },
          handWin.product.end,
        );

        return () => {
          tlRef.current = null;
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    [],
  );

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
    egyptPedestalRef,
    egyptCheetahRef,
    egyptCopyRef,
    babylonRef,
    babylonPedestalRef,
    babylonCheetahRef,
    babylonCopyRef,
    greeceRef,
    greecePedestalRef,
    greeceCheetahRef,
    greeceCopyRef,
    chinaRef,
    chinaPedestalRef,
    chinaCheetahRef,
    chinaCopyRef,
    mistRef,
    overlayRef,
    radarRef,
    handsStageRef,
    handsHandleRef,
    handsCopyRef,
  };
}