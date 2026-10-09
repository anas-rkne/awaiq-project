import { defineRouting } from "next-intl/routing";

/**
 * URL strategy: every locale is prefixed (`/ar`, `/en`).
 * Arabic is the default locale — `/` redirects to `/ar`.
 * The `<html dir>` is intentionally NOT driven by this file (always `ltr`);
 * RTL is applied locally inside text blocks only.
 */
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
