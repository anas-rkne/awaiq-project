"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { heroConfig, heroGateConfig } from "@/config/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useHeroGate } from "@/hooks/useHeroGate";
import { HeroLoader } from "./HeroLoader";
import { HeroIncense } from "./HeroIncense";
import { SceneReveal } from "./SceneReveal";

/** Three.js stays out of the initial hero bundle (the `HandsCanvas` pattern). */
const HeroBottle = dynamic(() => import("./HeroBottle"), { ssr: false });

/**
 * Hero — the GATE CHAPTER, told in one scroll:
 *
 *   the GATE (1) rises out of the ground in About's pillar language → the camera
 *   DIVES through its doorway → the EGYPT scene behind the stone arrives through
 *   the opening and assembles itself (plate in from the right, `cheta` up from
 *   below, the copy line by line, a star flashing behind the CTA) — and then
 *   BABYLON, GREECE and CHINA do the same, one handoff after another: every
 *   transition is the SEQUENTIAL DIVE, the scene on stage pushing past the
 *   camera while the next slides into its wake.
 *
 * The section is TALL and holds a CSS `sticky` stage — never a GSAP `pin` (see
 * `HERO-REDESIGN-PLAN.md` §12), so React keeps owning its own subtree. Every
 * beat is driven from the chapter's own progress by `useHeroGate`. The vh
 * classes below are the legacy chapter (hero act + Egypt) × 2.08: the growth is
 * what lets the four scene windows keep the exact pacing the single Egypt
 * window had — see the remap in `heroGateConfig`.
 *
 * The RESTING composition: the hero art glued to the stage's bottom-right
 * corner, shown whole, and the copy on the left — the same distribution as the
 * scene copy columns, and just as PHYSICAL: the art stays right and the copy
 * stays left in both languages (`dir` only restores the reading order inside
 * the column; alignment is pinned to the physical left).
 *
 * Layers, in paint order (all inside the stage's `isolation`, so nothing here
 * can reach the sections below): the `moroco_hero_pattern` backdrop across the
 * whole stage at `opacity-[0.04]` — a wall texture behind EVERYTHING — then
 *   z-0  the hero's INCENSE sky — a golden    z-20 the gate (rise box → zoom image)
 *        dust horizon + two rising smoke
 *        threads (webgl) BEHIND the resting
 *        hero art (the plate occludes them,   z-40 the hero copy, left column
 *        so they read as depth around it),
 *        then the art itself, bottom-right
 *   z-[1] the hero's own 3D bottle (webgl) —
 *        the finale's product, leaning 45° to
 *        the right and turning on its own
 *        axis mid-stage, between the copy
 *        column and the resting art
 *   z-10 the four scene layers, in story
 *        order (each paints over the one
 *        before it, which is what lets a
 *        scene slide into the wake of the
 *        one diving out ahead of it)
 *
 * The scene layers live UNDER the gate on purpose: the doorway's own column is
 * transparent (`1.png` was alpha-scanned, see `heroGateConfig`), so the Egypt
 * plate shows through the opening as the stone rises, long before the stone
 * clears — one continuous movement, not a hand-off to a second section.
 *
 * The engine empties the RESTING set (art + words + the hero incense sky + the
 * hero bottle) BEFORE the first scene is on stage: the words are gone by
 * `phases.exit` (≤0.091) and the hero image — and the incense sky, which rides
 * its fade — reach `autoAlpha 0` over the first `hero.fade` (45%) of the dive —
 * fully gone at 0.267, before the Egypt window opens at 0.308. The hero carries
 * no CTA of its own, so that beat is unbound and skips (see `useHeroGate`).
 * The backdrop pattern is NOT part of that set: it is the stage's own wall
 * and stays behind every layer through the whole chapter.
 *
 * Under `prefers-reduced-motion` there is no chapter at all: one plain
 * `100dvh` screen with no gate, no scenes and no sticky travel.
 */
export function HeroSection() {
  const t = useTranslations("Hero");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  /**
   * SHORT LANDSCAPE tier — phones and small tablets on their side
   * (`max-height: 520px`). A 100svh PORTRAIT stage cannot hold the
   * three-anchor composition (copy left / bottle centre / art bottom-right):
   * the measured 844×390 frame overlapped the art band (y56–204) with the copy
   * stack (y116–258) and left a doorway only ~78px wide. Every value below is
   * therefore swapped wholesale, never layered on top of the portrait set, so
   * the short tier owns its own composition. Verified by the CDP matrix in
   * `HERO-RESPONSIVE-PLAN.md` §7.
   */
  const short = useMediaQuery(
    "(max-width: 1023px) and (orientation: landscape) and (max-height: 520px)",
  );

  /**
   * The composition, per tier. ONE rule across all five: the art stays glued
   * to the stage's bottom-right, the bottle stays centred, the copy stays on
   * the physical left — only the dose of each changes. Two of these are
   * LOAD-BEARING maths, not taste:
   *
   * • `bottleBox` is SQUARE. `heroBottleScene` fits the 45°-tilted bottle's
   *   bounding box to `0.8 × container height`, and at exactly 45° that box is
   *   an axis-aligned square — so the container needs `w ≥ 0.8·h` or the glass
   *   is clipped. The old `46vw` column broke that on every frame below 1024
   *   (measured: 198px of the 626px the phone needed ⇒ ~69% cut; 353 of 688 on
   *   the tablet ⇒ ~49%). Square removes the whole class of bug, and the tier
   *   value then just picks the visible mass (`0.8 × size`).
   * • `artBox` is WIDTH-driven on portrait (the art's own 1376/768 ratio) and
   *   HEIGHT-driven on desktop — so the visible content (the canvas' content
   *   starts at `x 13.8%`) can never cross into the copy's lane. Desktop keeps
   *   the approved `min(100svh,41vw)` fit untouched; the short tier flips to
   *   height so the art tucks under a 390px-tall viewport.
   *
   * The h1's REM cap is multiplied by `--hl-h1-scale` (set on the section from
   * the locale: Arabic runs 6% smaller — its glyphs are taller per line — while
   * the tier CLAMPS stay byte-identical for both languages).
   */
  const h1Vars = { "--hl-h1-scale": isArabic ? "0.94" : "1" } as unknown as CSSProperties;

  const artBox = short
    ? "absolute bottom-0 right-0 h-[52svh] w-[calc(52svh*1.7917)]"
    : "absolute bottom-0 right-0 aspect-[1376/768] w-[112vw] min-[480px]:w-[92vw] min-[768px]:w-[74vw] min-[1024px]:aspect-auto min-[1024px]:h-[min(100svh,41vw)] min-[1024px]:w-[calc(min(100svh,41vw)*1.7917)]";

  const bottleBox = short
    ? "h-[min(84svh,26vw)] w-[min(84svh,26vw)]"
    : "h-[min(42svh,80vw)] w-[min(42svh,80vw)] min-[480px]:h-[min(44svh,72vw)] min-[480px]:w-[min(44svh,72vw)] min-[768px]:h-[min(44svh,58vw)] min-[768px]:w-[min(44svh,58vw)] min-[1024px]:h-[min(84svh,52vw)] min-[1024px]:w-[min(84svh,52vw)]";

  /**
   * The gate (1.png), sized by HEIGHT (`w` is pinned to the art's own 0.781
   * ratio). It must be at least as tall as the stage so the stone never shows a
   * seam while it stands on the stage's foot — but a full-screen facade reads as
   * oversized on a phone (measured: 112svh on a 844-tall stage), so the narrow
   * tiers now settle the whole doorway INSIDE the screen (`88svh`), and the
   * dive still covers the frame: the doorway is `0.18 × h ≈ 133px` at 88svh, and
   * `scaleTo.mobile = 5` clears the 390px-wide frame with room to spare.
   * The short landscape tier keeps its oversized frame on purpose: a 390px-tall
   * viewport is 844px WIDE, and only a big gate (240svh) gives the dive a
   * doorway wide enough to cover it.
   */
  const gateBox = short
    ? "h-[240svh] w-[188svh]"
    : "h-[88svh] w-[69svh] min-[480px]:h-[92svh] min-[480px]:w-[72svh] min-[768px]:h-[96svh] min-[768px]:w-[75svh] min-[1024px]:h-[100svh] min-[1024px]:w-[78svh]";

  const h1Box = short
    ? "text-[clamp(1.5rem,3vw,2rem)]"
    : "text-[calc(clamp(1.7rem,7.6vw,2.125rem)*var(--hl-h1-scale))] min-[480px]:text-[calc(clamp(2rem,5.4vw,2.75rem)*var(--hl-h1-scale))] min-[768px]:text-[calc(clamp(2.5rem,4.6vw,3rem)*var(--hl-h1-scale))] min-[1024px]:text-[calc(clamp(3rem,4.45vw,4rem)*var(--hl-h1-scale))]";

  /**
   * The copy column: the headline, and — on DESKTOP ONLY — the resting CTA.
   *
   * The top padding belongs to the NARROW tiers alone: there the heading opens
   * under the fixed header plus the notch inset. Desktop is the approved left
   * column, CENTRED in the stage with no padding at all, and a leaked `pt` here
   * would push the whole stack down and break that approved composition — so the
   * narrow padding is zeroed back out at `min-[1024px]:pt-0` (the same pattern,
   * and the same proven cascade order, as `SceneReveal`'s copy column).
   *
   * The hero's CTA is `max-[1023px]:hidden`: the brief dropped the resting
   * button from the narrow stages (the scene CTAs are the chapter's calls to
   * action there, and the bottle floated between the copy and the art), while
   * the desktop composition keeps it exactly as approved — the gold pill under
   * the headline, at the copy's own gutter. The engine's CTA beat is therefore
   * bound on desktop and inert on the narrow tiers (the element is `display:none`
   * there, so fading it costs nothing).
   *
   * The tray carries NO padding — the column inside is `absolute` and anchors to
   * the tray's padding box, so tray padding would silently offset it.
   */
  const copyOuter = short ? "flex items-center" : "";

  const copyInner = short
    ? "relative flex w-[36%] flex-col px-6 text-left"
    : "absolute inset-y-0 left-0 flex w-[76%] max-w-[22rem] flex-col px-6 pt-[calc(env(safe-area-inset-top)+4.75rem)] text-left min-[480px]:w-[68%] min-[480px]:px-8 min-[768px]:w-[56%] min-[768px]:max-w-[30rem] min-[768px]:px-10 min-[768px]:pt-[calc(env(safe-area-inset-top)+6rem)] min-[1024px]:absolute min-[1024px]:top-0 min-[1024px]:left-0 min-[1024px]:h-full min-[1024px]:w-[38%] min-[1024px]:max-w-[640px] min-[1024px]:min-w-[320px] min-[1024px]:justify-center min-[1024px]:px-10 min-[1024px]:pt-0 min-[1024px]:pb-0";

  const {
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
  } = useHeroGate({ enabled: !reduced, locale });

  return (
    <>
      <HeroLoader />
      <section
        ref={sectionRef}
        id={heroConfig.sectionId}
        dir={isArabic ? "rtl" : "ltr"}
        style={h1Vars}
        aria-labelledby="home-hero-title"
        className={
          reduced
            ? "relative z-0 h-[100dvh] w-full overflow-hidden bg-navy-ink"
            : "relative z-0 h-[582.4vh] w-full bg-navy-ink motion-reduce:h-[100dvh] min-[1024px]:h-[915.2vh]"
        }
      >
        <div
          ref={stageRef}
          className={
            reduced
              ? "relative h-full w-full overflow-hidden"
              : "sticky top-0 isolate h-[100svh] w-full overflow-hidden"
          }
        >
          {/* z-0 — the backdrop: the Morocco pattern stretched across the whole
              stage and held at `opacity-[0.04]`, so it reads as texture in the navy
              wall behind EVERY layer. It never moves — the wall the chapter
              stands on. */}
          <img
            src={heroConfig.pattern}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-[0.04]"
          />

          {/* z-0 — the hero's OWN INCENSE sky: a golden dust horizon and two
              rising smoke threads (WebGL, see `HeroIncense`) breathing
              continuously BEHIND the resting art — the plate occludes them,
              so they read as depth around and through the artwork, never
              over it. The engine only fades this wrapper (with the resting
              art's own `heroOut`); the shader animates itself. */}
          {reduced ? null : (
            <div
              ref={incenseRef}
              className="pointer-events-none absolute inset-0 z-0"
            >
              <HeroIncense />
            </div>
          )}

          {/* z-0 — the resting art, glued to the bottom-right corner and shown
              WHOLE (`object-contain` + right/bottom alignment: never cropped,
              never glued over the copy).

              The frame is WIDTH-driven on portrait (`artBox` above carries the
              canvas' own 1376/768 ratio and 92/78/62vw per tier) so the art
              reads as a real object on a phone instead of the 213px strip it
              used to be — and it stays FLUSH with the stage's bottom-right
              edge in every language. On desktop the frame is still sized by
              WIDTH through its height: `41vw` (× 1376/768 ⇒ `73.4vw` wide) puts
              its left edge at `26.6vw`, and the art's lead-in — its content
              only starts at `x 13.8%` (alpha-scanned) — lands the visible art at
              `26.6 + 0.138 × 73.4 ≈ 36.7%` of the stage: past the copy column's
              text on every width, so the two safe areas never have to be
              juggled. The `100svh` term is the outer cap, so a short or
              ultra-wide window settles it lower instead of pushing it off.
              The short landscape tier flips to height-driven (52svh) so the
              art tucks under a 390px-tall viewport. */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className={artBox}>
              <img
                ref={imageRef}
                src={heroConfig.image}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain object-right object-bottom will-change-transform"
              />
            </div>
          </div>

          {reduced ? null : (
            <>
              {/* z-10 — the four civilization scenes, in story order, all
                  under the gate: each plate, its cheta and its copy live here,
                  and the doorway is what reveals Egypt. Later scenes paint
                  OVER earlier ones (same layer, later DOM), which is what lets
                  a civilization slide into the wake of the one diving out
                  ahead of it. */}
              {heroGateConfig.scenes.map((scene, index) => (
                <SceneReveal
                  key={scene.id}
                  scene={scene}
                  refs={sceneRefs[index]}
                />
              ))}

              {/* the hero's own 3D BOTTLE (WebGL, see `HeroBottle`): the
                  finale's product, floated mid-stage between the copy column
                  and the resting art — leaning 45° to the right and turning
                  around its own axis, draggable exactly like the finale. This
                  box IS the interactive footprint: it is centred by Tailwind
                  transforms (gsap only ever fades the wrapper — never touches
                  its transform), and the canvas inside claims pointer events,
                  so touch scrolling stays with the page.

                  It sits AFTER the scenes in the DOM so its layer can be
                  raised above them: `z-[1]` on desktop (under the plates — the
                  story covers it and it is gone from the stage before Egypt
                  opens, exactly as the approved desktop behaves) and
                  `max-[1023px]:z-20` on the narrow tiers, where the chapter
                  keeps it alive through every scene (`useHeroGate` skips the
                  `heroOut` fade there) so it hangs BETWEEN the copy above and
                  the plate below — which is also why the narrow tiers drop it a
                  little below dead centre and trim its box: the scenes' word
                  block is centred at the top and runs to a CTA, so the glass has
                  to start under it rather than across it. The gate is `z-20` too
                  but comes later in the DOM, so the stone still paints over the
                  glass mid-dive.

                  The inner SLOT (`bottleSlotRef`) carries the scene sink: on the
                  narrow tiers `useHeroGate` slides it down through the dive
                  (`BOTTLE_SCENE_SINK`) so the glass sits clear of every scene's
                  copy + CTA. The transform lives on the slot, never on this
                  box — the wrapper's Tailwind centring is untouchable. */}
              <div
                ref={bottleRef}
                className={`pointer-events-none absolute left-1/2 top-1/2 max-[1023px]:top-[45%] z-[1] max-[1023px]:z-20 -translate-x-1/2 -translate-y-1/2 ${bottleBox}`}
              >
                <div
                  ref={bottleSlotRef}
                  className="relative h-full w-full will-change-transform"
                >
                  <HeroBottle />
                </div>
              </div>

              {/* z-20 — the gate. The box rises about its own foot, the image
                  zooms about the doorway; GSAP owns every transform on both, so
                  neither may carry a Tailwind transform class (a
                  `-translate-x-1/2` would be overwritten by GSAP's inline
                  transform the moment the engine writes it).

                  Centring is therefore done by a flex row — with `dir="ltr"`, so
                  the composition stays PHYSICAL like the scenes' — instead of
                  auto margins: the gate is wider than the stage on portrait, and
                  an over-constrained `inset-x-0 mx-auto` box resolves its winding
                  margins by the containing block's direction (flush left under
                  LTR, flush right under RTL), which would put the doorway off
                  centre in one language only. Flex centring splits the overflow
                  evenly, and the physical `ml` on the narrow tiers then nudges
                  the whole facade — doorway and dive origin together — slightly
                  right, which is where the brief wants the opening.

                  It is sized by HEIGHT, not width, so the rise ends flush:
                  `rise.to: 0` puts this box's foot ON the stage's foot, its top
                  past the top edge, and the door stays centred (`origin.x: 50`)
                  with no letterboxing. */}
              <div
                dir="ltr"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-center"
              >
                <div
                  ref={riseRef}
                  className={`invisible will-change-transform max-[1023px]:ml-[8%] ${gateBox}`}
                >
                  <img
                    ref={zoomRef}
                    src={heroGateConfig.gate.src}
                    alt=""
                    aria-hidden="true"
                    className="block h-full w-full object-cover will-change-transform"
                  />
                </div>
              </div>
            </>
          )}

          {/* z-40 — the copy: the headline on every tier, plus the resting CTA
              on DESKTOP. It owns the LEFT of the frame (`text-left` is physical
              on purpose — with the art pinned right, a mirrored Arabic column
              would open a dead margin on the left), while `dir` keeps Arabic's
              reading order and punctuation correct.

              Placement is the tier's own: on the narrow tiers the headline fills
              the top band (below the fixed header + the notch inset) so it reads
              before the bottle and the art, with no dead middle (the measured
              430×932 frame used to leave ~49% of the screen empty, with the copy
              bottom-anchored under a 213px art strip) and NO button — the gold
              pill is `max-[1023px]:hidden` there. Tablet grows the band to its
              wider gutters; desktop keeps the approved left column
              byte-for-byte, CTA included; the short landscape tier centres a 36%
              column beside the art. */}
          <div
            className={`pointer-events-none absolute inset-0 z-40 ${copyOuter}`}
          >
            <div
              dir={isArabic ? "rtl" : "ltr"}
              className={copyInner}
            >
              {/*
                Keyed on the locale on purpose: SplitText REPLACES the heading's
                contents, so React's own text node is detached by the time the
                language changes — an in-place text update would never reach the
                DOM, and the headline would stay in the previous language. Keying
                makes React swap the element wholesale, then the engine re-splits
                the fresh one.
              */}
              <h1
                key={locale}
                ref={titleRef}
                id="home-hero-title"
                className={`font-primary leading-[120%] font-medium text-beige ${h1Box}`}
              >
                {t("headline")}
              </h1>

              {/* The resting CTA — desktop only (see `copyInner`). `mr-auto` is a
                  physical margin, so the pill keeps its intrinsic width and sits
                  at the column's own gutter in both languages; the engine owns
                  its exit (`useHeroGate`). */}
              <Link
                ref={ctaRef}
                href={heroConfig.ctaHref}
                className="pointer-events-auto mr-auto mt-6 inline-flex items-center justify-center rounded-none bg-gold px-8 py-3 font-primary text-sm font-medium text-navy transition-colors hover:bg-gold/85 max-[1023px]:hidden min-[480px]:mt-8"
              >
                {t("cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
