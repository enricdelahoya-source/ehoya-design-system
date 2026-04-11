import { useEffect, useState, type ReactNode } from "react"
import { renderCaseRecordSection } from "./renderers"
import type {
  CaseRecord,
  SectionConfig,
  UpdateCaseRecordField,
} from "./types"
import type { CaseStatus } from "../../design-system/components/CaseStatusBadge"
import ActivityTimeline, {
  type ActiveSuggestedAction,
  type ActivityTimelineItem,
} from "../../design-system/components/ActivityTimeline"
import Button from "../../design-system/components/Button"
import Drawer from "../../design-system/components/Drawer"
import Link from "../../design-system/components/Link"
import Tabs from "../../design-system/components/Tabs"
import RecordPageTemplate from "../../design-system/templates/RecordPageTemplate"

export type CaseState =
  | "Needs assignment"
  | "Waiting for first response"
  | "Waiting for customer response"
  | "Waiting for internal review"
  | "In investigation"

type AIRecordInsight = {
  signals: string[]
  summary: string[]
  actions: {
    label: string
    referenceId?: string
    reason?: string
  }[]
  references: {
    id: string
    label: string
  }[]
}

type CaseRecordTemplateProps = {
  record: CaseRecord
  status: CaseStatus
  sections: SectionConfig[]
  updateField: UpdateCaseRecordField
  getDisplayValue: (value: string) => string
  recordTab: "details" | "activity"
  onRecordTabChange: (tab: "details" | "activity") => void
  onBackToCases: () => void
  onEnterEditMode: () => void
  selectedActivityTimelineItems: ActivityTimelineItem[]
  caseState: CaseState
  highlightedTimelineItemId: string | null
  activeSuggestedAction: ActiveSuggestedAction | null
  onAppendTimelineItem: (item: ActivityTimelineItem) => void
  onDismissSuggestedAction: () => void
  onOpenSuggestedActionComposer: () => void
  isAIDrawerOpen: boolean
  onToggleAIDrawer: () => void
  onCloseAIDrawer: () => void
  aiUpdatedLabel: ReactNode
  aiRecordInsight: AIRecordInsight
  onRefreshAIInsights: () => void
  onSendSuggestedAction: (actionLabel: ActiveSuggestedAction["label"]) => void
  onAIReferenceClick: (referenceId: string) => void
  onAIActionClick: (actionLabel: string, referenceId: string, reason?: string) => void
}

const recordTabs = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
] as const

const asideTitleStyles = {
  fontSize: "var(--text-aside-title)",
  lineHeight: "var(--leading-aside-title)",
  fontWeight: "var(--font-weight-bold)",
  letterSpacing: "normal",
  color: "var(--color-text-primary)",
} as const

export default function CaseRecordTemplate({
  record,
  status,
  sections,
  updateField,
  getDisplayValue,
  recordTab,
  onRecordTabChange,
  onBackToCases,
  onEnterEditMode,
  selectedActivityTimelineItems,
  caseState,
  highlightedTimelineItemId,
  activeSuggestedAction,
  onAppendTimelineItem,
  onDismissSuggestedAction,
  onOpenSuggestedActionComposer,
  isAIDrawerOpen,
  onToggleAIDrawer,
  onCloseAIDrawer,
  aiUpdatedLabel,
  aiRecordInsight,
  onRefreshAIInsights,
  onSendSuggestedAction,
  onAIReferenceClick,
  onAIActionClick,
}: CaseRecordTemplateProps) {
  const [completedSuggestedActionLabels, setCompletedSuggestedActionLabels] = useState<string[]>([])
  const visibleSuggestedActions = aiRecordInsight.actions.filter(
    (action) => !completedSuggestedActionLabels.includes(action.label),
  )
  const headerMetadataItems = [
    record.customer.trim(),
    record.assignee.trim(),
    record.priority.trim() ? `${record.priority} priority` : "",
    record.queue.trim(),
  ].filter(Boolean)

  useEffect(() => {
    setCompletedSuggestedActionLabels([])
  }, [record.id])

  return (
    <RecordPageTemplate
      breadcrumbs={[
        {
          label: "Cases",
          href: "#",
          onClick: (event) => {
            event.preventDefault()
            onBackToCases()
          },
        },
        {
          label: record.id,
        },
      ]}
      title={record.title}
      status={status}
      metadata={headerMetadataItems.join(" • ")}
      actions={
        <Button variant="secondary" onClick={onEnterEditMode}>
          Edit
        </Button>
      }
      aiOpen={isAIDrawerOpen}
      mainContent={
        <>
          <div className="shrink-0">
            <Tabs
              tabs={[...recordTabs]}
              activeTab={recordTab}
              onChange={(tabId) => onRecordTabChange(tabId as "details" | "activity")}
            />
          </div>

          <div className={`min-h-0 flex-1 pt-[var(--space-3)] ${recordTab === "activity" ? "overflow-hidden" : "overflow-y-auto"}`}>
            <div className={`min-w-0 w-full ${recordTab === "activity" ? "h-full" : "space-y-[var(--space-6)]"}`}>
              {recordTab === "details" ? (
                sections.map((section) =>
                  renderCaseRecordSection({
                    section,
                    record,
                    renderMode: "view",
                    updateField,
                    getDisplayValue,
                  })
                )
              ) : (
                <ActivityTimeline
                  items={selectedActivityTimelineItems}
                  className="h-full"
                  highlightedItemId={highlightedTimelineItemId}
                  activeSuggestedAction={activeSuggestedAction}
                  onAppendTimelineItem={onAppendTimelineItem}
                  onCompleteSuggestedAction={(actionLabel) =>
                    setCompletedSuggestedActionLabels((current) =>
                      current.includes(actionLabel) ? current : [...current, actionLabel],
                    )
                  }
                  onSendSuggestedAction={onSendSuggestedAction}
                  onDismissSuggestedAction={onDismissSuggestedAction}
                  onOpenSuggestedActionComposer={onOpenSuggestedActionComposer}
                  scrollListOnly
                />
              )}
            </div>
          </div>
        </>
      }
      aiRegion={
        <Drawer
          open={isAIDrawerOpen}
          title="AI assistance"
          metadata={aiUpdatedLabel}
          subtitle="Generated from visible case details and recent activity."
          onToggle={onToggleAIDrawer}
          toggleLabel={isAIDrawerOpen ? "Collapse AI assistance" : "Open AI assistance"}
          railLabel="AI"
          onClose={onCloseAIDrawer}
          closeLabel="Close AI assistance"
          actions={
            <Link
              href="#"
              className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
              onClick={(event) => {
                event.preventDefault()
                onRefreshAIInsights()
              }}
            >
              Refresh summary
            </Link>
          }
        >
          <section className="space-y-[var(--space-2)]">
            <h3 className="m-0" style={asideTitleStyles}>
              Case signals
            </h3>
            <div className="pt-[var(--space-1)]">
              <div className="grid gap-x-[var(--space-3)] gap-y-[var(--space-3)] sm:grid-cols-2">
                <div className="min-w-0">
                  <span className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                    State:
                  </span>
                  {" "}
                  <span className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                    {caseState}
                  </span>
                </div>
                {aiRecordInsight.signals.map((signal) => {
                  const [label, value = ""] = signal.split(": ")

                  return (
                    <div key={signal} className="min-w-0">
                      <span className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                        {label}:
                      </span>
                      {" "}
                      <span className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                        {value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="mt-[var(--space-5)] space-y-[var(--space-2)]">
            <h3
              className="m-0 text-[color:var(--color-text-primary)]"
              style={asideTitleStyles}
            >
              Summary
            </h3>
            <ul className="list-outside list-disc space-y-[var(--space-1)] pt-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
              {aiRecordInsight.summary.map((item) => (
                <li key={item} className="text-sm leading-normal text-[color:var(--color-text-primary)]">
                  {item}
                </li>
              ))}
            </ul>
            {aiRecordInsight.references.length > 0 ? (
              <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
                <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                  Related activity
                </p>
                <div className="space-y-[var(--space-1)]">
                  {aiRecordInsight.references.map((reference) => (
                    selectedActivityTimelineItems.some((item) => item.id === reference.id) ? (
                      <button
                        key={reference.id}
                        type="button"
                        onClick={() => onAIReferenceClick(reference.id)}
                        className="block w-full cursor-pointer py-[var(--space-half)] text-left text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] whitespace-normal break-words underline-offset-2 transition-colors hover:text-[color:var(--color-text-primary)] hover:underline focus-visible:rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                      >
                        {reference.label}
                      </button>
                    ) : (
                      <span
                        key={reference.id}
                        className="block w-full py-[var(--space-half)] text-left text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] whitespace-normal break-words"
                      >
                        {reference.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-[var(--space-6)] space-y-[var(--space-2)]">
            <h3
              className="m-0 text-[color:var(--color-text-primary)]"
              style={asideTitleStyles}
            >
              Suggested actions
            </h3>
            <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
              Suggested next steps. Review before action.
            </p>
            <ol className="list-outside list-decimal space-y-[var(--space-2)] pt-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
              {visibleSuggestedActions.map((action) => (
                <li
                  key={action.label}
                  className="text-sm leading-normal text-[color:var(--color-text-primary)]"
                >
                  {action.referenceId &&
                  selectedActivityTimelineItems.some(
                    (item) => item.id === action.referenceId
                  ) ? (
                    <button
                      type="button"
                      onClick={() =>
                        onAIActionClick(action.label, action.referenceId!, action.reason)
                      }
                      className="cursor-pointer text-left text-[color:inherit] underline-offset-2 transition-colors hover:text-[color:var(--color-text-primary)] hover:underline focus-visible:rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      {action.label}
                    </button>
                  ) : (
                    action.label
                  )}
                  {action.reason ? (
                    <div className="pt-[var(--space-half)] text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                      {action.reason}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </Drawer>
      }
    />
  )
}
