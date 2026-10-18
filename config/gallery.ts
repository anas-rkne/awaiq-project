/**
 * Gallery chapter — the curtained bottle gallery that sits between the About
 * chapter and the footer.
 *
 * Structure only: item order, image paths and links. All copy (eyebrow, title,
 * subheading, CTA, per-perfume name/tag) lives in the `Gallery` namespace of
 * the messages so the chapter stays bilingual — the same split About uses.
 *
 * The chapter is ONE pinned `100dvh` section. Two THREE.js velvet curtains
 * (WebGL, see `CurtainReveal` / `curtainScene.ts`) hang over it and part from
 * the centre as the scroll drives a scrub timeline; behind them a horizontal
 * bottle belt slides past while the bottle nearest the centre scales up.
 *
 * GEOMETRY IS VIEWPORT-RELATIVE (vw): card width, gap and the GSAP `x` all
 * speak vw, so a resize needs no re-measure — the belt re-reads its own size.
 */

export type GalleryItemId = "egypt" | "babylon" | "greece" | "china";

export interface GalleryItem {
  id: GalleryItemId;
  /** The product portrait shown on the card. */
  image: string;
  /** Store detail page the card links to. */
  href: string;
}

export const galleryConfig = {
  sectionId: "gallery",
  /** The four perfumes, in belt order (matches the store order). */
  items: [
    { id: "egypt", image: "/products/1.jpg", href: "/store/egypt" },
    { id: "babylon", image: "/products/2.jpg", href: "/store/babylon" },
    { id: "greece", image: "/products/3.jpg", href: "/store/greece" },
    { id: "china", image: "/products/4.jpg", href: "/store/china" },
  ] as GalleryItem[],
  /** Where the chapter's own CTA points. */
  ctaHref: "/store",
  /** Belt geometry — card box (vw) and gap (vw) per viewport. The card keeps
   *  the product's own 3:4 portrait ratio, so `object-cover` crops nothing. */
  card: {
    mobile: { width: 64, gap: 7 },
    desktop: { width: 26, gap: 3.5 },
    /** width / height of a product shot (896x1200). */
    aspect: 3 / 4,
    /** Scale of a card at the far edge and dead-centre of the belt. */
    scaleMin: 0.84,
    scaleMax: 1.06,
    /** Darkness of the veil laid over a card at the far edge (0 = clear). */
    veilMax: 0.6,
  },
  /**
   * Motion windows — normalized 0–1 positions on the pinned section, driven by
   * a single scrub trigger. The curtain parts first, then the belt travels.
   */
  motion: {
    /** The panels part from the centre (eased). */
    open: { start: 0, end: 0.42 },
    /** The gold seam light swells as the gap widens, then fades (a bell). */
    seam: { start: 0.06, end: 0.38 },
    /** The belt begins to travel — just before the panels are fully clear. */
    belt: { start: 0.4, end: 1 },
    /** The heading/subheading/CTA fade up once the curtain is open. */
    copy: { start: 0.42, end: 0.66 },
  },
  /** Scroll distance the section stays pinned — a scrub timeline, reversible. */
  pin: { mobile: "+=320%", desktop: "+=620%" },
  /**
   * The theatre curtain — two THREE.js velvet planes that hang over the
   * chapter and part from the centre as the scroll advances (`CurtainReveal`
   * / `curtainScene.ts`). The wind (desktop only) ripples them continuously
   * while they hang; the opening itself is the chapter's own scrub (see
   * `motion.open` above) — nothing here is animated outside the scene.
   *
   * All sizes are viewport-relative: the scene derives its world units from
   * the camera (`fov` / `cameraZ`), so `width` and `slide` are measured in
   * SCREEN WIDTHS. `segments` is mesh density (the wind moves real vertices);
   * `fold` bakes the static velvet pleats the sheen light lives on.
   *
   * VELVET RECIPE (tuned against real theatre drapes): EVERY light is cool —
   * key, sheen and fill — so the drape stays pure navy with no gold or warm
   * cast anywhere on the fabric (the chapter's gold lives in the seam light
   * and frame decor, never on the velvet); a navy ambient + sky/floor
   * hemisphere keep the creases from crushing to black. The grain texture
   * (baked in the scene) is the fabric itself: it breaks the sheen into
   * fibre, fold to fold.
   */
  curtain: {
    /** Deep navy velvet — sits between the ink and the spec blue and keeps the
     *  gallery's own mid-night palette. */
    color: "#2d4b70",
    roughness: 0.82,
    metalness: 0,
    sheen: 1,
    /** Cool silver-blue sheen — NO gold on the fabric: the lustre reads as
     *  velvet nap, never as a warm light. */
    sheenColor: "#8aa4c6",
    /** Tight sheen lobe: velvet lustre clings to the crests, not the valleys. */
    sheenRoughness: 0.32,
    /** Cool soft key (top-front-right) — carries the navy body. */
    light: { color: "#dfe9f7", intensity: 0.85, position: [0.8, 2.6, 2.4] },
    /** Navy ambient so nothing ever crushes to black. */
    ambient: { color: "#2f4e78", intensity: 0.35 },
    /** Sky/floor fill — the drape is a touch lighter at the rail than the hem. */
    hemi: { sky: "#5f7ea8", ground: "#0b1524", intensity: 0.5 },
    fov: 35,
    cameraZ: 3.2,
    /** Plane width per half, in viewport widths — 1.5× total: the pleats and
     *  the off-screen hang need the extra fabric. */
    width: 0.75,
    /** Slide per half when fully open, in viewport widths — a hair over half
     *  a screen so the fabric clears with the wind still moving. */
    slide: 0.56,
    segments: { desktop: { x: 120, y: 72 }, mobile: { x: 72, y: 40 } },
    maxDpr: 1.75,
    maxDprMobile: 1.5,
    /** The pleats gathered into each half: `count` waves across the width
     *  (≈90px on a desktop screen — real drape density), `depth` in world
     *  units, a second `twist` harmonic that makes them slightly asymmetric
     *  like gathered fabric, a forward `curve` that gives the drape volume,
     *  and `taper` — how much deeper the folds hang toward the floor. */
    fold: { count: 15, depth: 0.05, twist: 0.28, curve: 0.04, taper: 0.5 },
    /** The wind that ripples the hanging velvet — DESKTOP ONLY. `amp` is the
     *  world-unit throw at the free edge; each wave is a travelling ripple
     *  (`kx` across the fabric, `ky` down it, `omega` in rad/s — weights are
     *  normalized in the scene): a slow bulk sway under a mid travelling
     *  flutter under a fast fine shimmer. */
    wind: {
      amp: 0.125,
      waves: [
        { kx: 1.8, ky: 0.9, omega: 0.75, weight: 0.45 },
        { kx: 13, ky: 0, omega: 2.3, weight: 0.9 },
        { kx: 24, ky: 4, omega: 4.4, weight: 0.3 },
      ],
    },
  },
} as const;
