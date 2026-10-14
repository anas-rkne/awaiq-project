/**
 * Craft — "The Craft" section.
 *
 * A pinned, split-screen narrative: a stack of images (left) is unmasked stage
 * by stage while the copy (right) advances, then the numbers finale takes over.
 * The section owns ONLY tokens + image paths here; all copy lives in the
 * `CraftSection` messages (ar/en) so the section stays bilingual.
 *
 * Scroll model: the section is `scrollHeight` tall with a `100svh` CSS-sticky
 * child, so the stage pins for (scrollHeight − 100vh) of travel and a single
 * scrubbed GSAP timeline — keyed off normalized progress 0→1 — drives every
 * reveal. All timeline positions below are that normalized landscape.
 */
export const craftConfig = {
  sectionId: "craft",
  /** Taller than the viewport so the sticky stage can tell the whole story.
   *  Trimmed so each step of travel maps to a visible event (no dead scroll). */
  scrollHeight: { desktop: "200vh", mobile: "220vh" },

  /** The three making stages, in order. `id` indexes the messages copy. */
  stages: [
    { id: "extraction", image: "/craft/craft-1.jpg" },
    { id: "distillation", image: "/craft/craft-2.jpg" },
    { id: "sealing", image: "/craft/craft-3.jpg" },
  ],

  /** Optional full-bleed table backdrop (kept for a later depth pass). */
  backgroundImage: "/craft/craft-bg.jpg",

  /** The finale counters. `value` counts up from 0; `key` indexes `stats`. */
  stats: [
    { key: "hours", value: 48, suffix: "" },
    { key: "purification", value: 7, suffix: "" },
    { key: "natural", value: 100, suffix: "%" },
    { key: "experience", value: 30, suffix: "+" },
  ],

  /** Light colour grade for the stage photos — see `.craft-image` in
   *  app/globals.css (base + hover). The brief forbids altering the source
   *  images, so this is a CSS veil only. */
  imageRadius: 20,
  imageVeil:
    "linear-gradient(105deg, rgba(15,22,34,0.12) 0%, rgba(15,22,34,0.55) 100%)",

  backdrop: {
    /** Black veil opacity over the parchment. The craft-bg image is dark, so
     *  the light veil (brief's "dark image" case) keeps the manuscript legible
     *  instead of flattening it to navy. Tune 0.25–0.45. */
    blackOpacity: 0.3,
    /** Brand gradient that binds the beige manuscript to the navy identity. */
    gradient:
      "linear-gradient(to bottom, rgba(26,51,80,0.55) 0%, rgba(47,78,120,0.35) 50%, rgba(26,51,80,0.55) 100%)",
    /** Solid base behind the parchment (shows if the image fails to load). */
    base: "#1a3350",
  },

  /** Scrub feel — how long the timeline takes to catch up to the scroll. */
  scrub: 1,

  /** Normalized timeline (0→1) — ONE source of truth for every reveal. */
  timeline: {
    /** Title block leaves as the first stage arrives. */
    intro: { out: 0.12, dur: 0.1 },
    /** Each stage copy fades in / out on this window. */
    text: { inDur: 0.12, outDur: 0.1 },
    /** The mask wipe between images. */
    imageReveal: { dur: 0.16 },
    /** Per-stage copy windows [in, out], and the image wipe start per index. */
    stages: [
      { in: 0.16, out: 0.34 },
      { in: 0.4, out: 0.58 },
      { in: 0.64, out: 0.8 },
    ],
    imageAt: [0, 0.3, 0.56],
    /** The numbers finale. */
    numbers: { at: 0.82, dur: 0.14 },
    /** Dim the stage as the finale rises. */
    gridDim: { at: 0.8, dur: 0.12, to: 0.12 },
    /** Section progress that kicks the counters off. */
    counterAt: 0.84,
  },

  /** Parallax: the photo drifts inside its mask as the section scrolls. */
  parallax: { imageYPercent: 7 },

  /** Entrance for the title block (once, on first view). */
  entrance: { y: 40, duration: 1.1, ease: "power3.out" },
} as const;
