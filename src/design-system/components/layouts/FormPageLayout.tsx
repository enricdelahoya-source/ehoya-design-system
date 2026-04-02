// Page layout: constrains and spaces editable form pages.
import type { ComponentPropsWithoutRef } from "react"

type FormPageLayoutProps = ComponentPropsWithoutRef<"div">

export default function FormPageLayout({
  className = "",
  children,
  ...props
}: FormPageLayoutProps) {
  const outerClasses = [
    "px-[var(--space-section-sm)]",
    "md:px-[var(--space-section-md)]",
  ].join(" ")

  const innerClasses = [
    "w-full",
    "max-w-[var(--content-width-md)]",
    "space-y-[var(--space-section-md)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={outerClasses}>
      <div className={innerClasses} {...props}>
        {children}
      </div>
    </div>
  )
}
