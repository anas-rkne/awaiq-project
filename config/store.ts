/**
 * Store — single source of truth for the shop.
 *
 * Prices, sizes, product order and imagery live here ONLY. Copy (names,
 * stories, notes) lives in the `Store` namespace of the ar/en messages so the
 * store stays bilingual. Images are the untouched product shots already used
 * by the collection strip.
 */

export type ProductId = "egypt" | "babylon" | "greece" | "china";

export interface StoreVariant {
  /** Stable id used by the cart; also the message key for the size label. */
  id: string;
  sizeMl: number;
  /** Price in the store currency (major units, no decimals). */
  price: number;
}

export interface StoreProduct {
  id: ProductId;
  /** Indexes `Store.products.<id>` in the messages. */
  image: string;
  /** Optional extra shots for the detail gallery. */
  gallery: string[];
  variants: StoreVariant[];
}

const SIZE_SMALL: StoreVariant = { id: "50ml", sizeMl: 50, price: 350 };
const SIZE_LARGE: StoreVariant = { id: "100ml", sizeMl: 100, price: 520 };

export const storeConfig = {
  /** ISO-ish currency label shown next to prices. Localised in messages. */
  currency: "SAR",
  /** Free delivery above this subtotal (major units). */
  freeShippingThreshold: 600,
  /** Flat delivery fee below the threshold (major units). */
  shippingFee: 25,
  /**
   * Orders WhatsApp number in international format (digits only, e.g.
   * "9665xxxxxxxx"). Empty → the WhatsApp action is hidden and the visitor
   * can still copy the order text.
   */
  whatsapp: "",
  /** Max quantity per line. */
  maxQty: 99,
  products: [
    { id: "egypt", image: "/products/1.jpg", gallery: [], variants: [SIZE_SMALL, SIZE_LARGE] },
    { id: "babylon", image: "/products/2.jpg", gallery: [], variants: [SIZE_SMALL, SIZE_LARGE] },
    { id: "greece", image: "/products/3.jpg", gallery: [], variants: [SIZE_SMALL, SIZE_LARGE] },
    { id: "china", image: "/products/4.jpg", gallery: [], variants: [SIZE_SMALL, SIZE_LARGE] },
  ] as StoreProduct[],
} as const;

export type StoreConfig = typeof storeConfig;

/** All product ids, in strip order. */
export const productIds = storeConfig.products.map((p) => p.id);

export function getProduct(id: string): StoreProduct | undefined {
  return storeConfig.products.find((p) => p.id === id);
}

export function getVariant(
  product: StoreProduct,
  variantId: string,
): StoreVariant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

/** Lowest variant price — the "from" price on a catalog card. */
export function fromPrice(product: StoreProduct): number {
  return Math.min(...product.variants.map((v) => v.price));
}
