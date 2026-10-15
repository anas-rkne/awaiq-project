"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { getProduct, getVariant, storeConfig } from "@/config/store";
import { useCart } from "./cart/CartProvider";
import { StoreShell } from "./StoreShell";

type ProductCopy = { name: string };

interface OrderItem {
  name: string;
  sizeMl: number;
  qty: number;
  line: number;
}

interface OrderSnapshot {
  ref: string;
  text: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  customer: { name: string; phone: string; city: string; address: string; notes: string };
}

type FieldKey = "name" | "phone" | "city" | "address" | "notes";
type FormState = Record<FieldKey, string>;

function buildRef(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `3W-${stamp}-${rand}`;
}

/**
 * Checkout — a client-side ORDER REQUEST, not a payment. It validates the
 * customer details, then produces an order summary the visitor can copy or
 * send over WhatsApp. The cart is cleared once the order is placed. No data
 * leaves the browser and no payment is taken on the site.
 */
export function CheckoutForm() {
  const t = useTranslations("Store");
  const isRtl = useLocale() === "ar";
  const { lines, clear, hydrated } = useCart();
  const copy = t.raw("products") as Record<string, ProductCopy>;

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [placed, setPlaced] = useState<OrderSnapshot | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items: OrderItem[] = lines.map((l) => {
    const p = getProduct(l.productId);
    const v = p ? getVariant(p, l.variantId) : undefined;
    return {
      name: p ? copy[p.id].name : l.productId,
      sizeMl: v?.sizeMl ?? 0,
      qty: l.qty,
      line: (v?.price ?? 0) * l.qty,
    };
  });
  const subtotal = items.reduce((s, it) => s + it.line, 0);
  const shipping =
    subtotal === 0 || subtotal >= storeConfig.freeShippingThreshold
      ? 0
      : storeConfig.shippingFee;
  const totals = { items, subtotal, shipping, total: subtotal + shipping };

  const setField = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (form.name.trim().length < 2) next.name = t("checkout.required");
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 8) next.phone = t("checkout.invalidPhone");
    if (form.city.trim().length < 2) next.city = t("checkout.required");
    if (form.address.trim().length < 4) next.address = t("checkout.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ref = buildRef();
    const customer = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
    };
    const lines_ = totals.items
      .map((it) => `• ${it.name} — ${it.sizeMl} ${t("ml")} × ${it.qty} = ${formatPrice(it.line)} ${t("currency")}`)
      .join("\n");
    const text = [
      `3WEEQ — ${t("checkout.title")}`,
      `${t("checkout.orderRef")}: ${ref}`,
      "",
      lines_,
      "",
      `${t("cart.subtotal")}: ${formatPrice(totals.subtotal)} ${t("currency")}`,
      `${t("cart.shipping")}: ${totals.shipping === 0 ? t("cart.shippingFree") : `${formatPrice(totals.shipping)} ${t("currency")}`}`,
      `${t("cart.total")}: ${formatPrice(totals.total)} ${t("currency")}`,
      "",
      `${t("checkout.name")}: ${customer.name}`,
      `${t("checkout.phone")}: ${customer.phone}`,
      `${t("checkout.city")}: ${customer.city}`,
      `${t("checkout.address")}: ${customer.address}`,
      customer.notes ? `${t("checkout.notes")}: ${customer.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setCopied(false);
    setPlaced({
      ref,
      text,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      items: totals.items,
      customer,
    });
    clear();
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — the text is visible to copy manually */
    }
  };

  const whatsappHref = (text: string) =>
    `https://wa.me/${storeConfig.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

  const inputClass =
    "w-full rounded-lg border border-beige/20 bg-navy-ink/40 px-4 py-3 text-beige placeholder:text-beige/30 transition-colors focus:border-gold/70 focus:outline-none";

  // ── Not hydrated yet (SSR / first paint) ────────────────────────────────
  if (!hydrated) {
    return (
      <StoreShell>
        <div className="h-40 animate-pulse rounded-2xl bg-beige/5" aria-hidden="true" />
      </StoreShell>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  if (placed) {
    return (
      <StoreShell>
        <div dir={localeDir(isRtl)} className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h1 className="font-primary text-3xl text-beige">{t("checkout.successTitle")}</h1>
            <p className="max-w-md text-beige/70">{t("checkout.successBody")}</p>
            <p className="text-sm text-beige/50">
              {t("checkout.orderRef")}:{" "}
              <span className="text-beige/80">{placed.ref}</span>
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-beige/10 bg-navy-ink/40 p-6">
            <OrderSummary items={placed.items} subtotal={placed.subtotal} shipping={placed.shipping} total={placed.total} isRtl={isRtl} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onCopy(placed.text)}
                className="flex-1 rounded-full border border-beige/25 px-6 py-3 text-sm text-beige transition-colors hover:border-beige/50"
              >
                {copied ? t("checkout.copied") : t("checkout.copyOrder")}
              </button>
              {storeConfig.whatsapp ? (
                <a
                  href={whatsappHref(placed.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-gold bg-gold px-6 py-3 text-center text-sm font-medium text-navy-ink transition-colors hover:bg-transparent hover:text-gold active:bg-transparent active:text-gold"
                >
                  {t("checkout.whatsapp")}
                </a>
              ) : null}
            </div>
            <p className="mt-4 text-xs text-beige/45">{t("checkout.note")}</p>
          </div>

          <div className="mt-8 text-center">
            <Link href="/store" className="text-sm text-beige/60 transition-colors hover:text-beige active:text-beige">
              {t("checkout.placeAnother")}
            </Link>
          </div>
        </div>
      </StoreShell>
    );
  }

  // ── Empty ───────────────────────────────────────────────────────────────
  if (!totals.items.length) {
    return (
      <StoreShell>
        <div dir={localeDir(isRtl)} className="flex flex-col items-center gap-6 py-24 text-center">
          <h1 className="font-primary text-3xl text-beige">{t("checkout.emptyTitle")}</h1>
          <p className="max-w-md text-beige/70">{t("checkout.emptyDesc")}</p>
          <Link
            href="/store"
            className="border border-gold bg-gold px-8 py-3 text-sm font-medium text-navy-ink transition-colors hover:bg-transparent hover:text-gold active:bg-transparent active:text-gold"
          >
            {t("cart.emptyCta")}
          </Link>
        </div>
      </StoreShell>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <StoreShell>
      <div dir={localeDir(isRtl)} className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-2">
          <p className={`text-[10px] font-medium text-gold ${isRtl ? "" : "tracking-[0.3em]"}`}>{t("checkout.eyebrow")}</p>
          <h1 className="font-primary text-[clamp(2rem,4vw,3rem)] font-medium leading-tight text-beige">
            {t("checkout.title")}
          </h1>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <Field label={t("checkout.name")} value={form.name} onChange={(v) => setField("name", v)} error={errors.name} autoComplete="name" inputClass={inputClass} />
            <Field label={t("checkout.phone")} value={form.phone} onChange={(v) => setField("phone", v)} error={errors.phone} type="tel" inputMode="tel" autoComplete="tel" inputClass={inputClass} />
            <Field label={t("checkout.city")} value={form.city} onChange={(v) => setField("city", v)} error={errors.city} autoComplete="address-level2" inputClass={inputClass} />
            <Field label={t("checkout.address")} value={form.address} onChange={(v) => setField("address", v)} error={errors.address} autoComplete="street-address" inputClass={inputClass} />
            <Field label={t("checkout.notes")} value={form.notes} onChange={(v) => setField("notes", v)} textarea inputClass={inputClass} />

            <button
              type="submit"
              className="mt-2 border border-gold bg-gold px-8 py-4 text-sm font-medium text-navy-ink transition-colors duration-300 hover:bg-transparent hover:text-gold active:bg-transparent active:text-gold active:scale-[0.99]"
            >
              {t("checkout.submit")}
            </button>
            <p className="text-xs text-beige/45">{t("checkout.note")}</p>
          </form>

          <aside className="h-fit rounded-2xl border border-beige/10 bg-navy-ink/40 p-6 lg:sticky lg:top-28">
            <p className={`mb-4 text-[10px] font-medium text-beige/50 ${isRtl ? "" : "tracking-[0.3em]"}`}>
              {t("checkout.summary")}
            </p>
            <OrderSummary items={totals.items} subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} isRtl={isRtl} />
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}

function localeDir(isRtl: boolean) {
  return isRtl ? "rtl" : "ltr";
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  isRtl,
}: {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  isRtl: boolean;
}) {
  const t = useTranslations("Store");
  return (
    <div dir={localeDir(isRtl)}>
      <ul className="flex flex-col gap-3">
        {items.map((it, i) => (
          <li key={`${it.name}-${i}`} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-beige/80">
              {it.name}
              <span className="text-beige/45">
                {" "}
                · {it.sizeMl} {t("ml")} × {it.qty}
              </span>
            </span>
            <span className="tabular-nums text-beige/70">
              {formatPrice(it.line)} {t("currency")}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 flex flex-col gap-2 border-t border-beige/10 pt-4 text-sm">
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
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
  inputClass,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
  inputClass: string;
  inputMode?: "tel" | "text" | "numeric" | "email";
  autoComplete?: string;
}) {
  const id = `field-${label.replace(/\s+/g, "-")}`;
  const isRtl = useLocale() === "ar";
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className={`text-xs text-beige/60 ${isRtl ? "" : "tracking-[0.08em]"}`}>{label}</span>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`${inputClass} ${error ? "border-[#e3a6a6]/70" : ""}`}
        />
      )}
      {error ? <span className="text-xs text-[#e3a6a6]">{error}</span> : null}
    </label>
  );
}
