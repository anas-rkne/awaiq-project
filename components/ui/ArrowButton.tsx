import type { ReactNode } from "react";

type ArrowButtonVariant = "outline" | "solid";

interface ArrowButtonProps {
  href: string;
  variant?: ArrowButtonVariant;
  children: ReactNode;
}

/** Small editorial CTA used across the hero (and later sections). */
export function ArrowButton({
  href,
  variant = "outline",
  children,
}: ArrowButtonProps) {
  const base =
    "inline-flex h-[32px] items-center gap-1.5 px-3.5 text-[10px] tracking-[0.08em] transition-colors md:text-[11px]";
  const styles =
    variant === "solid"
      ? "bg-gold font-medium text-navy hover:bg-gold/85"
      : "border border-beige/35 text-beige/90 hover:border-beige hover:text-beige";

  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
      <span aria-hidden="true" className="text-[12px] leading-none">
        →
      </span>
    </a>
  );
}
