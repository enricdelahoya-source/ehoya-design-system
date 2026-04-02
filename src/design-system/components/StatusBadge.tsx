import type { ReactNode } from "react"

/**
 * ========================================
 * STATUS BADGE
 * Design-system semantic badge primitive
 * ========================================
 *
 * This component renders compact semantic badges with reusable
 * tone, emphasis, and sizing rules.
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
export type StatusBadgeTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"

export type StatusBadgeEmphasis = "subtle" | "strong"

export type StatusBadgeSize = "sm" | "md"

type StatusBadgeProps = {
  children: ReactNode
  tone?: StatusBadgeTone
  emphasis?: StatusBadgeEmphasis
  size?: StatusBadgeSize
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
    "rounded-[var(--badge-radius)]",
    "text-[length:var(--text-badge)]",
    "leading-[var(--leading-badge)]",
    "[font-weight:var(--font-weight-badge)]",
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
      "min-h-[var(--badge-height-sm)]",
      "px-[var(--badge-padding-inline-sm)]",
    ].join(" "),
    md: [
      "min-h-[var(--badge-height-md)]",
      "px-[var(--badge-padding-inline-md)]",
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
        "bg-[var(--color-badge-neutral-subtle-bg)]",
        "text-[var(--color-badge-neutral-subtle-text)]",
        "border-[var(--color-badge-neutral-subtle-border)]",
      ].join(" "),
      info: [
        "border",
        "bg-[var(--color-badge-info-subtle-bg)]",
        "text-[var(--color-badge-info-subtle-text)]",
        "border-[var(--color-badge-info-subtle-border)]",
      ].join(" "),
      success: [
        "border",
        "bg-[var(--color-badge-success-subtle-bg)]",
        "text-[var(--color-badge-success-subtle-text)]",
        "border-[var(--color-badge-success-subtle-border)]",
      ].join(" "),
      warning: [
        "border",
        "bg-[var(--color-badge-warning-subtle-bg)]",
        "text-[var(--color-badge-warning-subtle-text)]",
        "border-[var(--color-badge-warning-subtle-border)]",
      ].join(" "),
      danger: [
        "border",
        "bg-[var(--color-badge-danger-subtle-bg)]",
        "text-[var(--color-badge-danger-subtle-text)]",
        "border-[var(--color-badge-danger-subtle-border)]",
      ].join(" "),
    },
    strong: {
      neutral: [
        "bg-[var(--color-badge-neutral-strong-bg)]",
        "text-[var(--color-badge-neutral-strong-text)]",
      ].join(" "),
      info: [
        "bg-[var(--color-badge-info-strong-bg)]",
        "text-[var(--color-badge-info-strong-text)]",
      ].join(" "),
      success: [
        "bg-[var(--color-badge-success-strong-bg)]",
        "text-[var(--color-badge-success-strong-text)]",
      ].join(" "),
      warning: [
        "bg-[var(--color-badge-warning-strong-bg)]",
        "text-[var(--color-badge-warning-strong-text)]",
      ].join(" "),
      danger: [
        "bg-[var(--color-badge-danger-strong-bg)]",
        "text-[var(--color-badge-danger-strong-text)]",
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
