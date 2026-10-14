import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { fontPreloads } from "../fonts";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/site-url";
import { routing, type AppLocale } from "@/i18n/routing";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GlobalSkyLayer } from "@/components/home/Sky/GlobalSkyLayer";
import { CartProvider } from "@/components/store/cart/CartProvider";
import "../globals.css";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL(getSiteUrl()),
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Mobile-native viewport (mobile-native skill):
 * - `viewportFit: "cover"` lets the scene bleed to the very edge on iOS —
 *   no white letterbox bars around the full-screen hero.
 * - `themeColor` matches the navy hero so the status/URL chrome never
 *   flashes white during pull-down or navigation.
 * - The rest restores the safe defaults Next drops when you export a
 *   custom `viewport`.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f4e78",
  viewportFit: "cover",
};

/**
 * Root layout per locale.
 *
 * Golden rule: `<html>` is ALWAYS `dir="ltr"` — direction flipping lives
 * locally inside text blocks (see HeroCopy). Only `lang` changes.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
  };

  return (
    <html lang={locale} dir="ltr" className="h-full antialiased">
      <head>
        {/* F1 (reload determinism): disable browser scroll restoration BEFORE
            the body parses, so every hard reload lands at the top and the
            pinned cinematic intro replays from zero (a restored mid-stage
            scroll is what rendered the exit-cover = black screen). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration="manual"`,
          }}
        />
        {fontPreloads.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
        <JsonLd data={orgLd} />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <SmoothScroll>
              <GlobalSkyLayer />
              {children}
            </SmoothScroll>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
