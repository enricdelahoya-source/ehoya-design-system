import type { MouseEventHandler, ReactNode } from "react"

/**
 * ========================================
 * LINK
 * Design-system text link primitive
 * ========================================
 *
 * This component renders a calm text link style for record pages,
 * metadata rows, and lightweight navigation moments.
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type LinkProps = {
  children: ReactNode
  href?: string
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function Link({
  children,
  href = "#",
  className = "",
  onClick,
}: LinkProps) {
  /**
   * ========================================
   * 3. BASE LAYER
   * ========================================
   *
   * Keep links integrated with surrounding text.
   * Hover adds a light structural signal instead of a button feel.
   */
  const base = [
    "bg-transparent",
    "border-0",
    "p-0",
    "font-medium",
    "text-[var(--color-text-brand)]",
    "no-underline",
    "underline-offset-2",
    "transition-[color,text-decoration-color]",
    "hover:text-[var(--color-action-brand-hover)]",
    "hover:underline",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-focus-ring)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
  ].join(" ")

  /**
   * ========================================
   * 4. FINAL COMPOSITION
   * ========================================
   */
  const linkClasses = [base, className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 5. RENDER
   * ========================================
   */
  return (
    <a href={href} className={linkClasses} onClick={onClick}>
      {children}
    </a>
  )
}
