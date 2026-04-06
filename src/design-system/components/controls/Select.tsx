// Control primitive: editable select control.
import { forwardRef } from "react"
import type { SelectHTMLAttributes } from "react"

/**
 * ========================================
 * SELECT
 * Design-system select primitive
 * ========================================
 *
 * This component wraps the native <select> element and focuses
 * only on control styling and native select behavior.
 *
 * Shared field structure like labels, hints, and errors lives
 * in the Field wrapper component.
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type SelectProps = {
  size?: "sm" | "md"
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = "md",
    className = "",
    disabled,
    "aria-invalid": ariaInvalid,
    children,
    ...props
  },
  ref
) {
  const isInvalid =
    ariaInvalid === true || ariaInvalid === "true"

  /**
   * ========================================
   * 3. BASE SELECT
   * ========================================
   *
   * Keep this neutral.
   * Focus and error should be layered separately.
   */
  const base = [
    "w-full",
    "min-w-0",
    "appearance-none",
    "rounded-[var(--radius-sm)]",
    "border-[length:var(--border-width-control)]",
    "py-0",
    "outline-none",
    "bg-[var(--color-field-bg)]",
    "text-[var(--color-field-text)]",
    "transition-[border-color,box-shadow,background-color,color]",
    "bg-[image:linear-gradient(45deg,transparent_50%,var(--color-field-text)_50%),linear-gradient(135deg,var(--color-field-text)_50%,transparent_50%)]",
    "bg-[position:calc(100%-1.25rem)_calc(50%-0.125rem),calc(100%-0.9375rem)_calc(50%-0.125rem)]",
    "bg-[size:0.375rem_0.375rem,0.375rem_0.375rem]",
    "bg-no-repeat",

    "disabled:cursor-not-allowed",
    "disabled:bg-[var(--color-disabled-bg)]",
    "disabled:text-[var(--color-disabled-text)]",
    "disabled:border-[var(--color-disabled-border)]",
    "disabled:bg-[image:linear-gradient(45deg,transparent_50%,var(--color-disabled-text)_50%),linear-gradient(135deg,var(--color-disabled-text)_50%,transparent_50%)]",
  ].join(" ")

  /**
   * ========================================
   * 4. DEFAULT / ERROR STATE
   * ========================================
   *
   * Border color communicates semantic state.
   */
  const stateClasses = isInvalid
    ? [
        "border",
        "border-[var(--color-field-error-border)]",
        "bg-[var(--color-field-error-bg)]",
        "hover:border-[var(--color-field-error-border)]",
      ].join(" ")
    : [
        "border",
        "border-[var(--color-field-border)]",
        "hover:border-[var(--color-field-border-hover)]",
        "hover:bg-[var(--color-surface-muted)]",
      ].join(" ")

  /**
   * ========================================
   * 5. FOCUS STATE
   * ========================================
   *
   * Border thickness communicates interaction state.
   *
   * Normal focus:
   * - thicker neutral border
   * - no outer ring
   *
   * Error focus:
   * - keep red border
   * - no outer ring
   */
  const focusClasses = isInvalid
  ? [
      "focus:border-[length:var(--border-width-control-focus)]",
      "focus:border-[var(--color-field-error-border)]",
    ].join(" ")
  : [
      "focus:border-[length:var(--border-width-control-focus)]",
      "focus:border-[var(--color-field-border-focus)]",
    ].join(" ")

  /**
   * ========================================
   * 6. SIZE
   * ========================================
   */
  const sizes = {
    sm: [
      "h-[var(--control-height-sm)]",
      "pl-[var(--space-inline-sm)]",
      "pr-[calc(var(--space-inline-sm)+1.5rem)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
    md: [
      "h-[var(--control-height-md)]",
      "pl-[var(--space-inline-md)]",
      "pr-[calc(var(--space-inline-md)+1.5rem)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
  }

  /**
   * ========================================
   * 7. FINAL COMPOSITION
   * ========================================
   */
  const selectClasses = [base, stateClasses, focusClasses, sizes[size], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 8. RENDER
   * ========================================
   */
  return (
    <select
      ref={ref}
      className={selectClasses}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      {...props}
    >
      {children}
    </select>
  )
})

export default Select
