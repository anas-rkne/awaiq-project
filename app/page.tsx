import { HeroSection } from "@/components/home/Hero/HeroSection";
import { HandsSection } from "@/components/home/Hands/HandsSection";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Home — thin composition only.
 * Layout lives in `components/layout`, sections in `components/home`,
 * copy in `config/site.ts`.
 *
 * `/` is redirected to the detected locale by `proxy.ts` (next-intl
 * middleware, 307 → `/ar`), so this route is NEVER rendered for users.
 * `force-dynamic` opts it out of build-time prerendering: without a locale
 * param there is no `NextIntlClientProvider`, and `useLocale()` in the
 * shared client components would throw during static generation.
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <HandsSection />
    </>
  );
}
