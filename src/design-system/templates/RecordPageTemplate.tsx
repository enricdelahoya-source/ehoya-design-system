import type { MouseEventHandler, ReactNode } from "react"
import type { CaseStatus } from "../components/CaseStatusBadge"
import RecordShellBar from "../components/RecordShellBar"

type RecordPageTemplateBreadcrumb = {
  label: string
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type RecordPageTemplateProps = {
  breadcrumbs?: RecordPageTemplateBreadcrumb[]
  title: string
  status?: CaseStatus
  metadata?: ReactNode
  actions?: ReactNode
  aiOpen: boolean
  mainContent: ReactNode
  aiRegion: ReactNode
}

export default function RecordPageTemplate({
  breadcrumbs,
  title,
  status,
  metadata,
  actions,
  aiOpen,
  mainContent,
  aiRegion,
}: RecordPageTemplateProps) {
  return (
    <>
      <RecordShellBar
        breadcrumbs={breadcrumbs}
        title={title}
        status={status}
        metadata={metadata}
        actions={actions}
      />
      <div className="min-h-0 flex-1">
        <div className="mx-auto flex h-full w-full max-w-[var(--content-width-xl)] min-h-0 px-[var(--space-section-sm)] md:px-[var(--space-section-md)]">
          <div className={`grid h-full min-h-0 w-full items-stretch xl:grid-cols-[minmax(0,calc(var(--content-width-lg)_-_var(--space-section-md)))_minmax(var(--space-section-lg),1fr)_${aiOpen ? "minmax(0,calc(var(--content-width-sm)_+_var(--control-height-sm)))" : "var(--control-height-sm)"}]`}>
            <div className="flex min-w-0 min-h-0 flex-col py-[var(--space-section-md)]">
              {mainContent}
            </div>

            <div className="min-h-0 xl:col-start-3">
              {aiRegion}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
