import type { ButtonHTMLAttributes, ReactNode } from "react"

type FilterChipProps = {
  children: ReactNode
  selected: boolean
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "aria-controls">

export default function FilterChip({
  children,
  selected,
  onClick,
  "aria-controls": ariaControls,
}: FilterChipProps) {
  const classes = [
    "inline-flex items-center",
    "rounded-[var(--radius-pill)]",
    "border",
    "px-[var(--space-2)]",
    "py-[var(--space-1)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "transition-colors",
    selected
      ? [
          "border-[var(--color-field-border-focus)]",
          "bg-[var(--color-surface-selected)]",
          "shadow-[inset_0_0_0_1px_var(--color-field-border-focus)]",
          "text-[color:var(--color-text-primary)]",
        ].join(" ")
      : [
          "border-[var(--color-field-border)]",
          "bg-[var(--color-surface)]",
          "text-[color:var(--color-text-primary)]",
          "hover:bg-[var(--color-surface-muted)]",
        ].join(" "),
    "focus-visible:border-[var(--color-field-border-focus)]",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-focus-ring)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
    "focus-visible:outline-none",
  ].join(" ")

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls={ariaControls}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  )
}
