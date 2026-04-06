import type { ReactNode } from "react"
import RecordShellBar from "../components/RecordShellBar"

type CasesListTemplateProps = {
  actions?: ReactNode
  overview: ReactNode
  filterControls: ReactNode
  activeFilters?: ReactNode
  listContent: ReactNode
  resultsRegionId?: string
  compactFilterSpacing?: boolean
}

export default function CasesListTemplate({
  actions,
  overview,
  filterControls,
  activeFilters,
  listContent,
  resultsRegionId,
  compactFilterSpacing = false,
}: CasesListTemplateProps) {
  return (
    <div className="space-y-[var(--space-4)]">
      <RecordShellBar title="Cases" actions={actions} />

      <div className="space-y-[var(--space-4)] border-t border-[color:color-mix(in_srgb,var(--color-accent)_22%,var(--color-border-divider))] px-[var(--space-section-sm)] pt-[var(--space-4)] md:px-[var(--space-section-md)]">
        <section
          className="grid gap-[var(--space-2)] md:grid-cols-2 xl:grid-cols-4"
          aria-label="Case list overview filters"
        >
          {overview}
        </section>

        <section
          className={`bg-[var(--color-surface)] ${
            compactFilterSpacing
              ? "space-y-[var(--space-2)]"
              : "space-y-[var(--space-3)]"
          }`}
        >
          {filterControls}
          {activeFilters ? (
            <div role="list" aria-label="Active filters" className="flex flex-wrap items-center gap-[var(--space-2)]">
              {activeFilters}
            </div>
          ) : null}
          <div className="overflow-hidden" id={resultsRegionId}>
            {listContent}
          </div>
        </section>
      </div>
    </div>
  )
}
