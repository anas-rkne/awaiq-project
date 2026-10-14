import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/Hero/HeroSection";
import { HandsSection } from "@/components/home/Hands/HandsSection";
import { AboutSection } from "@/components/home/About/AboutSection";
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
      <AboutSection />
      <SiteFooter />
    </>
  );
}