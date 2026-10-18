"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import {
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * Floating Dock — proximity magnification driven by MotionValues.
 *
 * 1. The pointer position lives in ONE `mouseX` MotionValue written by the
 *    container's `onPointerMove`. Moving the mouse never triggers a React
 *    render — every item subscribes to the value instead. That is the reason
 *    this holds 60fps where a naive `setState` version would re-render the
 *    dock 60×/second.
 * 2. Each item measures its own centre from the DOM on every value change, so
 *    the mapping survives resizes, font loading and label swaps — no cached,
 *    stale offsets.
 * 3. distance → size is a range transform (`[-150, 0, 150] → [44, 78, 44]`)
 *    wrapped in `useSpring`; the spring supplies the macOS-style lag and
 *    settle, a raw transform would track the cursor rigidly.
 * 4. Size is animated as real `width`/`height` (not `scale`), so glyph strokes
 *    are never distorted and no scale corrector is required.
 * 5. The active dot is a single `layoutId` element inside this component's own
 *    `LayoutGroup`, so it cannot collide with the other demos' ids.
 */

export interface DockEntry {
  label: string;
  href: string;
}

export interface FloatingDockProps {
  items: DockEntry[];
  ariaLabel: string;
}

const ICONS = [
  "M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.8Z",
  "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  "m12 3 1.9 4.6L19 9.5l-4 3.4 1.2 5.1L12 15.4 7.8 18l1.2-5.1-4-3.4 5.1-1.9L12 3Z",
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2",
];

const NEIGHBOURHOOD = 150;
const MIN_SIZE = 44;
const MAX_SIZE = 78;
const DOT_SIZE = 10;

export function FloatingDock({ items, ariaLabel }: FloatingDockProps) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const [active, setActive] = useState(0);

  return (
    <LayoutGroup id="floating-dock">
      <nav
        aria-label={ariaLabel}
        dir={locale === "ar" ? "rtl" : "ltr"}
        onPointerMove={(event) => {
          if (!reduced) mouseX.set(event.clientX);
        }}
        onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className="inline-flex items-end gap-3 rounded-[26px] border border-beige/15 bg-white/[0.06] px-4 pt-3 pb-4 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
      >
        {items.map((item, index) => (
          <DockItem
            key={item.href}
            mouseX={mouseX}
            icon={ICONS[index % ICONS.length]}
            label={item.label}
            href={item.href}
            isActive={index === active}
            onSelect={() => setActive(index)}
            reduced={Boolean(reduced)}
          />
        ))}
      </nav>
    </LayoutGroup>
  );
}

interface DockItemProps {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  icon: string;
  label: string;
  href: string;
  isActive: boolean;
  onSelect: () => void;
  reduced: boolean;
}

function DockItem({ mouseX, icon, label, href, isActive, onSelect, reduced }: DockItemProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return NEIGHBOURHOOD;
    return value - (bounds.x + bounds.width / 2);
  });

  const sizeSource = useTransform(distance, [-NEIGHBOURHOOD, 0, NEIGHBOURHOOD], [
    MIN_SIZE,
    MAX_SIZE,
    MIN_SIZE,
  ]);
  const size = useSpring(sizeSource, { mass: 0.1, stiffness: 180, damping: 14 });

  return (
    <a
      ref={ref}
      href={href}
      onClick={onSelect}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      title={label}
      className="group relative flex flex-col items-center no-underline"
    >
      <motion.span
        className="flex items-center justify-center rounded-2xl border border-beige/15 bg-navy-ink/70 text-beige/85 transition-colors group-hover:border-gold/50 group-hover:text-beige"
        style={
          reduced
            ? { width: MIN_SIZE, height: MIN_SIZE, borderRadius: 18 }
            : { width: size, height: size, borderRadius: 18 }
        }
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-full w-full p-[22%]">
          <path
            d={icon}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>

      {/* Slot is always reserved so activating an item never shifts the dock;
          only the dot itself is the shared `layoutId` element. */}
      <span aria-hidden="true" className="mt-2 flex h-[10px] w-full items-center justify-center">
        {isActive ? (
          reduced ? (
            <span
              className="block bg-gold"
              style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE }}
            />
          ) : (
            <motion.span
              layoutId="floating-dock-dot"
              className="block bg-gold"
              style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE }}
              transition={{ type: "spring", stiffness: 460, damping: 32 }}
            />
          )
        ) : null}
      </span>
    </a>
  );
}
