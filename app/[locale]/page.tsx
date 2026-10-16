import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/Hero/HeroSection";
import { HandsSection } from "@/components/home/Hands/HandsSection";
import { AboutSection } from "@/components/home/About/AboutSection";
import { GallerySection } from "@/components/home/Gallery/GallerySection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Home — thin composition only.
 * Layout lives in `components/layout`, sections in `components/home`.
 *
 * Hero + hands finale are frozen. The post-hero "About" chapter is rebuilt
 * from the reference (`momentolegal.com`) — see `components/home/About`.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <HandsSection />
      {/*
        `display:contents` shell around the pinned About chapter.
        ScrollTrigger wraps the pinned `<section>` in a pin-spacer, so the
        section itself is no longer a direct child of `<body>`. Anything React
        later inserts *before* it (the hero's reduced-motion scenes, the Hands
        chapter) anchors on its previous sibling — and `insertBefore` fails when
        that anchor is a pin-spacer child. This shell stays a stable child of
        `<body>`, so it can always serve as that anchor. `contents` keeps the
        flex layout byte-for-byte identical.
      */}
      <div className="contents">
        <AboutSection />
      </div>
      <GallerySection />
      <SiteFooter />
    </>
  );
}