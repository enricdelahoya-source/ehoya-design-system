// Section wrapper: groups read-only record content within a section.
import { useId, type ReactNode } from "react"

type RecordSectionProps = {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export default function RecordSection({
  title,
  description,
  children,
  className = "",
}: RecordSectionProps) {
  const titleId = useId()

  const sectionClasses = [
    "pt-[var(--space-5)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const innerClasses = [
    "space-y-[var(--space-stack-sm)]",
    "border-b",
    "border-[var(--color-border-divider)]",
    "pb-[var(--space-5)]",
  ].join(" ")

  const headerClasses = [
    "space-y-[var(--space-2)]",
  ].join(" ")

  const titleClasses = [
    "m-0",
  ].join(" ")

  const titleStyles = {
    fontSize: "var(--text-section-title)",
    lineHeight: "var(--leading-section-title)",
    fontWeight: "var(--font-weight-section-title)",
    letterSpacing: "normal",
    color: "var(--color-text-section-title)",
  } as const

  const descriptionClasses = [
    "max-w-[var(--content-width-md)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const contentClasses = ["pt-[var(--space-4)]"].join(" ")

  return (
    <section aria-labelledby={titleId} className={sectionClasses}>
      <div className={innerClasses}>
        <div className={headerClasses}>
          <h2 id={titleId} className={titleClasses} style={titleStyles}>
            {title}
          </h2>

          {description ? (
            <p className={descriptionClasses}>{description}</p>
          ) : null}
        </div>

        <div className={contentClasses}>{children}</div>
      </div>
    </section>
  )
}
