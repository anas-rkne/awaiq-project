"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { heroRevealConfig } from "@/config/site";

interface HeroRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps the hero and adds a cursor-following spotlight that reveals
 * the reveal artwork through a soft circular mask.
 *
 * - Reveal layer sits above the hero background, below all UI (z-index).
 * - `pointer-events: none` — never blocks clicks.
 * - Smooth lerp follow via rAF; snaps when reduced motion is preferred.
 * - Fully hidden (opacity 0) when the cursor leaves the hero.
 */
export function HeroReveal({ children, className = "" }: HeroRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const insideRef = useRef(false);
  const easingRef = useRef<number>(heroRevealConfig.easing);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    easingRef.current = query.matches ? 1 : heroRevealConfig.easing;
    const onChange = (event: MediaQueryListEvent) => {
      easingRef.current = event.matches ? 1 : heroRevealConfig.easing;
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Preload both artworks so the hero never flashes.
  useEffect(() => {
    for (const src of [heroRevealConfig.baseImage, heroRevealConfig.image]) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  // Hoisted loop: self-references safely via function declaration.
  function tick() {
    const layer = layerRef.current;
    if (!layer || !insideRef.current) {
      rafRef.current = 0;
      return;
    }
    const current = currentRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * easingRef.current;
    current.y += (target.y - current.y) * easingRef.current;
    layer.style.setProperty("--reveal-x", `${current.x.toFixed(1)}px`);
    layer.style.setProperty("--reveal-y", `${current.y.toFixed(1)}px`);
    rafRef.current = requestAnimationFrame(tick);
  }

  const startLoop = () => {
    if (rafRef.current === 0) rafRef.current = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  const toLocalPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseEnter = (event: ReactMouseEvent<HTMLDivElement>) => {
    const point = toLocalPoint(event.clientX, event.clientY);
    if (!point) return;
    insideRef.current = true;
    // Start exactly under the cursor — no sweep-in from a corner.
    targetRef.current = point;
    currentRef.current = { ...point };
    setVisible(true);
    startLoop();
  };

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const point = toLocalPoint(event.clientX, event.clientY);
    if (!point) return;
    targetRef.current = point;
    startLoop();
  };

  const handleMouseLeave = () => {
    insideRef.current = false;
    setVisible(false);
    stopLoop();
  };

  const { radius } = heroRevealConfig;
  const mask = `radial-gradient(circle ${radius}px at var(--reveal-x, 50%) var(--reveal-y, 50%), rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0) 100%)`;

  const baseStyle: CSSProperties = {
    backgroundImage: `url(${heroRevealConfig.baseImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const layerStyle: CSSProperties = {
    backgroundImage: `url(${heroRevealConfig.image})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    maskImage: mask,
    WebkitMaskImage: mask,
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {/* Base artwork — always visible, exactly as provided */}
      <div
        aria-hidden="true"
        style={baseStyle}
        className="pointer-events-none absolute inset-0 z-0"
      />
      <div
        ref={layerRef}
        aria-hidden="true"
        style={layerStyle}
        className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      {children}
    </div>
  );
}
