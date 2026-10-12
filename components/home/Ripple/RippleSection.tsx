"use client";

import Image from "next/image";
import { rippleConfig } from "@/config/site";
import { RippleCanvas } from "./RippleCanvas";

/**
 * Ripple banner — one full-bleed image, exactly as tall as the collection
 * card images, that refracts like water as the page scrolls past. The plain
 * `<img>` renders the picture immediately (and remains the fallback under
 * reduced-motion / no-WebGL); `RippleCanvas` layers the WebGL distortion on
 * top and covers it once ready.
 */
export function RippleSection() {
  const cfg = rippleConfig;

  return (
    <section
      id={cfg.sectionId}
      className="relative w-full overflow-hidden"
      style={{ height: `min(${cfg.heightPx}px, ${cfg.heightVh}svh)` }}
    >
      <Image
        src={cfg.image}
        alt=""
        fill
        sizes="100vw"
        draggable={false}
        className="object-cover select-none"
      />
      <RippleCanvas />
    </section>
  );
}
