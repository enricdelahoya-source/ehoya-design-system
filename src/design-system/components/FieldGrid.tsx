import type { ComponentPropsWithoutRef } from "react"

type FieldGridProps = ComponentPropsWithoutRef<"div">

export default function FieldGrid({
  className = "",
  children,
  ...props
}: FieldGridProps) {
  const fieldGridClasses = [
    "grid",
    "gap-x-[var(--space-stack-lg)]",
    "gap-y-[var(--space-stack-md)]",
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
