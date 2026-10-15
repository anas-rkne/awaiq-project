"use client";

import { useLocale, useTranslations } from "next-intl";
import { storeConfig } from "@/config/store";

/**
 * Quantity control — two round hit-targets (≥40px, touch-friendly) around a
 * live value. Keyboard reachable, values announced politely. The upper bound
 * comes from `storeConfig.maxQty` so limits stay a single source of truth.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = storeConfig.maxQty,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";

  const btn = `flex h-11 w-11 items-center justify-center text-beige/80 transition-colors hover:text-beige active:text-beige disabled:cursor-not-allowed disabled:opacity-30 ${
    compact ? "text-base" : "text-lg"
  }`;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="inline-flex items-center rounded-full border border-beige/20 bg-navy-ink/40"
    >
      <button
        type="button"
        aria-label={t("decrease")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={btn}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="w-8 text-center text-sm tabular-nums text-beige"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={t("increase")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
