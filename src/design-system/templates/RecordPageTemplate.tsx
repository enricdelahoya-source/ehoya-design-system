import type { CSSProperties, MouseEventHandler, ReactNode } from "react"
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
  const drawerGap = aiOpen ? "var(--space-4)" : "var(--space-8)"
  const drawerWidth = aiOpen
    ? "calc(var(--content-width-sm) + var(--control-height-sm))"
    : "var(--control-height-sm)"

  return (
    <>
      <RecordShellBar
        breadcrumbs={breadcrumbs}
        title={title}
        status={status}
        metadata={metadata}
        actions={actions}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[var(--content-width-xl)] min-h-0 overflow-hidden px-[var(--space-section-sm)] md:px-[var(--space-section-md)]">
          <div
            className="grid h-full min-h-0 w-full items-stretch overflow-hidden xl:[column-gap:var(--record-page-gap)] xl:[grid-template-columns:minmax(0,1fr)_var(--record-page-drawer-width)]"
            style={
              {
                "--record-page-gap": drawerGap,
                "--record-page-drawer-width": drawerWidth,
              } as CSSProperties
            }
          >
            <div className="flex min-w-0 min-h-0 w-full max-w-[var(--content-width-lg)] flex-col overflow-hidden py-[var(--space-section-md)] xl:justify-self-start">
              {mainContent}
            </div>

            <div className="min-h-0 overflow-hidden">
              {aiRegion}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
