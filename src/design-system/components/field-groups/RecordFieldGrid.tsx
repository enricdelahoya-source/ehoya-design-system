// Field-group layout: grid for read-only record field collections.
import type { ComponentPropsWithoutRef } from "react"

type RecordFieldGridProps = ComponentPropsWithoutRef<"div">

export default function RecordFieldGrid({
  className = "",
  children,
  ...props
}: RecordFieldGridProps) {
  const fieldGridClasses = [
    "grid",
    "gap-x-[var(--space-stack-lg)]",
    "gap-y-[var(--space-stack-sm)]",
    "lg:grid-cols-3",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={fieldGridClasses} {...props}>
      {children}
    </div>
  )
}
