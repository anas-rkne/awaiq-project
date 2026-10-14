"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { getProduct, getVariant, type ProductId } from "@/config/store";

export interface CartLine {
  productId: ProductId;
  variantId: string;
  qty: number;
}

interface CartApi {
  lines: CartLine[];
  /** Total quantity across all lines. */
  count: number;
  /** False during SSR + hydration, true once localStorage has been read. */
  hydrated: boolean;
  add: (productId: ProductId, variantId: string, qty?: number) => void;
  setQty: (productId: ProductId, variantId: string, qty: number) => void;
  remove: (productId: ProductId, variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "3weeq.cart.v1";
const MAX_QTY = 99;

function clampQty(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

/** Drop anything that no longer resolves against the catalog config. */
function sanitize(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  const out: CartLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const product =
      typeof r.productId === "string" ? getProduct(r.productId) : undefined;
    if (!product) continue;
    const variant =
      typeof r.variantId === "string"
        ? getVariant(product, r.variantId)
        : undefined;
    if (!variant) continue;
    out.push({
      productId: product.id,
      variantId: variant.id,
      qty: clampQty(Number(r.qty)),
    });
  }
  return out;
}

/* ── External store ─────────────────────────────────────────────────────────
   Cart state lives OUTSIDE React (module scope) and is read through
   `useSyncExternalStore`. This gives a hydration-safe localStorage read with
   no setState-in-effect, and one shared instance for the header badge, the
   drawer and every store page.                                                  */
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let lines: CartLine[] = EMPTY;
let hydrated = false;

function readStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) lines = sanitize(JSON.parse(raw));
  } catch {
    /* corrupt storage — start empty */
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* private mode — cart stays in memory */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartLine[] | ((prev: CartLine[]) => CartLine[])) {
  const value = typeof next === "function" ? next(lines) : next;
  if (value === lines) return;
  lines = value;
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  readStorage();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartLine[] {
  readStorage();
  return lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function getHydrated(): boolean {
  readStorage();
  return hydrated;
}

function getHydratedServer(): boolean {
  return false;
}

/* ── Actions (module-stable — safe in dependency arrays) ──────────────────── */
function add(productId: ProductId, variantId: string, qty = 1) {
  commit((prev) => {
    const i = prev.findIndex(
      (l) => l.productId === productId && l.variantId === variantId,
    );
    if (i === -1) return [...prev, { productId, variantId, qty: clampQty(qty) }];
    const next = [...prev];
    next[i] = { ...next[i], qty: clampQty(next[i].qty + qty) };
    return next;
  });
}

function setQty(productId: ProductId, variantId: string, qty: number) {
  commit((prev) =>
    prev.map((l) =>
      l.productId === productId && l.variantId === variantId
        ? { ...l, qty: clampQty(qty) }
        : l,
    ),
  );
}

function remove(productId: ProductId, variantId: string) {
  commit((prev) =>
    prev.filter(
      (l) => !(l.productId === productId && l.variantId === variantId),
    ),
  );
}

function clear() {
  commit(EMPTY);
}

/**
 * Cart API for the whole site. Mount `useCart()` anywhere under the locale
 * layout — the header badge, the drawer and every store page share it.
 */
export function useCart(): CartApi {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribe,
    getHydrated,
    getHydratedServer,
  );
  const count = useMemo(
    () => current.reduce((n, l) => n + l.qty, 0),
    [current],
  );

  return {
    lines: current,
    count,
    hydrated: isHydrated,
    add,
    setQty,
    remove,
    clear,
  };
}

/**
 * Boundary kept so the locale layout can nest the app under one named
 * provider. Cart state itself lives in the module store above, so this simply
 * renders its children.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const CART_MAX_QTY = MAX_QTY;
