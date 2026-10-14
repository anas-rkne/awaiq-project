import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductDetail } from "@/components/store/ProductDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProduct, storeConfig } from "@/config/store";
import { getSiteUrl } from "@/lib/site-url";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return storeConfig.products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const t = await getTranslations({ locale, namespace: "Store" });
  const copy = t.raw("products") as Record<string, { name: string; tag: string }>;
  const c = copy[product.id];
  return {
    title: `${c.name} — 3WEEQ`,
    description: c.tag,
    alternates: {
      canonical: `/${locale}/store/${product.id}`,
      languages: {
        ar: `/ar/store/${product.id}`,
        en: `/en/store/${product.id}`,
      },
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Store" });
  const copy = t.raw("products") as Record<string, { name: string; story: string }>;
  const c = copy[product.id];
  const base = getSiteUrl();
  const productUrl = `${base}/${locale}/store/${product.id}`;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: c.name,
    description: c.story,
    image: [product.image, ...product.gallery].map((src) => `${base}${src}`),
    sku: product.id,
    brand: { "@type": "Brand", name: "3WEEQ" },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      name: `${variant.sizeMl} ml`,
      url: productUrl,
      price: variant.price,
      priceCurrency: storeConfig.currency,
      availability: "https://schema.org/InStock",
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("title"),
        item: `${base}/${locale}/store`,
      },
      { "@type": "ListItem", position: 2, name: c.name, item: productUrl },
    ],
  };

  return (
    <>
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
      <SiteHeader />
      <ProductDetail productId={product.id} />
    </>
  );
}
