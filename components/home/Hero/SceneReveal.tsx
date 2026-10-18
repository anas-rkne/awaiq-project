"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { heroGateConfig } from "@/config/site";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { SceneRefs } from "@/hooks/useHeroGate";

/**
 * cheta's canvas is 1024×1024 but its picture starts at `x 36` (3.5%), so the
 * visible plate sits 3.5% of its own width right of the box. Subtracting exactly
 * that share of its size puts the picture — not the box — on the copy's line.
 * Percent margins would resolve against the COLUMN, so the size has to be
 * restated here; keep these in step with the `h-`/`w-` classes below.
 */
const CHETA_ML_MOBILE = "ml-[calc(clamp(132px,34vw,200px)*-0.035)]";
const CHETA_ML_DESKTOP =
  "min-[1024px]:ml-[calc(min(clamp(150px,15vw,230px),24svh)*-0.035)]";

/**
 * The plate's desktop size, as whole literal class strings because Tailwind
 * scans source text. `standard` is Egypt's approved fit; `compact` is China's
 * (`0.914 ×` — its picture is ~9% larger inside the same 1376×768 canvas, so
 * the smaller cap restores the same visual mass and keeps its edge out of the
 * copy's lane; see `heroGateConfig.scenes`).
 */
const ART_CAP_STANDARD =
  "min-[1024px]:h-[min(100svh,58vw)] min-[1024px]:w-[calc(min(100svh,58vw)*1.7917)]";
const ART_CAP_COMPACT =
  "min-[1024px]:h-[min(92svh,53vw)] min-[1024px]:w-[calc(min(92svh,53vw)*1.7917)]";

type SceneRevealProps = {
  /** One entry of `heroGateConfig.scenes`: art, copy namespace, CTA target. */
  scene: (typeof heroGateConfig.scenes)[number];
  /** The hook's handles for THIS scene: root carries the scene's visibility,
   *  the rest carry its beats (plate, cheta, copy column, star flash). */
  refs: SceneRefs;
};

/**
 * ONE CIVILIZATION SCENE — what the hero's chapter assembles, as a layer of the
 * hero's own stage (there is no scene section: `useHeroGate` drives every one
 * of these elements from the chapter's single scroll progress).
 *
 * All four scenes (Egypt → Babylon → Greece → China) are clones of this one
 * component: same composition, same beats, same entrance magnitudes — only the
 * plate, the copy namespace and (for China) the `artCap` differ. Each scene
 * enters as the previous one dives past the camera, and each assembles itself
 * in the same order: plate → cheta → copy lines → star flash.
 *
 * The composition is PHYSICAL, and identical in both languages: the plate owns
 * the right of the screen, the copy hugs the left gutter. So the root is
 * `dir="ltr"` and the copy column sets its own direction only for the reader's
 * SCRIPT — Arabic bidi stays correct — while its alignment is pinned to the
 * physical left, exactly like the English stack. Under RTL the composition must
 * not mirror, and the copy must not drift to the middle of the frame leaving a
 * dead margin on the left.
 *
 * Three numbers make that work against these plates, and all three come from
 * measuring them:
 *
 * • Every plate's canvas is 1376×768 and `object-contain` on the FULL height
 *   scales it to `100svh`, i.e. `179svh` wide. Egypt's, Babylon's and Greece's
 *   pictures occupy the right `852/1376 = 62%` of that, so the visible art lands
 *   `111svh` wide with its left edge at ~38% of a 16:9 stage — the reference's
 *   own ratio — and the canvas's empty lead-in becomes the gap between copy and
 *   art for free. China's picture is bigger (content from `x 444`, full canvas
 *   height), which is why it gets the smaller `ART_CAP_COMPACT`: at 92svh its
 *   visible mass and its edge land where the others' do (~37% of the stage).
 * • `58vw` caps the height so that edge can never cross into the copy's lane on
 *   a narrow desktop. On 16:9 the cap does not bind (the stage is 178svh wide,
 *   so it allows ~103svh) and the plate stands full height; on 4:3 it settles
 *   at ~77svh instead of colliding.
 * • The headline is capped in `rem` as well as `vw`: the stack is anchored to
 *   the bottom, so a headline free to grow pushes the kicker off the top of the
 *   stage — and these headlines are long: Egypt's measures `14.44em` in Reem
 *   Kufi 500 ("From the Nile, 3WEEQ Was Born"), i.e. two lines at `3.375rem`
 *   inside the column's 560px of text. Both caps are measured: `3.8vw` tracks
 *   the column as the window narrows, `3.375rem` is the size the widest common
 *   desktop (column at its 640px cap, 560px of text) still sets in two lines,
 *   and the column is `38%`/`640px` so every desktop down to ~1280px lands in
 *   two as well.
 *
 * Narrow screens used to STACK the scene (plate → copy → cheta) because one
 * `100svh` stage cannot hold the desktop composition. That stack was measured
 * and it read wrong: on a 430×932 phone the plate became a 213px strip at the
 * top, the copy sat under it, and ~49% of the screen stayed empty. The narrow
 * tiers now carry the HERO'S OWN composition instead — plate glued to the
 * stage's BOTTOM-RIGHT and sized larger than the hero's own art (it bleeds a
 * little past the edge, `104vw` on the phone, because a scene plate wants more
 * presence than the resting artwork), the copy across the TOP of the screen and
 * CENTRED (full width, the brief: kicker → headline → verses → CTA, one
 * top-down block that the bottle below it cannot cover), and the cheta standing
 * in the corner UNDER the copy, glued to the page's bottom-left — so the chapter
 * speaks one composition language at rest and inside every scene, with the 3D
 * bottle hanging between the words and the plate (see `HeroSection`'s bottle
 * layer). `short`
 * (landscape phones) swaps to a compact height-driven set, exactly like the
 * hero. Desktop is untouched: the measured `ART_CAP_*` fits and the in-flow
 * cheta are the approved look.
 */
export function SceneReveal({ scene, refs }: SceneRevealProps) {
  const t = useTranslations(scene.messages);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const short = useMediaQuery(
    "(max-width: 1023px) and (orientation: landscape) and (max-height: 520px)",
  );
  const { root, art, cheta, copy, star } = refs;

  const plateBox = short
    ? "absolute bottom-0 right-0 h-[52svh] w-[calc(52svh*1.7917)]"
    : `absolute bottom-0 right-0 aspect-[1376/768] w-[104vw] min-[480px]:w-[86vw] min-[768px]:w-[70vw] min-[1024px]:aspect-auto ${scene.artCap === "compact" ? ART_CAP_COMPACT : ART_CAP_STANDARD}`;

  /**
   * The copy column. On the narrow tiers it is the full width of the screen and
   * its text is CENTRED (the brief), top-anchored under the fixed header: the
   * kicker, the headline, the verses and then the CTA right beneath them — one
   * block that reads top-down, clear of the bottle below it. `inset-0` (not just
   * `top-0`) keeps the column as tall as the stage so the cheta's corner pin is
   * the PAGE's corner, not the text block's.
   */
  const copyCol = short
    ? "absolute inset-y-0 left-0 flex w-[36%] flex-col justify-center px-6 text-left"
    : "absolute inset-0 flex flex-col items-center px-6 pt-[calc(env(safe-area-inset-top)+4.75rem)] text-center min-[480px]:px-8 min-[768px]:px-10 min-[768px]:pt-[calc(env(safe-area-inset-top)+6rem)] min-[1024px]:right-auto min-[1024px]:items-start min-[1024px]:w-[38%] min-[1024px]:max-w-[640px] min-[1024px]:min-w-[320px] min-[1024px]:justify-end min-[1024px]:px-10 min-[1024px]:pt-0 min-[1024px]:text-left";

  const ctaBox = short
    ? "mt-7 mr-auto"
    : "mt-6 mx-auto min-[1024px]:mt-9 min-[1024px]:ml-0 min-[1024px]:mr-auto";

  /**
   * cheta, in the corner UNDER the copy: glued to the bottom-left of the page
   * on every narrow tier (the brief is explicit) and enlarged to hold that
   * corner (`132–200px` against the old `96–150px`). Out of flow there, so the
   * CTA's `mt-auto` is not disturbed; desktop restores the approved in-flow
   * cheta that closes the copy's stack on the plate's ground line.
   */
  const chetaBox = short
    ? `absolute bottom-0 left-0 h-[clamp(96px,26vw,150px)] w-[clamp(96px,26vw,150px)] object-contain object-left object-bottom will-change-transform ${CHETA_ML_MOBILE}`
    : `absolute bottom-0 left-0 h-[clamp(132px,34vw,200px)] w-[clamp(132px,34vw,200px)] object-contain object-left object-bottom will-change-transform min-[1024px]:static min-[1024px]:mt-[4svh] min-[1024px]:mr-auto min-[1024px]:h-[min(clamp(150px,15vw,230px),24svh)] min-[1024px]:w-[min(clamp(150px,15vw,230px),24svh)] ${CHETA_ML_MOBILE} ${CHETA_ML_DESKTOP}`;

  const h2Box = short
    ? "text-[clamp(1.4rem,2.8vw,1.8rem)]"
    : "text-[calc(clamp(1.5rem,6.6vw,1.9rem)*var(--hl-h1-scale))] min-[480px]:text-[calc(clamp(1.9rem,4.6vw,2.4rem)*var(--hl-h1-scale))] min-[768px]:text-[calc(clamp(2.2rem,4vw,2.6rem)*var(--hl-h1-scale))] min-[1024px]:text-[min(3.8vw,3.375rem)]";

  return (
    <div
      ref={root}
      dir="ltr"
      className="pointer-events-none absolute inset-0 z-10 opacity-0"
    >
      {/*
        The plate — the screen's bottom-right corner, bleeding off the right the
        way the reference's artwork does. `object-contain` (never `cover`):
        clipping the canvas's 38.1% lead-in would drag the picture left into the
        copy, and the lead-in is exactly the breathing room we want.
      */}
      <div className={plateBox}>
        <img
          ref={art}
          src={scene.hero}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain object-right object-bottom will-change-transform"
        />
      </div>

      {/*
        The copy column — the reader's side of the composition.

        `text-left` is deliberate and PHYSICAL: with the art fixed to the right
        (the brief is explicit that it stays there in both languages), Arabic must
        not right-align inside this column — it would leave a dead margin on the
        left and read as a different composition from the English one. Bidi is
        unaffected: the column keeps `dir="rtl"`, so Arabic still runs and
        punctuates right-to-left; only the line alignment is pinned.

        `mr-auto` (a physical margin) pins the stack to the left in both
        languages, where `self-start` would flip to the right under RTL and break
        the pairing with the corner-pinned cheta — the narrow tiers centre the
        stack instead, so the physical pin only matters on desktop.

        The column owns the stack: kicker → headline → paragraph → CTA, with the
        cheta in the page's bottom-left corner outside it. On desktop the stack
        grows UPWARD from the stage's bottom line — the line the plate's ground
        stands on too, with the cheta closing the stack in flow. On the narrow
        tiers the same block sits CENTRED across the top of the screen (the CTA
        directly under the verses, where nothing can cover it), the cheta is
        glued to the bottom-left corner, and the bottle floats in between.
      */}
      <div
        ref={copy}
        dir={isRtl ? "rtl" : "ltr"}
        className={copyCol}
      >
        {/* The kicker: Latin typography only. Arabic has no case, and
            letter-spacing would pull its joined letters apart, so the tracking is
            dropped under RTL. */}
        <p
          data-scene-line=""
          className="font-primary text-[0.68rem] tracking-[0.3em] text-beige/55 uppercase rtl:tracking-normal"
        >
          {t("kicker")}
        </p>

        {/*
          The headline carries the reference's weight, but both terms are caps
          measured against the longest of the four strings in Reem Kufi 500
          (14.44em wide): `3.8vw` keeps it two lines as the column narrows with
          the window, `3.375rem` keeps it two lines on wide desktops where the
          column stops growing.
        */}
        <h2
          data-scene-line=""
          className={`mt-5 font-primary leading-[1.08] font-medium text-beige ${h2Box}`}
        >
          {t("headline")}
        </h2>

        {/* `whitespace-pre-line`: the copy is authored as verses, one per line —
            forcing it to re-wrap as a paragraph would rewrite the writing. Its
            size tracks the stage height so six verses can never outgrow a short
            window. */}
        <p
          data-scene-line=""
          className="mt-5 line-clamp-3 whitespace-pre-line text-sm leading-[1.8] text-beige/80 min-[768px]:line-clamp-4 min-[1024px]:mt-6 min-[1024px]:line-clamp-none min-[1024px]:text-[min(1.9svh,1rem)] min-[1024px]:leading-[1.6]"
        >
          {t("body")}
        </p>

        {/* The CTA and its flash share one positioned wrapper, so the star is
            centred on the button with no CSS transform — GSAP owns `transform`
            here too, and a Tailwind `-translate-x-1/2` would be wiped the first
            time the engine writes a scale. The arrow turns with the reading
            direction (`rtl:rotate-180`) instead of pointing backwards in Arabic. */}
        <span
          data-scene-line=""
          className={`relative inline-flex ${ctaBox}`}
        >
          <span
            ref={star}
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[35%] -inset-y-[170%] opacity-0"
            style={{
              backgroundImage:
                "radial-gradient(closest-side, rgba(246,230,214,0.5), rgba(205,158,97,0.28) 46%, transparent 74%)",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full text-gold"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M50 0 55.4 44.6 100 50 55.4 55.4 50 100 44.6 55.4 0 50 44.6 44.6Z" />
            </svg>
          </span>
          <Link
            href={scene.ctaHref}
            className="pointer-events-auto relative inline-flex items-center justify-center bg-gold px-7 py-3 font-primary text-sm font-medium text-navy-ink transition-colors hover:bg-gold/85 min-[1024px]:py-3.5"
          >
            {t("cta")}
            <span aria-hidden="true" className="ms-2 rtl:rotate-180">
              →
            </span>
          </Link>
        </span>

        {/* cheta — on desktop the last thing in the stack and the first thing
            above the stage's bottom line: its foot lands on the same baseline as
            the plate's ground, and its edge on the same line as the copy's. On
            the narrow tiers it is lifted out of the stack and pinned to the
            page's own bottom-left corner instead (the brief is explicit), where
            it can overlap the plate's lower-left lead-in. The `24svh` term keeps
            it from eating a short window's stack, and the negative inline margin
            cancels the art's own transparent lead-in so the PICTURE, not its
            box, sits on that edge. */}
        <img
          ref={cheta}
          src={scene.cheta}
          alt=""
          aria-hidden="true"
          className={chetaBox}
        />
      </div>
    </div>
  );
}
