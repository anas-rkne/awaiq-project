"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { heroGateConfig, heroSceneConfig } from "@/config/site";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** The slice of the chapter's progress inside one `heroGateConfig.phases`
 *  window, as 0–1. EVERY beat below is expressed through this, so the story
 *  can never drift out of sync with the chapter's length. */
const span = (progress: number, start: number, end: number) =>
  clamp01((progress - start) / (end - start));

/** About's entrance curve — quick to move, soft to land (`1 - (1-x)²`). */
const settle = (x: number) => 1 - (1 - x) * (1 - x);

/** Symmetric ease for anything that must begin AND end at rest (fades). */
const smooth = (x: number) => x * x * (3 - 2 * x);

/** Share of the exit window during which the LAST word begins to leave, so the
 *  headline clears exactly at the window's end — word after word. */
const WORD_SPREAD = 0.55;
/** The resting art's horizontal drift while it pushes past the camera. */
const HERO_RISE_Y = -6;
/** Tail of the dive over which the gate art is cleared. The doorway covers a
 *  16:9 frame only at ~7.6× (`gate.scaleTo` is sized for a wider one), so the
 *  stone must NOT start leaving before that: up to here it is the only thing
 *  occluding the Egypt plate behind it outside the doorway's own opening. */
const GATE_CLEAR_FROM = 0.9;
/** How far the bottle SINKS (as a share of the viewport height) once the story
 *  owns the stage. On the narrow tiers the bottle is the chapter's companion,
 *  and a scene's copy is one centred block — kicker, headline, verses, CTA —
 *  stacked from the top of the stage: measured, that block reaches ~46% of an
 *  844px phone, i.e. right through the glass when the bottle hangs at the
 *  hero's own 45%. A share of the VIEWPORT (not of the bottle's box) keeps the
 *  drop identical on every tier, and it rides the dive — while the stone still
 *  covers the screen — so the move itself is never seen. */
const BOTTLE_SCENE_SINK = 0.16;
/** Share of a scene window over which its root is faded in. It carries only
 *  the scene's own visibility: every element inside it is either off-screen
 *  or hidden by its own beat, so the step can never be seen. */
const SCENE_IN_SHARE = 0.25;

/** The handles ONE civilization scene needs (`SceneReveal`): its root carries
 *  the scene's visibility, and the rest carry its beats. All four scenes are
 *  painted UNDER the gate, which is why the doorway reveals Egypt as it rises
 *  through them. */
export interface SceneRefs {
  root: RefObject<HTMLDivElement | null>;
  art: RefObject<HTMLImageElement | null>;
  cheta: RefObject<HTMLImageElement | null>;
  copy: RefObject<HTMLDivElement | null>;
  star: RefObject<HTMLSpanElement | null>;
}

export interface HeroGateRefs {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  /** OPTIONAL: the resting stage's own CTA. It is the DESKTOP button — the
   *  narrow tiers hide it through CSS, and the brief's narrow stages carry no
   *  resting button at all — so the beat simply fades a `display:none` element
   *  there. `null` (no page CTA) still skips the beat. */
  ctaRef: RefObject<HTMLAnchorElement | null>;
  riseRef: RefObject<HTMLDivElement | null>;
  zoomRef: RefObject<HTMLImageElement | null>;
  /** The hero incense-sky layer's wrapper (WebGL decoration, `HeroIncense`):
   *  the engine only fades it with the resting art — the shader animates
   *  itself. */
  incenseRef: RefObject<HTMLDivElement | null>;
  /** The hero bottle layer's wrapper (WebGL decoration, `HeroBottle`): on
   *  desktop the engine only fades it with the resting art; on the narrow tiers
   *  it is held visible for the whole chapter (the layer outranks the scenes).
   *  The scene owns its motion and its pointer interaction. */
  bottleRef: RefObject<HTMLDivElement | null>;
  /** The INNER slot of the bottle layer — its own transform, so the engine can
   *  sink the glass into the scene's lower band without ever touching the
   *  wrapper's Tailwind centring transform. */
  bottleSlotRef: RefObject<HTMLDivElement | null>;
  /** One handle set per scene, in `heroGateConfig.scenes` order. */
  sceneRefs: SceneRefs[];
}

interface UseHeroGateOptions {
  /** Build the chapter at all. `false` for `prefers-reduced-motion`: the caller
   *  then renders ONE static screen (and none of the gate/scene layers), so every
   *  ref below is `null` and nothing here runs. */
  enabled: boolean;
  /** Re-splits the headline when the language changes. */
  locale: string;
}

/**
 * The GATE CHAPTER engine — the gate (1) rises in About's pillar language, the
 * camera dives through the doorway, and EGYPT assembles behind the stone
 * (plate, cheta, copy, star) — then BABYLON, GREECE and CHINA do the same, each
 * one entered by diving through the one before it (the sequential dive: the
 * scene on stage pushes past the camera while the next slides into its wake).
 * No WebGL in the engine: every STORY layer is DOM, so the whole chapter is
 * one `drive(progress)` and nothing can drift from the scroll. (The two
 * non-story canvases — the hero's incense sky and the hero's 3D bottle — are
 * autonomous WebGL the engine merely fades in and out; see `incenseRef` and
 * `bottleRef` below. On the narrow tiers the bottle is not faded at all: it is
 * the one object that survives the whole chapter.)
 *
 * Structure, and why:
 * - The chapter's <section> is TALL and holds a CSS `sticky` stage. There is no
 *   GSAP `pin` anywhere: a pin-spacer injected into a React-reconciled subtree
 *   is the bug class documented in `HERO-REDESIGN-PLAN.md` §12. One consequence
 *   is that the pixel length of the chapter lives in `HeroSection`'s Tailwind
 *   classes, while every window here is a FRACTION of the chapter's progress.
 * - ONE `ScrollTrigger` (`top top` → `bottom bottom`, i.e. exactly the sticky
 *   stage's own travel) calls a PURE `drive(progress)`. No `scrub`: Lenis'
 *   `lerp: 0.1` already smooths the scroll position.
 * - TWO elements carry the gate: an outer box that rises about its own foot
 *   (`50% 100%`, yPercent only) and an inner image that zooms about the doorway
 *   (`transform-origin` at `gate.origin`). A single element cannot do both
 *   without one transform dragging the other.
 * - `gsap.matchMedia` swaps only the per-breakpoint magnitudes (`rise.to`,
 *   `scaleTo`); the phase windows are shared, so the story is identical on both.
 * - The scenes share one vocabulary (`heroGateConfig.scene`): the same beats,
 *   the same entrance magnitudes and the same dive-out — which is what makes
 *   four civilizations feel like one continuous chapter instead of four
 *   slideshows. Egypt keeps its own `first` beat layout because it is entered
 *   through the gate's doorway; the other three use `handoff`, whose head band
 *   belongs to the scene leaving.
 *
 * Property ownership (nothing else may touch these):
 *   image → scale, yPercent, autoAlpha     title → skewX (shear only)
 *   words → autoAlpha, yPercent            cta   → autoAlpha, yPercent
 *                                                  (the hero's own CTA is
 *                                                  optional and currently
 *                                                  unbound)
 *   rise  → yPercent, rotation, autoAlpha  zoom  → scale
 *   incense → autoAlpha (fade only — the shader owns everything else)
 *   bottle → autoAlpha (fade on desktop; held at 1 on the narrow tiers, where
 *            the layer outranks the scenes and the bottle is the chapter's
 *            floating constant — the scene owns everything else)
 *   bottleSlot → y (the scene sink — narrow tiers only; see
 *            `BOTTLE_SCENE_SINK`)
 *   scene[i].root  → autoAlpha
 *   scene[i].art   → xPercent (arrival); autoAlpha + scale (its own dive-out)
 *   scene[i].cheta → yPercent (arrival + dive-out), autoAlpha (dive-out)
 *   scene[i].copy  → its `[data-scene-line]` children's autoAlpha + y
 *   scene[i].star  → autoAlpha, scale, rotate
 */
/** One scene's five handles. A hook of its own so the four scenes can be
 *  created without a ref-in-a-loop (each call is unconditional and stable). */
function useSceneRefs(): SceneRefs {
  return {
    root: useRef<HTMLDivElement>(null),
    art: useRef<HTMLImageElement>(null),
    cheta: useRef<HTMLImageElement>(null),
    copy: useRef<HTMLDivElement>(null),
    star: useRef<HTMLSpanElement>(null),
  };
}

export function useHeroGate({ enabled, locale }: UseHeroGateOptions): HeroGateRefs {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const riseRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLImageElement>(null);
  const incenseRef = useRef<HTMLDivElement>(null);
  const bottleRef = useRef<HTMLDivElement>(null);
  const bottleSlotRef = useRef<HTMLDivElement>(null);
  // The four scenes, in `heroGateConfig.scenes` order (Egypt → Babylon →
  // Greece → China) — `HeroSection` renders its `SceneReveal`s from the same
  // array, so index i here always belongs to scenes[i] there.
  const egyptRefs = useSceneRefs();
  const babylonRefs = useSceneRefs();
  const greeceRefs = useSceneRefs();
  const chinaRefs = useSceneRefs();
  const sceneRefs = [egyptRefs, babylonRefs, greeceRefs, chinaRefs];

  useGSAP(
    () => {
      if (!enabled) return;

      const section = sectionRef.current;
      const image = imageRef.current;
      const title = titleRef.current;
      const cta = ctaRef.current;
      const rise = riseRef.current;
      const zoom = zoomRef.current;
      const incense = incenseRef.current;
      const bottle = bottleRef.current;
      const bottleSlot = bottleSlotRef.current;
      if (!section || !image || !title || !rise || !zoom) {
        return;
      }

      const C = heroGateConfig;
      const { phases } = C;
      const E = C.scene.entrance;
      const diveLength = phases.dive.end - phases.dive.start;
      const desktop = heroSceneConfig.breakpoints.desktop;

      const mm = gsap.matchMedia();

      const build = (isMobile: boolean) => {
        // The bottle's scene sink, resolved ONCE per breakpoint/rebuild (never
        // read per frame): a share of the viewport, so the drop looks the same
        // on every tier.
        const sinkPx = window.innerHeight * BOTTLE_SCENE_SINK;
        // Words, never chars — splitting Arabic into characters would tear every
        // connected letter out of its word.
        const split = SplitText.create(title, { type: "words" });
        const words = split.words;

        // The four scenes' parts and their windows. They are optional: a caller
        // that renders the chapter without the reveals (e.g. a future variant)
        // leaves every handle null and the loop below skips it instead of
        // throwing.
        const scenes = C.scenes.map((_, index) => {
          const r = sceneRefs[index];
          const window_ = phases.scenes[index];
          const next =
            index + 1 < phases.scenes.length ? phases.scenes[index + 1] : null;
          const copy = r?.copy.current ?? null;
          return {
            window: window_,
            length: window_.end - window_.start,
            // Egypt is entered through the gate's doorway; the other three are
            // entered through the scene before them (see `heroGateConfig`).
            beats: index === 0 ? C.scene.beats.first : C.scene.beats.handoff,
            next,
            nextLength: next ? next.end - next.start : 0,
            root: r?.root.current ?? null,
            art: r?.art.current ?? null,
            cheta: r?.cheta.current ?? null,
            copy,
            star: r?.star.current ?? null,
            // The copy is one column per scene, and the lines that land one
            // after another are marked `[data-scene-line]` — a stagger over
            // marked lines, not over `children`: the cheta lives in the same
            // column (that is how it shares the copy's gutter) and has its own
            // beat, so it must not be caught here.
            lines: copy
              ? Array.from(copy.querySelectorAll("[data-scene-line]"))
              : [],
          };
        });

        // Two origins, set once: the outer box rises about its own foot (About's
        // pillars), the inner image zooms about the doorway.
        gsap.set(rise, { transformOrigin: "50% 100%" });
        gsap.set(zoom, {
          transformOrigin: `${C.gate.origin.x}% ${C.gate.origin.y}%`,
        });

        const riseTo = isMobile ? C.gate.rise.to.mobile : C.gate.rise.to.desktop;
        const doorScale = isMobile ? C.gate.scaleTo.mobile : C.gate.scaleTo.desktop;

        const drive = (progress: number) => {
          // 1. EXIT — the resting art pushes past the camera while the words
          //    leave one after another (a resting CTA, when a page renders one,
          //    outlives them and clears BEFORE the gate appears).
          const exit = span(progress, phases.exit.start, phases.exit.end);
          // The resting stage's CTA (desktop only — the narrow tiers hide it via
          // CSS): the beat stays OPTIONAL, so a stage without one just skips it.
          if (cta) {
            const ctaOut = span(progress, phases.cta.start, phases.cta.end);
            gsap.set(cta, { autoAlpha: 1 - ctaOut, yPercent: -30 * ctaOut });
          }
          const spread = words.length > 1 ? WORD_SPREAD : 0;
          const wordOut = (index: number) =>
            clamp01(
              (exit -
                (words.length > 1
                  ? (index / (words.length - 1)) * spread
                  : 0)) /
                (1 - spread),
            );

          // 2. DIVE — accelerating push through the doorway (About's `K = fv²`),
          //    with the resting art clearing over the opening share of the window
          //    and the stone clearing at its tail.
          const dive = span(progress, phases.dive.start, phases.dive.end);
          const push = dive * dive;
          const gateClear = clamp01(
            (dive - GATE_CLEAR_FROM) / (1 - GATE_CLEAR_FROM),
          );
          const heroOut = smooth(
            span(
              progress,
              phases.dive.start,
              phases.dive.start + diveLength * C.hero.fade,
            ),
          );

          // 3. RISE — About's pillar language: `yPercent` about a `50% 100%`
          //    origin, `settle`-eased, swinging through a shallow arc and landing
          //    straight (the pillars' ±12° fan, compressed into one element).
          const riseIn = span(progress, phases.rise.start, phases.rise.end);
          const landing = settle(riseIn);

          gsap.set(image, {
            autoAlpha: 1 - heroOut,
            scale: 1 + (C.hero.scaleTo - 1) * exit,
            yPercent: HERO_RISE_Y * exit,
          });
          // The hero's incense sky (WebGL, see `HeroIncense`) belongs to the
          // main hero ONLY: it rides the resting art's own fade, so the stage
          // breathes while the story rests and clears the moment the dive
          // starts — nothing of the hero atmosphere survives into the scenes.
          if (incense) {
            gsap.set(incense, { autoAlpha: 1 - heroOut });
          }
          // The hero bottle (WebGL, see `HeroBottle`) — the finale's product.
          // On DESKTOP it belongs to the main hero only and clears with the
          // same fade as the art and the incense sky. On the NARROW tiers the
          // wrapper is raised above the scene layers (`HeroSection`), so the
          // bottle is the chapter's living constant instead: it keeps floating
          // between every scene's copy and that scene's plate, and only the
          // gate (later in the DOM at the same z) ever paints over it.
          if (bottle) {
            gsap.set(bottle, { autoAlpha: isMobile ? 1 : 1 - heroOut });
          }
          // The bottle's SCENE SINK (narrow tiers only): the glass drops out of
          // the scene's centred copy band, riding the dive so it is already low
          // by the time Egypt assembles. Its own inner slot carries the
          // transform — the wrapper's centring transform is never touched.
          if (bottleSlot) {
            gsap.set(bottleSlot, { y: isMobile ? sinkPx * dive : 0 });
          }
          gsap.set(words, {
            autoAlpha: (index) => 1 - wordOut(index),
            yPercent: (index) => -60 * wordOut(index),
          });
          gsap.set(rise, {
            yPercent: C.gate.rise.from + (riseTo - C.gate.rise.from) * landing,
            rotation: C.gate.rise.rotMax * Math.sin(Math.PI * riseIn),
            autoAlpha: 1 - gateClear,
          });
          gsap.set(zoom, { scale: 1 + (doorScale - 1) * push });

          // 4. SCENES — the four civilizations, one window each. Every scene
          //    assembles with the SAME vocabulary: the plate in from off-screen
          //    right, `cheta` up from below, the copy line by line, the star
          //    flash at the window's tail — and their beats overlap by design,
          //    so each scene reads as one movement. Every handoff is the
          //    SEQUENTIAL DIVE: while the NEXT window's head runs, the scene on
          //    stage pushes past the camera (`K = out²` — the gate's own
          //    accelerator) and clears, its copy lifting away, so each
          //    civilization is entered by diving through the one before it.
          //    Because every value below is a function of `progress`, the
          //    reader sets the pace — nothing is a one-shot trigger that could
          //    fire off-screen.
          scenes.forEach((scene) => {
            const { window: w, length: len, beats, next, nextLength } = scene;
            const beat = (b: { start: number; end: number }) =>
              span(progress, w.start + len * b.start, w.start + len * b.end);
            /** A dive-out beat, measured in the NEXT scene's window. */
            const outBeat = (b: { start: number; end: number }) =>
              next
                ? span(
                    progress,
                    next.start + nextLength * b.start,
                    next.start + nextLength * b.end,
                  )
                : 0;

            const sceneIn = span(progress, w.start, w.end);
            const artIn = settle(beat(beats.art));
            const chetaIn = settle(beat(beats.cheta));
            const copyIn = beat(beats.copy);
            const starIn = beat(beats.star);
            const outArt = outBeat(C.scene.diveOut.beats.art);
            const outCopy = outBeat(C.scene.diveOut.beats.copy);
            const outCheta = outBeat(C.scene.diveOut.beats.cheta);
            const outStar = outBeat(C.scene.diveOut.beats.star);
            const lineSpread = scene.lines.length > 1 ? E.copySpread : 0;
            const copyLineIn = (index: number) =>
              clamp01(
                (copyIn -
                  (scene.lines.length > 1
                    ? (1 - index / (scene.lines.length - 1)) * lineSpread
                    : 0)) /
                  (1 - lineSpread),
              );

            if (scene.root) {
              // Before the window opens the scene is hidden outright (so a
              // plate parked off-screen can never peek), then it is simply
              // present: its parts carry their own arrival.
              gsap.set(scene.root, {
                autoAlpha: clamp01(sceneIn / SCENE_IN_SHARE),
              });
            }
            if (scene.art) {
              gsap.set(scene.art, {
                xPercent: E.artFrom * (1 - artIn),
                autoAlpha: 1 - smooth(outArt),
                scale: 1 + (C.hero.scaleTo - 1) * outArt * outArt,
              });
            }
            if (scene.cheta) {
              gsap.set(scene.cheta, {
                yPercent:
                  E.chetaFrom * (1 - chetaIn) -
                  C.scene.diveOut.chetaLift * outCheta,
                autoAlpha: 1 - outCheta,
              });
            }
            if (scene.copy) {
              gsap.set(scene.lines, {
                autoAlpha: (index) => copyLineIn(index) * (1 - outCopy),
                y: (index) =>
                  E.copyRise * (1 - copyLineIn(index)) -
                  C.scene.diveOut.copyLift * outCopy,
              });
            }
            if (scene.star) {
              // The flash: a bloom, then a settle — it stays as a glow behind
              // the button instead of blinking away; the dive-out takes it out
              // with the rest of the scene.
              const bloom = clamp01(starIn / 0.35);
              const after = clamp01((starIn - 0.35) / 0.65);
              gsap.set(scene.star, {
                autoAlpha:
                  bloom * (1 - after * (1 - E.starSettle)) * (1 - outStar),
                scale:
                  0.35 +
                  (E.starScale - 0.35) * bloom +
                  (1 - E.starScale) * after,
                rotate: -28 * (1 - starIn),
              });
            }
          });
        };

        drive(0);

        // ONE trigger owns the whole chapter. A SECOND trigger on the same
        // element would read its `start` AFTER any pin — the documented desync
        // (`HERO-REDESIGN-PLAN.md` §12). `onRefresh` re-drives on resize.
        const driver = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => drive(self.progress),
          onRefresh: (self) => drive(self.progress),
        });

        // Velocity shear — desktop only: touch velocity is too jumpy to be a
        // tasteful signal. Only a stronger impulse may interrupt an in-flight
        // decay, so a flick reads as one physical gesture instead of noise.
        let shear: ScrollTrigger | undefined;
        if (!isMobile) {
          const proxy = { skew: 0 };
          const setSkew = gsap.quickSetter(title, "skewX", "deg");
          const clampSkew = gsap.utils.clamp(-4, 4);

          shear = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const impulse = clampSkew(self.getVelocity() / -300);
              if (Math.abs(impulse) <= Math.abs(proxy.skew)) return;
              proxy.skew = impulse;
              setSkew(impulse);
              gsap.to(proxy, {
                skew: 0,
                duration: 0.6,
                ease: "power3",
                overwrite: true,
                onUpdate: () => setSkew(proxy.skew),
              });
            },
          });
        }

        return () => {
          driver.kill();
          shear?.kill();
          // `quickSetter` writes the transform imperatively, so `mm.revert()`
          // cannot undo it on a breakpoint / locale rebuild — clear it here.
          gsap.set(title, { clearProps: "transform" });
          split.revert();
        };
      };

      mm.add(`(max-width: ${desktop - 1}px)`, () => build(true));
      mm.add(`(min-width: ${desktop}px)`, () => build(false));

      // Word wrapping is only trustworthy once the fonts have landed; a late
      // refresh keeps start/end honest (SmoothScroll already owns `load`).
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        mm.revert();
      };
    },
    { dependencies: [enabled, locale], revertOnUpdate: true }
  );

  return {
    sectionRef,
    stageRef,
    imageRef,
    titleRef,
    ctaRef,
    riseRef,
    zoomRef,
    incenseRef,
    bottleRef,
    bottleSlotRef,
    sceneRefs,
  };
}
