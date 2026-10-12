"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { useMediaQuery } from "@/hooks/useHeroResponsive";

/** Per-tab flag: show the intro loader once, never again on reload. */
const SKIP_KEY = "3weeq:loader-seen";

/**
 * Reads the flag WITHOUT touching state during render: `useSyncExternalStore`
 * yields the server snapshot (`false`) through hydration, then the real client
 * value — so there is no hydration mismatch, and marking the tab as seen is a
 * pure external-system write (never a setState-in-effect).
 */
const subscribe = () => () => {};
const getSnapshot = () => {
  try {
    return window.sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
};
const getServerSnapshot = () => false;

/**
 * Luxury loader, honest about time (F3):
 * - ends on `window.load` (all above-the-fold assets incl. the LCP sky) or a
 *   1.8s safety timeout — never a fixed fake timer that races the paint;
 * - skipped entirely on repeat visits in the same tab (sessionStorage);
 * - hidden entirely for reduced-motion users.
 */
export function HeroLoader() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const skipped = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [done, setDone] = useState(false);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const finish = () => setDone(true);
    const timeout = window.setTimeout(finish, 1800);

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("load", finish);
    };
  }, [reduced]);

  useEffect(() => {
    if (!done) return;
    const timeout = window.setTimeout(() => setFaded(true), 600);
    return () => window.clearTimeout(timeout);
  }, [done]);

  // Mark the tab as "seen" once the intro has fully played out.
  useEffect(() => {
    if (!faded) return;
    try {
      window.sessionStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* storage unavailable — the loader simply replays next time */
    }
  }, [faded]);

  // Under reduce there is no fade-out beat — hide the instant the query flips.
  if (skipped || reduced || faded) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-navy transition-opacity duration-700 ease-out ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      } motion-reduce:transition-none`}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="font-primary text-3xl tracking-[0.35em] text-beige uppercase">
          {siteConfig.name}
        </span>
        <span className="h-px w-16 origin-center bg-gold animate-[loader-rule_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
