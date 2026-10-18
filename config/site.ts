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
 * Shared hero atmosphere — the ONE place the live hero stack reads from:
 * the scroll gate + smooth scroll (breakpoint), `HeroIncense` (incense),
 * `GlobalSkyLayer` / `heroCloudsShader` (the page-wide cloud bank) and
 * `handsScene` / `heroMistShader` (the resting mist bank).
 */
export const heroSceneConfig = {
  breakpoints: {
    /** Below this width the hero uses the centered mobile composition. */
    desktop: 1024,
  },

  /**
   * The ONE generated FBM mist bank — the RESTING background of the hands
   * finale scene (a constant, slowly-drifting bank at `restIntensity`, drawn
   * by `handsScene` / `heroMistBackgroundFragment`). The resting background of
   * the other sections is the cloud bank (`clouds`). Soft by nature, so it
   * renders at (sub)screen DPR cheaply.
   */
  mist: {
    /** Noise scale — low = broad billows (a bank), not wisps. */
    scale: 1.5,
    /** Density threshold + edge softness of the mist texture. */
    coverage: 0.4,
    softness: 0.32,
    /** Minimum fill so the bank reads as a mass, not just a tint. */
    fill: 0.66,
    /** Peak opacity — the resting bank is scaled by `restIntensity`. */
    maxOpacity: 0.62,
    /** Constant intensity of the hands-scene resting bank — the mist breathes. */
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
   * the navy sky base. The mist is reserved for the hands finale's resting
   * bank; the clouds are the resting background everywhere else.
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
   * The hero's INCENSE sky — the golden dust horizon + two rising smoke
   * threads + a dusting of gold motes (raw WebGL, `HeroIncense` /
   * `heroIncenseShader`). The hero's OWN atmosphere, drawn BEHIND the
   * resting art and faded out
   * with it by the engine, so it lives in the main hero ONLY (the page-wide
   * sky keeps the base cloud variant). Deliberately sparse: gradient + FBM
   * only, no geometry, no textures.
   *
   * Threads: one entry each, drawn in order. `desktopPos` / `mobilePos` are
   * UV (y-up) centers; `radius` the thread's aspect-corrected half-width;
   * `sway` how far the column bends as it rises (uv, anchored at the base);
   * `speed` the upward advection of the density; LOWER `coverage` = denser
   * smoke. Positions, radii and the haze line are UNIFORMS: the viewport
   * switch uploads them on the live program — never a recompile.
   */
  incense: {
    opacity: 0.8,
    /** DPR cap — desktop. Mobile runs a lighter scene (see `maxDprMobile`). */
    maxDpr: 1.75,
    maxDprMobile: 1.5,
    colors: {
      body: "#f6e6d6",
      sheen: "#cd9e61",
    },
    /** The dust horizon: `y` = the band's center (uv, y-up) per viewport. */
    haze: {
      strength: 0.55,
      desktopY: 0.2,
      mobileY: 0.26,
    },
    motes: {
      strength: 0.55,
    },
    threads: [
      {
        radius: 0.09,
        strength: 0.6,
        sway: 0.045,
        speed: 0.05,
        seed: 2.3,
        desktopPos: { x: 0.63, y: 0.47 },
        mobilePos: { x: 0.62, y: 0.52 },
      },
      {
        radius: 0.075,
        strength: 0.5,
        sway: 0.04,
        speed: 0.042,
        seed: 7.1,
        desktopPos: { x: 0.16, y: 0.33 },
        mobilePos: { x: 0.22, y: 0.4 },
      },
    ],
  },
} as const;

/**
 * HERO — the opening section.
 *
 * Deliberately minimal: ONE non-pinned `100dvh` section holding the brand's
 * MAIN IMAGE plus the headline and the store CTA — no pin, no civilization
 * chambers; the story below is told by the standalone 3D HANDS chapter
 * (`components/home/Hands/HandsSection.tsx`) and the sections after it.
 *
 * It is still static AT REST: everything you see at scroll 0 is plain markup.
 * The only motion is how it EXITS — a single scrubbed timeline plus a
 * scroll-velocity shear on the headline, both built in
 * `components/home/Hero/HeroSection.tsx`. New hero beats are added back onto
 * this base intentionally.
 */
export const heroConfig = {
  sectionId: "hero",
  /**
   * The hero's MAIN IMAGE (صورة رئيسية) — `right_main_hero.png` (1376×768 RGBA,
   * alpha-scanned: its content spans `x 13.8%–99.9%` and `y 0.8%–99.9%`, so the
   * empty band down its left edge is the art's own lead-in, not padding to be
   * cropped). Drawn glued to the stage's bottom-right corner and shown whole
   * (`object-contain object-right object-bottom`), with the copy staying left.
   */
  image: "/images/sections/right_main_hero.png",
  /**
   * The stage's backdrop: `moroco_hero_pattern.webp` (1376×768 RGBA pattern,
   * avg alpha ≈ 37%), stretched `object-cover` across the whole stage BEHIND
   * every layer and held at `opacity-[0.04]` in `HeroSection`, so it stays a
   * texture in the navy wall rather than an image.
   */
  pattern: "/images/sections/moroco_hero_pattern.webp",
  /** The headline CTA target. */
  ctaHref: "/store",
} as const;

/**
 * The HANDS chapter's flanking side images (`HandsSection`): one portrait
 * glued to EACH edge of the viewport — `left_hero_img.png` left,
 * `right_hero_img.png` right (both 768×1376 RGBA, semi-transparent decor).
 *
 * They START outside the page and ENTER the scene on scroll: one pure
 * `drive(progress)` (no scrub — Lenis' lerp already smooths, the hero
 * chapter's doctrine) over the section's approach, `from` being each
 * image's own entry offset in % of its width — eased fast-in / soft-settle
 * so each portrait glides in and parks FLUSH against its side AND foot
 * (bottom-glued: the trees stand ON the section's floor line, exactly where
 * they rest in the static composition). Under `prefers-reduced-motion`
 * they render already settled, no motion.
 */
export const handsSideConfig = {
  left: { src: "/images/sections/left_hero_img.png", from: -120 },
  right: { src: "/images/sections/right_hero_img.png", from: 120 },
  /** The entrance window: from the section touching the viewport's bottom
   *  edge (`top bottom`) to the section's top reaching 30% down the viewport
   *  (`top 30%`) — fully settled WELL BEFORE the chapter fills the screen,
   *  so the trees always land ahead of the scene, never mid-view. */
  entrance: { start: "top bottom", end: "top 30%" },
} as const;

/**
 * GATE CHAPTER — everything the hero does while you scroll:
 *
 *   the GATE (1) rises from below in the exact language of About's pillars
 *   (`yPercent` about a `50% 100%` origin, driven by a pure `drive(progress)`)
 *   → the camera DIVES through the doorway → EGYPT arrives through the opening
 *   and assembles itself (plate in from off-screen right, `cheta` up from
 *   below, the copy line by line, a star flashing behind the CTA) → then
 *   BABYLON, GREECE and CHINA, each assembling with the exact same vocabulary.
 *   Every handoff between scenes is a SEQUENTIAL DIVE: the civilization on
 *   stage pushes past the camera while the next slides into its wake — one
 *   continuous journey, still inside this one chapter.
 *
 * There is NO scene section below the hero: every reveal is the chapter's own
 * act, driven by the same scroll and the same `drive(progress)` as the gate.
 * `1.png`'s doorway is a transparent column open at the art's base, so the Egypt
 * layer behind it shows through the opening LONG before the stone clears — the
 * two halves read as one continuous movement instead of a hand-off.
 *
 * The chapter is a tall `<section>` holding a CSS `sticky` stage — NEVER a
 * GSAP `pin`: a pin-spacer injected into a React-reconciled subtree is the
 * bug class documented in `HERO-REDESIGN-PLAN.md` §12. The chapter's pixel
 * length therefore lives as literal Tailwind classes in `HeroSection`
 * (Tailwind cannot see interpolated values), while EVERY window below is a
 * FRACTION of the chapter's own progress — so lengthening or shortening the
 * chapter can never desync the story.
 *
 * The gate art is `public/images/egypt/1.png` (1000×1280, RGBA).
 *
 * `1.png` was MEASURED (alpha scan, `sharp`), not guessed:
 *   • the doorway channel is the transparent column `x 350–651` (centre 50.0%)
 *     running from `y 576` (45%) all the way DOWN through the bottom edge —
 *     i.e. the opening is open at the base of the art, so the door reads as an
 *     opening in the facade, not a closed frame;
 *   • its vertical centre is `y ≈ 928 / 1280 = 72%` → `gate.origin.y`;
 *   • everything outside the facade silhouette (left/right/top margins, ~45% of
 *     the box) is ALSO transparent — the gate stands in the scene, the hero art
 *     showing around it.
 */
/**
 * The chapter grew from ONE scene window (Egypt) to FOUR (Egypt → Babylon →
 * Greece → China). Every legacy fraction of the old chapter is remapped through
 * `legacy()` instead of being re-guessed: the hero act, the gate and the
 * approved Egypt choreography keep their EXACT pacing in vh, and each new scene
 * gets the same scroll length Egypt always had (≈158vh on desktop). The
 * section's pixel length grows by the matching factor (×2.08 — the literal vh
 * classes in `HeroSection`), which is what keeps the fractions true on both
 * breakpoints: the hero-act/scene ratio is 0.64/0.36 on each of them.
 */
const LEGACY_SCENE_SHARE = 0.36;
const SCENE_WINDOWS = 4;
const GATE_SCENE_REMAP =
  (1 / LEGACY_SCENE_SHARE) / (1 / LEGACY_SCENE_SHARE + SCENE_WINDOWS - 1);
/** A fraction of the LEGACY chapter (hero act + Egypt) → the new chapter. */
const legacy = (fraction: number) => fraction * GATE_SCENE_REMAP;
/** Scene `index`'s window in the new chapter — the same length for all four. */
const gateSceneWindow = (index: number) => {
  const start =
    legacy(1 - LEGACY_SCENE_SHARE) + index * legacy(LEGACY_SCENE_SHARE);
  return { start, end: start + legacy(LEGACY_SCENE_SHARE) };
};

export const heroGateConfig = {
  /** Windows as fractions of the chapter's progress (0–1), in story order.
   *  The hero act below is a REMAP of the legacy chapter's own fractions
   *  (`legacy()` above) — same story, same vh, longer chapter. */
  phases: {
    /** Headline leaves while the resting art pushes in. */
    exit: { start: legacy(0), end: legacy(0.12) },
    /** The CTA outlives the headline, then clears BEFORE the gate appears. */
    cta: { start: legacy(0.1), end: legacy(0.19) },
    /** Gate (1) rises from fully below its own height until its base is ON the
     *  stage's base (its highest point while still grounded). Its doorway column
     *  is already an opening, so the Egypt layer starts showing through it here. */
    rise: { start: legacy(0.2), end: legacy(0.42) },
    /** Settled — the doorway reads before we move again. */
    hold: { start: legacy(0.42), end: legacy(0.47) },
    /** Dive — the accelerator through the opening (`K = dive²`), the resting art
     *  clearing over its first share and the stone clearing over its last. */
    dive: { start: legacy(0.47), end: legacy(0.66) },
    /** The FOUR civilization windows, in story order, back to back. Egypt's
     *  starts exactly where it always did (a remap of the legacy 0.64) and
     *  each window is one scene long; the beats INSIDE a window are shares of
     *  it, not of the chapter. */
    scenes: [
      gateSceneWindow(0),
      gateSceneWindow(1),
      gateSceneWindow(2),
      gateSceneWindow(3),
    ],
  },
  /** The gate (1) — outer element rises, inner image zooms (two elements, so
   *  the `50% 100%` rise origin and the doorway dive origin never collide). */
  gate: {
    src: "/images/egypt/1.png",
    /** The doorway's own centre inside the art box, as % — the dive's transform
     *  origin. Measured off `1.png` (see the block comment above), not tuned by
     *  eye: `50` is the doorway column's centre, `72` its vertical centre. */
    origin: { x: 50, y: 72 },
    rise: {
      /** About's language: `100` parks it fully below its own height. */
      from: 100,
      /** `0` = the gate's bottom edge ends ON the screen's bottom edge: the
       *  highest point it can reach while still touching the base. It is TALLER
       *  than the stage (see `HeroSection`), so its top is already past the top
       *  edge and only the bottom lands. Never goes negative — that would float
       *  the gate off the base and leave a seam. */
      to: { desktop: 0, mobile: 0 },
      /** Straightens as it settles (About's pillars tilt up to ±12°). */
      rotMax: 4,
    },
    /** How far the opening is pushed past every viewport edge. The DOORWAY is
     *  only ~23% of the art's width, so covering a 16:9 frame takes ~7.6× and a
     *  21:9 one ~10× — hence 9 rather than "a lot": below that the stone is
     *  still at the edges when `gateClear` starts and the corners would flash
     *  the page behind it. */
    scaleTo: { desktop: 9, mobile: 5 },
  },
  /**
   * THE SCENE VOCABULARY — everything a civilization scene does, shared by all
   * four so their assemblies are clones of one another. The scenes are plain DOM
   * images (`SceneReveal`), painted UNDER the gate so the doorway column reveals
   * Egypt as the stone rises, and driven only by `phases.scenes` above. There is
   * no shader and no second section: the whole journey is the hero's own act.
   */
  scene: {
    /** One-shot entrance magnitudes. Distances are shares of each element's
     *  OWN size, so the composition scales with the plates on any screen. */
    entrance: {
      /** The plate starts this far off the right edge (% of its own width). */
      artFrom: 110,
      /** `cheta` starts this far below the fold (% of its own height). */
      chetaFrom: 115,
      /** How far each copy line rises as it lands (px). */
      copyRise: 20,
      /** Share of the copy beat by which the LAST line still lags the first —
       *  the same device as `WORD_SPREAD`: nothing is staggered by a fixed
       *  duration, so the copy can never step outside its own window. */
      copySpread: 0.5,
      /** The star flash behind the CTA: peak scale, then where it settles. */
      starScale: 1.7,
      starSettle: 0.42,
    },
    /** Beat layout INSIDE a scene window (shares of the window, not the
     *  chapter). Order: plate in from off-screen RIGHT → `cheta` up from BELOW
     *  → the copy line by line → the star flash. Chained by `start`/`end`, so
     *  the sequence cannot invert.
     *
     *  • `first` — Egypt's own layout, untouched: it is entered through the
     *    gate's doorway, so its window opens with the plate already arriving.
     *  • `handoff` — scenes 1-3: every beat shifts a touch into the window so
     *    its head belongs to the scene LEAVING (see `diveOut`); the incoming
     *    plate waits those few vh and then assembles on the same rhythm. */
    beats: {
      first: {
        art: { start: 0, end: 0.3 },
        cheta: { start: 0.22, end: 0.5 },
        copy: { start: 0.44, end: 0.82 },
        star: { start: 0.76, end: 1 },
      },
      handoff: {
        art: { start: 0.04, end: 0.34 },
        cheta: { start: 0.26, end: 0.54 },
        copy: { start: 0.48, end: 0.84 },
        star: { start: 0.78, end: 1 },
      },
    },
    /** THE SEQUENTIAL DIVE — the transition: every scene but the last leaves
     *  through it, and the next civilization is entered by diving through the
     *  one before. While the NEXT window's head runs, the plate on stage pushes
     *  past the camera (`scale` toward `hero.scaleTo`, accelerating like the
     *  gate dive) until it clears, its copy lifts away, `cheta` drifts up with
     *  it and the star goes out. */
    diveOut: {
      /** Beats, in shares of the NEXT scene's window. */
      beats: {
        art: { start: 0, end: 0.12 },
        copy: { start: 0, end: 0.07 },
        cheta: { start: 0, end: 0.07 },
        star: { start: 0, end: 0.05 },
      },
      /** How far the copy lifts as it leaves (px). */
      copyLift: 20,
      /** How far `cheta` drifts up as it leaves (% of its own height). */
      chetaLift: 12,
    },
  },
  /**
   * THE FOUR SCENES, in story order. Everything about them beyond their art and
   * their copy is shared (`scene` above): `messages` names the next-intl
   * namespace holding kicker/headline/body/cta, `hero` the plate (all four are
   * 1376×768 canvases with a transparent lead-in down the left edge) and
   * `cheta` the square plate that stands under the copy — the same stone for
   * all four.
   *
   * The plate fills the right edge from `object-contain` on a full-height
   * frame: the canvas' lead-in is the copy/art gap, and the measured numbers
   * (content from `x 524` = 38.1%, visible art ≈ 62% wide, landing at ~38% of
   * a 16:9 stage) are written out in `SceneReveal`. Re-export a plate with the
   * padding trimmed and those numbers want revisiting.
   *
   * `artCap` picks the plate's height cap: `standard` (`100svh`/`58vw`) is
   * Egypt's approved fit — Babylon and Greece ship the SAME canvas geometry
   * (alpha-scanned: content starts at `x 524` on both), so it is exact for
   * them too. China's picture is bigger (content from `x 444`, full canvas
   * height), so at `standard` its edge would cross the copy's lane on a 1440px
   * window; its `compact` cap (`min(92svh,53vw)` — `0.914 ×` standard, the
   * ratio of the two pictures' widths) brings it back to the SAME visual mass
   * and lands the edge at ~37% of the stage, clear of the text on every
   * common width.
   */
  scenes: [
    {
      id: "egypt",
      messages: "EgyptReveal",
      hero: "/images/sections/egypt_hero.png",
      cheta: "/images/sections/cheta_section.png",
      artCap: "standard",
      /** Where the CTA goes (the store landing, not a single civilization). */
      ctaHref: "/store",
    },
    {
      id: "babylon",
      messages: "BabylonReveal",
      hero: "/images/sections/babel_hero.png",
      cheta: "/images/sections/cheta_section.png",
      artCap: "standard",
      ctaHref: "/store",
    },
    {
      id: "greece",
      messages: "GreeceReveal",
      hero: "/images/sections/greece_hero.png",
      cheta: "/images/sections/cheta_section.png",
      artCap: "standard",
      ctaHref: "/store",
    },
    {
      id: "china",
      messages: "ChinaReveal",
      hero: "/images/sections/china_hero.png",
      cheta: "/images/sections/cheta_section.png",
      artCap: "compact",
      ctaHref: "/store",
    },
  ],
  /** The resting hero art. */
  hero: {
    scaleTo: 1.16,
    /** Share of the dive window over which the resting art clears. It has to be
     *  gone before the stone fills the frame, so what shows in the doorway is the
     *  Egypt plate arriving behind it and not the bottle leaving in front of it. */
    fade: 0.45,
  },
} as const;
