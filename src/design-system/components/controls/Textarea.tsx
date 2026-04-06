// Control primitive: editable multiline text control.
import { forwardRef } from "react"
import type { TextareaHTMLAttributes } from "react"

/**
 * ========================================
 * TEXTAREA
 * Design-system textarea primitive
 * ========================================
 *
 * This component wraps the native <textarea> element and focuses
 * only on control styling and native textarea behavior.
 *
 * Shared field structure like labels, hints, and errors lives
 * in the Field wrapper component.
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type TextareaProps = {
  size?: "sm" | "md"
} & TextareaHTMLAttributes<HTMLTextAreaElement>

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
   * 3. BASE TEXTAREA
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
    "outline-none",
    "resize-y",
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
   *
   * Textareas use padding + min-height instead of fixed height.
   */
  const sizes = {
    sm: [
      "min-h-[calc(var(--control-height-sm)*2.75)]",
      "px-[var(--space-inline-sm)]",
      "py-[var(--space-1)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
    md: [
      "min-h-[calc(var(--control-height-md)*2.75)]",
      "px-[var(--space-inline-md)]",
      "py-[var(--space-2)]",
      "text-sm",
      "leading-normal",
    ].join(" "),
  }

  /**
   * ========================================
   * 7. FINAL COMPOSITION
   * ========================================
   */
  const textareaClasses = [base, stateClasses, focusClasses, sizes[size], className]
    .filter(Boolean)
    .join(" ")

  /**
   * ========================================
   * 8. RENDER
   * ========================================
   */
  return (
    <textarea
      ref={ref}
      className={textareaClasses}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      {...props}
    />
  )
})

export default Textarea
