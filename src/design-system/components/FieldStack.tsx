import type { ComponentPropsWithoutRef } from "react"

type FieldStackProps = ComponentPropsWithoutRef<"div">

export default function FieldStack({
  className = "",
  children,
  ...props
}: FieldStackProps) {
  const fieldStackClasses = [
    "flex",
    "flex-col",
    "gap-[var(--space-stack-md)]",
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
