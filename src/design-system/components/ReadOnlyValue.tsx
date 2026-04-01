import type { ComponentPropsWithoutRef, ReactNode } from "react"

/**
 * ========================================
 * READ ONLY VALUE
 * Design-system read-only field primitive
 * ========================================
 *
 * This component is a control-only primitive for values that should
 * be visible inside a Field wrapper without looking editable.
 *
 * It is intentionally not a disabled input clone:
 * - no caret
 * - no interactive hover/focus treatment
 * - calm surface
 * - structured like a field
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
export type ReadOnlyValueBehavior = "compact" | "flexible" | "full-width"

type ReadOnlyValueProps = {
  value?: ReactNode
  behavior?: ReadOnlyValueBehavior
  multiline?: boolean
  variant?: "boxed" | "compact"
  size?: "sm" | "md"
} & Omit<ComponentPropsWithoutRef<"output">, "children"> & {
    children?: ReactNode
  }

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function ReadOnlyValue({
  value,
  children,
  behavior = "compact",
  multiline = false,
  variant = "boxed",
  size = "md",
  className = "",
  ...props
}: ReadOnlyValueProps) {
  const content = value ?? children

  /**
   * ========================================
   * 3. BASE VALUE
   * ========================================
   *
   * Keep the value readable and selectable in both layouts.
   */
  const base = [
    "block",
    "w-full",
    "min-w-0",
    "text-[length:var(--text-field-value)]",
    "leading-[var(--leading-normal)]",
    "font-normal",
    "text-[color:var(--color-text-primary)]",
    "cursor-default",
    "select-text",
  ].join(" ")

  const surfaces = {
    boxed: [
      "flex",
      "items-center",
      "rounded-[var(--radius-sm)]",
      "border",
      "border-[var(--color-field-readonly-border)]",
      "bg-[var(--color-field-readonly-bg)]",
      "overflow-hidden",
    ].join(" "),
    compact: [
      "bg-transparent",
      "border-0",
      "rounded-none",
      "overflow-visible",
    ].join(" "),
  }

  /**
   * ========================================
   * 4. VALUE FLOW
   * ========================================
   *
   * Single-line values align to the input rhythm.
   * Multiline values preserve imported formatting.
   */
  const flow = multiline
    ? [
        "whitespace-pre-wrap",
        "break-words",
      ].join(" ")
    : {
        compact: [
          "truncate",
          "whitespace-nowrap",
        ].join(" "),
        flexible: [
          "overflow-hidden",
          "whitespace-normal",
          "break-words",
          "[display:-webkit-box]",
          "[-webkit-box-orient:vertical]",
          "[-webkit-line-clamp:2]",
        ].join(" "),
        "full-width": [
          "whitespace-normal",
          "break-words",
        ].join(" "),
      }[behavior]

  /**
   * ========================================
   * 5. SIZE
   * ========================================
   */
  const sizes = {
    sm: multiline
      ? [
          variant === "boxed"
            ? "min-h-[calc(var(--control-height-sm)*3)]"
            : "",
          variant === "boxed"
            ? "px-[var(--space-inline-sm)]"
            : "px-0",
          variant === "boxed"
            ? "py-[var(--space-2)]"
            : "py-0",
        ].join(" ")
      : [
          variant === "boxed"
            ? "h-[var(--control-height-sm)]"
            : "",
          variant === "boxed"
            ? "px-[var(--space-inline-sm)]"
            : "px-0",
          variant === "boxed"
            ? "py-[var(--space-2)]"
            : "py-0",
        ].join(" "),
    md: multiline
      ? [
          variant === "boxed"
            ? "min-h-[calc(var(--control-height-md)*3)]"
            : "",
          variant === "boxed"
            ? "px-[var(--space-inline-md)]"
            : "px-0",
          variant === "boxed"
            ? "py-[var(--space-3)]"
            : "py-0",
        ].join(" ")
      : [
          variant === "boxed"
            ? "h-[var(--control-height-md)]"
            : "",
          variant === "boxed"
            ? "px-[var(--space-inline-md)]"
            : "px-0",
          variant === "boxed"
            ? "py-[var(--space-3)]"
            : "py-0",
        ].join(" "),
  }

  /**
   * ========================================
   * 6. FINAL COMPOSITION
   * ========================================
   */
  const valueClasses = [base, surfaces[variant], flow, sizes[size], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 7. RENDER
   * ========================================
   */
  return (
    <output className={valueClasses} {...props}>
      {content}
    </output>
  )
}
