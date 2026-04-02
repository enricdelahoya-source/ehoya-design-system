// Field-group layout: vertical stack for grouped fields or values.
import type { ComponentPropsWithoutRef } from "react"

type FieldGroupStackProps = ComponentPropsWithoutRef<"div">

export default function FieldGroupStack({
  className = "",
  children,
  ...props
}: FieldGroupStackProps) {
  const fieldStackClasses = [
    "flex",
    "flex-col",
    "gap-[var(--space-2)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={fieldStackClasses} {...props}>
      {children}
    </div>
  )
}
