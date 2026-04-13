type ActionListItem = {
  label: string
  onClick?: () => void
}

type ActionListProps = {
  items: ActionListItem[]
  ariaLabel?: string
}

export default function ActionList({
  items,
  ariaLabel,
}: ActionListProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div
      aria-label={ariaLabel}
      className="border-y border-[var(--color-border-divider)]"
    >
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={[
            "flex",
            "w-full",
            "items-center",
            "justify-between",
            "px-[var(--space-inline-sm)]",
            "py-[var(--space-2)]",
            "text-left",
            "text-sm",
            "leading-normal",
            "text-[color:var(--color-text-primary)]",
            "transition-colors",
            "hover:bg-[var(--color-surface-muted)]",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--color-focus-ring)]",
            "focus-visible:ring-inset",
            index > 0 ? "border-t border-[var(--color-border-divider)]" : "",
          ].filter(Boolean).join(" ")}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
