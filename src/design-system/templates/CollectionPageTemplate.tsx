import type { ReactNode } from "react"
import RecordShellBar from "../components/RecordShellBar"

type CollectionPageTemplateProps = {
  title: string
  actions?: ReactNode
  summary?: ReactNode
  filterBar?: ReactNode
  filterBarClassName?: string
  mainContent: ReactNode
  mainContentId?: string
}

export default function CollectionPageTemplate({
  title,
  actions,
  summary,
  filterBar,
  filterBarClassName = "",
  mainContent,
  mainContentId,
}: CollectionPageTemplateProps) {
  const filterSectionClasses = [filterBarClassName].filter(Boolean).join(" ")

  return (
    <div>
      <RecordShellBar title={title} actions={actions} />

      <div className="mx-auto w-full max-w-[var(--content-width-xl)] px-[var(--space-section-sm)] py-[var(--space-section-md)] md:px-[var(--space-section-md)]">
        <div className="space-y-[var(--space-4)]">
          {summary ? (
            <section
              className="grid gap-[var(--space-2)] md:grid-cols-2 xl:grid-cols-4"
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

          <div className="overflow-hidden bg-[var(--color-surface)]" id={mainContentId}>
            {mainContent}
          </div>
        </div>
      </div>
    </div>
  )
}
