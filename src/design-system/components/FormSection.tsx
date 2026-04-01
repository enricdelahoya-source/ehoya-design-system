import { useId, type ReactNode } from "react"

type FormSectionProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  const titleId = useId()

  const sectionClasses = [
    "space-y-[var(--space-2)]",
    className,
  ].join(" ")

  const headerClasses = [
    "space-y-[var(--space-half)]",
  ].join(" ")

  const titleClasses = [
    "m-0",
  ].join(" ")

  const titleStyles = {
    fontSize: "var(--text-aside-title)",
    lineHeight: "var(--leading-aside-title)",
    fontWeight: "var(--font-weight-bold)",
    letterSpacing: "normal",
    color: "var(--color-text-primary)",
  } as const

  const descriptionClasses = [
    "max-w-[var(--content-width-sm)]",
    "text-xs",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  return (
    <section aria-labelledby={title ? titleId : undefined} className={sectionClasses}>
      {title || description ? (
        <div className={headerClasses}>
          {title ? (
            <h2 id={titleId} className={titleClasses} style={titleStyles}>
              {title}
            </h2>
          ) : null}

          {description ? (
            <p className={descriptionClasses}>{description}</p>
          ) : null}
        </div>
      ) : null}

      <div>{children}</div>
    </section>
  )
}
