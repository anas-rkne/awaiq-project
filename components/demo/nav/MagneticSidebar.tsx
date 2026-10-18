"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

/**
 * Magnetic Sidebar — pointer attraction plus a shared `layoutId` marker.
 *
 * 1. Magnetic pull: the item writes its own offset into two MotionValues on
 *    `pointermove`. Nothing is keyed on screen coordinates, so React never
 *    re-renders while the cursor travels across the list.
 * 2. The raw offsets are fed through `useSpring` (`stiffness 260, damping 18`)
 *    — an under-damped spring, deliberately, so the row overshoots a touch on
 *    release. That overshoot is what reads as "physical" rather than "CSS".
 * 3. The active marker is ONE `layoutId` node. Switching rows makes React mount
 *    it inside a different `<li>`; Motion FLIPs it from the previous box to
 *    the new one using a measured, inverted transform — `left`/`top` are never
 *    written, so the marker stays correct under RTL (the box is measured, and
 *    direction is irrelevant to a transform).
 * 4. `borderRadius` is set through `style` so Motion's scale corrector keeps
 *    the marker's corners round while it stretches; and `LayoutGroup` scopes
 *    the id to this component so the tab pill and the dock dot stay separate.
 */

export interface MagneticSidebarProps {
  items: { label: string; href: string }[];
  ariaLabel: string;
}

const MARKER_RADIUS = 8;

export function MagneticSidebar({ items, ariaLabel }: MagneticSidebarProps) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const [active, setActive] = useState(0);

  return (
    <LayoutGroup id="magnetic-sidebar">
      <nav
        aria-label={ariaLabel}
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="w-full max-w-[300px] rounded-[22px] border border-beige/15 bg-white/[0.04] p-2 backdrop-blur-sm"
      >
        <ul className="flex flex-col gap-1">
          {items.map((item, index) => (
            <MagneticRow
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={index === active}
              reduced={Boolean(reduced)}
              onSelect={() => setActive(index)}
            />
          ))}
        </ul>
      </nav>
    </LayoutGroup>
  );
}

interface MagneticRowProps {
  href: string;
  label: string;
  isActive: boolean;
  reduced: boolean;
  onSelect: () => void;
}

const PULL_X = 0.34;
const PULL_Y = 0.42;

function MagneticRow({ href, label, isActive, reduced, onSelect }: MagneticRowProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 18, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 260, damping: 18, mass: 0.5 });

  const handlePointerMove = (event: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    rawX.set((event.clientX - (bounds.x + bounds.width / 2)) * PULL_X);
    rawY.set((event.clientY - (bounds.y + bounds.height / 2)) * PULL_Y);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <li className="relative">
      <motion.a
        ref={ref}
        href={href}
        onClick={onSelect}
        onPointerMove={handlePointerMove}
        onPointerLeave={reset}
        aria-current={isActive ? "page" : undefined}
        className="relative flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-gold/70"
        style={{ x, y, borderRadius: 14 }}
        whileHover={reduced ? undefined : { scale: 0.98 }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.6 }}
      >
        {isActive ? (
          reduced ? (
            <span
              aria-hidden="true"
              className="absolute inset-y-1 start-0 w-[3px] bg-gold"
              style={{ borderRadius: MARKER_RADIUS }}
            />
          ) : (
            <motion.span
              layoutId="magnetic-sidebar-marker"
              aria-hidden="true"
              className="absolute inset-y-1 start-0 w-[3px] bg-gold"
              style={{ borderRadius: MARKER_RADIUS }}
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
            />
          )
        ) : null}

        <motion.span
          layout
          className={isActive ? "relative z-10 font-medium text-beige" : "relative z-10 text-beige/70"}
        >
          {label}
        </motion.span>
      </motion.a>
    </li>
  );
}
