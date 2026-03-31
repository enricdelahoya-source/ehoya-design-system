import type { ReactNode } from "react"

/**
 * ========================================
 * STATUS BADGE
 * Design-system status primitive
 * ========================================
 *
 * This component renders compact semantic status badges for
 * ERP-style record states, shell bars, and detail headers.
 *
 * The goal is consistency:
 * - calm semantic treatment
 * - compact structural rhythm
 * - reusable status styling
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type StatusBadgeProps = {
  children: ReactNode
  tone?: "neutral" | "info" | "success" | "warning" | "danger"
  emphasis?: "subtle" | "strong"
  size?: "sm" | "md"
  className?: string
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function StatusBadge({
  children,
  tone = "neutral",
  emphasis = "subtle",
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  /**
   * ========================================
   * 3. BASE LAYER
   * ========================================
   *
   * Keep badges compact, readable, and non-interactive.
   * These should feel structural rather than decorative.
   */
  const base = [
    "inline-flex",
    "min-w-0",
    "items-center",
    "justify-center",
    "whitespace-nowrap",
    "rounded-md",
    "font-medium",
    "leading-normal",
    "cursor-default",
    "select-none",
    "align-middle",
  ].join(" ")

  /**
   * ========================================
   * 4. SIZE LAYER
   * ========================================
   *
   * Both sizes keep the same text scale.
   * Density changes through min-height and padding.
   */
  const sizes = {
    sm: [
      "min-h-[1.375rem]",
      "px-[0.375rem]",
      "text-sm",
    ].join(" "),
    md: [
      "min-h-[1.5rem]",
      "px-[0.5rem]",
      "rounded-[0.3125rem]",
      "text-sm",
    ].join(" "),
  }

  /**
   * ========================================
   * 5. TONE / EMPHASIS LAYER
   * ========================================
   *
   * Subtle badges use soft semantic tinting.
   * Strong badges use filled semantic surfaces.
   */
  const styles = {
    subtle: {
      neutral: [
        "border",
        "bg-[color-mix(in_srgb,var(--color-surface-muted)_58%,var(--color-surface-elevated))]",
        "text-[var(--color-text-default)]",
        "border-[color-mix(in_srgb,var(--color-border-subtle)_70%,transparent)]",
      ].join(" "),
      info: [
        "border",
        "bg-[color-mix(in_srgb,var(--color-info)_10%,var(--color-surface-elevated))]",
        "text-[var(--color-info)]",
        "border-[color-mix(in_srgb,var(--color-info)_16%,var(--color-border-subtle))]",
      ].join(" "),
      success: [
        "border",
        "bg-[color-mix(in_srgb,var(--color-success)_10%,var(--color-surface-elevated))]",
        "text-[var(--color-success)]",
        "border-[color-mix(in_srgb,var(--color-success)_16%,var(--color-border-subtle))]",
      ].join(" "),
      warning: [
        "border",
        "bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface-elevated))]",
        "text-[var(--color-warning)]",
        "border-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-border-subtle))]",
      ].join(" "),
      danger: [
        "border",
        "bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-surface-elevated))]",
        "text-[var(--color-danger)]",
        "border-[color-mix(in_srgb,var(--color-danger)_16%,var(--color-border-subtle))]",
      ].join(" "),
    },
    strong: {
      neutral: [
        "bg-[var(--color-surface-inverse)]",
        "text-[var(--color-text-inverse)]",
      ].join(" "),
      info: [
        "bg-[var(--color-info)]",
        "text-[var(--color-on-info)]",
      ].join(" "),
      success: [
        "bg-[var(--color-success)]",
        "text-[var(--color-on-success)]",
      ].join(" "),
      warning: [
        "bg-[var(--color-warning)]",
        "text-[var(--color-on-warning)]",
      ].join(" "),
      danger: [
        "bg-[var(--color-danger)]",
        "text-[var(--color-on-danger)]",
      ].join(" "),
    },
  }

  /**
   * ========================================
   * 6. FINAL COMPOSITION
   * ========================================
   */
  const badgeClasses = [base, sizes[size], styles[emphasis][tone], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 7. RENDER
   * ========================================
   */
  return <span className={badgeClasses}>{children}</span>
}
