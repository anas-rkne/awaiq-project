/**
 * Gallery chapter — the curtained bottle gallery that sits between the About
 * chapter and the footer.
 *
 * Structure only: item order, image paths and links. All copy (eyebrow, title,
 * subheading, CTA, per-perfume name/tag) lives in the `Gallery` namespace of
 * the messages so the chapter stays bilingual — the same split About uses.
 *
 * The chapter is ONE pinned `100dvh` section. A pair of velvet CSS panels
 * (no images — a transform-only opening, see `CurtainVeil`) part from the
 * centre as the scroll drives a scrub timeline; behind them a horizontal
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
} as const;
