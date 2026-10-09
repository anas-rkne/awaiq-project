/**
 * Single source of truth for site-wide copy and navigation.
 * Extend here as the project grows (new routes, locales, links).
 */

export const siteConfig = {
  name: "3WEEQ",
  tagline: "Enter a world where creatures come alive",
  description:
    "An immersive world of curious creatures, magical places, and stories waiting to be discovered.",
} as const;

export interface MenuLink {
  index: string;
  label: string;
  href: string;
}

export const menuLinks: MenuLink[] = [
  { index: "01", label: "Explore 3WEEQ", href: "#explore" },
  { index: "02", label: "Meet the Creatures", href: "#creatures" },
  { index: "03", label: "Magical Worlds", href: "#worlds" },
  { index: "04", label: "Stories", href: "#stories" },
];

/**
 * Cursor spotlight reveal over the hero.
 * - `image` must stay exactly as provided (no crop/resize/recolor).
 * - `radius` is the spotlight radius in px.
 * - `easing` is the lerp factor (0–1, lower = smoother/slower).
 */
export const heroRevealConfig = {
  baseImage: "/BG_IMAGE_2.jpg",
  image: "/BG_IMAGE_1.jpg",
  radius: 260,
  easing: 0.12,
} as const;

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
  images: {
    sky: "/art/hero/sky.webp",
    bottle: "/art/hero/hero-product.webp",
    pixlr: "/art/hero/pixlr-6ac83b83dba31debc51a6ecd (1).webp",
    egypt2: "/art/hero/egypt2.png",
  },
  /**
   * Procedural clouds — generated entirely in a raw WebGL fragment shader
   * (FBM domain-warped noise), the pear.no approach: generated texture, not
   * uploaded image. No `<img>`, no texture files.
   * - `pos` is baked at COMPILE time (kept identical across viewports);
   *   positions are pushed at RUNTIME as uniforms so a breakpoint switch
   *   never recompiles the shader.
   * - Scroll drift (px) mirrors the parallax and is scrubbed into the shader
   *   as center offsets from the GSAP timeline.
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
  copy: {
    eyebrow: "3WEEQ",
    headline: "Ancient Craft, Modern Presence",
    subheadline: "A fragrance scene built like an editorial painting.",
    cta: "Explore the Bottle",
  },
  perViewport: {
    desktop: {
      /** Merged scene: the hero (520vh) + the Egypt bridge (210vh). The pin
       *  covers both, so ONE pinned lens + ONE bottle spans hero→Egypt. */
      stageHeight: "730vh",
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
        zoomTo: 1.42,
        rotateY: 9,
        tilt: 2.5,
      },
    },
mobile: {
      stageHeight: "460vh",
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
        zoomTo: 1.28,
        rotateY: 4,
        tilt: 1,
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
    /** Hero→Egypt bridge. The timeline is 0→1.5: hero windows above keep
     *  their absolute positions (speed preserved), the bridge lives in
     *  [1.0, 1.5]. The pinned stage is 630vh/360vh so each unit = the same
     *  px as before (420vh/unit desktop, 240vh/unit mobile). */
    bridge: {
      worldReset: { start: 0.92, end: 1.05 },
      overlayFade: { start: 0.96, end: 1.1 },
      artworkFade: { start: 0.98, end: 1.16 },
      egyptFade: { start: 1.02, end: 1.32 },
      bottleTravel: { start: 1.05, end: 1.5 },
      copyIn: { start: 1.18, end: 1.36 },
    },
  },
} as const;

/**
 * Headline 3D extrusion (static, subtle) — shallow stacked
 * text-shadow so the title never reads flat. No motion effects.
 */
export const headlineMotion = {
  extrude: { layers: 6, step: 0.007, topLight: 42, bottomDark: 18 },
} as const;

/**
 * Egypt bridge — the SECOND half of the merged hero scene (not a separate
 * section). The SAME pinned lens + the SAME single bottle element continue:
 * the camera un-zooms (`world` returns to identity), the hero artwork and its
 * overlays fade away, the Egypt plate fades in, and the one bottle TRAVELS
 * from the hero focal down onto the Egypt platform — smaller, upright, never
 * covering the copy. Same image, same palette, one continuous shot.
 *
 * CONTINUITY IS DERIVED, NOT HARd-CODED: at runtime the bottle's start is the
 * frame's hero anchor (`pixlr.centerY`) and its start scale is the hero's
 * `motion.zoomTo`; only the SETTLED pose (`toTop`/`scaleTo`) is authored here.
 *
 * COLOR GRADING: the Egypt plate is regraded to the hero palette with
 * `imageFilter`, tied to the sky by a navy veil (`veil`) and a top `topFade`
 * that melts the hero navy into the plate — the two halves share one look.
 */
export const egyptConfig = {
  sectionId: "brand-story",
  /** Where the bottle settles. `scaleTo` is a fraction of the SAME base width
   *  the hero uses (`frame.pixlr.width`) → responsive by construction, and the
   *  handoff scale (`zoomTo`) is read from the hero at the seam. `toTop` is the
   *  settled center (% of the lens). */
  travel: {
    desktop: { toTop: 74, scaleTo: 0.5 },
    mobile: { toTop: 70, scaleTo: 0.82 },
  },
  /** Gentle lean as it travels (settles upright). */
  rotateFrom: -5,
  shadow: { maxOpacity: 0.45 },
  /** Hero-matched regrade for the Egypt plate. */
  imageFilter: "sepia(0.2) saturate(0.9) contrast(1.1) brightness(0.95)",
  /** Hero-navy veil tying the warm plate to the sky. */
  veil: "rgba(47, 78, 120, 0.3)",
  /** Top fade: melts the hero navy into the plate so the seam never cuts. */
  topFade:
    "linear-gradient(to bottom, #2f4e78 0%, rgba(47,78,120,0.55) 14%, rgba(47,78,120,0) 42%)",
} as const;