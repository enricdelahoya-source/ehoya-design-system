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
import Button from "../../design-system/components/Button"
import Field from "../../design-system/components/fields/Field"
import Tabs from "../../design-system/components/Tabs"
import Select from "../../design-system/components/controls/Select"
import Textarea from "../../design-system/components/controls/Textarea"
import RecordPageTemplate from "../../design-system/templates/RecordPageTemplate"
import CaseIntelligenceRail from "./CaseIntelligenceRail"
import type { DecisionPanelInsight } from "./caseIntelligenceRailTypes"

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
  onActivateSuggestedAction: (action: ActiveSuggestedAction) => void
  isAIDrawerOpen: boolean
  onToggleAIDrawer: () => void
  onCloseAIDrawer: () => void
  aiUpdatedLabel: ReactNode
  aiRecordInsight: DecisionPanelInsight
  onRefreshAIInsights: () => void
  onSendSuggestedAction: (actionLabel: ActiveSuggestedAction["label"]) => void
}

const recordTabs = [
  { id: "activity", label: "Activity" },
  { id: "details", label: "Details" },
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

// Temporary scroll-debug instrumentation. Remove after identifying the real clipping container.
const CASE_RECORD_SCROLL_DEBUG = true
const CASE_RECORD_SCROLL_DEBUG_TIMELINE_ROOT_CLASS =
  "case-record-scroll-debug-timeline-root"
const CASE_RECORD_SCROLL_DEBUG_CLASSES = {
  tabPanelOuter:
    "outline outline-1 outline-offset-[-1px] outline-[rgba(37,99,235,0.55)] bg-[rgba(37,99,235,0.04)]",
  tabPanelScroll:
    "outline outline-1 outline-offset-[-1px] outline-[rgba(245,158,11,0.55)] bg-[rgba(245,158,11,0.04)]",
  detailsContent:
    "outline outline-1 outline-offset-[-1px] outline-[rgba(34,197,94,0.55)] bg-[rgba(34,197,94,0.04)]",
  activityWrapper:
    "outline outline-1 outline-offset-[-1px] outline-[rgba(168,85,247,0.55)] bg-[rgba(168,85,247,0.04)]",
  activityTimelineRoot:
    "outline outline-1 outline-offset-[-1px] outline-[rgba(239,68,68,0.55)] bg-[rgba(239,68,68,0.04)]",
} as const

const PROVIDE_ETA_SUMMARY =
  "Customer is asking for ETA on remittance correction before planning call"
const PROVIDE_ETA_SUPPORTING_TEXT =
  "Customer is waiting for timing confirmation"
const DEFAULT_PROVIDE_ETA_REPLY = `Hi Irene,

We're still validating the remittance correction on our side.
We expect to have the updated file ready by tomorrow's export run.

I'll confirm once it's available.

Best,
Nadia`

function shouldUseProvideEtaFlow(record: CaseRecord) {
  return (
    record.channel === "Email" &&
    record.contact.trim() === "Irene Costa" &&
    record.productArea === "Remittance Export" &&
    record.nextStep.toLowerCase().includes("update the customer")
  )
}

function getCheckpointMoment(checkpoint: string) {
  const trimmed = checkpoint.trim()

  if (!trimmed || trimmed === "No checkpoint set") {
    return null
  }

  return trimmed
    .replace(/^Follow up on /, "")
    .replace(/^First response due /, "")
    .replace(/^Review by /, "")
}

function getImmediateNextStep(value: string) {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim()
}

function getLatestTimelineItem(
  items: ActivityTimelineItem[],
  predicate: (item: ActivityTimelineItem) => boolean,
) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]

    if (predicate(item)) {
      return item
    }
  }

  return null
}

function getLatestTimelineItemIndex(
  items: ActivityTimelineItem[],
  predicate: (item: ActivityTimelineItem) => boolean,
) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index
    }
  }

  return -1
}

function sortOtherActionLabels(
  state: ReturnType<typeof resolveCaseState>,
  labels: string[]
) {
  if (state !== "Waiting on customer") {
    return labels
  }

  const priority = [
    "Record customer reply",
    "Escalate case",
    "Close case",
    "Add internal note",
  ]

  return [...labels].sort((left, right) => {
    const leftIndex = priority.indexOf(left)
    const rightIndex = priority.indexOf(right)

    if (leftIndex === -1 && rightIndex === -1) {
      return 0
    }

    if (leftIndex === -1) {
      return 1
    }

    if (rightIndex === -1) {
      return -1
    }

    return leftIndex - rightIndex
  })
}

function getScrollDebugMetrics(label: string, element: HTMLDivElement | null) {
  if (!element) {
    return null
  }

  const computedStyle = window.getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  return {
    label,
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    offsetHeight: element.offsetHeight,
    rectHeight: Math.round(rect.height * 100) / 100,
    scrollTop: Math.round(element.scrollTop * 100) / 100,
    overflowY: computedStyle.overflowY,
    canScroll: element.scrollHeight > element.clientHeight + 1,
  }
}

type ScrollDebugMetric = NonNullable<
  ReturnType<typeof getScrollDebugMetrics>
>

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
  onActivateSuggestedAction,
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
  const [isProvideEtaOpen, setIsProvideEtaOpen] = useState(false)
  const [provideEtaDraft, setProvideEtaDraft] = useState(DEFAULT_PROVIDE_ETA_REPLY)
  const [hasSentProvideEta, setHasSentProvideEta] = useState(false)
  const [scrollDebugMetrics, setScrollDebugMetrics] = useState<ScrollDebugMetric[]>([])
  const [activeScrollDebugOwners, setActiveScrollDebugOwners] = useState<string[]>([])
  const [reassignmentAssignee, setReassignmentAssignee] = useState("")
  const [reassignmentTeam, setReassignmentTeam] = useState("")
  const [reassignmentNote, setReassignmentNote] = useState("")
  const [escalationReason, setEscalationReason] = useState("")
  const [escalationNote, setEscalationNote] = useState("")
  const moreActionsRef = useRef<HTMLDivElement | null>(null)
  const tabPanelOuterRef = useRef<HTMLDivElement | null>(null)
  const tabPanelScrollRef = useRef<HTMLDivElement | null>(null)
  const detailsContentRef = useRef<HTMLDivElement | null>(null)
  const activityWrapperRef = useRef<HTMLDivElement | null>(null)
  const provideEtaFlowEnabled = shouldUseProvideEtaFlow(record) || hasSentProvideEta
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
      caseActionState === "Waiting on customer" &&
      (mockSignalRecord.followUpsSent ?? 0) >= 2,
  } as const
  const primaryAction = getPrimaryAction(caseActionState, caseSignals)
  const primaryActionLabel = primaryAction ? ACTION_LABELS[primaryAction] : null
  const secondaryActionLabels = sortOtherActionLabels(
    caseActionState,
    getSecondaryActions(caseActionState, primaryAction).map((action) => ACTION_LABELS[action]),
  )
  const availableActionLabels = [
    ...(primaryActionLabel ? [primaryActionLabel] : []),
    ...secondaryActionLabels,
  ]
  const canEscalateCase = showEscalateAction && availableActionLabels.includes("Escalate case")
  const actionExplanation = getActionExplanation(caseActionState, caseSignals)
  const checkpointMoment = getCheckpointMoment(record.checkpoint)
  const nextStepSummary = getImmediateNextStep(record.nextStep.trim() || actionExplanation)
  const normalizedNextStep = nextStepSummary.toLowerCase()
  const latestIncomingEmailItem =
    record.channel === "Email" && selectedActivityTimelineItems.length > 0
      ? getLatestTimelineItem(
          selectedActivityTimelineItems,
          (item) => item.type === "incoming",
        )
      : null
  const latestIncomingEmailIndex =
    record.channel === "Email" && selectedActivityTimelineItems.length > 0
      ? getLatestTimelineItemIndex(
          selectedActivityTimelineItems,
          (item) => item.type === "incoming",
        )
      : -1
  const latestOutgoingEmailItem =
    record.channel === "Email" && selectedActivityTimelineItems.length > 0
      ? getLatestTimelineItem(
          selectedActivityTimelineItems,
          (item) => item.type === "outgoing",
        )
      : null
  const latestOutgoingEmailIndex =
    record.channel === "Email" && selectedActivityTimelineItems.length > 0
      ? getLatestTimelineItemIndex(
          selectedActivityTimelineItems,
          (item) => item.type === "outgoing",
        )
      : -1
  const needsEscalationOwner =
    caseActionState === "Escalated" && (!record.assignee.trim() || record.signals.needsAssignment)
  const needsOwnerAssignment = caseActionState === "Needs owner"
  const nextStepIsPassive =
    caseSignals.noActionAvailable ||
    normalizedNextStep.startsWith("wait ") ||
    normalizedNextStep.startsWith("no further action")
  const nextStepRequiresCommunication =
    normalizedNextStep.includes("reply") ||
    normalizedNextStep.includes("send the closure summary") ||
    normalizedNextStep.includes("send closure summary") ||
    normalizedNextStep.includes("customer update") ||
    normalizedNextStep.includes("update the customer") ||
    normalizedNextStep.includes("first response")
  const hasOutstandingCustomerMessage =
    latestIncomingEmailIndex > latestOutgoingEmailIndex
  const communicationComesFirst =
    record.channel === "Email" &&
    !provideEtaFlowEnabled &&
    !needsOwnerAssignment &&
    !needsEscalationOwner &&
    !nextStepIsPassive &&
    (hasOutstandingCustomerMessage || nextStepRequiresCommunication)
  const nextStepExplanation = (() => {
    if (provideEtaFlowEnabled) {
      return hasSentProvideEta
        ? "Wait for customer confirmation after the ETA update."
        : PROVIDE_ETA_SUPPORTING_TEXT
    }

    if (needsEscalationOwner) {
      return "Assign an escalation owner and coordinate the next response."
    }

    if (needsOwnerAssignment) {
      return "Assign the case to an owner."
    }

    if (communicationComesFirst) {
      if (caseActionState === "Ready to close") {
        return "Reply with the closure summary or clarification, then close the case if no issues remain."
      }

      if (caseActionState === "Waiting on customer") {
        return "Reply to clarify the remaining requirement, then wait for customer confirmation."
      }

      return "Reply with the next customer update so the case keeps moving."
    }

    if (caseActionState === "Waiting on customer") {
      return checkpointMoment
        ? `Wait for customer confirmation and review on ${checkpointMoment}.`
        : "Wait for customer confirmation."
    }

    if (caseActionState === "Waiting on internal team") {
      return checkpointMoment
        ? `Wait for the internal dependency and review on ${checkpointMoment}.`
        : "Wait for the internal dependency to clear."
    }

    if (caseActionState === "Ready to close" && (
      normalizedNextStep === "close the case" ||
      normalizedNextStep === "close case"
    )) {
      return "Close the case."
    }

    if (caseActionState === "In progress" && !communicationComesFirst) {
      return "Continue investigation and prepare the next customer update."
    }

    return nextStepSummary || actionExplanation
  })()
  const mainDrawerAction = (() => {
    if (provideEtaFlowEnabled) {
      if (hasSentProvideEta) {
        return null
      }

      return {
        label: "Provide ETA to customer",
        onClick: handleOpenProvideEta,
        suppressLabels: [],
      }
    }

    if (needsEscalationOwner) {
      return {
        label: "Assign escalation owner",
        onClick: handleOpenReassignment,
        suppressLabels: ["Assign owner"],
      }
    }

    if (needsOwnerAssignment) {
      return {
        label: "Assign owner",
        onClick: handleOpenReassignment,
        suppressLabels: ["Assign owner"],
      }
    }

    if (communicationComesFirst && latestIncomingEmailItem) {
      return {
        label: "Reply",
        onClick: () => {
          onRecordTabChange("activity")
          onActivateSuggestedAction({
            label: "Reply to customer",
            referenceId: latestIncomingEmailItem.id,
            reason: nextStepExplanation,
            composerOpen: true,
          })
        },
        suppressLabels: [],
      }
    }

    if (
      caseActionState === "Ready to close" &&
      record.channel === "Email" &&
      !latestIncomingEmailItem &&
      latestOutgoingEmailItem &&
      (
        normalizedNextStep.includes("send the closure summary") ||
        normalizedNextStep.includes("send closure summary")
      )
    ) {
      return {
        label: "Reply",
        onClick: () => {
          onRecordTabChange("activity")
          onActivateSuggestedAction({
            label: "Follow up with customer",
            referenceId: latestOutgoingEmailItem.id,
            reason: nextStepExplanation,
            composerOpen: true,
          })
        },
        suppressLabels: [],
      }
    }

    if (
      caseActionState === "Ready to close" &&
      (
        normalizedNextStep === "close the case" ||
        normalizedNextStep === "close case"
      )
    ) {
      return {
        label: "Close case",
        onClick: onEnterEditMode,
        suppressLabels: ["Close case"],
      }
    }

    if (primaryActionLabel === "Escalate case") {
      return {
        label: "Escalate case",
        onClick: handleOpenEscalation,
        suppressLabels: ["Escalate case"],
      }
    }

    return null
  })()
  const otherActionLabels = availableActionLabels.filter(
    (actionLabel) => !mainDrawerAction?.suppressLabels.includes(actionLabel)
  )
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
    setIsProvideEtaOpen(false)
    setProvideEtaDraft(DEFAULT_PROVIDE_ETA_REPLY)
    setHasSentProvideEta(false)
    setReassignmentAssignee("")
    setReassignmentTeam("")
    setReassignmentNote("")
    setEscalationReason("")
    setEscalationNote("")
  }, [record.id])

  useEffect(() => {
    if (!canEscalateCase) {
      setIsEscalateOpen(false)
      setEscalationReason("")
      setEscalationNote("")
    }
  }, [canEscalateCase])

  useEffect(() => {
    if (!CASE_RECORD_SCROLL_DEBUG) {
      return
    }

    let frameId = 0
    let nestedFrameId = 0
    let cleanupScrollListeners = () => {}

    function measureScrollDebugMetrics() {
      const activityTimelineRoot =
        tabPanelScrollRef.current?.querySelector<HTMLDivElement>(
          `.${CASE_RECORD_SCROLL_DEBUG_TIMELINE_ROOT_CLASS}`,
        ) ?? null
      const metrics = [
        getScrollDebugMetrics("tab-panel-outer", tabPanelOuterRef.current),
        getScrollDebugMetrics("tab-panel-scroll", tabPanelScrollRef.current),
        getScrollDebugMetrics("details-content", detailsContentRef.current),
        getScrollDebugMetrics("activity-wrapper", activityWrapperRef.current),
        getScrollDebugMetrics("activity-timeline-root", activityTimelineRoot),
      ].filter((entry): entry is ScrollDebugMetric => entry !== null)
      const activeVerticalScrollOwners = metrics
        .filter((entry) =>
          (entry.overflowY === "auto" || entry.overflowY === "scroll") &&
          entry.canScroll,
        )
        .map((entry) => entry.label)

      setScrollDebugMetrics(metrics)
      setActiveScrollDebugOwners(activeVerticalScrollOwners)

      console.groupCollapsed(
        `[case-record-scroll-debug] ${record.id} · ${recordTab}`,
      )
      console.table(metrics)
      console.log("Active vertical scroll owners:", activeVerticalScrollOwners)
      console.groupEnd()

      const scrollTargets = [
        tabPanelOuterRef.current,
        tabPanelScrollRef.current,
        detailsContentRef.current,
        activityWrapperRef.current,
        activityTimelineRoot,
      ].filter((element): element is HTMLDivElement => element !== null)

      cleanupScrollListeners()

      const handleScroll = () => {
        measureScrollDebugMetrics()
      }

      scrollTargets.forEach((element) => {
        element.addEventListener("scroll", handleScroll, { passive: true })
      })

      cleanupScrollListeners = () => {
        scrollTargets.forEach((element) => {
          element.removeEventListener("scroll", handleScroll)
        })
      }
    }

    frameId = window.requestAnimationFrame(() => {
      nestedFrameId = window.requestAnimationFrame(() => {
        measureScrollDebugMetrics()
      })
    })

    return () => {
      cleanupScrollListeners()
      window.cancelAnimationFrame(frameId)
      window.cancelAnimationFrame(nestedFrameId)
    }
  }, [
    record.id,
    recordTab,
    isReassignOpen,
    isEscalateOpen,
    isProvideEtaOpen,
    sections.length,
    selectedActivityTimelineItems.length,
  ])

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

  function handleReassignmentTeamChange(nextTeam: string) {
    setReassignmentTeam(nextTeam)
    setReassignmentAssignee("")
  }

  function handleOpenEscalation() {
    setIsProvideEtaOpen(false)
    setIsReassignOpen(false)
    setIsEscalateOpen(true)
  }

  function handleOpenEscalationFromMenu() {
    setIsMoreActionsOpen(false)
    handleOpenEscalation()
  }

  function handleOpenReassignment() {
    setIsProvideEtaOpen(false)
    setIsEscalateOpen(false)
    setIsReassignOpen(true)
  }

  function handleOpenProvideEta() {
    setIsReassignOpen(false)
    setIsEscalateOpen(false)
    setIsProvideEtaOpen(true)
    onRecordTabChange("activity")
  }

  const availableActionLabelSet = new Set(availableActionLabels)
  const moreActionItems = [
    ...(availableActionLabelSet.has("Record customer reply")
      ? [{ label: "Record customer reply" }]
      : []),
    ...(canEscalateCase
      ? [{
          label: "Escalate case",
          onSelect: handleOpenEscalationFromMenu,
        }]
      : []),
    ...(availableActionLabelSet.has("Close case")
      ? [{ label: "Close case" }]
      : []),
  ]

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

  function handleCancelProvideEta() {
    setIsProvideEtaOpen(false)
    setProvideEtaDraft(DEFAULT_PROVIDE_ETA_REPLY)
  }

  function handleSendProvideEta() {
    const trimmedProvideEtaDraft = provideEtaDraft.trim()

    if (!trimmedProvideEtaDraft) {
      return
    }

    const createdAt = new Date()

    onAppendTimelineItem({
      id: `activity-reply-${createdAt.getTime()}`,
      timestamp: createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      timestampDateTime: createdAt.toISOString(),
      type: "outgoing",
      actor: record.owner.trim() || "Nadia Romero",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content: trimmedProvideEtaDraft,
    })

    setHasSentProvideEta(true)
    setIsProvideEtaOpen(false)
    setProvideEtaDraft(DEFAULT_PROVIDE_ETA_REPLY)
    onDismissSuggestedAction()
    onRecordTabChange("activity")
  }

  const displayedStatus =
    hasSentProvideEta || (
      status === "in_progress" &&
      record.situation === "Waiting on customer"
    )
      ? "waiting_on_customer"
      : status

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
      status={displayedStatus}
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
                className="absolute top-[calc(100%+var(--space-1))] left-0 z-10 min-w-[12rem] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] bg-[var(--color-surface-elevated)] py-[var(--space-1)]"
              >
                {moreActionItems.map((item) =>
                  item.onSelect ? (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={item.onSelect}
                      className="block w-full px-[var(--space-inline-sm)] py-[var(--space-1)] text-left text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <div
                      key={item.label}
                      className="px-[var(--space-inline-sm)] py-[var(--space-1)] text-left text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]"
                    >
                      {item.label}
                    </div>
                  )
                )}
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
        <div className="relative flex min-h-0 flex-1 flex-col">
          {provideEtaFlowEnabled ? (
            <p className="m-0 shrink-0 text-sm leading-normal text-[color:var(--color-text-secondary)]">
              {PROVIDE_ETA_SUMMARY}
            </p>
          ) : null}
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
          {provideEtaFlowEnabled && isProvideEtaOpen ? (
            <section
              aria-label="Provide ETA to customer"
              className="shrink-0 border-y border-[var(--color-border-divider)] py-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-3)]">
                <div className="space-y-[var(--space-half)]">
                  <h2 className="m-0 text-[length:var(--text-md)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                    Reply to Irene
                  </h2>
                  <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                    {PROVIDE_ETA_SUPPORTING_TEXT}
                  </p>
                </div>

                <Textarea
                  size="sm"
                  rows={8}
                  value={provideEtaDraft}
                  onChange={(event) => setProvideEtaDraft(event.target.value)}
                  aria-label="Provide ETA reply"
                />

                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!provideEtaDraft.trim()}
                    onClick={handleSendProvideEta}
                  >
                    Send reply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelProvideEta}
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

          <div
            ref={tabPanelOuterRef}
            className={[
              "min-h-0 flex-1 overflow-hidden pt-[var(--space-3)]",
              CASE_RECORD_SCROLL_DEBUG ? CASE_RECORD_SCROLL_DEBUG_CLASSES.tabPanelOuter : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div
              ref={tabPanelScrollRef}
              className={[
                "min-h-0 h-full min-w-0 w-full",
                recordTab === "details"
                  ? "overflow-y-auto overscroll-contain"
                  : "overflow-hidden",
                CASE_RECORD_SCROLL_DEBUG ? CASE_RECORD_SCROLL_DEBUG_CLASSES.tabPanelScroll : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {recordTab === "details" ? (
                <div
                  ref={detailsContentRef}
                  className={[
                    "min-w-0 w-full space-y-[var(--space-6)]",
                    CASE_RECORD_SCROLL_DEBUG ? CASE_RECORD_SCROLL_DEBUG_CLASSES.detailsContent : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {sections.map((section) =>
                    renderCaseRecordSection({
                      section,
                      record,
                      renderMode: "view",
                      updateField,
                      getDisplayValue,
                    })
                  )}
                </div>
              ) : (
                <div
                  ref={activityWrapperRef}
                  className={[
                    "min-h-0 h-full min-w-0 w-full overflow-y-auto overscroll-contain",
                    CASE_RECORD_SCROLL_DEBUG ? CASE_RECORD_SCROLL_DEBUG_CLASSES.activityWrapper : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <ActivityTimeline
                    items={selectedActivityTimelineItems}
                    className={
                      CASE_RECORD_SCROLL_DEBUG
                        ? `${CASE_RECORD_SCROLL_DEBUG_TIMELINE_ROOT_CLASS} ${CASE_RECORD_SCROLL_DEBUG_CLASSES.activityTimelineRoot}`
                        : undefined
                    }
                    highlightedItemId={highlightedTimelineItemId}
                    activeSuggestedAction={provideEtaFlowEnabled ? null : activeSuggestedAction}
                    replyDraftContext={{
                      customerName: record.contact || record.customer,
                      situation: record.situation,
                      nextStep: record.nextStep,
                      reason: record.reason,
                      ownerName: record.owner,
                    }}
                    onAppendTimelineItem={onAppendTimelineItem}
                    onSendSuggestedAction={onSendSuggestedAction}
                    onDismissSuggestedAction={onDismissSuggestedAction}
                    onOpenSuggestedActionComposer={onOpenSuggestedActionComposer}
                    showReplyActions={!provideEtaFlowEnabled}
                  />
                </div>
              )}
            </div>
          </div>
          {CASE_RECORD_SCROLL_DEBUG ? (
            <aside
              aria-label="Case record scroll debug"
              className="pointer-events-auto absolute top-[var(--space-4)] right-[var(--space-4)] z-20 max-h-[calc(100%-var(--space-8))] w-[min(20rem,calc(100%-var(--space-6)))] overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] bg-[var(--color-surface-elevated)] p-[var(--space-3)]"
            >
              <div className="space-y-[var(--space-2)]">
                <div className="space-y-[var(--space-half)]">
                  <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                    Scroll debug
                  </p>
                  <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                    Active scroll owners: {activeScrollDebugOwners.join(", ") || "none"}
                  </p>
                </div>

                {scrollDebugMetrics.map((metric) => {
                  const isActiveOwner = activeScrollDebugOwners.includes(metric.label)

                  return (
                    <div
                      key={metric.label}
                      className={[
                        "space-y-[var(--space-1)] rounded-[var(--radius-sm)] border px-[var(--space-2)] py-[var(--space-2)]",
                        isActiveOwner
                          ? "border-[var(--color-border-divider)] bg-[var(--color-surface-muted)]"
                          : "border-[var(--color-border-divider)] bg-[var(--color-surface)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex items-center justify-between gap-[var(--space-2)]">
                        <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                          {metric.label}
                        </p>
                        {isActiveOwner ? (
                          <span className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                            scroll owner
                          </span>
                        ) : null}
                      </div>
                      <dl className="grid grid-cols-[auto_1fr] gap-x-[var(--space-2)] gap-y-[var(--space-half)] text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                        <dt>clientHeight</dt>
                        <dd className="m-0">{metric.clientHeight}</dd>
                        <dt>scrollHeight</dt>
                        <dd className="m-0">{metric.scrollHeight}</dd>
                        <dt>overflowY</dt>
                        <dd className="m-0">{metric.overflowY}</dd>
                        <dt>canScroll</dt>
                        <dd className="m-0">{String(metric.canScroll)}</dd>
                        <dt>scrollTop</dt>
                        <dd className="m-0">{metric.scrollTop}</dd>
                      </dl>
                    </div>
                  )
                })}
              </div>
            </aside>
          ) : null}
        </div>
      }
      aiRegion={
        <CaseIntelligenceRail
          key={record.id}
          open={isAIDrawerOpen}
          updatedLabel={aiUpdatedLabel}
          insight={aiRecordInsight}
          nextStepExplanation={nextStepExplanation}
          mainAction={mainDrawerAction}
          otherActionLabels={otherActionLabels}
          onRefreshInsights={onRefreshAIInsights}
          onToggle={onToggleAIDrawer}
          onClose={onCloseAIDrawer}
          record={record}
        />
      }
    />
  )
}
