/**
 * Single source of truth for site-wide copy and navigation.
 * Extend here as the project grows (new routes, locales, links).
 */

export const siteConfig = {
  name: "3WEEQ",
  tagline: "A world where civilizations are told in scent",
  description:
    "An immersive journey through the perfumes of Egypt, Babylon, Greece, and China — one bottle, four civilizations.",
} as const;

export interface MenuLink {
  index: string;
  /** next-intl message key under the `Menu` namespace. */
  key: string;
  href: string;
}

export const menuLinks: MenuLink[] = [
  { index: "01", key: "item1", href: "#brand-story" },
  { index: "02", key: "item2", href: "#babylon-story" },
  { index: "03", key: "item3", href: "#greece-story" },
  { index: "04", key: "item4", href: "#china-story" },
  { index: "05", key: "item5", href: "/store" },
];

/** Footer column links — `key` indexes the `Footer.links` messages. */
export interface FooterLink {
  key: string;
  href: string;
}

export const footerLinks: FooterLink[] = [
  { key: "home", href: "/" },
  { key: "brand", href: "#brand-story" },
  { key: "babylon", href: "#babylon-story" },
  { key: "greece", href: "#greece-story" },
  { key: "china", href: "#china-story" },
  { key: "store", href: "/store" },
];

/**
 * ONE bridge block = ONE section→section handoff, exactly 0.8 timeline units
 * long. EVERY handoff uses this same shape — the hero→Egypt handoff included —
 * only shifted in time by `b`, so the scroll gap between any two sections is
 * IDENTICAL and the copy/identity is presented the same way every time.
 *
 * Window offsets from `b`:
 *   fade 0.00–0.12 (current bg gone) · bottleUp 0.02–0.48 · bottleDown 0.48–0.80
 *   (apex at 0.48) · worldSweepIn 0.20–0.50 · worldSweepOut 0.50–0.76
 *   reveal 0.28–0.74 · mist 0.10–0.68
 */
const BRIDGE_LEN = 0.8;
function bridgeBlock(b: number) {
  return {
    fade: { start: b + 0, end: b + 0.12 },
    bottleUp: { start: b + 0.02, end: b + 0.48 },
    bottleDown: { start: b + 0.48, end: b + BRIDGE_LEN },
    worldSweepIn: { start: b + 0.2, end: b + 0.5 },
    worldSweepOut: { start: b + 0.5, end: b + 0.76 },
    reveal: { start: b + 0.28, end: b + 0.74 },
    mist: { start: b + 0.1, end: b + 0.68 },
  };
}

/**
 * Cinematic hero scene — fully responsive.
 *
 * The scene is a CENTERED portrait on every frame (copy top-center, product
 * bottom-center glued to the hero edge, clouds above-center). Below
 * `breakpoints.desktop` it scales down with a tighter, smaller composition.
 *
 * ONE rule: every visual + motion value lives in `perViewport.desktop` or
 * `perViewport.mobile`, and components read them through the
 * `useHeroResponsive` context — never by editing JSX across files. Everything
 * below the breakpoint uses the *mobile* block; `useGsap` rebuilds the
 * timeline on breakpoint switch.
 */
export const heroSceneConfig = {
  breakpoints: {
    /** Below this width the hero uses the centered mobile composition. */
    desktop: 1024,
  },
  stickyHeight: "100svh",
  /** Scroll SPEED of the pinned scene: vh travelled per timeline unit (the
   *  original hero speed). The per-viewport `stageHeight` is DERIVED from this
   *  × the timeline's total duration (see `heroStageHeight`), so extending the
   *  timeline can never desync the scroll length again. */
  scrollVhPerUnit: { desktop: 420, mobile: 180 },
  images: {
    bottle: "/art/hero/hero-product.webp",
    pixlr: "/art/hero/pixlr-bottle.webp",
    egypt2: "/art/hero/egypt2.png",
    babylon: "/art/hero/babel.png",
    greece: "/art/hero/greek.png",
    china: "/art/hero/china.png",
  },
  /**
   * The CIVILIZATION PLATE fit inside the lens. Every plate is a 16:9 artwork
   * whose monuments span its FULL width, while the phone lens is roughly
   * 1:2.2 — so the desktop fit (`object-cover`, which fills the lens) blows a
   * plate up ~3.8x on a phone and centre-crops it down to ~26% of the artwork:
   * the wings, side towers and colonnades are cut off entirely and what is left
   * reads as an oversized, mushy backdrop. The phone therefore draws the plate
   * at a controlled WIDTH instead, bottom-anchored so the painted floor still
   * reaches the fold (the bottle still lands ON the artwork at ~30% down it,
   * past the dissolve) and dissolved into the sky at its own cut top edge.
   * 200vw halves the zoom (3.8x -> 2.0x) and doubles the landmark coverage
   * (26% -> 50% of the artwork, which is the whole central monument mass).
   * The plate box keeps the art's own 16:9 ratio, so `object-cover` inside it
   * crops nothing and the veil's alpha mask stays pixel-aligned.
   */
  plate: {
    /** Phone plate width in vw, bottom-anchored inside the lens. */
    mobileWidthVw: 200,
    /** Fade that melts the plate's flat top edge into the sky. */
    mobileFade: "linear-gradient(to bottom, transparent 0%, #000 12%)",
  },
  /**
   * The ONE generated FBM mist bank. It plays TWO roles:
   *   - the section→section transition bank (driven by the timeline's
   *     `uProgress`), where it appears ONLY while the plates swap, then
   *     dissolves — see `HeroMist`;
   *   - the RESTING background of the hands finale scene (a constant,
   *     slowly-drifting bank at `restIntensity` — see `handsScene`).
   * The RESTING background of the other sections is the cloud bank (`clouds`).
   *
   * The transition intensity (a bell-shaped peak) and the roll are DERIVED from
   * the single normalized progress handed in by the timeline. Soft by nature, so
   * it renders at (sub)screen DPR cheaply.
   */
  mist: {
    /** DPR caps — the mist is soft, so a low DPR is invisible and cheap. */
    maxDpr: 1.75,
    maxDprMobile: 1.5,
    /** Noise scale — low = broad billows (a bank), not wisps. */
    scale: 1.5,
    /** Density threshold + edge softness of the mist texture. */
    coverage: 0.4,
    softness: 0.32,
    /** Minimum fill at the peak so the bank CONCEALS the seam, not just tints. */
    fill: 0.66,
    /** Peak opacity — as a transition it reads as a full bank that covers the
     *  seam; as a resting background it is scaled by `restIntensity`. */
    maxOpacity: 0.62,
    /** Constant intensity for the hands-scene RESTING background bank (where
     *  there is no transition progress — the mist just breathes). */
    restIntensity: 0.7,
    /** Vertical roll of the mist across the window (conveyor direction). */
    roll: 0.7,
    /** NEUTRAL palette: a cool cloud haze that reads with the navy sky
     *  instead of throwing its own hue. */
    colors: {
      body: "#e8eef6",
      sheen: "#b9c7da",
      shadow: "#2f4e78",
    },
  },
  /**
   * The procedural cloud bank — the SECTION atmosphere (restored). Two FBM +
   * domain-warped blobs positioned where the old cloud images sat, drawn over
   * the navy sky base. The mist is reserved for section→section transitions;
   * the clouds are the resting background everywhere else.
   */
  clouds: {
    opacity: 0.55,
    /** DPR cap — desktop. Mobile runs a lighter scene (see `maxDprMobile`). */
    maxDpr: 1.75,
    maxDprMobile: 1.5,
    colors: {
      body: "#f6e6d6",
      sheen: "#cd9e61",
      shadow: "#2f4e78",
    },
    layerA: {
      radius: 0.24,
      scale: 1.35,
      coverage: 0.72,
      desktopPos: { x: 0.5, y: 0.1 },
      mobilePos: { x: 0.5, y: 0.1 },
    },
    layerB: {
      radius: 0.16,
      scale: 1.5,
      coverage: 0.78,
      desktopPos: { x: 0.84, y: 0.28 },
      mobilePos: { x: 0.8, y: 0.3 },
    },
  },
  /**
   * Radial radar halo behind the bottle — a Lottie recording (lines.json).
   * `y` = the halo's center, in % of the lens height — matches the bottle's
   * center per viewport so the rings always radiate from directly behind the
   * product (the rotating rings are energy emitted by the bottle, not a
   * separate ornament). `width` is the square container size (512x512 asset).
   */
  radar: {
    path: "/art/hero/lines.json",
    /**
     * `y` = the halo's center, in % of the lens height, matching each
     * viewport's bottle center so the rings are ALWAYS directly behind the
     * product (desktop 64% = old 66% origin − 2% lift, pixel-identical).
     */
    desktop: { width: "clamp(360px, 62vw, 920px)", opacity: 0.85, y: 64 },
    mobile: { width: "clamp(280px, 80vw, 460px)", opacity: 0.6, y: 56 },
  },
  perViewport: {
    desktop: {
      perspective: 900,
      /** Full-scene tint (top-down) and bottom mist melt — these two overlay
       *  gradients differ per viewport: desktop keeps a tall opaque melt over
       *  the artwork, mobile uses a short translucent melt so the raised
       *  scene never reads as a solid navy slab. See HeroScene. */
      overlay: "from-[#2f4e78]/35 via-transparent to-[#2f4e78]/70",
      mist: "h-[35%] from-[#2f4e78]",
      /** Single traveling bottle: anchored by center-Y (% of the lens) so the
       *  SAME element can slide from here to the Egypt platform. */
      pixlr: { width: "clamp(200px, 30vw, 350px)", centerY: 64 },
copy: {
        /** Top offset of the centered copy block below the header. */
        offset: "clamp(2.5rem, 9vh, 6.5rem)",
        maxWidth: "min(94vw, 80rem)",
      },
bottle: {
        /** Centered product, bottom-glued, shifted down by the artwork's
         *  8.5% bottom inset so the artwork's surface touches the hero edge. */
        className:
          "absolute bottom-0 left-1/2 w-[86vw] max-w-[1580px] -translate-x-1/2 translate-y-[9.8%]",
      },
      radar: {
        width: "clamp(360px, 62vw, 920px)",
        opacity: 0.85,
        y: 64,
      },
      exit: { originX: 50, originY: 66 },
      motion: {
        skyScaleFrom: 1.3,
        skyScaleTo: 1.45,
        bottleRise: 36,
        bottleScaleFrom: 1,
        bottleScaleTo: 1.08,
        cloudDrift: 78,
        cloudDriftSecondary: -52,
        /** Reduced hero zoom (was 1.42): the descent now reads as the bottle
         *  SHRINKING through the clouds, not the camera diving in. */
        zoomTo: 1.12,
        /** The bottle's OWN scale at the seam (end of the exit). The camera
         *  zoom is small now, so the shrink starts here — net on-screen size
         *  dips to ~0.95 before the bridge carries it down to `scaleTo`. */
        exitBottleScale: 0.85,
      },
    },
    mobile: {
      perspective: 700,
      /** Mobile overlays mirror the desktop feel, but shorter: the artwork is
       *  glued to the fold again (the raised-bottle decision), so the mist
       *  13% melts OVER the warm painted floor exactly like the desktop hero —
       *  no bare navy band can form (see diagM5/M7/M8). */
      overlay: "from-[#2f4e78]/35 via-transparent to-[#2f4e78]/45",
      mist: "h-[13%] from-[#2f4e78]/55",
      pixlr: { width: "clamp(80px, 15vw , 300px)", centerY: 53 },
      copy: {
        offset: "clamp(6.5rem, 18vh, 11rem)",
        maxWidth: "min(94vw, 34rem)",
      },
      /**
 * Centered + LARGE: at `150vw` the bottle dominates the phone — ~36%
        * of the screen height, spilling past both edges (classic award-site
        * trick) while `overflow-x: clip` on html keeps zero horizontal scroll.
        * GLUED to the fold (bottom-0, translate-y tuned to the artwork's
        * 8.5% bottom inset) so the wide warm floor reaches the fold — the
        * base melt reads layered like the desktop hero, never a navy slab.
        * The raised-yet piece on mobile is the pixlr bottle in front.
        * POSITIONING ONLY — this wrapper is never touched by GSAP, so the
        * Tailwind `translate` centering survives (GSAP writes `translate:
        * none` on the element it animates — see HeroScene inner wrapper).
        */
      bottle: {
        className:
          "absolute bottom-0 left-1/2 w-[150vw] max-w-[720px] -translate-x-1/2 translate-y-[9.8%]",
      },
      radar: {
        width: "clamp(280px, 80vw, 460px)",
        opacity: 0.6,
        y: 53,
      },
      exit: { originX: 50, originY: 53 },
      motion: {
        skyScaleFrom: 1.14,
        skyScaleTo: 1.22,
        bottleRise: 18,
        bottleScaleFrom: 1,
        bottleScaleTo: 1.06,
        cloudDrift: 35,
        cloudDriftSecondary: -35,
        /** Reduced hero zoom (was 1.28) — same reason as desktop. */
        zoomTo: 1.06,
        /** Bottle's own scale at the seam (see desktop note). */
        exitBottleScale: 0.88,
      },
    },
  },
  /**
   * Shared (viewport-independent) motion windows — normalized 0–1 positions
   * on the stage, applied on both frames.
   */
  motionTimeline: {
    copyFadeStart: 0.18,
    copyFadeEnd: 0.68,
    exit: { start: 0.74, end: 0.92 },
    /** Hero→Egypt handoff — the SAME 0.8 block as every section→section bridge
     *  (`bridgeBlock(0.92)`), plus the hero-only `overlayFade` that clears the
     *  hero tint. The hero artwork is this block's "current background", the
     *  Egypt plate is the next one, and the world simply un-zooms through the
     *  SAME camera sweep (its scale starts at `zoomTo`). Because every block is
     *  the same length and contiguous, the gap between ANY two sections — hero
     *  included — is identical. */
    bridge: { ...bridgeBlock(0.92), overlayFade: { start: 0.94, end: 1.08 } },
    /** Egypt→Babylon handoff — identical block, shifted to start right where
     *  hero→Egypt ended (0.92 + 0.8 = 1.72). */
    babylonBridge: bridgeBlock(1.72),
    /** Babylon→Greece handoff — identical block (1.72 + 0.8 = 2.52). */
    greeceBridge: bridgeBlock(2.52),
    /** Greece→China handoff — identical block (2.52 + 0.8 = 3.32). */
    chinaBridge: bridgeBlock(3.32),
    /** China → HANDS FINALE — ONE simultaneous swap on the SAME pin, with NO
     *  separating transition block: the instant the product lands on China
     *  (4.12) the China plate + copy fade out while the 3D hands fade in over
     *  the same window. The product does NOT vanish: it hands off to the finale
     *  product (same pose, so the swap is invisible) which then descends +
     *  shrinks into the gap between the hands and HOLDs. A short `hold` lets
     *  the scene settle before the pin releases. One pin, one narrative. */
    chinaOut: {
      mist: { start: 4.12, end: 4.4 },
      plateFade: { start: 4.12, end: 4.4 },
      copyFade: { start: 4.12, end: 4.4 },
    },
    hands: {
      /** Cross-fade the traveling product into the finale product (they sit at
       *  the SAME China pose, so the swap is invisible). */
      bottleHandoff: { start: 4.12, end: 4.18 },
      /** The hands canvas fades in over the atmosphere. The camera opens at the
       *  slightly pulled-back entrance (baseZoom 1.3) and pushes in below. */
      in: { start: 4.12, end: 4.5 },
      /** The finale product descends + shrinks into the gap between the hands. */
      product: { start: 4.12, end: 4.55 },
      /** THE PULL-BACK: the scroll-scrubbed camera dolly. Forward (scroll down)
       *  it pushes the camera IN to the close inspection view (1.3 → 1.0);
       *  reversed (scroll up) it PULLS BACK a little (1.0 → 1.3) so the visitor
       *  gets a beat to take in the whole composition before the handoff. This is
       *  the "time to inspect" the brief asked for — the section no longer
       *  vanishes the instant the camera moves. */
      pullback: { start: 4.5, end: 4.9 },
      /** The PREVIEW BUFFER: after the pull-back, this whole window keeps the
       *  finale held at the close view so the visitor can look and dolly before
       *  the story starts to leave. Scrolling up does NOT jump to China — it
       *  first crosses the pull-back, then this buffer, so the handoff back is
       *  never abrupt. */
      hold: { start: 4.9, end: 5.7 },
    },
  },
} as const;

/**
 * The pinned scene's viewport height, DERIVED from the timeline itself:
 *   stageHeight = 100vh (the pinned lens) + scrollVhPerUnit × timelineDuration
 * where `timelineDuration` is the furthest window `end` across every bridge.
 * ONE source of truth — add a bridge window and the stage grows with it, so
 * the scroll length can never fall short of the animation (the "scroll stops
 * at Egypt" class of bug).
 */
export function heroStageHeight(isMobile: boolean): string {
  const tl = heroSceneConfig.motionTimeline;
  const duration = Math.max(
    tl.copyFadeEnd,
    tl.exit.end,
    ...Object.values(tl.bridge).map((w) => w.end),
    ...Object.values(tl.babylonBridge).map((w) => w.end),
    ...Object.values(tl.greeceBridge).map((w) => w.end),
    ...Object.values(tl.chinaBridge).map((w) => w.end),
    ...Object.values(tl.chinaOut).map((w) => w.end),
    ...Object.values(tl.hands).map((w) => w.end),
  );
  const perUnit = isMobile
    ? heroSceneConfig.scrollVhPerUnit.mobile
    : heroSceneConfig.scrollVhPerUnit.desktop;
  return `${100 + perUnit * duration}vh`;
}

/**
 * The SETTLED pose every civilization platform lands on — ONE source of truth
 * so the bottle stops at the exact same place and size after EVERY handoff
 * (the hero→Egypt stop included). `toTop` is the settled center as % of the
 * pinned lens (smaller = higher on screen); `scaleTo` is the fraction of the
 * hero's bottle base width (`frame.pixlr.width`). Because this object is shared
 * by every `*Config.travel`, the platforms can never drift apart again.
 */
const SECTION_LANDING = {
  desktop: { toTop: 60, scaleTo: 0.58 },
  mobile: { toTop: 56, scaleTo: 0.9 },
} as const;

/**
 * The HANDS finale product pose — where the bottle settles ONCE the story
 * reaches the 3D hands: CENTER-BOTTOM, between them (the chosen look). The
 * product is handed off at the China landing pose (`SECTION_LANDING`) and
 * tweens to THIS pose across the `hands.product` window — descending and
 * shrinking into the gap, then holding. `toTop` is the settled center as % of
 * the pinned lens (larger = lower); `scaleTo` is the fraction of the hero
 * product base width (`frame.pixlr.width`).
 */
export const handsFinaleConfig = {
  settle: {
    desktop: { toTop: 64, scaleTo: 0.4 },
    mobile: { toTop: 60, scaleTo: 0.62 },
  },
} as const;

/**
 * Egypt bridge — the SECOND half of the merged hero scene (not a separate
 * section). The SAME pinned lens + the SAME single bottle element continue:
 * the camera un-zooms (`world` returns to identity), the hero artwork and its
 * overlays fade away to reveal the clouds, the Egypt plate RISES from the
 * bottom edge like a curtain, and the one bottle TRAVELS down through the
 * clouds onto the Egypt platform — smaller, upright, never covering the copy.
 * Same image, same palette, one continuous shot.
 *
 * CONTINUITY IS DERIVED, NOT HARD-CODED: at runtime the bottle's start is the
 * frame's hero anchor (`pixlr.centerY`) and its handoff scale is the hero's
 * `motion.zoomTo * motion.exitBottleScale` (the net on-screen size at the
 * seam); only the SETTLED pose (`toTop`/`scaleTo`) is authored here.
 *
 * COLOR GRADING: the Egypt plate is regraded to the hero palette with
 * `imageFilter`, tied to the sky by a navy veil (`veil`) and a top `topFade`
 * that melts the hero navy into the plate — the two halves share one look.
 */
export const egyptConfig = {
  sectionId: "brand-story",
  /** Where the bottle settles — the SHARED `SECTION_LANDING` pose, so the
   *  hero→Egypt stop matches every section→section stop exactly. */
  travel: SECTION_LANDING,
  /** The mid-bridge arc apex — IDENTICAL to every section bridge, so the
   *  hero→Egypt handoff is the exact clone of the section→section ones. The
   *  bottle lifts high, is swallowed by the fog at its peak, then lands on the
   *  Egypt platform as the mist clears. */
  hop: {
    desktop: { toTop: 34, scaleTo: 0.92 },
    mobile: { toTop: 30, scaleTo: 1.12 },
  },
  /** Gentle lean as it travels (settles upright). */
  rotateFrom: -5,
  shadow: { maxOpacity: 0.45 },
  /** Regrade to the hero palette — keep (client-approved plate look). */
  imageFilter: "sepia(0.2) saturate(0.9) contrast(1.1) brightness(0.95)",
  /** Hero-navy veil tying the warm plate to the sky. */
  veil: "rgba(47, 78, 120, 0.3)",
  /** Top fade: melts the hero navy into the plate so the seam never cuts. */
  topFade:
    "linear-gradient(to bottom, #2f4e78 0%, rgba(47,78,120,0.55) 14%, rgba(47,78,120,0) 42%)",
} as const;

/**
 * Babylon bridge — the THIRD half of the merged hero scene (still not a
 * separate pin). The SAME lens + the SAME single bottle continue: the Egypt
 * plate dissolves OUT (`egyptFade`), the Babylon plate fades IN over it
 * (`babylonFade`) through a mist wall (`mist`), and the one bottle
 * VISIBLY travels — lifts off Egypt, arcs through the fog, lands on Babylon at
 * the SAME shared pose — while a camera sweep keeps the shot alive. Same image,
 * same palette, one continuous shot — the hero→Egypt method cloned so every
 * handoff feels unified.
 *
 * The plate image is added by the client; the regrade (`imageFilter`), navy
 * veil and top melt keep Babylon tied to the same sky the hero and Egypt use.
 */
export const babylonConfig = {
  sectionId: "babylon-story",
  /** Babylon arrival — the bottle JOURNEYS here (does not stay put): it lifts
   *  off Egypt (arc apex below), flies through the fog bank, and lands on the
   *  SHARED `SECTION_LANDING` pose — the exact same spot and size as every
   *  other platform, so every handoff ends identically. */
  travel: SECTION_LANDING,
  /** The mid-bridge arc apex: the bottle LIFTS HIGH (visible on take-off,
   *  swallowed by the fog at its peak, then lands as the mist clears). The
   *  apex is authored here; the settled pose is `travel` above. */
  hop: {
    desktop: { toTop: 34, scaleTo: 0.92 },
    mobile: { toTop: 30, scaleTo: 1.12 },
  },
  /** Wind-up lean as it takes off (rights upright as it lands). */
  rotateFrom: -12,
  shadow: { maxOpacity: 0.45 },
  /** Hero-matched regrade for the Babylon plate (slightly warmer — roses and
   *  saffron — but tied to the same palette). */
  imageFilter: "sepia(0.25) saturate(1.05) contrast(1.08) brightness(0.96)",
  /** Hero-navy veil tying the warm plate to the sky. */
  veil: "rgba(47, 78, 120, 0.3)",
  /** Top fade: melts the hero navy into the plate so the seam never cuts. */
  topFade:
    "linear-gradient(to bottom, #2f4e78 0%, rgba(47,78,120,0.55) 14%, rgba(47,78,120,0) 42%)",
} as const;

/**
 * Greece bridge — the FOURTH half of the merged hero scene. IDENTICAL motion
 * to `babylonConfig` (same travel, hop, lean, shadow, mist and camera shot),
 * so the Babylon→Greece handoff is the exact clone of Egypt→Babylon; only the
 * plate image changes. The regrade (`imageFilter`), navy veil and top melt are
 * shared so every civilization sits under ONE continuous sky.
 */
export const greeceConfig = {
  sectionId: "greece-story",
  travel: SECTION_LANDING,
  hop: {
    desktop: { toTop: 34, scaleTo: 0.92 },
    mobile: { toTop: 30, scaleTo: 1.12 },
  },
  rotateFrom: -12,
  shadow: { maxOpacity: 0.45 },
  imageFilter: "sepia(0.25) saturate(1.05) contrast(1.08) brightness(0.96)",
  veil: "rgba(47, 78, 120, 0.3)",
  topFade:
    "linear-gradient(to bottom, #2f4e78 0%, rgba(47,78,120,0.55) 14%, rgba(47,78,120,0) 42%)",
} as const;

/**
 * China bridge — the FIFTH half of the merged hero scene. Same statement as
 * Greece: an exact clone of the Babylon handoff (same motion, same atmosphere),
 * only the plate image changes. The journey ends here and dissolves into the
 * clouds via `chinaOut`.
 */
export const chinaConfig = {
  sectionId: "china-story",
  travel: SECTION_LANDING,
  hop: {
    desktop: { toTop: 34, scaleTo: 0.92 },
    mobile: { toTop: 30, scaleTo: 1.12 },
  },
  rotateFrom: -12,
  shadow: { maxOpacity: 0.45 },
  imageFilter: "sepia(0.25) saturate(1.05) contrast(1.08) brightness(0.96)",
  veil: "rgba(47, 78, 120, 0.3)",
  topFade:
    "linear-gradient(180deg, #2f4e78 0%, rgba(47,78,120,0.55) 14%, rgba(47,78,120,0.42) 42%)",
} as const;

/**
 * The story emblem — one brand motif shown ALONGSIDE each civilization's copy,
 * on the OPPOSITE side of the screen (inline-end: the LEFT in Arabic, the RIGHT
 * in English — so `dir` alone flips it). The tiled `svg_bg` motif fills the FULL
 * HEIGHT of the half (brand identity, edge to edge), while the golden Lamassu
 * sits over it, sized to and aligned with the copy's own text block. Desktop
 * only: below the breakpoint the copy is full-width, so there is no opposite
 * side to fill. Revealed by the motion timeline IN SYNC with its copy — fade +
 * scale (see `addBridge` in useHeroMotion).
 */
export const storyEmblemConfig = {
  /** The golden winged Lamassu (transparent PNG). */
  symbol: "/Gouden_gevleugelde_Lamassu_in_profiel-removebg-preview.png",
  /** The tiled motif behind the symbol — covers the full height of the half. */
  pattern: "/svg_bg.png",
  /** Width of the emblem half — mirrors the copy's own `min(90vw, 34rem)`
   *  column so both halves share the exact same edge inset. The half is only
   *  shown once two such columns + a gap fit (`min-[1180px]`). */
  width: "min(90vw, 34rem)",
  /** One tile's size inside the half. */
  patternSize: "22rem auto",
  /** The motif sits well behind the symbol — faint enough to add texture
   *  without competing with the copy (visual clutter). */
  patternOpacity: 0.08,
  /** Soft vignette so the motif melts into the plate at its edges, yet still
   *  reads across the FULL height (the brand motif matters — see design). */
  mask: "radial-gradient(ellipse 94% 104% at 50% 50%, #000 44%, transparent 97%)",
} as const;

/**
 * Collection — the product collection.
 *
 * A cinematic, draggable strip of the four perfumes over a dark hero-matched
 * backdrop. Each card is a product portrait with a 3D tilt on hover; the cards
 * rise in staggered, shrink + dim with distance from the centre, and drift on
 * scroll. (The signature "unwoven" ribbon treatment is layered on top of this
 * interaction layer in a later phase — its settings live below.)
 */
export const collectionConfig = {
  sectionId: "collection",
  /** The four perfumes, in strip order. `key` indexes the CollectionSection
   *  messages (`products.<key>`); `image` is the product shot, shown as-is. */
  products: [
    { key: "egypt", image: "/products/1.jpg" },
    { key: "babylon", image: "/products/2.jpg" },
    { key: "greece", image: "/products/3.jpg" },
    { key: "china", image: "/products/4.jpg" },
  ],
  /** Card geometry — a horizontal, draggable strip of four portraits.
   *  Sizes are the desktop box; the component scales down for tablet/phone. */
  card: {
    /** Desktop card box (the base; smaller breakpoints in the component). Wide
     *  enough that the side cards bleed past the viewport edge (~40% cut),
     *  giving the "infinite gallery" read around the single centred card. */
    width: "clamp(320px, 44vw, 760px)",
    height: "clamp(540px, 84vh, 960px)",
    radius: 24,
    /** Gaps between cards: tight on desktop, roomy on phones. */
    gapVw: 2,
    gapVwMobile: 4,
    /** Which product opens centred (0 = Egypt … 3 = China). */
    focusIndex: 1,
    /** The distance ladder: centre → side → far, by card-pitch distance. */
    scaleCenter: 1,
    scaleSide: 0.85,
    scaleFar: 0.7,
    brightCenter: 1,
    brightSide: 0.6,
    brightFar: 0.3,
    /** 3D tilt ceiling (deg) at a card's edge, and the pointer perspective. */
    tiltMax: 6,
    perspective: 800,
  },
  /** Entrance: cards rise into place, staggered, once the section is in view. */
  entrance: { y: 100, duration: 1.2, stagger: 0.15, ease: "power3.out" },
  /** Vertical parallax of the side cards as the section scrolls past. */
  parallax: { sideY: 40, scrub: 1.5 },
  /** Autoplay drift, px per second (drag adds inertia on top). */
  scrollSpeed: 35,
  /** Speed cap after a drag, px per second. */
  flingMax: 2600,

  /** ── Unwoven ribbon treatment (layered on top in a later phase) ────────── */
  /** Cover-fitted product shots for the ribbon strip. */
  images: [
    "/products/1.jpg",
    "/products/2.jpg",
    "/products/3.jpg",
    "/products/4.jpg",
  ],
  /** Ribbons per card. FEW and THICK — they read as silk threads. Many thin
   *  ribbons read as broken scan-lines (the old "glitch" impression). */
  threads: 7,
  /** Fewer ribbons on phones — keeps the loop cheap and the silk readable. */
  threadsMobile: 5,
  /** Horizontal subdivisions per ribbon (what the flutter rides on). */
  segments: 20,
  /** Card height in px — TALLER than the source's 452, clamped below. */
  cardMaxHeight: 700,
  /** Card width / height. */
  cardAspect: 0.75,
  /** Gap between cards, as a fraction of card width. */
  cardGapRatio: 0.11,
  /** Corner radius in px. */
  cardRadius: 20,
  /** How far in from an edge the unravelling starts, as a fraction of width.
   *  Small: the tear stays at the very edges, the centre stays solid. */
  tearZoneRatio: 0.1,
  /** Px cap for the tear zone. */
  tearZoneMax: 220,
  /** The card height is clamped to this fraction of the viewport height. */
  viewportClamp: 0.78,
  /** How long the ribbons take to unravel in, and the easing. */
  reveal: { duration: 2.6, ease: "power3.out" },
  /** Gold hairline that catches a tearing ribbon's edge (brand accent). */
  edgeGold: { rgb: "#cd9e61", alpha: 0.32 },
  /** Cinematic backdrop behind the strip — the hero's navy identity, not a
   *  flat cloud field. A dark gradient, a slow mist bank and a vignette. */
  backdrop: {
    top: "#1a3350",
    bottom: "#2f4e78",
    /** Opacity of the shared hero mist layer over the dark base. */
    mistOpacity: 0.15,
    /** Edge darkening so the eye settles on the centre. */
    vignette:
      "radial-gradient(ellipse at center, transparent 40%, rgba(10,15,25,0.6) 100%)",
  },
} as const;

/**
 * Ripple banner — a single full-bleed image, exactly as tall as the collection
 * card images, that refracts like water while the page scrolls. Rendered in
 * WebGL (Three.js, already in the bundle); the scroll velocity drives the
 * ripple, so it agitates as you scroll past and eases back to a slow ambient
 * breathing when you stop. The plain `<img>` shows through until the texture
 * loads (and is the fallback under reduced-motion / no-WebGL).
 */
export const rippleConfig = {
  sectionId: "ripple-banner",
  /** Full-bleed image (the "section background"). */
  image: "/section bacground.jpg",
  /** Its intrinsic size — used for the cover fit. */
  imageSize: { width: 1584, height: 672 },
  /** Section height === the collection card image height. */
  heightPx: collectionConfig.cardMaxHeight,
  heightVh: collectionConfig.viewportClamp * 100,
  /** Ripple strength at rest — a slow ambient water breathing. */
  idleRipple: 0.14,
  /** Peak ripple strength under a fast scroll. */
  maxRipple: 1,
  /** Scroll velocity (px/s) → ripple strength. */
  velocityScale: 0.001,
  /** How fast the ripple eases toward its target, per second. */
  ease: 4,
} as const;






