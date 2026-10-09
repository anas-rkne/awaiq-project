"use client";

import { menuLinks, siteConfig } from "@/config/site";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Fullscreen menu overlay with staggered editorial links. */
export function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  useEscapeKey(open, onClose);
  useBodyScrollLock(open);

  return (
    <div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={`fixed inset-0 z-40 bg-[#000000] transition-opacity duration-500 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className="flex h-full flex-col justify-center gap-1 px-8 pt-16 md:px-16"
      >
        {menuLinks.map((link, index) => (
          <a
            key={link.label}
            href={link.href}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${140 + index * 70}ms` : "0ms" }}
            className={`group flex items-baseline gap-4 transition-all duration-500 md:gap-6 ${
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <span className="text-[10px] tracking-[0.3em] text-beige/35">
              {link.index}
            </span>
            <span className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-beige/85 transition-all duration-300 group-hover:translate-x-2 group-hover:text-beige md:text-6xl">
              {link.label}
            </span>
          </a>
        ))}
      </nav>

      <p
        className={`absolute bottom-8 left-8 text-[10px] uppercase tracking-[0.28em] text-beige/40 transition-all delay-500 duration-500 md:left-16 ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {siteConfig.tagline}
      </p>
    </div>
  );
}
