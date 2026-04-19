import { useId, type ReactNode } from "react"

type DrawerProps = {
  open: boolean
  title: string
  subtitle?: ReactNode
  metadata?: ReactNode
  actions?: ReactNode
  onToggle: () => void
  toggleLabel?: string
  railLabel?: ReactNode
  railContent?: ReactNode
  onClose?: () => void
  closeLabel?: string
  children: ReactNode
}

export default function Drawer({
  open,
  title,
  subtitle,
  metadata,
  actions,
  onToggle,
  toggleLabel,
  railLabel,
  railContent,
  onClose,
  closeLabel,
  children,
}: DrawerProps) {
  const panelId = useId()

  const containerClasses = [
    "w-full",
    "h-full",
    "self-stretch",
    open
      ? "max-w-[calc(var(--content-width-sm)_+_var(--control-height-sm))]"
      : "max-w-[var(--control-height-sm)]",
    "justify-self-end",
  ].join(" ")

  const panelClasses = [
    "min-w-0",
    "flex",
    "h-full",
    "flex-1",
    "min-h-0",
    "flex-col",
    "border",
    "border-[var(--color-border-divider)]",
    "border-r-0",
    "bg-[var(--color-surface-elevated)]",
  ].join(" ")

  const railClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "h-[var(--control-height-sm)]",
    "w-[var(--control-height-sm)]",
    "shrink-0",
    "bg-transparent",
    "text-on-secondary",
    "border-[length:var(--border-width-action-secondary)]",
    "border-secondary-border",
    "rounded-[var(--radius-sm)]",
    "hover:border-secondary-border-hover",
    "hover:bg-ghost-hover",
    "active:bg-ghost-active",
    "transition-[background-color,border-color]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-focus-ring)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
  ].join(" ")

  const railShellClasses = [
    "flex",
    "min-h-full",
    "w-[var(--control-height-sm)]",
    "shrink-0",
    "items-start",
    "justify-start",
    "border-l",
    "border-r",
    "border-r-[var(--color-border-divider)]",
    "border-l-[var(--color-border-divider)]",
    "bg-[var(--color-surface-shell)]",
  ].join(" ")

  const railTextClasses = [
    "text-[length:var(--text-xs)]",
    "leading-[var(--leading-normal)]",
    "font-medium",
  ].join(" ")

  const headerClasses = [
    "space-y-[var(--space-4)]",
    "border-b",
    "border-[var(--color-border-divider)]",
    "px-[var(--space-4)]",
    "py-[var(--space-4)]",
  ].join(" ")

  const dismissRowClasses = [
    "flex",
    "justify-end",
  ].join(" ")

  const metaRowClasses = [
    "flex",
    "items-center",
    "justify-between",
    "gap-[var(--space-4)]",
  ].join(" ")

  const identityClasses = [
    "min-w-0",
    "space-y-[var(--space-2)]",
  ].join(" ")

  const titleClasses = [
    "m-0",
  ].join(" ")

  const titleStyles = {
    fontSize: "var(--text-section-title)",
    lineHeight: "var(--leading-section-title)",
    fontWeight: "var(--font-weight-section-title)",
    color: "var(--color-text-section-title)",
  } as const

  const metaClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  const headerActionsClasses = [
    "flex",
    "shrink-0",
    "items-center",
    "gap-[var(--space-2)]",
  ].join(" ")

  const closeButtonClasses = [
    "inline-flex",
    "h-[var(--space-6)]",
    "w-[var(--space-6)]",
    "items-center",
    "justify-center",
    "rounded-[var(--radius-sm)]",
    "text-[color:var(--color-text-muted)]",
    "transition-[background-color,color,border-color]",
    "hover:bg-[var(--color-surface-muted)]",
    "hover:text-[color:var(--color-text-secondary)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-focus-ring)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
  ].join(" ")

  const bodyClasses = [
    "min-h-0",
    "flex-1",
    "overflow-y-auto",
    "space-y-[var(--space-5)]",
    "px-[var(--space-4)]",
    "py-[var(--space-4)]",
  ].join(" ")

  const railToggleAriaLabel = toggleLabel ?? (open ? "Collapse panel" : `Open ${title}`)
  const dismissLabel = closeLabel ?? `Close ${title}`

  return (
    <aside className={containerClasses} aria-label={title}>
      <div className="flex h-full min-h-full items-stretch justify-end">
        {open ? (
          <div id={panelId} className={panelClasses}>
            <div className={headerClasses}>
              {onClose ? (
                <div className={dismissRowClasses}>
                  <button
                    type="button"
                    className={closeButtonClasses}
                    onClick={onClose}
                    aria-label={dismissLabel}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 12 12"
                      className="h-[var(--space-3)] w-[var(--space-3)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M2.5 2.5 9.5 9.5" />
                      <path d="M9.5 2.5 2.5 9.5" />
                    </svg>
                  </button>
                </div>
              ) : null}

              {metadata || actions ? (
                <div className={metaRowClasses}>
                  {metadata ? <div className={metaClasses}>{metadata}</div> : <div />}
                  {actions ? <div className={headerActionsClasses}>{actions}</div> : null}
                </div>
              ) : null}

              <div className={identityClasses}>
                <h2 className={titleClasses} style={titleStyles}>
                  {title}
                </h2>
                {subtitle ? <div className={metaClasses}>{subtitle}</div> : null}
              </div>
            </div>

            <div className={bodyClasses}>{children}</div>
          </div>
        ) : null}

        <div className={railShellClasses}>
          {railContent ?? (
            <button
              type="button"
              className={railClasses}
              onClick={onToggle}
              aria-label={railToggleAriaLabel}
              aria-expanded={open}
              aria-controls={panelId}
            >
              {railLabel ? <span className={railTextClasses}>{railLabel}</span> : null}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
