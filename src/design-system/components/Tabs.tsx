type TabOption = {
  id: string
  label: string
}

type TabsProps = {
  tabs: TabOption[]
  activeTab: string
  onChange: (tabId: string) => void
}

/**
 * ========================================
 * TABS
 * Design-system tabs navigation
 * ========================================
 *
 * This component renders a restrained tab row for section-level
 * navigation in enterprise screens and playground views.
 *
 * The goal is consistency:
 * - structural navigation rhythm
 * - calm active state
 * - reusable tab language
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function Tabs({
  tabs,
  activeTab,
  onChange,
}: TabsProps) {
  /**
   * ========================================
   * 3. BASE LAYER
   * ========================================
   *
   * Tabs should feel like navigation, not actions.
   * Keep the row quiet and structurally anchored.
   */
  const listClasses = [
    "flex",
    "items-end",
    "gap-[var(--space-1)]",
    "border-b",
    "border-[var(--color-border-divider)]",
  ].join(" ")

  const baseTab = [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "border-b-[length:var(--border-width-navigation-active)]",
    "border-transparent",
    "bg-transparent",
    "px-[var(--space-3)]",
    "py-[var(--space-2)]",
    "text-sm",
    "font-medium",
    "leading-normal",
    "whitespace-nowrap",
    "transition-[color,border-color,background-color]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-focus-ring)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-focus-ring-offset)]",
  ].join(" ")

  /**
   * ========================================
   * 4. STATE LAYER
   * ========================================
   *
   * Active tabs rely on structure and emphasis instead
   * of filled surfaces or pill treatments.
   */
  const states = {
    active: [
      "border-[var(--color-border-strong)]",
      "text-[var(--color-text-default)]",
    ].join(" "),
    inactive: [
      "text-[var(--color-text-muted)]",
      "hover:text-[var(--color-text-default)]",
      "hover:border-[color-mix(in_srgb,var(--color-border-subtle)_65%,transparent)]",
    ].join(" "),
  }

  /**
   * ========================================
   * 5. RENDER
   * ========================================
   */
  return (
    <div className={listClasses} role="tablist" aria-label="Sections">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const tabClasses = [baseTab, isActive ? states.active : states.inactive]
          .filter(Boolean)
          .join(" ")

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={tabClasses}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
