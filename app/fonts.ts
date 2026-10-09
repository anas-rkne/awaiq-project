/**
 * Brand font catalog.
 *
 * Fonts are self-hosted as local WOFF2 files in /public/fonts and declared
 * via @font-face in globals.css with unicode-range per subset (Arabic /
 * Latin). They never make a network request to fonts.googleapis.com or
 * fonts.gstatic.com. This file only exports the font-family tokens used by
 * Tailwind theme variables (--font-primary / --font-secondary).
 *
 * Primary  (Reem Kufi): headlines, section titles, brand wordmark.
 * Secondary (Tajawal): body copy, subheads, buttons.
 */

export const fontPrimary =
  '"Reem Kufi", "Segoe UI", Tahoma, Arial, sans-serif';

export const fontSecondary =
  '"Tajawal", "Segoe UI", Tahoma, Arial, sans-serif';

export const fontPreloads = [
  "/fonts/reem-kufi-arabic-500.woff2",
  "/fonts/reem-kufi-arabic-700.woff2",
  "/fonts/reem-kufi-latin-500.woff2",
  "/fonts/reem-kufi-latin-700.woff2",
  "/fonts/tajawal-arabic-400.woff2",
  "/fonts/tajawal-arabic-500.woff2",
  "/fonts/tajawal-latin-400.woff2",
  "/fonts/tajawal-latin-500.woff2",
] as const;