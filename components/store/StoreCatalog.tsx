"use client";

import { useLocale, useTranslations } from "next-intl";
import { storeConfig } from "@/config/store";
import { ProductCard } from "./ProductCard";
import { StoreShell } from "./StoreShell";

/**
 * Catalog — the four perfumes as a responsive grid. The header keeps the
 * section-title rhythm of the home page (eyebrow · title · subtitle).
 */
export function StoreCatalog() {
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";

  return (
    <StoreShell>
      <div dir={isRtl ? "rtl" : "ltr"}>
        <header className="mb-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] font-medium tracking-[0.3em] text-gold">
            {t("eyebrow")}
          </p>
          <h1 className="font-primary text-[clamp(2.2rem,5vw,3.5rem)] font-medium leading-tight text-beige">
            {t("title")}
          </h1>
          <p className="max-w-md text-beige/70">{t("subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {storeConfig.products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </StoreShell>
  );
}
