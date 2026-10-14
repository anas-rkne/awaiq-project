/**
 * Formatting helpers for the store.
 *
 * Digits are ALWAYS Latin across both locales (the site shows Latin digits
 * everywhere), so we format with a fixed `en-US` grouping and let the message
 * layer supply the currency label.
 */

export function formatPrice(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}
