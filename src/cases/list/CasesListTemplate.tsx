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
  const summaryClassName = [
    "pt-[var(--space-3)]",
    "pb-[var(--space-1)]",
    "[&>[aria-hidden='true']]:hidden",
    "[&_button]:rounded-[var(--radius-sm)]",
    "[&_button]:py-[var(--space-2)]",
    "[&_button>p:last-child]:pt-[var(--space-half)]",
    "[&_button>p:last-child]:text-lg",
  ].join(" ")
  const filterBarClasses = [
    compactFilterSpacing
      ? "gap-[var(--space-2)]"
      : "gap-[var(--space-3)]",
    "flex",
    "flex-col",
    "pt-[var(--space-1)]",
    "[&>div:first-child]:!flex",
    "[&>div:first-child]:flex-wrap",
    "[&>div:first-child]:items-end",
    "[&>div:first-child]:gap-[var(--space-2)]",
    "[&>div:first-child]:!space-y-0",
    "[&>div:first-child>div:first-child]:min-w-[min(24rem,100%)]",
    "[&>div:first-child>div:first-child]:flex-1",
    "[&>div:first-child>div:first-child]:gap-[var(--space-2)]",
    "[&>div:first-child>div:first-child]:md:grid-cols-[minmax(0,1fr)]",
    "[&>div:first-child>div:last-child]:flex-1",
  ].join(" ")
  const mainContentClassName = [
    "flex",
    "flex-1",
    "flex-col",
    "!bg-transparent",
    "pt-[var(--space-1)]",
    "[&>*]:!bg-transparent",
    "[&>*:nth-child(2)]:!bg-[var(--color-surface-structural-muted)]",
    "[&>*:last-child>*]:!bg-transparent",
    "[&>*:last-child]:min-h-0",
    "[&>*:last-child]:flex-1",
    "[&>*:last-child]:overflow-y-auto",
    "[&>*:last-child]:overscroll-contain",
    "[&>*:last-child]:pt-[var(--space-1)]",
    "[&>*:last-child]:pb-[var(--space-2)]",
  ].join(" ")

  return (
    <CollectionPageTemplate
      title="Cases"
      actions={actions}
      summary={overview}
      summaryClassName={summaryClassName}
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
      filterBarClassName={filterBarClasses}
      mainContent={listContent}
      mainContentClassName={mainContentClassName}
      mainContentId={resultsRegionId}
    />
  )
}
