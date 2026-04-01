import {
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type ReactElement,
} from "react"

/**
 * ========================================
 * FIELD
 * Shared field wrapper for form controls
 * ========================================
 *
 * This component owns the structural parts that repeat across
 * inputs and future controls:
 * label, hint, error, required mark, spacing, and accessibility.
 *
 * The goal is consistency:
 * - same field rhythm everywhere
 * - same accessible wiring everywhere
 * - same helper/error treatment everywhere
 */

type FieldControlProps = {
  id?: string
  disabled?: boolean
  required?: boolean
  className?: string
  "aria-describedby"?: string
  "aria-invalid"?: AriaAttributes["aria-invalid"]
}

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type FieldProps = {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  variant?: "default" | "tight"
  children: ReactElement<FieldControlProps>
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function Field({
  label,
  hint,
  error,
  required,
  variant = "default",
  children,
}: FieldProps) {
  const generatedId = useId()

  /**
   * ========================================
   * 3. CHILD CONTROL
   * Single element only
   * ========================================
   */
  if (!isValidElement<FieldControlProps>(children)) {
    return null
  }

  const childId = children.props.id ?? generatedId
  const childDisabled = Boolean(children.props.disabled)

  const hintId = hint ? `${childId}-hint` : undefined
  const errorId = error ? `${childId}-error` : undefined

  /**
   * ========================================
   * 4. ACCESSIBILITY
   * Merge field metadata with any existing child props
   * ========================================
   */
  const describedBy = [
    children.props["aria-describedby"],
    errorId,
    !error ? hintId : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined

  const ariaInvalid =
    error ? true : children.props["aria-invalid"]

  /**
   * ========================================
   * 5. WRAPPER
   * Shared vertical rhythm
   * ========================================
   */
  const wrapper = [
    "flex flex-col",
    variant === "tight"
      ? "gap-[var(--space-1)]"
      : "gap-[var(--space-stack-xs)]",
  ].join(" ")

  const controlStack = [
    "flex flex-col",
    "gap-[var(--space-stack-xs)]",
  ].join(" ")

  /**
   * ========================================
   * 6. LABEL
   * Compact and readable
   * ========================================
   */
  const labelClasses = [
    "text-[length:var(--text-field-label)]",
    "leading-[var(--leading-normal)]",
    "font-normal",
    childDisabled
      ? "text-[var(--color-disabled-text)]"
      : "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  /**
   * ========================================
   * 7. SUPPORTING TEXT
   * Hint or error below the control
   * ========================================
   */
  const hintClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  const errorClasses = [
    "text-xs",
    "leading-normal",
    "text-[var(--color-field-error-text)]",
  ].join(" ")

  const childProps: FieldControlProps = {
    id: childId,
    required,
    "aria-describedby": describedBy,
    "aria-invalid": ariaInvalid,
  }

  const control = cloneElement(children, childProps)

  const supportingText = error ? (
    <p id={errorId} className={errorClasses}>
      {error}
    </p>
  ) : hint ? (
    <p id={hintId} className={hintClasses}>
      {hint}
    </p>
  ) : null

  /**
   * ========================================
   * 8. RENDER
   * Shared field structure around the control
   * ========================================
   */
  return (
    <div className={wrapper}>
      {label ? (
        <label htmlFor={childId} className={labelClasses}>
          {label}
          {required ? " *" : null}
        </label>
      ) : null}

      <div className={controlStack}>
        {control}
        {supportingText}
      </div>
    </div>
  )
}
