/**
 * Canonical origin for the site, used by the sitemap, robots and JSON-LD.
 *
 * Reads `NEXT_PUBLIC_SITE_URL` at build time (so pages stay static). In
 * development it falls back to the local origin; in production the env var
 * MUST be set to the real domain, otherwise structured data and the sitemap
 * will carry localhost URLs.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
