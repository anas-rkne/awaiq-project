/**
 * About chapter — the post-hero section ported from the reference
 * (`momentolegal.com`, `HomeExpertiseSection`).
 *
 * Structure only: images, item order and links. All copy (title, paragraphs,
 * CTA, perfume names/summaries, insight titles) lives in the `About`
 * namespace of the messages so the chapter stays bilingual — exactly the split
 * the reference uses (server-rendered content props + this static shape).
 *
 * The reference rotates ten legal practice areas around a pocket watch
 * (`cleanclock.png`) standing on a "block" column (`blockv2.png`). Our clone
 * keeps the identical geometry/motion but swaps the watch for the brand bottle
 * (`pixlr-bottle`) and the practice areas for the four perfumes, whose product
 * shots fill the circular window on the bottle.
 */

export type AboutPerfumeId = "egypt" | "babylon" | "greece" | "china";

export interface AboutPerfume {
  id: AboutPerfumeId;
  /** Product shot shown inside the circular window on the bottle. */
  image: string;
  /** Store detail page the bottle links to. */
  href: string;
}

export interface AboutInsight {
  id: string;
  /** Cover image of the inset insight card. */
  image: string;
  /** Destination the card links to. */
  href: string;
}

export const aboutConfig = {
  sectionId: "about",
  /** The vertical pillar each bottle stands on (reference: blockv2.png). */
  blockColumn: "/images/home/blockv2.png",
  /** The central object — replaces the reference pocket watch. */
  bottle: "/art/hero/pixlr-bottle.webp",
  /** The four perfumes, in rotation order (matches the store order). */
  perfumes: [
    { id: "egypt", image: "/products/1.jpg", href: "/store/egypt" },
    { id: "babylon", image: "/products/2.jpg", href: "/store/babylon" },
    { id: "greece", image: "/products/3.jpg", href: "/store/greece" },
    { id: "china", image: "/products/4.jpg", href: "/store/china" },
  ] as AboutPerfume[],
  /** The inset "insights" strip — same cards/texts slider as the reference. */
  insights: [
    { id: "egypt", image: "/products/1.jpg", href: "/store/egypt" },
    { id: "babylon", image: "/products/2.jpg", href: "/store/babylon" },
    { id: "greece", image: "/products/3.jpg", href: "/store/greece" },
    { id: "china", image: "/products/4.jpg", href: "/store/china" },
  ] as AboutInsight[],
  /** Where the section's own circle CTA points. */
  ctaHref: "/store",
} as const;
