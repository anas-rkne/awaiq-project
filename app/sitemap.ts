import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { storeConfig } from "@/config/store";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Static sitemap: the home page, the store catalog and every product, once per
 * locale, with `hreflang` alternates linking the two languages. The checkout
 * page is intentionally excluded (transactional, `noindex`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const routes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/store", changeFrequency: "weekly" as const, priority: 0.9 },
    ...storeConfig.products.map((product) => ({
      path: `/store/${product.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return routes.flatMap((route) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${base}/${locale}${route.path}`]),
    );

    return routing.locales.map((locale) => ({
      url: `${base}/${locale}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages },
    }));
  });
}
