// Field-group layout: grid for editable form field collections.
import type { ComponentPropsWithoutRef } from "react"

type FormFieldGridProps = ComponentPropsWithoutRef<"div">

export default function FormFieldGrid({
  className = "",
  children,
  ...props
}: FormFieldGridProps) {
  const gridClasses = [
    "grid",
    "gap-x-[var(--space-stack-sm)]",
    "gap-y-[var(--space-2)]",
    "md:grid-cols-2",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  )
}
