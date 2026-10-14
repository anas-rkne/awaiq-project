"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/store/cart/CartProvider";
import type { ProductId } from "@/config/store";

/**
 * Primary add-to-cart action. On press it adds the line, swaps its label to a
 * confirmation with a check for ~1.8s, then returns to the default label.
 */
export function AddToCartButton({
  productId,
  variantId,
  qty,
}: {
  productId: ProductId;
  variantId: string;
  qty: number;
}) {
  const t = useTranslations("Store");
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = () => {
    add(productId, variantId, qty);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 border px-10 py-4 text-sm font-medium transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] ${
        added
          ? "border-gold bg-transparent text-gold"
          : "border-gold bg-gold text-navy-ink hover:bg-transparent hover:text-gold"
      }`}
    >
      {added ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M2 7.5l3.2 3.2L12 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("added")}
        </>
      ) : (
        t("addToCart")
      )}
    </button>
  );
}
