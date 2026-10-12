import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/Hero/HeroSection";
import { HandsSection } from "@/components/home/Hands/HandsSection";
import { CollectionSection } from "@/components/home/Collection/CollectionSection";
import { RippleSection } from "@/components/home/Ripple/RippleSection";
import { SiteHeader } from "@/components/layout/SiteHeader";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Home — thin composition only.
 * Layout lives in `components/layout`, sections in `components/home`.
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <HandsSection />
      <CollectionSection />
      <RippleSection />
    </>
  );
}