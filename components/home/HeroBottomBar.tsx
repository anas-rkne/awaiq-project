import { siteConfig } from "@/config/site";
import { ArrowButton } from "@/components/ui/ArrowButton";

/** Bottom hero bar: description (start) + CTAs (end). */
export function HeroBottomBar() {
  return (
    <footer className="relative z-40 w-full px-5 pb-6 sm:px-8 md:px-12 md:pb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <p className="max-w-[230px] text-[9px] font-normal leading-[1.7] tracking-[0.02em] text-beige/65 md:max-w-[250px] md:text-[10px]">
          {siteConfig.description}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          <ArrowButton href="#explore" variant="outline">
            Explore 3WEEQ
          </ArrowButton>
          <ArrowButton href="#creatures" variant="solid">
            Meet the Creatures
          </ArrowButton>
        </div>
      </div>
    </footer>
  );
}
