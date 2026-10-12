"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { heroSceneConfig, heroStageHeight } from "@/config/site";

/** A resolved per-viewport hero frame — ONE object consumed by every hero
 *  component, so all values stay in sync by construction. */
export interface HeroFrame {
  isMobile: boolean;
  /** True under `prefers-reduced-motion: reduce` — lets the DOM collapse the
      stage to a single viewport so reduced-motion users never scroll through
      hundreds of vh of unhitched emptiness (no ScrollTrigger exists for them). */
  isReduced: boolean;
  stageHeight: string;
  perspective: number;
  copyOffset: string;
  copyMaxWidth: string;
  overlay: string;
  mist: string;
  pixlr: { width: string; centerY: number };
  bottleClassName: string;
  radar: { width: string; opacity: number; y: number };
  exit: { originX: number; originY: number };
  motion: {
    skyScaleFrom: number;
    skyScaleTo: number;
    bottleRise: number;
    bottleScaleFrom: number;
    bottleScaleTo: number;
    cloudDrift: number;
    cloudDriftSecondary: number;
    zoomTo: number;
    exitBottleScale: number;
  };
}

function resolveFrame(isMobile: boolean, isReduced: boolean): HeroFrame {
  const v = isMobile
    ? heroSceneConfig.perViewport.mobile
    : heroSceneConfig.perViewport.desktop;
  return {
    isMobile,
    isReduced,
    stageHeight: isReduced ? "100svh" : heroStageHeight(isMobile),
    perspective: v.perspective,
    copyOffset: v.copy.offset,
    copyMaxWidth: v.copy.maxWidth,
    overlay: v.overlay,
    mist: v.mist,
    pixlr: v.pixlr,
    bottleClassName: v.bottle.className,
    radar: v.radar,
    exit: v.exit,
    motion: v.motion,
  };
}

interface HeroResponsiveValue {
  frame: HeroFrame;
}

const HeroResponsiveContext = createContext<HeroResponsiveValue | null>(null);

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

/** Supplies the resolved hero frame for the current viewport. Re-renders
 *  every consumer on breakpoint switch (e.g. tablet rotate 768↔1180). */
export function HeroResponsiveProvider({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(
    `(max-width: ${heroSceneConfig.breakpoints.desktop - 1}px)`,
  );
  const isReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const frame = useMemo(
    () => resolveFrame(isMobile, isReduced),
    [isMobile, isReduced],
  );

  return (
    <HeroResponsiveContext.Provider value={{ frame }}>
      {children}
    </HeroResponsiveContext.Provider>
  );
}

export function useHeroResponsive(): HeroFrame {
  const value = useContext(HeroResponsiveContext);
  if (!value) {
    throw new Error("useHeroResponsive must be used within HeroResponsiveProvider");
  }
  return value.frame;
}