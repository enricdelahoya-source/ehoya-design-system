import type { CaseIntelligenceModuleId } from "./caseIntelligenceRailTypes"

type ModuleSwitcherProps = {
  open: boolean
  activeModule: CaseIntelligenceModuleId
  onModuleSelect: (moduleId: CaseIntelligenceModuleId) => void
}

const modules: {
  id: CaseIntelligenceModuleId
  railLabel: string
  ariaLabel: string
}[] = [
  {
    id: "decision",
    railLabel: "DP",
    ariaLabel: "Decision panel",
  },
  {
    id: "similarCases",
    railLabel: "SC",
    ariaLabel: "Similar cases",
  },
]

export default function ModuleSwitcher({
  open,
  activeModule,
  onModuleSelect,
}: ModuleSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      aria-label="Case intelligence modules"
      className="flex w-full flex-col"
    >
      {modules.map((module) => {
        const isActive = open && activeModule === module.id
        const itemClasses = ["relative", "w-full"].join(" ")
        const innerClasses = [
          "mx-[var(--space-half)]",
          "border-b",
          "border-[var(--color-border-divider)]",
        ].join(" ")

        const buttonClasses = [
          "relative",
          "flex",
          "w-full",
          "min-h-[var(--control-height-sm)]",
          "items-center",
          "justify-center",
          "bg-transparent",
          "px-[var(--space-1)]",
          "text-[length:var(--text-xs)]",
          "leading-[var(--leading-normal)]",
          "transition-[background-color,color]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--color-focus-ring)]",
          "focus-visible:ring-inset",
          isActive
            ? "font-semibold text-[color:var(--color-text-primary)]"
            : "font-medium text-[color:var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[color:var(--color-text-primary)] active:bg-[var(--color-surface-muted)]",
        ].join(" ")

        const actionLabel = !open
          ? `Open ${module.ariaLabel}`
          : isActive
            ? `${module.ariaLabel}, current module`
            : `Show ${module.ariaLabel}`

        return (
          <div key={module.id} className={itemClasses}>
            <span
              aria-hidden="true"
              className={[
                "absolute",
                "left-0",
                "top-0",
                "bottom-0",
                "w-[var(--border-width-navigation-active)]",
                isActive ? "bg-[var(--color-border-focus)]" : "bg-transparent",
              ].join(" ")}
            />
            <div className={innerClasses}>
              <button
                type="button"
                className={buttonClasses}
                onClick={() => onModuleSelect(module.id)}
                role="tab"
                aria-label={actionLabel}
                aria-selected={isActive}
                aria-expanded={open && isActive}
                tabIndex={open ? (isActive ? 0 : -1) : 0}
              >
                <span aria-hidden="true" className="px-[var(--space-half)]">
                  {module.railLabel}
                </span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
