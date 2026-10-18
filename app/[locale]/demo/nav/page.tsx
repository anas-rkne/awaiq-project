import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { NavDemo } from "@/components/demo/nav/NavDemo";
import { routing } from "@/i18n/routing";

type NavDemoPageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: NavDemoPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NavDemo" });
  return {
    title: `${t("title")} — 3WEEQ`,
    description: t("subtitle"),
    robots: { index: false, follow: false },
  };
}

/**
 * Navigation Motion Lab — a dev harness, deliberately noindexed.
 * Three navigation patterns sharing one Motion install, each isolated in its
 * own `LayoutGroup` so their `layoutId` namespaces cannot collide.
 */
export default async function NavDemoPage({ params }: NavDemoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteHeader />
      <NavDemo />
    </>
  );
}
