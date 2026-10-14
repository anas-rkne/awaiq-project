"use client";

import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  gradient?: string;
  className?: string;
}

/**
 * Gradient-filled text (ported verbatim from the reference's `GradientText`).
 * The section's two paragraphs use the default dark→white sweep, so the copy
 * fades up out of the navy as it reveals.
 */
export function GradientText({
  children,
  gradient = "linear-gradient(90deg, #4A4A4A 0%, #FFF 100%)",
  className = "",
}: GradientTextProps) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}
