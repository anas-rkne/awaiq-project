"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";

/**
 * Elastic Tabs — the layoutId / FLIP harness.
 *
 * How the FLIP engine drives this, under the hood:
 *
 * 1. A tab is clicked → React re-renders and the single pill node becomes a
 *    child of a *different* tab. Motion never animates `left`/`top`; it first
 *    measures the pill's new box ("Last"), projects it back onto the previous
 *    box ("First"), writes an inverted transform, then plays it out to
 *    `transform: none` ("Invert, Play"). Values are read from the DOM, so the
 *    result is pixel-identical to plain CSS layout.
 * 2. `layoutId` is what lets Motion treat the two pills as the *same* element.
 *    Exactly one pill exists at any time, so there is no crossfade — the
 *    transition is a pure translation.
 * 3. `layout` on the labels is a second FLIP pass: the pill changes width
 *    (asymmetric `px-5`/`px-6` padding), so the active label shifts a few px.
 *    Without `layout` that shift would snap instantly and look detached from
 *    the pill; with it the two stay in phase.
 * 4. Scale distortion: the pill grows through `scale`, which would smear its
 *    corner radius — so the radius is set through `style`, the only place
 *    Motion's scale corrector reads it from. The parent carries `layout` too,
 *    so its children get counter-scales and do not stretch.
 * 5. `LayoutGroup` namespaces the shared id, so a `layoutId` from another
 *    component on the page can never capture this pill.
 *
 * Layout changes come only from React renders plus `style`/`className` — never
 * from `animate={{ x }}` / `left` / `top`.
 */

export interface ElasticTabsNavbarProps {
  labels: string[];
  ariaLabel: string;
}

const PILL_RADIUS = 16;

export function ElasticTabsNavbar({ labels, ariaLabel }: ElasticTabsNavbarProps) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const [active, setActive] = useState(0);

  return (
    <LayoutGroup id="elastic-tabs">
      <nav
        aria-label={ariaLabel}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="inline-flex flex-wrap items-center gap-1 rounded-[22px] border border-beige/15 bg-white/[0.04] p-1.5 backdrop-blur-sm"
      >
        {labels.map((label, index) => {
          const isActive = index === active;

          return (
            <motion.button
              key={label}
              type="button"
              onClick={() => setActive(index)}
              aria-current={isActive ? "page" : undefined}
              className="relative flex items-center px-5 py-3 text-[13px] font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-gold/70 md:px-6 md:text-sm"
              style={{ borderRadius: PILL_RADIUS }}
              whileHover={reduced ? undefined : { scale: 0.97 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 480, damping: 30, mass: 0.5 }}
            >
              {isActive ? (
                reduced ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gold"
                    style={{ borderRadius: PILL_RADIUS }}
                  />
                ) : (
                  <motion.span
                    layoutId="elastic-tabs-pill"
                    aria-hidden="true"
                    className="absolute inset-0 bg-gold"
                    style={{ borderRadius: PILL_RADIUS }}
                    transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                  />
                )
              ) : null}

              <motion.span
                layout
                className="relative z-10 whitespace-nowrap"
                animate={{
                  color: isActive ? "#1a3350" : "rgba(246,230,214,0.72)",
                }}
                transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
              >
                {label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}
