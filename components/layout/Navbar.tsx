"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface NavbarProps {
  menuOpen: boolean;
  cartCount: number;
  onMenuToggle: () => void;
  onCartOpen: () => void;
}

/**
 * Top navigation bar: logo (start) — locale + cart + menu (end).
 * Purely presentational — all state lives in `SiteHeader`.
 * The layout never mirrors: `html` stays LTR and positions are explicit.
 */
export function Navbar({
  menuOpen,
  cartCount,
  onMenuToggle,
  onCartOpen,
}: NavbarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = routing.locales.find((l) => l !== locale) ?? locale;

  return (
    <div className="flex h-16 items-center justify-between px-5 pt-[env(safe-area-inset-top)] sm:px-8 md:h-20 md:px-12">
      {/* Logo — top start */}
      <Link href="/" aria-label="3WEEQ home" className="flex items-center">
        <Image
          src="/art/hero/logo-11.png"
          alt="3WEEQ"
          width={4501}
          height={4501}
          className="h-10 w-auto md:h-11 lg:h-12"
        />
      </Link>

      {/* Actions — top end: locale + cart + menu */}
      <div className="flex items-center gap-5 md:gap-7">
        {/* Locale switch */}
        <Link
          href={pathname}
          locale={otherLocale}
          className="text-[11px] font-medium tracking-[0.18em] text-beige/85 uppercase transition-colors hover:text-beige md:text-xs"
          aria-label={`Switch to ${otherLocale === "ar" ? "Arabic" : "English"}`}
        >
          {otherLocale === "ar" ? "عربي" : "EN"}
        </Link>

        <span aria-hidden="true" className="h-4 w-px bg-beige/20" />

        {/* Cart */}
        <button
          type="button"
          onClick={onCartOpen}
          aria-label="Open cart"
          className="relative flex items-center text-beige/85 transition-colors hover:text-beige"
        >
          <svg
            width="17"
            height="19"
            viewBox="0 0 17 19"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6.5h11l-.8 11H3.8L3 6.5Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 6.5V5a3 3 0 0 1 6 0v1.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold leading-none text-navy"
          >
            {cartCount}
          </span>
        </button>

        <span aria-hidden="true" className="h-4 w-px bg-beige/20" />

        {/* Menu toggle: label + modern burger that morphs into a close icon */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="group flex items-center gap-3 text-beige/85 transition-colors hover:text-beige"
        >
          <span className="text-[11px] font-medium tracking-[0.18em] md:text-xs">
            Menu
          </span>
          <span className="relative block h-3 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
                menuOpen ? "translate-y-[5.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
                menuOpen ? "-translate-y-[5.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}