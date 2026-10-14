"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { getProduct, getVariant, storeConfig } from "@/config/store";
import { useCart } from "./cart/CartProvider";
import { QuantityStepper } from "./QuantityStepper";

type ProductCopy = { name: string };

/**
 * The cart's line-items view — shown inside the drawer when the cart is not
 * empty. Each line has a thumbnail, size, a compact quantity control, the line
 * total and a remove action; the footer sums subtotal, delivery and total and
 * leads to checkout.
 */
export function CartItems({ onClose }: { onClose: () => void }) {
  const { lines, setQty, remove } = useCart();
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";
  const copy = t.raw("products") as Record<string, ProductCopy>;

  const subtotal = lines.reduce((sum, l) => {
    const p = getProduct(l.productId);
    const v = p ? getVariant(p, l.variantId) : undefined;
    return sum + (v ? v.price * l.qty : 0);
  }, 0);
  const shipping =
    subtotal === 0 || subtotal >= storeConfig.freeShippingThreshold
      ? 0
      : storeConfig.shippingFee;
  const total = subtotal + shipping;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="flex min-h-0 flex-1 flex-col">
      <ul className="min-h-0 flex-1 divide-y divide-beige/10 overflow-y-auto px-6 md:px-8">
        {lines.map((line) => {
          const product = getProduct(line.productId);
          const variant = product ? getVariant(product, line.variantId) : undefined;
          if (!product || !variant) return null;
          return (
            <li
              key={`${line.productId}-${line.variantId}`}
              className="flex animate-cart-line gap-4 py-5"
            >
              <Link
                href={`/store/${product.id}`}
                onClick={onClose}
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-beige/10"
              >
                <Image
                  src={product.image}
                  alt={copy[product.id].name}
                  fill
                  sizes="64px"
                  className="object-cover select-none"
                />
              </Link>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-beige">
                      {copy[product.id].name}
                    </span>
                    <span className="text-xs text-beige/50">
                      {variant.sizeMl} {t("ml")} · {formatPrice(variant.price)}{" "}
                      {t("currency")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.productId, line.variantId)}
                    aria-label={t("cart.remove")}
                    className="text-beige/45 transition-colors hover:text-beige"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l10 10M11 1L1 11"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <QuantityStepper
                    compact
                    value={line.qty}
                    onChange={(n) => setQty(line.productId, line.variantId, n)}
                  />
                  <span className="text-sm tabular-nums text-beige/85">
                    {formatPrice(variant.price * line.qty)} {t("currency")}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-beige/10 px-6 py-6 md:px-8">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between text-beige/70">
            <dt>{t("cart.subtotal")}</dt>
            <dd className="tabular-nums">
              {formatPrice(subtotal)} {t("currency")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-beige/70">
            <dt>{t("cart.shipping")}</dt>
            <dd>{shipping === 0 ? t("cart.shippingFree") : `${formatPrice(shipping)} ${t("currency")}`}</dd>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-beige/10 pt-3 text-base text-beige">
            <dt>{t("cart.total")}</dt>
            <dd className="tabular-nums">
              {formatPrice(total)} {t("currency")}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/store/checkout"
            onClick={onClose}
            className="pointer-events-auto border border-gold bg-gold px-8 py-4 text-center text-sm font-medium text-navy-ink transition-colors duration-300 hover:bg-transparent hover:text-gold"
          >
            {t("cart.checkout")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-center text-xs text-beige/60 transition-colors hover:text-beige"
          >
            {t("cart.continueShopping")}
          </button>
        </div>
      </div>
    </div>
  );
}
