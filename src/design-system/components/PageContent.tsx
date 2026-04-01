import type { ComponentPropsWithoutRef } from "react"

type PageContentProps = {
  width?: "md" | "lg" | "xl"
} & ComponentPropsWithoutRef<"div">

export default function PageContent({
  width = "lg",
  className = "",
  children,
  ...props
}: PageContentProps) {
  const widths = {
    md: "max-w-[var(--content-width-md)]",
    lg: "max-w-[var(--content-width-lg)]",
    xl: "max-w-[var(--content-width-xl)]",
  }

  const pageContentClasses = [
    "mx-auto",
    "w-full",
    widths[width],
    "px-[var(--space-section-sm)]",
    "py-[var(--space-section-md)]",
    "space-y-[var(--space-4)]",
    "md:px-[var(--space-section-md)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={pageContentClasses} {...props}>
      {children}
    </div>
  )
}
