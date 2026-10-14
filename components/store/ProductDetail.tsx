"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { getProduct, getVariant, storeConfig } from "@/config/store";
import { AddToCartButton } from "./AddToCartButton";
import { ProductCard } from "./ProductCard";
import { QuantityStepper } from "./QuantityStepper";
import { StoreShell } from "./StoreShell";

type ProductCopy = {
  name: string;
  tag: string;
  story: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
};

/**
 * Product detail — one portrait, the fragrance's story and notes, a size
 * selector, a quantity control and the add-to-cart action. All copy is
 * bilingual; the whole layout mirrors under RTL via logical properties.
 */
export function ProductDetail({ productId }: { productId: string }) {
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";
  const product = getProduct(productId);

  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <StoreShell>
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="flex flex-col items-center gap-6 py-24 text-center"
        >
          <h1 className="font-primary text-3xl text-beige">{t("notFound")}</h1>
          <p className="max-w-md text-beige/70">{t("notFoundDesc")}</p>
          <Link
            href="/store"
            className="border border-gold bg-gold px-8 py-3 text-sm font-medium text-navy-ink transition-colors hover:bg-transparent hover:text-gold"
          >
            {t("backToStore")}
          </Link>
        </div>
      </StoreShell>
    );
  }

  const copy = t.raw("products") as Record<string, ProductCopy>;
  const c = copy[product.id];
  const variant = getVariant(product, variantId) ?? product.variants[0];

  const notes: Array<[string, string]> = [
    [t("notesTop"), c.notesTop],
    [t("notesHeart"), c.notesHeart],
    [t("notesBase"), c.notesBase],
  ];

  return (
    <StoreShell>
      <div dir={isRtl ? "rtl" : "ltr"}>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-beige/60 transition-colors hover:text-beige"
        >
          <span aria-hidden="true">{isRtl ? "→" : "←"}</span>
          {t("backToStore")}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Portrait */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-beige/10">
            <Image
              src={product.image}
              alt={c.name}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 44vw"
              className="object-cover select-none"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-8 lg:py-4">
            <header className="flex flex-col gap-2">
              <p className="text-[10px] font-medium tracking-[0.3em] text-gold">
                {t("eyebrow")}
              </p>
              <h1 className="font-primary text-[clamp(2.4rem,5vw,3.75rem)] font-medium leading-none text-beige">
                {c.name}
              </h1>
              <p className="text-beige/70">{c.tag}</p>
            </header>

            <p
              className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium text-gold"
              aria-live="polite"
            >
              {formatPrice(variant.price)}{" "}
              <span className="text-base text-beige/70">
                {t("currency")}
              </span>
            </p>

            <p className="max-w-prose leading-relaxed text-beige/80">
              {c.story}
            </p>

            {/* Notes */}
            <div className="flex flex-col gap-3 border-y border-beige/10 py-6">
              <p className="text-[10px] font-medium tracking-[0.3em] text-beige/50">
                {t("notes")}
              </p>
              {notes.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-sm text-beige/55">{label}</span>
                  <span className="text-sm text-beige">{value}</span>
                </div>
              ))}
            </div>

            {/* Size */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-[10px] font-medium tracking-[0.3em] text-beige/50">
                {t("size")}
              </legend>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => {
                  const active = v.id === variant.id;
                  return (
                    <label
                      key={v.id}
                      className={`cursor-pointer rounded-full border px-5 py-3 text-sm transition-colors duration-200 ${
                        active
                          ? "border-gold bg-gold/10 text-beige"
                          : "border-beige/20 text-beige/70 hover:border-beige/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={v.id}
                        checked={active}
                        onChange={() => setVariantId(v.id)}
                        className="sr-only"
                      />
                      {v.sizeMl} {t("ml")}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Quantity + add */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-medium tracking-[0.3em] text-beige/50">
                  {t("quantity")}
                </span>
                <QuantityStepper value={qty} onChange={setQty} />
              </div>
            </div>

            <AddToCartButton
              productId={product.id}
              variantId={variant.id}
              qty={qty}
            />

            <p className="text-xs text-beige/50">
              {t("shippingNote", {
                amount: `${formatPrice(storeConfig.freeShippingThreshold)} ${t("currency")}`,
              })}
            </p>
          </div>
        </div>

        {/* Complete the set — the other three fragrances of the collection. */}
        <section className="mt-16 border-t border-beige/10 pt-12">
          <h2 className="mb-8 font-primary text-2xl font-medium text-beige md:text-3xl">
            {t("relatedTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {storeConfig.products
              .filter((p) => p.id !== product.id)
              .map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
          </div>
        </section>
      </div>
    </StoreShell>
  );
}
