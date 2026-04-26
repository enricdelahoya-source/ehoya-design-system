import type { ReactNode } from "react"
import RecordShellBar from "../components/RecordShellBar"

type CollectionPageTemplateProps = {
  title: string
  actions?: ReactNode
  summary?: ReactNode
  summaryClassName?: string
  filterBar?: ReactNode
  filterBarClassName?: string
  mainContent: ReactNode
  mainContentClassName?: string
  mainContentId?: string
}

export default function CollectionPageTemplate({
  title,
  actions,
  summary,
  summaryClassName = "",
  filterBar,
  filterBarClassName = "",
  mainContent,
  mainContentClassName = "",
  mainContentId,
}: CollectionPageTemplateProps) {
  const summarySectionClasses = [
    "grid gap-[var(--space-2)] md:grid-cols-2 xl:grid-cols-4",
    summaryClassName,
  ].filter(Boolean).join(" ")
  const filterSectionClasses = [filterBarClassName].filter(Boolean).join(" ")
  const mainContentClasses = [
    "min-h-0 overflow-hidden bg-[var(--color-surface)]",
    mainContentClassName,
  ].filter(Boolean).join(" ")

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      <RecordShellBar title={title} actions={actions} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[var(--content-width-xl)] flex-col px-[var(--space-section-sm)] pt-[var(--space-3)] pb-[var(--space-section-sm)] md:px-[var(--space-section-md)]">
          <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-3)]">
            {summary ? (
              <section
                className={summarySectionClasses}
                aria-label={`${title} overview`}
              >
                {summary}
              </section>
            ) : null}

            {filterBar ? (
              <section aria-label={`${title} filters`} className={filterSectionClasses}>
                {filterBar}
              </section>
            ) : null}

            <div className={mainContentClasses} id={mainContentId}>
              {mainContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
