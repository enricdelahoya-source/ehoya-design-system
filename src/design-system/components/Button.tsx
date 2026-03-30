import type { ButtonHTMLAttributes, ReactNode } from "react"

/**
 * ========================================
 * BUTTON
 * Design-system button primitive
 * ========================================
 *
 * This component wraps the native <button> element and applies
 * semantic variants, shared sizing rules, and token-based styling.
 *
 * The goal is consistency:
 * - same hierarchy everywhere
 * - same sizing rhythm
 * - same interaction states
 */


/**
 * ========================================
 * 1. PUBLIC API
 * What callers are allowed to control
 * ========================================
 */
type ButtonProps = {
  /**
   * Button content.
   * Usually text, but can later include icons.
   */
  children: ReactNode

  /**
   * Semantic action priority.
   *
   * - primary: main action in the area
   * - secondary: visible but less dominant action
   * - ghost: lightest action, often tertiary
   */
  variant?: "primary" | "secondary" | "ghost"

  /**
   * Shared control size.
   * These should align with other controls like inputs/selects.
   */
  size?: "sm" | "md"
} & ButtonHTMLAttributes<HTMLButtonElement>


/**
 * ========================================
 * 2. COMPONENT
 * Compose shared structure + variant + size
 * ========================================
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  /**
   * ========================================
   * 3. BASE LAYER
   * Shared structure and behavior
   * ========================================
   *
   * These styles should be true for every button:
   * layout, typography weight, transitions, focus handling,
   * and disabled interaction behavior.
   */
  const base = [
    "inline-flex items-center justify-center",
    "whitespace-nowrap",
    "select-none",
    "font-medium",
    "transition-colors",
    "rounded-[var(--radius-sm)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-focus-ring",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
  ].join(" ")

  /**
   * ========================================
   * 4. VARIANT LAYER
   * Action meaning and hierarchy
   * ========================================
   *
   * Variants express product meaning, not arbitrary decoration.
   * If one variant feels wrong, question the tokens first.
   */
  const variants = {
    primary: [
      "bg-primary",
      "text-on-primary",
      "hover:bg-primary-hover",
      "active:bg-primary-active",
      "disabled:bg-[var(--color-disabled-bg)]",
      "disabled:text-[var(--color-disabled-text)]",
    ].join(" "),

    secondary: [
      "bg-transparent",
      "text-on-secondary",
      "border-[1.5px]",
      "border-secondary-border",

      // subtle brand on interaction
      "hover:border-secondary-border-hover",
      "hover:bg-ghost-hover",

      "active:bg-ghost-active",

      "disabled:bg-transparent",
      "disabled:text-[var(--color-disabled-text)]",
      "disabled:border-[var(--color-disabled-border)]",
    ].join(" "),

    ghost: [
      "bg-transparent",
      "text-on-ghost",
      "hover:bg-ghost-hover",
      "active:bg-ghost-active",
      "disabled:text-[var(--color-disabled-text)]",
    ].join(" "),
  }

  /**
   * ========================================
   * 5. SIZE LAYER
   * Shared control density and ergonomics
   * ========================================
   *
   * Height, padding, and font size should scale together.
   * That keeps the button feeling balanced.
   */
  const sizes = {
    sm: [
      "h-[var(--control-height-sm)]",
      "px-[var(--space-inline-sm)]",
      "text-[var(--text-sm)]",
      "leading-[var(--leading-normal)]",
    ].join(" "),

    md: [
      "h-[var(--control-height-md)]",
      "px-[var(--space-inline-md)]",
      "text-[var(--text-sm)]",
      "leading-[var(--leading-normal)]",
    ].join(" "),
  }

  /**
   * ========================================
   * 6. FINAL COMPOSITION
   * Merge structure + meaning + size + local overrides
   * ========================================
   */
  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 7. RENDER
   * Native button element with system styling
   * ========================================
   */
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}