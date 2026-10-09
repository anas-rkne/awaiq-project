"use client";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-over cart panel. Empty state for now — line items plug in here later. */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  useEscapeKey(open, onClose);
  useBodyScrollLock(open);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="السلة — cart"
      className={open ? undefined : "pointer-events-none"}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 cursor-default bg-black/60 transition-opacity duration-400 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(420px,92vw)] flex-col border-l border-beige/10 bg-[#000000] transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 md:px-8">
          <p lang="ar" className="text-xs tracking-[0.25em] text-beige/85">
            السلة
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center text-beige/70 transition-colors hover:text-beige"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <svg
            width="28"
            height="32"
            viewBox="0 0 17 19"
            fill="none"
            aria-hidden="true"
            className="text-beige/30"
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
          <p lang="ar" className="text-sm tracking-[0.1em] text-beige/70">
            سلتك فارغة
          </p>
          <p className="max-w-[240px] text-[11px] leading-relaxed text-beige/45">
            Your cart is empty. Start exploring the world of 3WEEQ.
          </p>
          <a
            href="#explore"
            onClick={onClose}
            className="mt-2 inline-flex h-[32px] items-center gap-1.5 border border-beige/35 px-3.5 text-[10px] tracking-[0.08em] text-beige/90 transition-colors hover:border-beige hover:text-beige"
          >
            Explore 3WEEQ
            <span aria-hidden="true" className="text-[12px] leading-none">
              →
            </span>
          </a>
        </div>
      </aside>
    </div>
  );
}
