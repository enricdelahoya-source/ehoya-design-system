import type { ReactNode } from "react"
import CollectionPageTemplate from "../../design-system/templates/CollectionPageTemplate"

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
    <CollectionPageTemplate
      title="Cases"
      actions={actions}
      summary={overview}
      filterBar={
        <>
          {filterControls}
          {activeFilters ? (
            <div role="list" aria-label="Active filters" className="flex flex-wrap items-center gap-[var(--space-2)]">
              {activeFilters}
            </div>
          ) : null}
        </>
      }
      filterBarClassName={`${
        compactFilterSpacing
          ? "space-y-[var(--space-2)]"
          : "space-y-[var(--space-3)]"
      }`}
      mainContent={listContent}
      mainContentId={resultsRegionId}
    />
  )
}
