import type { ButtonHTMLAttributes } from "react"

type SummaryCardProps = {
  label: string
  value: number | string
  selected: boolean
  className?: string
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "aria-controls">

export default function SummaryCard({
  label,
  value,
  selected,
  onClick,
  className = "",
  "aria-controls": ariaControls,
}: SummaryCardProps) {
  const classes = [
    "min-w-[10rem]",
    "flex-1",
    "basis-0",
    "rounded-[var(--radius-md)]",
    "border",
    "border-[var(--color-field-border)]",
    "px-[var(--space-4)]",
    "py-[var(--space-3)]",
    "text-left",
    "transition-[border-color,color,background-color]",
    selected
      ? [
          "border-[var(--color-field-border-focus)]",
          "bg-[var(--color-field-bg)]",
          "shadow-[inset_0_0_0_1px_var(--color-field-border-focus)]",
        ].join(" ")
      : [
          "bg-[var(--color-field-bg)]",
          "hover:border-[var(--color-field-border-hover)]",
          "hover:bg-[var(--color-surface-muted)]",
        ].join(" "),
    "focus-visible:border-[var(--color-field-border-focus)]",
    "focus-visible:bg-[var(--color-field-bg)]",
    "focus-visible:outline-none",
    className,
  ].filter(Boolean).join(" ")

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls={ariaControls}
      onClick={onClick}
      className={classes}
    >
      <p className={`text-[length:var(--text-meta)] leading-[var(--leading-normal)] ${
        selected
          ? "font-normal text-[color:var(--color-text-primary)]"
          : "font-normal text-[color:var(--color-text-secondary)]"
      }`}>
        {label}
      </p>
      <p className="pt-[var(--space-1)] text-xl leading-[var(--leading-snug)] font-medium text-[color:var(--color-text-primary)]">
        {value}
      </p>
    </button>
  )
}
