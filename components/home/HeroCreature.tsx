import Image from "next/image";

/**
 * Hero centerpiece — transparent character glued to the very bottom
 * of the hero viewport, rising up in front of the headline.
 * `pointer-events-none` keeps buttons underneath fully clickable.
 */
export function HeroCreature() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-center"
    >
      <Image
        src="/hero_cheet.png"
        alt=""
        width={1400}
        height={1400}
        priority
        className="h-auto w-auto max-h-[40vh] max-w-[75vw] object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:max-h-[54vh] sm:max-w-[62vw]"
      />
    </div>
  );
}
