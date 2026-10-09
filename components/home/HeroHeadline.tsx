import { headlineMotion, siteConfig } from "@/config/site";

const { extrude } = headlineMotion;

/** Subtle static 3D extrusion (shallow, em-based → scales with the font). */
const EXTRUDE_SHADOW = Array.from({ length: extrude.layers }, (_, i) => {
  const offset = ((i + 1) * extrude.step).toFixed(3);
  const light =
    extrude.topLight -
    ((extrude.topLight - extrude.bottomDark) * i) / (extrude.layers - 1);
  return `${offset}em ${offset}em 0 hsl(0 0% ${light.toFixed(1)}%)`;
}).join(", ");

/** Hero headline — simple, static 3D depth so it never reads flat. */
export function HeroHeadline() {
  return (
    <div className="px-5 text-center">
      <p className="mb-2 text-[8px] font-medium uppercase tracking-[0.28em] text-beige/55 md:mb-3 md:text-[10px]">
        {siteConfig.tagline}
      </p>

      <h1
        className="w-full font-black uppercase leading-[0.85] text-beige"
        style={{
          fontSize: "clamp(4.2rem, 17.5vw, 12.5rem)",
          letterSpacing: "-0.045em",
          textShadow: EXTRUDE_SHADOW,
        }}
      >
        {siteConfig.name}
      </h1>
    </div>
  );
}
