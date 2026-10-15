import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

/**
 * Shared frame for every store page: a dark hero-matched backdrop (so the
 * beige type keeps its contrast over the page-wide sky), the fixed-header
 * offset, and a small brand footer. Server-safe — no client hooks.
 */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-col">
      {/* Dark navy base + a soft gold glow — the brand identity of the store. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #14243b 0%, #1a3350 42%, #101d2f 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(205,158,97,0.14) 0%, rgba(205,158,97,0) 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-5 pb-20 pt-28 sm:px-8 md:pt-32">
        {children}
      </div>

      <footer className="border-t border-beige/10 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-primary text-sm tracking-[0.28em] text-beige/70 transition-colors hover:text-beige active:text-beige"
          >
            {siteConfig.name}
          </Link>
          <span className="text-[10px] tracking-[0.28em] text-beige/30">
            © {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </main>
  );
}
