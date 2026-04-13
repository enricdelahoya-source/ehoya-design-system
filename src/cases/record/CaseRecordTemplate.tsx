import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  ACTION_LABELS,
  getActionExplanation,
  getPrimaryAction,
  getSecondaryActions,
  resolveCaseState,
} from "./caseActions"
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
import ActionList from "../../design-system/components/ActionList"
import Button from "../../design-system/components/Button"
import Drawer from "../../design-system/components/Drawer"
import Field from "../../design-system/components/fields/Field"
import Link from "../../design-system/components/Link"
import StatusBadge, {
  type StatusBadgeEmphasis,
  type StatusBadgeTone,
} from "../../design-system/components/StatusBadge"
import Tabs from "../../design-system/components/Tabs"
import Select from "../../design-system/components/controls/Select"
import Textarea from "../../design-system/components/controls/Textarea"
import RecordPageTemplate from "../../design-system/templates/RecordPageTemplate"

type AIRecordInsight = {
  situation: {
    badge: {
      label: string
      tone: StatusBadgeTone
      emphasis: StatusBadgeEmphasis
    }
    ownership: string
    condition?: string
  }[]
  caseSummary: string[]
  signals: string[]
  actions: {
    label: string
    referenceId?: string
    reason?: string
  }[]
  basedOn: string[]
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
  onEscalateCase: (reason: string, note: string) => void
  onReassignCase: (assignee: string, team: string, note: string) => void
  showEscalateAction: boolean
  selectedActivityTimelineItems: ActivityTimelineItem[]
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
}

const recordTabs = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
] as const

const ESCALATION_REASON_OPTIONS = [
  "Engineering dependency",
  "Executive visibility",
  "Approval required",
  "Cross-team coordination",
] as const

const REASSIGNMENT_OPTIONS = {
  Billing: [
    "Lucia Fernandez",
    "Jonas Weber",
  ],
  "Technical Support": [
    "Marco Silva",
    "Nadia Romero",
  ],
  "Customer Success": [
    "Chiara Marino",
    "Anais Martin",
  ],
  "Risk / Compliance": [
    "Amelie Laurent",
    "David Park",
  ],
} as const

const REASSIGNMENT_TEAM_OPTIONS = Object.keys(REASSIGNMENT_OPTIONS)

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
  onEscalateCase,
  onReassignCase,
  showEscalateAction,
  selectedActivityTimelineItems,
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
}: CaseRecordTemplateProps) {
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const [isEscalateOpen, setIsEscalateOpen] = useState(false)
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [reassignmentAssignee, setReassignmentAssignee] = useState("")
  const [reassignmentTeam, setReassignmentTeam] = useState("")
  const [reassignmentNote, setReassignmentNote] = useState("")
  const [escalationReason, setEscalationReason] = useState("")
  const [escalationNote, setEscalationNote] = useState("")
  const moreActionsRef = useRef<HTMLDivElement | null>(null)
  const caseActionState = resolveCaseState(record)
  const mockSignalRecord = record as CaseRecord & { followUpsSent?: number }
  const caseSignals = {
    slaRisk:
      record.breachRisk === "High"
        ? "high"
        : record.breachRisk === "Medium"
          ? "medium"
          : "low",
    noActionAvailable:
      caseActionState === "waiting_on_customer" &&
      (mockSignalRecord.followUpsSent ?? 0) >= 2,
  } as const
  const primaryAction = getPrimaryAction(caseActionState, caseSignals)
  const primaryActionLabel = primaryAction ? ACTION_LABELS[primaryAction] : null
  const secondaryActionLabels = getSecondaryActions(caseActionState, primaryAction).map(
    (action) => ACTION_LABELS[action],
  )
  const actionExplanation = getActionExplanation(caseActionState, caseSignals)
  const headerMetadataItems = [
    record.customer.trim(),
    record.assignee.trim(),
    record.priority.trim() ? `${record.priority} priority` : "",
    record.queue.trim(),
  ].filter(Boolean)

  useEffect(() => {
    if (!isMoreActionsOpen) {
      return
    }

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!moreActionsRef.current?.contains(event.target as Node)) {
        setIsMoreActionsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown)

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown)
    }
  }, [isMoreActionsOpen])

  useEffect(() => {
    setIsReassignOpen(false)
    setIsEscalateOpen(false)
    setIsMoreActionsOpen(false)
    setReassignmentAssignee("")
    setReassignmentTeam("")
    setReassignmentNote("")
    setEscalationReason("")
    setEscalationNote("")
  }, [record.id])

  useEffect(() => {
    if (!showEscalateAction) {
      setIsEscalateOpen(false)
      setEscalationReason("")
      setEscalationNote("")
    }
  }, [showEscalateAction])

  const trimmedReassignmentAssignee = reassignmentAssignee.trim()
  const trimmedReassignmentTeam = reassignmentTeam.trim()
  const trimmedReassignmentNote = reassignmentNote.trim()
  const trimmedEscalationNote = escalationNote.trim()
  const canSubmitReassignment =
    trimmedReassignmentAssignee !== "" || trimmedReassignmentTeam !== ""
  const reassignmentAssigneeOptions =
    trimmedReassignmentTeam === ""
      ? []
      : REASSIGNMENT_OPTIONS[trimmedReassignmentTeam as keyof typeof REASSIGNMENT_OPTIONS] ?? []

  function handleOpenReassignment() {
    setIsEscalateOpen(false)
    setIsReassignOpen(true)
  }

  function handleReassignmentTeamChange(nextTeam: string) {
    setReassignmentTeam(nextTeam)
    setReassignmentAssignee("")
  }

  function handleOpenEscalation() {
    setIsReassignOpen(false)
    setIsEscalateOpen(true)
  }

  function handleOpenReassignmentFromMenu() {
    setIsMoreActionsOpen(false)
    handleOpenReassignment()
  }

  function handleOpenEscalationFromMenu() {
    setIsMoreActionsOpen(false)
    handleOpenEscalation()
  }

  function handleCancelReassignment() {
    setIsReassignOpen(false)
    setReassignmentAssignee("")
    setReassignmentTeam("")
    setReassignmentNote("")
  }

  function handleConfirmReassignment() {
    if (!canSubmitReassignment) {
      return
    }

    onReassignCase(
      trimmedReassignmentAssignee,
      trimmedReassignmentTeam,
      trimmedReassignmentNote,
    )
    handleCancelReassignment()
  }

  function handleCancelEscalation() {
    setIsEscalateOpen(false)
    setEscalationReason("")
    setEscalationNote("")
  }

  function handleConfirmEscalation() {
    if (!escalationReason) {
      return
    }

    onEscalateCase(escalationReason, trimmedEscalationNote)
    handleCancelEscalation()
  }

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
        <>
          <div className="relative" ref={moreActionsRef}>
            <Button
              variant="secondary"
              onClick={() => setIsMoreActionsOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={isMoreActionsOpen}
            >
              More actions
            </Button>
            {isMoreActionsOpen ? (
              <div
                role="menu"
                aria-label="More actions"
                className="absolute top-[calc(100%+var(--space-1))] left-0 z-10 min-w-[10rem] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] bg-[var(--color-surface-elevated)] py-[var(--space-1)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleOpenReassignmentFromMenu}
                  className="block w-full px-[var(--space-inline-sm)] py-[var(--space-1)] text-left text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)]"
                >
                  Reassign
                </button>
                {showEscalateAction ? (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleOpenEscalationFromMenu}
                    className="block w-full px-[var(--space-inline-sm)] py-[var(--space-1)] text-left text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)]"
                  >
                    Escalate
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <Button variant="primary" onClick={onEnterEditMode}>
            Edit
          </Button>
        </>
      }
      aiOpen={isAIDrawerOpen}
      mainContent={
        <>
          {isReassignOpen ? (
            <section
              aria-label="Reassign case"
              className="shrink-0 border-y border-[var(--color-border-divider)] py-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-3)]">
                <div className="space-y-[var(--space-half)]">
                  <h2 className="m-0 text-[length:var(--text-md)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                    Reassign case
                  </h2>
                  <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                    Update the ownership context before the case is reassigned.
                  </p>
                </div>

                <div className="grid gap-[var(--space-3)] md:grid-cols-2">
                  <Field label="Team" variant="tight">
                    <Select
                      size="sm"
                      value={reassignmentTeam}
                      onChange={(event) => handleReassignmentTeamChange(event.target.value)}
                    >
                      <option value="">Select a team</option>
                      {REASSIGNMENT_TEAM_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Assignee" variant="tight">
                    <Select
                      size="sm"
                      value={reassignmentAssignee}
                      onChange={(event) => setReassignmentAssignee(event.target.value)}
                      disabled={trimmedReassignmentTeam === ""}
                    >
                      <option value="">
                        {trimmedReassignmentTeam === ""
                          ? "Select a team first"
                          : "Select an assignee"}
                      </option>
                      {reassignmentAssigneeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Note" helper="Optional" variant="tight">
                      <Textarea
                        size="sm"
                        value={reassignmentNote}
                        onChange={(event) => setReassignmentNote(event.target.value)}
                        placeholder="Add context for the reassignment"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!canSubmitReassignment}
                    onClick={handleConfirmReassignment}
                  >
                    Reassign
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelReassignment}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </section>
          ) : null}
          {isEscalateOpen ? (
            <section
              aria-label="Escalate case"
              className="shrink-0 border-y border-[var(--color-border-divider)] py-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-3)]">
                <div className="space-y-[var(--space-half)]">
                  <h2 className="m-0 text-[length:var(--text-md)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                    Escalate case
                  </h2>
                  <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                    Capture the escalation context before the case state is updated.
                  </p>
                </div>

                <div className="grid gap-[var(--space-3)] md:grid-cols-2">
                  <Field label="Reason" required variant="tight">
                    <Select
                      size="sm"
                      value={escalationReason}
                      onChange={(event) => setEscalationReason(event.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {ESCALATION_REASON_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Note" helper="Optional" variant="tight">
                      <Textarea
                        size="sm"
                        value={escalationNote}
                        onChange={(event) => setEscalationNote(event.target.value)}
                        placeholder="Add context for the escalation"
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!escalationReason}
                    onClick={handleConfirmEscalation}
                  >
                    Escalate
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEscalation}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

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
              Refresh insights
            </Link>
          }
        >
          <section className="space-y-[var(--space-2)]">
            <h3
              className="m-0 text-[color:var(--color-text-primary)]"
              style={asideTitleStyles}
            >
              Case summary
            </h3>
            <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
              {aiRecordInsight.caseSummary.map((item) => (
                <p
                  key={item}
                  className="m-0 text-sm leading-normal text-[color:var(--color-text-primary)]"
                >
                  {item}
                </p>
              ))}
            </div>
          </section>

          {aiRecordInsight.signals.length > 0 ? (
            <section className="mt-[var(--space-6)] space-y-[var(--space-2)]">
              <h3 className="m-0" style={asideTitleStyles}>
                Key factors
              </h3>
              <ul className="list-outside list-disc space-y-[var(--space-1)] pt-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
                {aiRecordInsight.signals.map((signal) => (
                  <li
                    key={signal}
                    className="text-sm leading-normal text-[color:var(--color-text-primary)]"
                  >
                    {signal}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-[var(--space-6)] space-y-[var(--space-2)]">
            <h3
              className="m-0 text-[color:var(--color-text-primary)]"
              style={asideTitleStyles}
            >
              Situation
            </h3>
            <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
              {aiRecordInsight.situation.map((item) => (
                <div key={`${item.badge.label}-${item.ownership}`} className="space-y-[var(--space-1)]">
                  <div>
                    <StatusBadge
                      tone={item.badge.tone}
                      emphasis={item.badge.emphasis}
                      size="sm"
                    >
                      {item.badge.label}
                    </StatusBadge>
                  </div>
                  <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                    {`Owned by ${item.ownership}`}
                  </p>
                  {item.condition ? (
                    <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                      {item.condition}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-[var(--space-6)] border-b border-[var(--color-border-divider)] pb-[var(--space-5)]">
            <div className="space-y-[var(--space-3)] pt-[var(--space-1)]">
              <div className="space-y-[var(--space-1)]">
                <h3
                  className="m-0 text-[color:var(--color-text-primary)]"
                  style={asideTitleStyles}
                >
                  Next step
                </h3>
                <div className="space-y-[var(--space-1)] pt-[var(--space-half)]">
                  <p className="m-0 text-sm leading-normal text-[color:var(--color-text-primary)]">
                    {actionExplanation}
                  </p>
                  {primaryActionLabel ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-[var(--space-2)] mb-[var(--space-2)] w-full"
                    >
                      {primaryActionLabel}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-[var(--space-1)] pt-[var(--space-2)]">
                <p className="m-0 text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                  Other actions
                </p>
                <div className="pt-[var(--space-half)]">
                  <ActionList
                    ariaLabel="Other actions"
                    items={secondaryActionLabels.map((actionLabel) => ({
                      label: actionLabel,
                    }))}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-[var(--space-6)] space-y-[var(--space-2)]">
            <h3 className="m-0" style={asideTitleStyles}>
              Based on
            </h3>
            <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
              {aiRecordInsight.basedOn.map((item) => (
                <p
                  key={item}
                  className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]"
                >
                  {item}
                </p>
              ))}
            </div>
          </section>
        </Drawer>
      }
    />
  )
}
