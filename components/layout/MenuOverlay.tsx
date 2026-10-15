"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { menuLinks } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Fullscreen menu overlay with staggered editorial links. */
export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const locale = useLocale();
  const tNav = useTranslations("Nav");
  const tMenu = useTranslations("Menu");
  const isAr = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);

  useEscapeKey(open, onClose);
  useBodyScrollLock(open);
  useFocusTrap(open, containerRef);

  return (
    <div
      id="site-menu"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={tNav("siteMenu")}
      tabIndex={-1}
      dir={isAr ? "rtl" : "ltr"}
      className={`fixed inset-0 z-20 bg-navy-ink outline-none transition-opacity duration-500 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav
        aria-label={tNav("primary")}
        className="flex h-full flex-col justify-center gap-1 px-8 pb-[env(safe-area-inset-bottom)] pt-[calc(4rem+env(safe-area-inset-top))] md:px-16"
      >
        {menuLinks.map((link, index) => {
          const isRoute = link.href.startsWith("/");
          const className = `group flex items-baseline gap-4 py-1 transition-all duration-500 md:gap-6 ${
            open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`;
          const style = {
            transitionDelay: open ? `${140 + index * 70}ms` : "0ms",
          };
          const inner = (
            <>
              <span className="text-[10px] tracking-[0.3em] text-beige/35">
                {link.index}
              </span>
              <span
                className={`font-primary text-4xl font-medium leading-[1.05] text-beige/85 transition-all duration-300 group-hover:text-beige md:text-6xl ${
                  isAr
                    ? "group-hover:-translate-x-2"
                    : "uppercase tracking-tight group-hover:translate-x-2"
                }`}
              >
                {tMenu(link.key)}
              </span>
            </>
          );
          return isRoute ? (
            <Link
              key={link.key}
              href={link.href}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={style}
              className={className}
            >
              {inner}
            </Link>
          ) : (
            <a
              key={link.key}
              href={link.href}
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              style={style}
              className={className}
            >
              {inner}
            </a>
          );
        })}
      </nav>

      <p
        className={`absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] start-8 text-[10px] text-beige/40 transition-all delay-500 duration-500 md:start-16 ${
          isAr ? "" : "tracking-[0.28em] uppercase"
        } ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        {tNav("tagline")}
      </p>
    </div>
  );
}
