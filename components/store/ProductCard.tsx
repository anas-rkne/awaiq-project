"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { fromPrice, type StoreProduct } from "@/config/store";

type ProductCopy = { name: string; tag: string };

/**
 * One catalog card — the whole card is a locale-aware link to the product
 * page. Hover lifts the card and warms the gold hairline; the image scale is
 * restrained and eased so it reads expensive, not bouncy.
 */
export function ProductCard({
  product,
  index,
}: {
  product: StoreProduct;
  index: number;
}) {
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";
  const copy = t.raw("products") as Record<string, ProductCopy>;
  const c = copy[product.id];

  return (
    <Link
      href={`/store/${product.id}`}
      dir={isRtl ? "rtl" : "ltr"}
      className="group block outline-none active:scale-[0.99]"
      style={{
        transition: "transform 300ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-beige/10 transition-[box-shadow,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-1 group-hover:ring-gold/50 group-focus-visible:ring-2 group-focus-visible:ring-gold">
        <Image
          src={product.image}
          alt={c.name}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 24vw"
          className="object-cover select-none transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-ink/85 via-navy-ink/10 to-transparent" />
        <span className="absolute start-4 top-4 text-[10px] font-medium tracking-[0.3em] text-beige/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <h2 className="font-primary text-2xl font-medium leading-tight text-beige">
            {c.name}
          </h2>
          <p className="mt-1 text-sm text-beige/70">{c.tag}</p>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3 px-1">
        <span className="text-[11px] tracking-[0.14em] text-beige/50">
          {t("view")}
        </span>
        <span className="text-sm text-beige/85">
          {t("from")} {formatPrice(fromPrice(product))} {t("currency")}
        </span>
      </div>
    </Link>
  );
}
