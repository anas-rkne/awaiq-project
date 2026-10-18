"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Media-query subscription built on `useSyncExternalStore` — the only
 * pattern that is correct for BOTH hydration and lazy breakpoint switches:
 * - `getServerSnapshot` => `false` during SSR/hydration (matching the very
 *   first server frame the user seems to see).
 * - right AFTER hydration React re-reads `getSnapshot` on the client and
 *   re-renders the instant the query resolves — even if it never "changes"
 *   afterwards (a `useState` + listener only fires on subsequent flips, so a
 *   phone-sized viewport would stay stuck on the desktop frame forever).
 * - No `setState` inside an effect, so it is lint-clean by construction.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useMemo(
    () =>
      (onStoreChange: () => void) => {
        const mql = window.matchMedia(query);
        mql.addEventListener("change", onStoreChange);
        return () => mql.removeEventListener("change", onStoreChange);
      },
    [query],
  );
  const getSnapshot = useMemo(
    () => () => window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
