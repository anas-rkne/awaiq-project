import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { storeConfig } from "@/config/store";
import { getSiteUrl } from "@/lib/site-url";

type StorePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Store" });
  return {
    title: `${t("title")} — 3WEEQ`,
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/store`,
      languages: { ar: "/ar/store", en: "/en/store" },
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Store" });
  const copy = t.raw("products") as Record<string, { name: string }>;
  const base = getSiteUrl();

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: storeConfig.products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/${locale}/store/${product.id}`,
      name: copy[product.id].name,
    })),
  };

  return (
    <>
      <JsonLd data={listLd} />
      <SiteHeader />
      <StoreCatalog />
    </>
  );
}
