// Control primitive: editable single-line text input.
import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"

/**
 * ========================================
 * INPUT
 * Design-system input primitive
 * ========================================
 *
 * This component wraps the native <input> element and focuses
 * only on control styling and native input behavior.
 *
 * Shared field structure like labels, hints, and errors lives
 * in the Field wrapper component.
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type InputProps = {
  size?: "sm" | "md"
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = "md",
    className = "",
    disabled,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref
) {
  const isInvalid =
    ariaInvalid === true || ariaInvalid === "true"

  /**
   * ========================================
   * 3. BASE INPUT
   * ========================================
   *
   * Keep this neutral.
   * Focus and error should be layered separately.
   */
  const base = [
    "w-full",
    "min-w-0",
    "rounded-[var(--radius-sm)]",
    "border-[length:var(--border-width-control)]",
    "py-0",
    "outline-none",
    "transition-[border-color,box-shadow,background-color,color]",
    "bg-[var(--color-field-bg)]",
    "text-[var(--color-field-text)]",
    "placeholder:text-[var(--color-field-placeholder)]",

    "disabled:cursor-not-allowed",
    "disabled:bg-[var(--color-disabled-bg)]",
    "disabled:text-[var(--color-disabled-text)]",
    "disabled:border-[var(--color-disabled-border)]",
    "disabled:placeholder:text-[var(--color-disabled-text)]",
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
      "px-[var(--space-inline-sm)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
    md: [
      "h-[var(--control-height-md)]",
      "px-[var(--space-inline-md)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
  }

  /**
   * ========================================
   * 7. FINAL COMPOSITION
   * ========================================
   */
  const inputClasses = [base, stateClasses, focusClasses, sizes[size], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 8. RENDER
   * ========================================
   */
  return (
    <input
      ref={ref}
      className={inputClasses}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      {...props}
    />
  )
})

export default Input
