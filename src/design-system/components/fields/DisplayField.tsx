// Field wrapper: read-only field chrome around display content.
import type { ReactNode } from "react"

type DisplayFieldProps = {
  label?: string
  hint?: string
  variant?: "default" | "tight"
  layout?: "vertical" | "horizontal"
  children: ReactNode
}

export default function DisplayField({
  label,
  hint,
  variant = "default",
  layout = "vertical",
  children,
}: DisplayFieldProps) {
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

  const contentStack = [
    "flex min-w-0 flex-col",
    "gap-[var(--space-0)]",
    layout === "horizontal" ? "flex-1" : "",
  ].join(" ")

  const labelClasses = [
    layout === "horizontal"
      ? "w-[var(--field-label-width-horizontal)] shrink-0 pt-[calc((var(--control-height-md)-1lh)/2)]"
      : "",
    "text-[length:var(--text-field-label)]",
    "leading-[var(--leading-normal)]",
    "font-normal",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const hintClasses = [
    "pt-[var(--space-2)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  return (
    <div className={wrapper}>
      {label ? (
        <div className={labelClasses}>
          {label}
        </div>
      ) : null}

      <div className={contentStack}>
        {children}

        {hint ? (
          <p className={hintClasses}>{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
