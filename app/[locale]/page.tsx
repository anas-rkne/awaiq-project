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
      {/*
        SAME `display:contents` shell, SAME reason — but for the DELETE path.
        ScrollTrigger wraps the pinned `#gallery` in a pin-spacer the moment
        the trigger is created, so the section is no longer a direct child of
        `<body>`. On a locale switch React deletes the old page subtree and
        calls removeChild on each branch's recorded parent for its TOP host
        node. Without the shell that node is `#gallery` itself — now sitting
        inside the pin-spacer — so removeChild throws NotFoundError, the
        commit dies mid-way, and the page is left torn (the
        "switching languages breaks the site" bug). The shell is never moved,
        so React removes IT (still a body child) and the chapter leaves with
        it. `contents` keeps the flex layout byte-for-byte identical — the
        About shell above proves this pattern survives the pin.
      */}
      <div className="contents">
        <GallerySection />
      </div>
      <SiteFooter />
    </>
  );
}