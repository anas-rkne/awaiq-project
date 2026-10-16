"use client";

import type { RefObject } from "react";
import Image from "next/image";
import leftStandArt from "@/public/images/left_stand.png";
import rightStandArt from "@/public/images/right_stand.png";

interface CurtainVeilProps {
  /** The left panel — GSAP drives `xPercent: -100 → 0`. */
  leftRef: RefObject<HTMLDivElement | null>;
  /** The right panel — GSAP drives `xPercent: 0 → 100`. */
  rightRef: RefObject<HTMLDivElement | null>;
  /** The centred gold seam light — GSAP drives its `opacity` (a bell). */
  seamRef: RefObject<HTMLDivElement | null>;
  /**
   * Reduced-motion: keep the curtain MOUNTED but `display:none`, so the pinned
   * section's children are never removed/inserted after ScrollTrigger has
   * wrapped it in a pin-spacer (a structural swap there breaks React's commit).
   */
  hidden?: boolean;
}

/**
 * The velvet curtain — the two supplied stand plates (`left_stand.png`,
 * `right_stand.png`).
 *
 * Each plate is a wide stage-shot (669x373) whose VELVET occupies only one band
 * of the canvas: the left plate's fabric sits at 12–50% of its width, the right
 * plate's at 50–88%, and both carry a bright warm lamp at their meeting edge
 * (~50%) beneath a full-width rod across the top.
 *
 * To turn those into two curtain HALVES that fully cover the viewport we render
 * each plate larger than its panel and offset it so its fabric band (12–50% /
 * 50–88%) maps exactly onto the panel (0–100%), which puts the two warm lamps
 * together at the top-centre of the closed curtain. The panel's own navy is the
 * backdrop, so any transparent sliver of the plate simply blends into velvet.
 *
 * The opening is `transform: translateX` (composited) and the seam is an
 * `opacity`-only glow — no blend modes, no blur filters.
 */
const FABRIC_LEFT = { start: 0.12, end: 0.5 };
const FABRIC_RIGHT = { start: 0.5, end: 0.88 };
/** width of the plate relative to its panel (fabric band → full panel). */
const plateWidth = (1 / (FABRIC_LEFT.end - FABRIC_LEFT.start)) * 100; // ≈263%
/**
 * The plate's curtain ROD is a bright gold bar at ~4–6.5% of the canvas height.
 * The display starts just below it and is stretched a touch past the panel, so
 * the rod (and the "light line" it reads as) stays off-screen and the velvet
 * fills the panel top-to-bottom. Folds are vertical, so the stretch is invisible.
 */
const plateHeight = 113;
const plateTop = -8.5;

export function CurtainVeil({
  leftRef,
  rightRef,
  seamRef,
  hidden = false,
}: CurtainVeilProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 overflow-hidden ${hidden ? "hidden" : ""}`}
      aria-hidden="true"
    >
      {/* Left curtain half */}
      <div
        ref={leftRef}
        data-gallery="left"
        className="absolute inset-y-0 left-0 w-[50.5%] overflow-hidden will-change-transform"
        style={{ backgroundColor: "#101826" }}
      >
        <div
          className="absolute"
          style={{
            width: `${plateWidth}%`,
            height: `${plateHeight}%`,
            left: `${-FABRIC_LEFT.start * plateWidth}%`,
            top: `${plateTop}%`,
          }}
        >
          <Image
            src={leftStandArt}
            alt=""
            fill
            sizes="130vw"
            style={{ objectFit: "fill" }}
          />
        </div>
      </div>

      {/* Right curtain half */}
      <div
        ref={rightRef}
        data-gallery="right"
        className="absolute inset-y-0 right-0 w-[50.5%] overflow-hidden will-change-transform"
        style={{ backgroundColor: "#101826" }}
      >
        <div
          className="absolute"
          style={{
            width: `${plateWidth}%`,
            height: `${plateHeight}%`,
            left: `${-FABRIC_RIGHT.start * plateWidth}%`,
            top: `${plateTop}%`,
          }}
        >
          <Image
            src={rightStandArt}
            alt=""
            fill
            sizes="130vw"
            style={{ objectFit: "fill" }}
          />
        </div>
      </div>

      {/* Gold seam light — invisible at rest, swells as the gap widens. */}
      <div
        ref={seamRef}
        data-gallery="seam"
        className="absolute inset-y-0 left-1/2 w-[26vw] max-w-[420px] -translate-x-1/2 opacity-0"
      >
        <div
          className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to bottom, rgba(205,158,97,0) 0%, rgba(205,158,97,0.9) 22%, rgba(246,230,214,0.95) 50%, rgba(205,158,97,0.9) 78%, rgba(205,158,97,0) 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 left-1/2 w-full -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 38% 58% at 50% 50%, rgba(205,158,97,0.34), rgba(205,158,97,0) 70%)",
          }}
        />
      </div>
    </div>
  );
}
