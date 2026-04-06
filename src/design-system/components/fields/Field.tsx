// Field wrapper: editable field chrome around a control primitive.
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
  readOnly?: boolean
  name?: string
  onBlur?: unknown
  onChange?: unknown
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
  helper?: string
  hint?: string
  error?: string
  required?: boolean
  variant?: "default" | "tight"
  layout?: "vertical" | "horizontal"
  children: ReactElement<FieldControlProps>
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function Field({
  label,
  helper,
  hint,
  error,
  required,
  variant = "default",
  layout = "vertical",
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
  const isRequired = required ?? Boolean(children.props.required)
  const supportText = error ? error : helper ?? hint

  const helperId = supportText && !error ? `${childId}-helper` : undefined
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
    helperId,
  ]
    .filter(Boolean)
    .join(" ") || undefined

  const ariaInvalid =
    error ? true : children.props["aria-invalid"]

  const shouldPassFieldState =
    typeof children.type === "string"
      ? children.type === "input" ||
        children.type === "select" ||
        children.type === "textarea"
      : "required" in children.props ||
        "name" in children.props ||
        "onBlur" in children.props ||
        "onChange" in children.props

  /**
   * ========================================
   * 5. WRAPPER
   * Shared vertical rhythm
   * ========================================
   */
  const wrapper = [
    "flex min-w-0",
    layout === "horizontal"
      ? "items-start gap-[var(--space-stack-sm)]"
      : "flex-col",
    layout === "vertical"
      ? variant === "tight"
        ? "gap-[var(--space-half)]"
        : "gap-[var(--space-1)]"
      : "",
  ].join(" ")

  const controlStack = [
    "flex min-w-0 flex-col",
    "gap-[var(--space-half)]",
    layout === "horizontal" ? "flex-1" : "",
  ].join(" ")

  /**
   * ========================================
   * 6. LABEL
   * Compact and readable
   * ========================================
   */
  const labelClasses = [
    layout === "horizontal"
      ? "w-[var(--field-label-width-horizontal)] shrink-0 pt-[calc((var(--control-height-md)-1lh)/2)]"
      : "",
    "min-w-0",
    "break-words",
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
  const supportingTextBaseClasses = [
    "min-w-0",
    "break-words",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
  ].join(" ")

  const helperClasses = [
    supportingTextBaseClasses,
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  const errorClasses = [
    supportingTextBaseClasses,
    "text-[var(--color-field-error-text)]",
  ].join(" ")

  const childProps: FieldControlProps = {
    id: childId,
    "aria-describedby": describedBy,
  }

  if (shouldPassFieldState) {
    childProps.required = isRequired
    childProps["aria-invalid"] = ariaInvalid
  }

  const control = cloneElement(children, childProps)

  const supportingText = error ? (
    <p id={errorId} className={errorClasses}>
      {error}
    </p>
  ) : supportText ? (
    <p id={helperId} className={helperClasses}>
      {supportText}
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
          {isRequired ? (
            <>
              <span
                aria-hidden="true"
                className="text-[color:var(--color-text-muted)]"
              >
                {" *"}
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </label>
      ) : null}

      <div className={controlStack}>
        {control}
        {supportingText}
      </div>
    </div>
  )
}
