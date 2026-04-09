import { useEffect, useState } from "react"
import CasesListTemplate from "./case-list/CasesListTemplate"
import { renderCaseRecordSection } from "./case-record/renderers"
import { getCaseRecordSections, STATUS_OPTIONS } from "./case-record/schema"
import type { CaseRecord, SectionConfig } from "./case-record/types"
import Button from "./components/Button"
import CaseStatusBadge, { type CaseStatus } from "./components/CaseStatusBadge"
import ActivityTimeline, { type ActivityTimelineItem } from "./components/ActivityTimeline"
import Input from "./components/controls/Input"
import ReadOnlyValue from "./components/controls/ReadOnlyValue"
import Select from "./components/controls/Select"
import Drawer from "./components/Drawer"
import Field from "./components/fields/Field"
import FieldGroupStack from "./components/field-groups/FieldGroupStack"
import FormFieldGrid from "./components/field-groups/FormFieldGrid"
import Link from "./components/Link"
import FormPageLayout from "./components/layouts/FormPageLayout"
import PageContent from "./components/PageContent"
import FormSection from "./components/sections/FormSection"
import RecordSection from "./components/sections/RecordSection"
import RecordShellBar from "./components/RecordShellBar"
import StatusBadge from "./components/StatusBadge"
import Tabs from "./components/Tabs"
import {
  activityTimelineItems,
  activityTimelineItemsByCaseId,
  EXAMPLE_CASES,
  INITIAL_CASE_RECORD,
} from "../prototype/mockData"

type AICaseInput = {
  caseId: string
  title: string
  status: string
  priority?: string
  blockingReason?: CaseRecord["blockingReason"]
  sections: {
    title: string
    fields: {
      label: string
      value: string | null
    }[]
  }[]
}

type AIRecordInsight = {
  signals: string[]
  summary: string[]
  actions: {
    label: string
    referenceId?: string
  }[]
  references: {
    id: string
    label: string
  }[]
}

type AICaseSignals = {
  status: AICaseInput["status"]
  priority?: AICaseInput["priority"]
  blockingReason: CaseRecord["blockingReason"]
  isEscalated: boolean
  isWaitingOnCustomer: boolean
  isHighPriority: boolean
  needsApproval: boolean
  isMigrationRelated: boolean
  isVisibilityIssue: boolean
  isAuthRelated: boolean
}

type AIEvidenceSignal = {
  intent: "blocked" | "progress" | "resolved"
  blockingReason: CaseRecord["blockingReason"]
  selectedEvent?: ActivityTimelineItem
}

type CaseListKpiFilter =
  | "open"
  | "waiting_on_customer"
  | "on_hold"
  | "high_priority"

function getSuggestedTargets(severity: CaseRecord["severity"]) {
  switch (severity) {
    case "Critical":
      return {
        responseTarget: "2026-04-01 09:15 CET",
        resolutionTarget: "2026-04-01 13:00 CET",
      }
    case "Minor":
      return {
        responseTarget: "2026-04-01 14:00 CET",
        resolutionTarget: "2026-04-03 17:00 CET",
      }
    case "Major":
    default:
      return {
        responseTarget: "2026-04-01 10:15 CET",
        resolutionTarget: "2026-04-02 17:00 CET",
      }
  }
}

function getShellStatus(status: CaseRecord["status"]): CaseStatus {
  switch (status) {
    case "New":
      return "new"
    case "Waiting on customer":
      return "waiting_on_customer"
    case "Escalated":
      return "escalated"
    case "Resolved":
      return "resolved"
    case "In progress":
    default:
      return "in_progress"
  }
}

function getDisplayValue(value: string) {
  return value.trim() ? value : "—"
}

function buildAICaseInput(record: CaseRecord, sections: SectionConfig[]): AICaseInput {
  const excludedTopLevelFieldLabels = new Set(["Status", "Priority"])

  return {
    caseId: record.id,
    title: record.title,
    status: record.status,
    priority: record.priority || undefined,
    blockingReason: record.blockingReason || undefined,
    sections: sections.map((section) => ({
      title: section.title,
      fields: section.fields
        .filter((field) => !field.when || field.when(record))
        .filter((field) => !excludedTopLevelFieldLabels.has(field.label))
        .map((field) => {
          const rawValue = record[field.key]
          const normalizedValue = rawValue.trim() ? rawValue : null

          return {
            label: field.label,
            value: normalizedValue,
          }
        }),
    })),
  }
}

function getBlockingReasonSummary(reason: CaseRecord["blockingReason"]) {
  switch (reason) {
    case "awaiting_customer_reply":
      return "The case is currently blocked on a customer reply."
    case "awaiting_customer_validation":
      return "The case is waiting for the customer to validate the current remediation."
    case "awaiting_approval":
      return "The case is paused pending approval before the next operational step."
    case "awaiting_engineering_fix":
      return "The case is blocked on an engineering-side fix before progress can resume."
    default:
      return null
  }
}

function getBlockingReasonAction(reason: CaseRecord["blockingReason"]) {
  switch (reason) {
    case "awaiting_customer_reply":
      return "Request customer reply"
    case "awaiting_customer_validation":
      return "Ask for customer validation"
    case "awaiting_approval":
      return "Confirm approval path"
    case "awaiting_engineering_fix":
      return "Track engineering handoff"
    default:
      return null
  }
}

function detectAICaseSignals(input: AICaseInput): AICaseSignals {
  const fieldEntries = input.sections.flatMap((section) => section.fields)
  const combinedCaseText = [
    input.title,
    input.status,
    input.priority ?? "",
    ...fieldEntries.flatMap((field) => [field.label, field.value ?? ""]),
  ]
    .join(" ")
    .toLowerCase()

  const approvalRequiredValue = fieldEntries.find(
    (field) => field.label === "Approval required"
  )?.value

  const hasKeyword = (keywords: string[]) =>
    keywords.some((keyword) => combinedCaseText.includes(keyword))

  return {
    status: input.status,
    priority: input.priority,
    blockingReason: input.blockingReason ?? "",
    isEscalated: input.status === "Escalated",
    isWaitingOnCustomer: input.status === "Waiting on customer",
    isHighPriority:
      input.priority === "High" || input.priority === "Critical",
    needsApproval: approvalRequiredValue === "Yes",
    isMigrationRelated: hasKeyword(["migration", "tenant", "sync"]),
    isVisibilityIssue: hasKeyword(["visibility", "permission", "permissions", "access scope"]),
    isAuthRelated: hasKeyword(["authentication", "identity", "password", "login", "access"]),
  }
}

function buildFakeSignalItems(signals: AICaseSignals): string[] {
  const items = [`Status: ${signals.status}`]

  if (signals.priority) {
    items.push(`Priority: ${signals.priority}`)
  }

  if (signals.blockingReason === "awaiting_customer_reply") {
    items.push("Blocker: awaiting customer reply")
  } else if (signals.blockingReason === "awaiting_customer_validation") {
    items.push("Blocker: awaiting customer validation")
  } else if (signals.blockingReason === "awaiting_approval") {
    items.push("Blocker: awaiting approval")
  } else if (signals.blockingReason === "awaiting_engineering_fix") {
    items.push("Blocker: awaiting engineering fix")
  }

  if (signals.isEscalated) {
    items.push("Escalation: active")
  }

  if (signals.needsApproval) {
    items.push("Approval: required")
  }

  if (signals.isMigrationRelated) {
    items.push("Pattern: migration-related")
  } else if (signals.isVisibilityIssue) {
    items.push("Pattern: visibility-related")
  } else if (signals.isAuthRelated) {
    items.push("Pattern: access-related")
  }

  return items.slice(0, 5)
}

function getCaseIntent(signals: AICaseSignals): AIEvidenceSignal["intent"] {
  if (signals.blockingReason !== "" && signals.blockingReason !== "none") {
    return "blocked"
  }

  if (signals.status === "Resolved") {
    return "resolved"
  }

  return "progress"
}

function buildEventEvidenceLine(item?: ActivityTimelineItem) {
  if (!item || typeof item.content !== "string") {
    return null
  }

  const content = item.content.trim().replace(/\s+/g, " ")
  const shortContent =
    content.length > 112 ? `${content.slice(0, 109).trimEnd()}...` : content

  switch (item.type) {
    case "incoming":
      return `Customer message: ${shortContent}`
    case "outgoing":
      return `Agent update: ${shortContent}`
    case "comment":
    case "internal":
    case "internal-note":
      return `Internal note: ${shortContent}`
    case "status-change":
      return `Status change: ${shortContent}`
    case "system":
    default:
      return `System event: ${shortContent}`
  }
}

function buildFakeSummary(evidenceSignal: AIEvidenceSignal): string[] {
  const summary: string[] = []
  const blockingReasonSummary = getBlockingReasonSummary(evidenceSignal.blockingReason)
  const eventEvidenceLine = buildEventEvidenceLine(evidenceSignal.selectedEvent)

  if (evidenceSignal.intent === "blocked") {
    summary.push(blockingReasonSummary ?? "The case is currently blocked on a recorded constraint.")
  } else if (evidenceSignal.intent === "resolved") {
    summary.push("The case is resolved, and the selected activity records the closure path.")
  } else {
    summary.push("The case is in active progress, and the selected activity shows the current workstream.")
  }

  if (eventEvidenceLine) {
    summary.push(eventEvidenceLine)
  }

  return summary.slice(0, 2)
}

function getTimelineItemTimeValue(item?: ActivityTimelineItem) {
  if (!item?.timestampDateTime) {
    return Number.NEGATIVE_INFINITY
  }

  const timeValue = new Date(item.timestampDateTime).getTime()

  return Number.isNaN(timeValue) ? Number.NEGATIVE_INFINITY : timeValue
}

function buildFakeActions(
  evidenceSignal: AIEvidenceSignal,
  timelineItems: ActivityTimelineItem[],
): {
  label: string
  referenceId?: string
}[] {
  const actions: { label: string; referenceId?: string }[] = []
  const selectedEvent = evidenceSignal.selectedEvent
  const actionReferenceId = selectedEvent?.id
  const selectedEventContent =
    typeof selectedEvent?.content === "string"
      ? selectedEvent.content.toLowerCase()
      : ""
  const blockingReasonAction = getBlockingReasonAction(evidenceSignal.blockingReason)
  const latestCustomerMessage = [...timelineItems]
    .reverse()
    .find((item) => item.type === "incoming")
  const latestAgentMessage = [...timelineItems]
    .reverse()
    .find((item) => item.type === "outgoing")
  const customerIsLastSpeaker =
    getTimelineItemTimeValue(latestCustomerMessage) >
    getTimelineItemTimeValue(latestAgentMessage)
  const pushAction = (label: string, referenceId = actionReferenceId) => {
    if (actions.some((action) => action.label === label)) {
      return
    }

    actions.push({ label, referenceId })
  }

  if (evidenceSignal.intent === "blocked") {
    if (blockingReasonAction) {
      pushAction(blockingReasonAction)
    }

    switch (evidenceSignal.blockingReason) {
      case "awaiting_customer_reply":
        pushAction("Send customer follow-up")
        break
      case "awaiting_customer_validation":
        pushAction("Confirm validation steps")
        break
      case "awaiting_approval":
        pushAction("Route for approval")
        break
      case "awaiting_engineering_fix":
        pushAction("Check fix status")
        break
      default:
        break
    }

    switch (selectedEvent?.type) {
      case "incoming":
        pushAction("Review customer message")
        break
      case "comment":
      case "internal":
      case "internal-note":
        pushAction("Follow up on internal note")
        break
      case "status-change":
      case "system":
        pushAction("Verify blocker status")
        break
      default:
        break
    }

    return actions.slice(0, 3)
  }

  if (evidenceSignal.intent === "resolved") {
    if (selectedEventContent.includes("close") || selectedEventContent.includes("resolved")) {
      pushAction("Confirm closure record")
    }

    if (selectedEvent?.type === "outgoing" || selectedEvent?.type === "incoming") {
      pushAction("Send closure confirmation")
    } else {
      pushAction("Archive resolution notes")
    }

    return actions.slice(0, 2)
  }

  switch (selectedEvent?.type) {
    case "incoming":
      if (customerIsLastSpeaker && latestCustomerMessage) {
        pushAction("Respond to customer", latestCustomerMessage.id)
      } else {
        pushAction("Wait for customer response", latestAgentMessage?.id)
      }
      pushAction("Confirm needed details")
      break
    case "outgoing":
      pushAction("Track customer response")
      pushAction("Continue current work")
      break
    case "comment":
    case "internal":
    case "internal-note":
      pushAction("Continue internal follow-up")
      pushAction("Prepare customer update")
      break
    case "status-change":
    case "system":
      pushAction("Verify current case state")
      pushAction("Continue current work")
      break
    default:
      pushAction("Continue current work")
      break
  }

  return actions.slice(0, 3)
}

function buildTimelineReferenceLabel(item: ActivityTimelineItem) {
  const content = typeof item.content === "string" ? item.content.trim().replace(/\s+/g, " ") : ""
  const shortContent =
    content.length > 72 ? `${content.slice(0, 69).trimEnd()}...` : content

  switch (item.type) {
    case "incoming":
      return `Customer report: ${shortContent}`
    case "outgoing":
      return `Agent update: ${shortContent}`
    case "comment":
    case "internal":
    case "internal-note":
      return `Internal note: ${shortContent}`
    case "status-change":
      return `Status change: ${shortContent}`
    case "system":
    default:
      return `System event: ${shortContent}`
  }
}

function selectReferenceItems(
  signals: AICaseSignals,
  timelineItems: ActivityTimelineItem[],
): ActivityTimelineItem[] {
  const references: ActivityTimelineItem[] = []
  const normalizedTimelineItems = [...timelineItems].reverse()
  const caseIntent = getCaseIntent(signals)

  const addReference = (item?: ActivityTimelineItem) => {
    if (!item || references.some((reference) => reference.id === item.id)) {
      return
    }

    references.push(item)
  }

  const findLatestTimelineItem = (
    predicate: (item: ActivityTimelineItem, normalizedContent: string) => boolean,
  ) =>
    normalizedTimelineItems.find((item) => {
      const normalizedContent =
        typeof item.content === "string" ? item.content.toLowerCase() : ""

      return predicate(item, normalizedContent)
    })

  const findLatestCustomerMessage = () =>
    findLatestTimelineItem((item) => item.type === "incoming")

  const findLatestInternalNote = () =>
    findLatestTimelineItem((item, normalizedContent) =>
      (item.type === "comment" || item.type === "internal" || item.type === "internal-note") &&
      !normalizedContent.includes("new chat received")
    )

  const findMeaningfulSystemEvent = () =>
    findLatestTimelineItem((item, normalizedContent) =>
      (item.type === "system" || item.type === "status-change") &&
      (
        normalizedContent.includes("resolved") ||
        normalizedContent.includes("restored") ||
        normalizedContent.includes("repair") ||
        normalizedContent.includes("remediation") ||
        normalizedContent.includes("migration") ||
        normalizedContent.includes("tenant") ||
        normalizedContent.includes("sync") ||
        normalizedContent.includes("approval")
      )
    )

  const findResolutionEvent = () =>
    findLatestTimelineItem((item, normalizedContent) =>
      (
        item.type === "status-change" ||
        item.type === "system" ||
        item.type === "outgoing" ||
        item.type === "incoming"
      ) &&
      (
        normalizedContent.includes("resolved") ||
        normalizedContent.includes("restored") ||
        normalizedContent.includes("resolution summary") ||
        normalizedContent.includes("close the incident") ||
        normalizedContent.includes("can close")
      )
    )

  if (caseIntent === "blocked") {
    if (signals.isWaitingOnCustomer) {
      addReference(findLatestCustomerMessage())
    }

    addReference(findLatestInternalNote())
    addReference(findMeaningfulSystemEvent())
  } else if (caseIntent === "resolved") {
    addReference(findResolutionEvent())
    addReference(findLatestInternalNote())
  } else {
    addReference(findLatestInternalNote())
    addReference(findLatestCustomerMessage())
    addReference(findMeaningfulSystemEvent())
  }

  if (references.length === 0 && timelineItems.length > 0) {
    addReference(timelineItems[timelineItems.length - 1])
  }

  return references.slice(0, 2)
}

function buildFakeReferences(referenceItems: ActivityTimelineItem[]): { id: string; label: string }[] {
  return referenceItems.map((item) => ({
    id: item.id,
    label: buildTimelineReferenceLabel(item),
  }))
}

function formatAIUpdatedLabel(updatedAt: number) {
  const diffInMinutes = Math.floor((Date.now() - updatedAt) / (1000 * 60))

  if (diffInMinutes <= 0) {
    return "Updated just now"
  }

  if (diffInMinutes === 1) {
    return "Updated 1 minute ago"
  }

  if (diffInMinutes < 60) {
    return `Updated ${diffInMinutes} minutes ago`
  }

  return `Updated ${new Date(updatedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`
}

function getClosestScrollableParent(element: HTMLElement) {
  let currentParent = element.parentElement

  while (currentParent) {
    const { overflowY } = window.getComputedStyle(currentParent)
    const supportsVerticalScroll = overflowY === "auto" || overflowY === "scroll"

    if (supportsVerticalScroll && currentParent.scrollHeight > currentParent.clientHeight) {
      return currentParent
    }

    currentParent = currentParent.parentElement
  }

  return null
}

function isElementVisibleInScrollRegion(element: HTMLElement) {
  const scrollParent = getClosestScrollableParent(element)
  const elementRect = element.getBoundingClientRect()

  if (!scrollParent) {
    return elementRect.top >= 0 && elementRect.bottom <= window.innerHeight
  }

  const parentRect = scrollParent.getBoundingClientRect()

  return (
    elementRect.top >= parentRect.top &&
    elementRect.bottom <= parentRect.bottom
  )
}

function getFakeAIRecordInsight(
  input: AICaseInput,
  _aiVersion: number,
  timelineItems: ActivityTimelineItem[],
): AIRecordInsight {
  const signals = detectAICaseSignals(input)
  const referenceItems = selectReferenceItems(signals, timelineItems)
  const evidenceSignal: AIEvidenceSignal = {
    intent: getCaseIntent(signals),
    blockingReason: signals.blockingReason,
    selectedEvent: referenceItems[0],
  }

  return {
    signals: buildFakeSignalItems(signals),
    summary: buildFakeSummary(evidenceSignal),
    actions: buildFakeActions(evidenceSignal, timelineItems),
    references: buildFakeReferences(referenceItems),
  }
}

const recordTabs = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
] as const

const componentTabs = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
  { id: "insights", label: "AI" },
] as const

const typeScaleSpecimens = [
  { label: "text-xs", sample: "Auxiliary microcopy for supporting details.", style: { fontSize: "var(--text-xs)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-primary)" } },
  { label: "text-sm", sample: "Compact interface copy for dense operational screens.", style: { fontSize: "var(--text-sm)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-primary)" } },
  { label: "text-md", sample: "Default reading size for field values and body text.", style: { fontSize: "var(--text-md)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-primary)" } },
  { label: "text-lg", sample: "Prominent supporting copy for higher-emphasis moments.", style: { fontSize: "var(--text-lg)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-primary)" } },
  { label: "text-xl", sample: "Large interface heading used for transitional hierarchy.", style: { fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" } },
  { label: "text-2xl", sample: "Large headline for prominent overview surfaces.", style: { fontSize: "var(--text-2xl)", lineHeight: "var(--leading-snug)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-primary)" } },
] as const

const semanticTypeSpecimens = [
  { label: "Record title", sample: "Customer cannot access invoice portal", style: { fontSize: "var(--text-record-title)", lineHeight: "var(--leading-record-title)", fontWeight: "var(--font-weight-record-title)", color: "var(--color-text-record-title)" } },
  { label: "Section title", sample: "Status & ownership", style: { fontSize: "var(--text-section-title)", lineHeight: "var(--leading-section-title)", fontWeight: "var(--font-weight-section-title)", color: "var(--color-text-section-title)" } },
  { label: "Aside title", sample: "Suggested actions", style: { fontSize: "var(--text-aside-title)", lineHeight: "var(--leading-aside-title)", fontWeight: "var(--font-weight-aside-title)", color: "var(--color-text-primary)" } },
  { label: "Field label", sample: "Approval required", style: { fontSize: "var(--text-field-label)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-secondary)" } },
  { label: "Field value", sample: "Enterprise Plus", style: { fontSize: "var(--text-field-value)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-primary)" } },
  { label: "Meta", sample: "Updated today at 09:41 CET", style: { fontSize: "var(--text-meta)", lineHeight: "var(--leading-normal)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-secondary)" } },
  { label: "Shell bar record id", sample: "CASE-10482", style: { fontSize: "var(--text-shellbar-record-id)", lineHeight: "var(--leading-shellbar-record-id)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-shellbar-record-id)" } },
  { label: "Shell bar dirty", sample: "Unsaved changes", style: { fontSize: "var(--text-shellbar-dirty)", lineHeight: "var(--leading-shellbar-dirty)", fontWeight: "var(--font-weight-regular)", color: "var(--color-text-shellbar-dirty)" } },
] as const

const caseListKpiItems: {
  id: CaseListKpiFilter
  label: string
  value: number
}[] = []

const surfaceColorSpecimens = [
  { label: "Page", token: "--color-page", swatch: "var(--color-page)", text: "var(--color-text-primary)", sample: "Page background" },
  { label: "Surface", token: "--color-surface", swatch: "var(--color-surface)", text: "var(--color-text-primary)", sample: "Default surface" },
  { label: "Surface elevated", token: "--color-surface-elevated", swatch: "var(--color-surface-elevated)", text: "var(--color-text-primary)", sample: "Elevated surface" },
  { label: "Surface muted", token: "--color-surface-muted", swatch: "var(--color-surface-muted)", text: "var(--color-text-primary)", sample: "Muted surface" },
  { label: "Surface selected", token: "--color-surface-selected", swatch: "var(--color-surface-selected)", text: "var(--color-text-primary)", sample: "Selected surface" },
  { label: "Shell", token: "--color-surface-shell", swatch: "var(--color-surface-shell)", text: "var(--color-text-primary)", sample: "Shell surface" },
  { label: "Shell editing", token: "--color-surface-shell-editing", swatch: "var(--color-surface-shell-editing)", text: "var(--color-text-primary)", sample: "Shell editing surface" },
  { label: "Inverse", token: "--color-surface-inverse", swatch: "var(--color-surface-inverse)", text: "var(--color-text-inverse)", sample: "Inverse surface" },
] as const

const textColorSpecimens = [
  { label: "Primary", token: "--color-text-primary", swatch: "var(--color-text-primary)", sample: "Primary text" },
  { label: "Secondary", token: "--color-text-secondary", swatch: "var(--color-text-secondary)", sample: "Secondary text" },
  { label: "Muted", token: "--color-text-muted", swatch: "var(--color-text-muted)", sample: "Muted text" },
  { label: "Brand", token: "--color-text-brand", swatch: "var(--color-text-brand)", sample: "Brand text" },
  { label: "Accent", token: "--color-text-accent", swatch: "var(--color-text-accent)", sample: "Accent text" },
  { label: "Success", token: "--color-text-success", swatch: "var(--color-text-success)", sample: "Success text" },
  { label: "Warning", token: "--color-text-warning", swatch: "var(--color-text-warning)", sample: "Warning text" },
  { label: "Danger", token: "--color-text-danger", swatch: "var(--color-text-danger)", sample: "Danger text" },
] as const

const stateColorSpecimens = [
  { label: "Action brand", token: "--color-action-brand", swatch: "var(--color-action-brand)", text: "var(--color-on-action-brand)", sample: "Primary action" },
  { label: "Accent", token: "--color-accent", swatch: "var(--color-accent)", text: "var(--color-on-accent)", sample: "Accent state" },
  { label: "Info", token: "--color-info", swatch: "var(--color-info)", text: "var(--color-on-info)", sample: "Info state" },
  { label: "Success", token: "--color-success", swatch: "var(--color-success)", text: "var(--color-on-success)", sample: "Success state" },
  { label: "Warning", token: "--color-warning", swatch: "var(--color-warning)", text: "var(--color-on-warning)", sample: "Warning state" },
  { label: "Danger", token: "--color-danger", swatch: "var(--color-danger)", text: "var(--color-on-danger)", sample: "Danger state" },
  { label: "Disabled bg", token: "--color-disabled-bg", swatch: "var(--color-disabled-bg)", text: "var(--color-text-primary)", sample: "Disabled surface" },
  { label: "Focus ring", token: "--color-focus-ring", swatch: "var(--color-focus-ring)", text: "var(--color-text-primary)", sample: "Focus ring" },
] as const

const borderColorSpecimens = [
  { label: "Subtle", token: "--color-border-subtle", swatch: "var(--color-border-subtle)" },
  { label: "Strong", token: "--color-border-strong", swatch: "var(--color-border-strong)" },
  { label: "Divider", token: "--color-border-divider", swatch: "var(--color-border-divider)" },
  { label: "Focus", token: "--color-border-focus", swatch: "var(--color-border-focus)" },
  { label: "Field", token: "--color-border-field", swatch: "var(--color-border-field)" },
  { label: "Field hover", token: "--color-border-field-hover", swatch: "var(--color-border-field-hover)" },
  { label: "Success", token: "--color-border-success", swatch: "var(--color-border-success)" },
  { label: "Warning", token: "--color-border-warning", swatch: "var(--color-border-warning)" },
  { label: "Danger", token: "--color-border-danger", swatch: "var(--color-border-danger)" },
] as const

const asideTitleStyles = {
  fontSize: "var(--text-aside-title)",
  lineHeight: "var(--leading-aside-title)",
  fontWeight: "var(--font-weight-bold)",
  letterSpacing: "normal",
  color: "var(--color-text-primary)",
} as const

function getPriorityDisplay(priority: CaseRecord["priority"]) {
  switch (priority) {
    case "Critical":
      return {
        label: "P4 Critical",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "High":
      return {
        label: "P3 High",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "Medium":
      return {
        label: "P2 Medium",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "Low":
      return {
        label: "P1 Low",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "":
    default:
      return {
        label: "P0 Not set",
        className: "text-[color:var(--color-text-primary)]",
      }
  }
}

function getCaseListStatusDisplay(status: CaseRecord["status"]) {
  switch (status) {
    case "Escalated":
      return {
        label: status,
        className: "text-[color:var(--color-status-escalated)]",
      }
    case "Waiting on customer":
      return {
        label: status,
        className: "text-[color:var(--color-status-waiting)]",
      }
    case "Resolved":
      return {
        label: status,
        className: "text-[color:var(--color-status-resolved)]",
      }
    case "New":
      return {
        label: status,
        className: "text-[color:var(--color-status-new)]",
      }
    case "In progress":
    default:
      return {
        label: status,
        className: "text-[color:var(--color-status-in-progress)]",
      }
  }
}

function formatCaseListUpdated(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return {
      primary: "—",
      secondary: undefined,
    }
  }

  const [datePart, ...timeParts] = trimmed.split(" ")

  if (!datePart) {
    return {
      primary: trimmed,
      secondary: undefined,
    }
  }

  const parsedDate = new Date(`${datePart}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      primary: trimmed,
      secondary: undefined,
    }
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffInDays = Math.round(
    (todayStart.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const primary =
    diffInDays === 0
      ? "Today"
      : diffInDays === 1
        ? "Yesterday"
        : parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

  const secondary = timeParts.join(" ").trim() || parsedDate.getFullYear().toString()

  return {
    primary,
    secondary,
  }
}

export function CaseScreenPage() {
  const [recordTab, setRecordTab] = useState<"details" | "activity">("details")
  const [screenView, setScreenView] = useState<"list" | "record">("list")
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false)
  const [cases, setCases] = useState(EXAMPLE_CASES)
  const [selectedCaseId, setSelectedCaseId] = useState(EXAMPLE_CASES[0]?.id ?? "")
  const [draftRecord, setDraftRecord] = useState(EXAMPLE_CASES[0] ?? INITIAL_CASE_RECORD)
  const [caseSearch, setCaseSearch] = useState("")
  const [caseStatusFilter, setCaseStatusFilter] = useState<"all" | CaseRecord["status"]>("all")
  const [caseKpiFilter, setCaseKpiFilter] = useState<CaseListKpiFilter | null>(null)
  const [aiVersion, setAiVersion] = useState(1)
  const [aiUpdatedAt, setAiUpdatedAt] = useState(() => Date.now())
  const [pendingTimelineReferenceId, setPendingTimelineReferenceId] = useState<string | null>(null)
  const [highlightedTimelineItemId, setHighlightedTimelineItemId] = useState<string | null>(null)
  const [responseTargetEdited, setResponseTargetEdited] = useState(false)
  const [resolutionTargetEdited, setResolutionTargetEdited] = useState(false)
  const [touched, setTouched] = useState({
    title: false,
    priority: false,
  })
  const [saveAttempted, setSaveAttempted] = useState(false)
  const savedRecord =
    cases.find((record) => record.id === selectedCaseId) ??
    cases[0] ??
    INITIAL_CASE_RECORD

  const hasUnsavedChanges =
    JSON.stringify(savedRecord) !== JSON.stringify(draftRecord)

  const titleError = draftRecord.title.trim() ? undefined : "Title is required"
  const priorityError = draftRecord.priority ? undefined : "Priority is required"

  const visibleTitleError =
    touched.title || saveAttempted ? titleError : undefined
  const visiblePriorityError =
    touched.priority || saveAttempted ? priorityError : undefined

  const viewRecordSections = getCaseRecordSections(savedRecord)
  const editRecordSections = getCaseRecordSections(draftRecord, {
    visibleTitleError,
    visiblePriorityError,
    markTitleTouched: () => markTouched("title"),
    markPriorityTouched: () => markTouched("priority"),
    onStatusChange: handleStatusChange,
    onChannelChange: handleChannelChange,
    onSeverityChange: handleSeverityChange,
    onFieldChange: updateDraft,
    onResponseTargetEdit: () => setResponseTargetEdited(true),
    onResolutionTargetEdit: () => setResolutionTargetEdited(true),
  })
  const aiSourceSections = viewRecordSections.filter((section) =>
    section.id === "status-ownership" || section.id === "classification"
  )
  const selectedActivityTimelineItems =
    activityTimelineItemsByCaseId[selectedCaseId] ?? activityTimelineItems
  const aiCaseInput = buildAICaseInput(savedRecord, aiSourceSections)
  const aiRecordInsight = getFakeAIRecordInsight(
    aiCaseInput,
    aiVersion,
    selectedActivityTimelineItems
  )
  const aiUpdatedLabel = formatAIUpdatedLabel(aiUpdatedAt)
  const openCaseCount = cases.filter((record) => record.status !== "Resolved").length
  const waitingCaseCount = cases.filter((record) => record.status === "Waiting on customer").length
  const onHoldCaseCount = cases.filter((record) => Boolean(record.onHoldUntil)).length
  const highPriorityCaseCount = cases.filter(
    (record) => record.priority === "High" || record.priority === "Critical"
  ).length
  const caseListSummaryItems = (
    [
      { id: "open", label: "Open", value: openCaseCount },
      { id: "waiting_on_customer", label: "Waiting on customer", value: waitingCaseCount },
      { id: "on_hold", label: "On hold", value: onHoldCaseCount },
      { id: "high_priority", label: "High priority", value: highPriorityCaseCount },
    ] satisfies typeof caseListKpiItems
  )
  const trimmedCaseSearch = caseSearch.trim()
  const selectedCaseKpiItem =
    caseKpiFilter === null
      ? undefined
      : caseListSummaryItems.find((item) => item.id === caseKpiFilter)
  const selectedCaseStatusOption =
    caseStatusFilter === "all"
      ? undefined
      : STATUS_OPTIONS.find((option) => option.value === caseStatusFilter)
  const activeCaseFilters = [
    ...(selectedCaseKpiItem
      ? [
          {
            id: "kpi" as const,
            label: selectedCaseKpiItem.label,
            clear: () => setCaseKpiFilter(null),
          },
        ]
      : []),
    ...(selectedCaseStatusOption
      ? [
          {
            id: "status" as const,
            label: `Status: ${selectedCaseStatusOption.label}`,
            clear: () => setCaseStatusFilter("all"),
          },
        ]
      : []),
    ...(trimmedCaseSearch !== ""
      ? [
          {
            id: "search" as const,
            label: `Search: ${trimmedCaseSearch}`,
            clear: () => setCaseSearch(""),
          },
        ]
      : []),
  ]
  const filteredCases = cases.filter((record) => {
    const matchesSearch =
      trimmedCaseSearch === "" ||
      [record.id, record.title, record.customer, record.assignee]
        .join(" ")
        .toLowerCase()
        .includes(trimmedCaseSearch.toLowerCase())

    const matchesStatus =
      caseStatusFilter === "all" || record.status === caseStatusFilter

    const matchesKpiFilter =
      caseKpiFilter === null ||
      (caseKpiFilter === "open" && record.status !== "Resolved") ||
      (caseKpiFilter === "waiting_on_customer" && record.status === "Waiting on customer") ||
      (caseKpiFilter === "on_hold" && Boolean(record.onHoldUntil)) ||
      (caseKpiFilter === "high_priority" &&
        (record.priority === "High" || record.priority === "Critical"))

    return matchesSearch && matchesStatus && matchesKpiFilter
  })

  useEffect(() => {
    if (recordTab !== "activity" || !pendingTimelineReferenceId) {
      return
    }

    const target = document.getElementById(pendingTimelineReferenceId)

    if (!target) {
      setPendingTimelineReferenceId(null)
      return
    }

    if (!isElementVisibleInScrollRegion(target)) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }

    setHighlightedTimelineItemId(pendingTimelineReferenceId)
    setPendingTimelineReferenceId(null)
  }, [pendingTimelineReferenceId, recordTab])

  useEffect(() => {
    if (!highlightedTimelineItemId) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedTimelineItemId(null)
    }, 1600)

    return () => window.clearTimeout(timeoutId)
  }, [highlightedTimelineItemId])

  function resetEditState(nextDraft: CaseRecord) {
    setDraftRecord(nextDraft)
    setResponseTargetEdited(false)
    setResolutionTargetEdited(false)
    setTouched({
      title: false,
      priority: false,
    })
    setSaveAttempted(false)
  }

  function refreshAIInsights() {
    setAiVersion((current) => current + 1)
    setAiUpdatedAt(Date.now())
  }

  function handleAIReferenceClick(referenceId: string) {
    setRecordTab("activity")
    setPendingTimelineReferenceId(referenceId)
  }

  function handleAIActionClick(referenceId: string) {
    setRecordTab("activity")
    setPendingTimelineReferenceId(referenceId)
  }

  function enterEditMode() {
    resetEditState(savedRecord)
    setRecordTab("details")
    setIsAIDrawerOpen(false)
    setMode("edit")
  }

  function openCase(caseId: string) {
    const nextCase = cases.find((record) => record.id === caseId)

    if (!nextCase) {
      return
    }

    setSelectedCaseId(caseId)
    resetEditState(nextCase)
    setRecordTab("details")
    setIsAIDrawerOpen(false)
    setMode("view")
    setScreenView("record")
    refreshAIInsights()
  }

  function markTouched(field: "title" | "priority") {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }))
  }

  function updateDraft<K extends keyof CaseRecord>(field: K, value: CaseRecord[K]) {
    setDraftRecord((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSeverityChange(nextSeverity: CaseRecord["severity"]) {
    updateDraft("severity", nextSeverity)

    const suggestedTargets = getSuggestedTargets(nextSeverity)

    if (!responseTargetEdited) {
      updateDraft("responseTarget", suggestedTargets.responseTarget)
    }

    if (!resolutionTargetEdited) {
      updateDraft("resolutionTarget", suggestedTargets.resolutionTarget)
    }
  }

  function handleStatusChange(nextStatus: CaseRecord["status"]) {
    updateDraft("status", nextStatus)
  }

  function handleChannelChange(nextChannel: CaseRecord["channel"]) {
    updateDraft("channel", nextChannel)
  }

  function toggleCaseKpiFilter(nextFilter: CaseListKpiFilter) {
    setCaseKpiFilter((current) => current === nextFilter ? null : nextFilter)
  }

  function handleBackToCases() {
    if (mode === "edit" && hasUnsavedChanges) {
      const confirmed = window.confirm("Discard unsaved changes and return to the cases list?")

      if (!confirmed) {
        return
      }

      resetEditState(savedRecord)
      setMode("view")
    }

    setScreenView("list")
  }

  function handleCancel() {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("Discard unsaved changes?")

      if (!confirmed) {
        return
      }
    }

    resetEditState(savedRecord)
    setMode("view")
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveAttempted(true)
    setTouched({
      title: true,
      priority: true,
    })

    if (titleError || priorityError) {
      return
    }

    setCases((currentCases) =>
      currentCases.map((record) => (
        record.id === savedRecord.id ? draftRecord : record
      ))
    )
    resetEditState(draftRecord)
    setMode("view")
    refreshAIInsights()
  }

  return (
    <main className={`${screenView === "list" ? "min-h-screen" : "flex h-screen flex-col overflow-hidden"} bg-page text-text-default [font-family:var(--font-sans)] border-t border-[var(--color-border-divider)]`}>
      {screenView === "list" ? (
        <PageContent width="xl">
          <CasesListTemplate
            actions={
              <Button variant="primary" onClick={() => undefined}>
                Create case
              </Button>
            }
            compactFilterSpacing={activeCaseFilters.length > 0 && filteredCases.length === 0}
            resultsRegionId="case-list-results"
            overview={caseListSummaryItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => toggleCaseKpiFilter(item.id)}
                aria-pressed={caseKpiFilter === item.id}
                aria-controls="case-list-results"
                aria-label={`${caseKpiFilter === item.id ? "Clear" : "Filter by"} ${item.label.toLowerCase()} cases`}
                className={`group rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] text-left transition-[background-color,border-color,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${
                  caseKpiFilter === item.id
                    ? "border-[length:var(--border-width-control-focus)] border-[var(--color-field-border-focus)] bg-[var(--color-field-bg)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]"
                }`}
              >
                <p className={`text-[length:var(--text-meta)] leading-[var(--leading-normal)] ${
                  caseKpiFilter === item.id
                    ? "text-[color:var(--color-text-primary)]"
                    : "text-[color:var(--color-text-secondary)] group-hover:text-[color:var(--color-text-primary)]"
                }`}>
                  {item.label}
                </p>
                <p className={`pt-[var(--space-1)] text-xl leading-[var(--leading-snug)] text-[color:var(--color-text-primary)] ${
                  caseKpiFilter === item.id ? "font-medium" : "font-normal"
                }`}>
                  {item.value}
                </p>
              </button>
            ))}
            filterControls={
              <div className="grid gap-[var(--space-3)] md:grid-cols-[minmax(0,2fr)_minmax(12rem,0.8fr)]">
                <Field label="Search" variant="tight">
                  <Input
                    size="sm"
                    value={caseSearch}
                    onChange={(event) => setCaseSearch(event.target.value)}
                    placeholder="Search by case, title, customer, or assignee"
                    aria-controls="case-list-results"
                    aria-label="Search cases"
                  />
                </Field>

                <Field label="Status" variant="tight">
                  <Select
                    size="sm"
                    value={caseStatusFilter}
                    onChange={(event) => setCaseStatusFilter(event.target.value as "all" | CaseRecord["status"])}
                    aria-controls="case-list-results"
                    aria-label="Filter cases by status"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            }
            activeFilters={activeCaseFilters.length > 0 ? (
              <>
                {activeCaseFilters.map((filter) => (
                  <div
                    key={filter.id}
                    role="listitem"
                    className="inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)] transition-[background-color,border-color,opacity] duration-150 hover:bg-[var(--color-surface-muted)]"
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      onClick={filter.clear}
                      className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-text-muted)] transition-colors hover:text-[color:var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                      aria-label={`Remove filter ${filter.label}`}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 12 12"
                        className="h-[0.75rem] w-[0.75rem]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M2.5 2.5 9.5 9.5" />
                        <path d="M9.5 2.5 2.5 9.5" />
                      </svg>
                    </button>
                  </div>
                ))}

                {activeCaseFilters.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCaseKpiFilter(null)
                      setCaseStatusFilter("all")
                      setCaseSearch("")
                    }}
                    aria-controls="case-list-results"
                    aria-label="Clear all active filters"
                    className="rounded-[var(--radius-sm)] text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)] transition-colors hover:text-[color:var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                  >
                    Clear all
                  </button>
                ) : null}
              </>
            ) : undefined}
            listContent={
              <>
                <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(10rem,1.2fr)_minmax(10rem,1fr)_minmax(8rem,0.9fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_1.5rem] gap-[var(--space-3)] border-y border-[var(--color-border-divider)] bg-[var(--color-surface-structural-muted)] px-[var(--space-4)] py-[var(--space-3)] md:grid">
                  {["Case", "Customer", "Status", "Priority", "Assignee", "Updated", ""].map((label, index) => (
                    <div
                      key={`${label}-${index}`}
                      className={`text-[length:var(--text-meta)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-secondary)] ${index === 6 ? "text-right" : ""}`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {filteredCases.length > 0 ? (
                  <div className="divide-y divide-[var(--color-border-divider)]">
                    {filteredCases.map((record) => {
                      const priorityDisplay = getPriorityDisplay(record.priority)
                      const statusDisplay = getCaseListStatusDisplay(record.status)
                      const updatedDisplay = formatCaseListUpdated(record.lastUpdate)

                      return (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => openCase(record.id)}
                          className="group grid w-full cursor-pointer gap-[var(--space-2)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-4)] text-left transition-[background-color,border-color,opacity] duration-100 hover:bg-[var(--color-surface-muted)] focus-visible:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)] md:grid-cols-[minmax(0,2.4fr)_minmax(10rem,1.2fr)_minmax(10rem,1fr)_minmax(8rem,0.9fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_1.5rem] md:items-center md:gap-[var(--space-3)]"
                          aria-label={`Open case ${record.id}`}
                        >
                          <div className="min-w-0 space-y-[var(--space-half)]">
                            <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-text-primary)] group-focus-visible:text-[color:var(--color-text-primary)]">
                              {record.id}
                            </p>
                            <div className="flex min-w-0 items-start justify-between gap-[var(--space-2)]">
                              <p className="min-w-0 text-sm leading-normal font-medium text-[color:var(--color-text-primary)] transition-colors group-hover:text-[color:var(--color-text-brand)] group-focus-visible:text-[color:var(--color-text-brand)]">
                                {record.title}
                              </p>
                            </div>
                          </div>
                          <div className="min-w-0 text-sm leading-normal text-[color:var(--color-text-primary)] transition-colors group-hover:text-[color:var(--color-text-brand)] group-focus-visible:text-[color:var(--color-text-brand)]">
                            {getDisplayValue(record.customer)}
                          </div>
                          <div className={`text-sm leading-normal ${statusDisplay.className}`}>
                            {statusDisplay.label}
                          </div>
                          <div className={`text-sm leading-normal ${priorityDisplay.className}`}>
                            {priorityDisplay.label}
                          </div>
                          <div className="min-w-0 text-sm leading-normal text-[color:var(--color-text-primary)] transition-colors group-hover:text-[color:var(--color-text-brand)] group-focus-visible:text-[color:var(--color-text-brand)]">
                            {getDisplayValue(record.assignee)}
                          </div>
                          <div className="space-y-[var(--space-half)]">
                            <p className="text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-text-primary)] group-focus-visible:text-[color:var(--color-text-primary)]">
                              {updatedDisplay.primary}
                            </p>
                            {updatedDisplay.secondary ? (
                              <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                                {updatedDisplay.secondary}
                              </p>
                            ) : null}
                          </div>
                          <div className="hidden text-right md:block">
                            <span
                              aria-hidden="true"
                              className="inline-block h-[0.5rem] w-[0.5rem] -rotate-45 border-r-2 border-b-2 border-[color:var(--color-text-muted)] transition-colors group-hover:border-[color:var(--color-text-secondary)] group-focus-visible:border-[color:var(--color-text-secondary)]"
                            />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="border-b border-[var(--color-border-divider)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-5)]">
                    <div className="space-y-[var(--space-3)]">
                      <p className="text-lg leading-[var(--leading-snug)] font-medium text-[color:var(--color-text-primary)]">
                        No cases match your filters.
                      </p>
                      <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                        Clear filters to see more cases.
                      </p>
                      <div className="pt-[var(--space-3)]">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setCaseKpiFilter(null)
                            setCaseStatusFilter("all")
                            setCaseSearch("")
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            }
          />
        </PageContent>
      ) : mode === "view" ? (
        <>
          <RecordShellBar
            breadcrumbs={[
              {
                label: "Cases",
                href: "#",
                onClick: (event) => {
                  event.preventDefault()
                  handleBackToCases()
                },
              },
            ]}
            title={savedRecord.title}
            recordId={savedRecord.id}
            status={getShellStatus(savedRecord.status)}
            metadata={
              <>
                {savedRecord.customer}
                {" • "}
                {savedRecord.assignee}
              </>
            }
            actions={
              <Button variant="secondary" onClick={enterEditMode}>
                Edit
              </Button>
            }
          />
          <div className="min-h-0 flex-1">
            <div className="mx-auto flex h-full w-full max-w-[var(--content-width-xl)] min-h-0 px-[var(--space-section-sm)] md:px-[var(--space-section-md)]">
              <div className={`grid h-full min-h-0 w-full items-stretch gap-x-[var(--space-8)] ${isAIDrawerOpen ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,calc(var(--content-width-sm)_+_var(--control-height-sm)))]" : "xl:grid-cols-[minmax(0,1fr)_var(--control-height-sm)]"}`}>
                <div className="flex min-w-0 min-h-0 flex-col py-[var(--space-section-md)]">
                  <div className="shrink-0">
                    <Tabs
                      tabs={[...recordTabs]}
                      activeTab={recordTab}
                      onChange={(tabId) => setRecordTab(tabId as "details" | "activity")}
                    />
                  </div>

                  <div className={`min-h-0 flex-1 pt-[var(--space-4)] ${recordTab === "activity" ? "overflow-hidden" : "overflow-y-auto"}`}>
                    <div className={`min-w-0 ${recordTab === "activity" ? "h-full" : "space-y-[var(--space-4)]"}`}>
                      {recordTab === "details" ? (
                        viewRecordSections.map((section) =>
                          renderCaseRecordSection({
                            section,
                            record: savedRecord,
                            renderMode: "view",
                            updateField: updateDraft,
                            getDisplayValue,
                          })
                        )
                      ) : (
                        <ActivityTimeline
                          items={selectedActivityTimelineItems}
                          className="h-full"
                          highlightedItemId={highlightedTimelineItemId}
                          scrollListOnly
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-h-0">
                  <Drawer
                    open={isAIDrawerOpen}
                    title="AI assistance"
                    metadata={aiUpdatedLabel}
                    subtitle="Generated from visible case details and recent activity."
                    onToggle={() => setIsAIDrawerOpen((current) => !current)}
                    toggleLabel={isAIDrawerOpen ? "Collapse AI assistance" : "Open AI assistance"}
                    railLabel="AI"
                    onClose={() => setIsAIDrawerOpen(false)}
                    closeLabel="Close AI assistance"
                    actions={
                      <Link
                        href="#"
                        className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
                        onClick={(event) => {
                          event.preventDefault()
                          refreshAIInsights()
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
                                  onClick={() => handleAIReferenceClick(reference.id)}
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
                        {aiRecordInsight.actions.map((action) => (
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
                                onClick={() => handleAIActionClick(action.referenceId!)}
                                className="cursor-pointer text-left text-[color:inherit] underline-offset-2 transition-colors hover:text-[color:var(--color-text-primary)] hover:underline focus-visible:rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                              >
                                {action.label}
                              </button>
                            ) : (
                              action.label
                            )}
                          </li>
                        ))}
                      </ol>
                    </section>
                  </Drawer>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <RecordShellBar
            title={draftRecord.title || "Untitled case"}
            mode="edit"
            recordId={draftRecord.id}
            actions={
              <>
                <div className="text-xs leading-[var(--leading-normal)] font-normal text-[color:var(--color-text-muted)]">
                  {hasUnsavedChanges ? "Unsaved changes" : ""}
                </div>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button form="case-edit-form" type="submit" variant="primary">
                  Save
                </Button>
              </>
            }
          />
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[var(--content-width-xl)] px-[var(--space-section-sm)] py-[var(--space-section-md)] md:px-[var(--space-section-md)]">
              <div className="mx-auto w-full max-w-[var(--content-width-md)]">
                <form
                  id="case-edit-form"
                  className="space-y-[var(--space-section-md)]"
                  onSubmit={handleSave}
                >
                  {editRecordSections.map((section) =>
                    renderCaseRecordSection({
                      section,
                      record: draftRecord,
                      renderMode: "edit",
                      updateField: updateDraft,
                      getDisplayValue,
                    })
                  )}
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default function App() {
  const [componentTab, setComponentTab] = useState<"details" | "activity" | "insights">("details")
  const savedRecord = EXAMPLE_CASES[0] ?? INITIAL_CASE_RECORD
  const [draftRecord, setDraftRecord] = useState(savedRecord)

  function updateDraft<K extends keyof CaseRecord>(field: K, value: CaseRecord[K]) {
    setDraftRecord((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <main className="min-h-screen bg-page text-text-default [font-family:var(--font-sans)] border-t border-[var(--color-border-divider)]">
      <PageContent width="xl">
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-half)]">
            <h1 className="m-0 text-record-title">Design system playground</h1>
            <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
              Component gallery to test primitives in isolation.
            </p>
          </div>

          <div className="space-y-[var(--space-4)]">
            <RecordSection
              title="Tabs"
              description="Restrained section navigation for case record views and other enterprise page areas."
              className="pt-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-4)]">
                <Tabs
                  tabs={[...componentTabs]}
                  activeTab={componentTab}
                  onChange={(tabId) =>
                    setComponentTab(tabId as "details" | "activity" | "insights")
                  }
                />

                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] bg-[var(--color-surface-elevated)] px-[var(--space-4)] py-[var(--space-4)]">
                  {componentTab === "details" ? (
                    <div className="space-y-[var(--space-2)]">
                      <h3 className="m-0" style={asideTitleStyles}>
                        Details
                      </h3>
                      <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                        Structured record fields and sectioned case information.
                      </p>
                    </div>
                  ) : componentTab === "activity" ? (
                    <div className="space-y-[var(--space-2)]">
                      <h3 className="m-0" style={asideTitleStyles}>
                        Activity
                      </h3>
                      <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                        Chronological communication, workflow, and system updates.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-[var(--space-2)]">
                      <h3 className="m-0" style={asideTitleStyles}>
                        AI
                      </h3>
                      <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                        Generated summaries and suggested next steps for record review.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </RecordSection>

            <RecordSection
              title="Typography"
              description="Foundational size scale and semantic text roles used across the current design system."
              className="pt-[var(--space-4)]"
            >
              <div className="grid gap-[var(--space-section-sm)] xl:grid-cols-2">
                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Type scale
                  </h3>
                  <div className="space-y-[var(--space-3)]">
                    {typeScaleSpecimens.map((specimen) => (
                      <div
                        key={specimen.label}
                        className="space-y-[var(--space-half)] border-b border-[var(--color-border-divider)] pb-[var(--space-3)]"
                      >
                        <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                          {specimen.label}
                        </div>
                        <p className="m-0" style={specimen.style}>
                          {specimen.sample}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Semantic roles
                  </h3>
                  <div className="space-y-[var(--space-3)]">
                    {semanticTypeSpecimens.map((specimen) => (
                      <div
                        key={specimen.label}
                        className="space-y-[var(--space-half)] border-b border-[var(--color-border-divider)] pb-[var(--space-3)]"
                      >
                        <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                          {specimen.label}
                        </div>
                        <p className="m-0" style={specimen.style}>
                          {specimen.sample}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </RecordSection>

            <RecordSection
              title="Colors"
              description="Semantic color roles for surfaces, text, feedback, actions, and borders."
              className="pt-[var(--space-4)]"
            >
              <div className="grid gap-[var(--space-section-sm)] xl:grid-cols-2">
                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Surfaces
                  </h3>
                  <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                    {surfaceColorSpecimens.map((specimen) => (
                      <div
                        key={specimen.token}
                        className="space-y-[var(--space-2)] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] p-[var(--space-3)]"
                      >
                        <div
                          className="flex min-h-[5rem] items-end rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] p-[var(--space-2)]"
                          style={{ background: specimen.swatch, color: specimen.text }}
                        >
                          <span className="text-[length:var(--text-sm)] leading-[var(--leading-normal)]">{specimen.sample}</span>
                        </div>
                        <div className="space-y-[var(--space-half)]">
                          <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                            {specimen.label}
                          </div>
                          <div className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                            {specimen.token}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Text
                  </h3>
                  <div className="space-y-[var(--space-3)]">
                    {textColorSpecimens.map((specimen) => (
                      <div
                        key={specimen.token}
                        className="space-y-[var(--space-half)] border-b border-[var(--color-border-divider)] pb-[var(--space-3)]"
                      >
                        <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                          {specimen.label} · {specimen.token}
                        </div>
                        <p className="m-0 text-[length:var(--text-md)] leading-[var(--leading-normal)]" style={{ color: specimen.swatch }}>
                          {specimen.sample}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    States & actions
                  </h3>
                  <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                    {stateColorSpecimens.map((specimen) => (
                      <div
                        key={specimen.token}
                        className="space-y-[var(--space-2)] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] p-[var(--space-3)]"
                      >
                        <div
                          className="flex min-h-[4.5rem] items-end rounded-[var(--radius-sm)] p-[var(--space-2)]"
                          style={{ background: specimen.swatch, color: specimen.text }}
                        >
                          <span className="text-[length:var(--text-sm)] leading-[var(--leading-normal)]">{specimen.sample}</span>
                        </div>
                        <div className="space-y-[var(--space-half)]">
                          <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                            {specimen.label}
                          </div>
                          <div className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                            {specimen.token}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-[var(--space-3)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Borders
                  </h3>
                  <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
                    {borderColorSpecimens.map((specimen) => (
                      <div
                        key={specimen.token}
                        className="space-y-[var(--space-2)] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] p-[var(--space-3)]"
                      >
                        <div
                          className="min-h-[4rem] rounded-[var(--radius-sm)] border-[3px] bg-[var(--color-surface-elevated)]"
                          style={{ borderColor: specimen.swatch }}
                        />
                        <div className="space-y-[var(--space-half)]">
                          <div className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                            {specimen.label}
                          </div>
                          <div className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                            {specimen.token}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </RecordSection>

            <RecordSection
              title="Actions"
              description="Button hierarchy, link treatment, and action spacing for common interaction states."
              className="pt-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-4)]">
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <Button variant="primary">Primary action</Button>
                  <Button variant="secondary">Secondary action</Button>
                  <Button variant="ghost">Ghost action</Button>
                  <Button variant="secondary" size="sm">Small secondary</Button>
                  <Button disabled>Disabled</Button>
                  <Link href="#">Inline link</Link>
                </div>
              </div>
            </RecordSection>

            <RecordSection
              title="Status"
              description="Badge tones, emphasis levels, and product-level case status mapping."
              className="pt-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-4)]">
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <StatusBadge tone="neutral">Neutral</StatusBadge>
                  <StatusBadge tone="info">Info</StatusBadge>
                  <StatusBadge tone="success">Success</StatusBadge>
                  <StatusBadge tone="warning">Warning</StatusBadge>
                  <StatusBadge tone="danger">Danger</StatusBadge>
                </div>

                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <StatusBadge tone="info" emphasis="strong">Info strong</StatusBadge>
                  <StatusBadge tone="success" emphasis="strong">Success strong</StatusBadge>
                  <StatusBadge tone="warning" emphasis="strong">Warning strong</StatusBadge>
                  <StatusBadge tone="danger" emphasis="strong">Danger strong</StatusBadge>
                </div>

                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <CaseStatusBadge status="new" />
                  <CaseStatusBadge status="in_progress" />
                  <CaseStatusBadge status="waiting_on_customer" />
                  <CaseStatusBadge status="escalated" />
                  <CaseStatusBadge status="resolved" />
                  <CaseStatusBadge status="closed" />
                </div>
              </div>
            </RecordSection>

            <RecordSection
              title="Field system"
              description="Field owns label, required state, supporting text, and spacing for both editable controls and read-only values."
              className="pt-[var(--space-4)]"
            >
              <FormFieldGrid>
                <Field
                  label="Case title"
                  required
                  helper="Use the customer-facing summary so the case remains easy to scan in queues."
                >
                  <Input
                    size="sm"
                    name="field-system-title"
                    defaultValue="Customer cannot access invoice portal"
                  />
                </Field>

                <Field
                  label="Assignee"
                  required
                  helper="Helper text is intentionally hidden when an error is present."
                  error="Select an owner before saving this case."
                >
                  <Input
                    size="sm"
                    name="field-system-assignee"
                    defaultValue=""
                    placeholder="Select assignee"
                  />
                </Field>

                <Field
                  label="Status reason"
                  helper="Optional fields keep the same structure without the required marker."
                >
                  <Input
                    size="sm"
                    name="field-system-status-reason"
                    defaultValue="Awaiting customer confirmation after account remediation."
                  />
                </Field>

                <Field label="Assigned queue" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.queue)}
                    behavior="compact"
                  />
                </Field>

                <Field label="Contract type" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.contractType)}
                    behavior="flexible"
                    variant="compact"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Approval path and contracted exception coverage details"
                    variant="tight"
                    helper="Long labels and values keep the same wrapper rhythm in read-only presentation."
                  >
                    <ReadOnlyValue
                      size="sm"
                      value="Finance leadership approval is required before issuing accelerated customer credit for any merged-entity billing remediation that exceeds the contracted service exception threshold."
                      behavior="full-width"
                      multiline
                    />
                  </Field>
                </div>
              </FormFieldGrid>
            </RecordSection>

            <RecordSection
              title="Activity timeline"
              description="Structured vertical history for case activity, using time, type, and content hierarchy rather than decorative styling."
              className="pt-[var(--space-4)]"
            >
              <ActivityTimeline items={activityTimelineItems} />
            </RecordSection>

            <RecordSection
              title="Compositions"
              description="Higher-level compositions shown together to validate rhythm, hierarchy, and shell behavior."
              className="pt-[var(--space-4)]"
            >
              <div className="space-y-[var(--space-4)]">
                <RecordShellBar
                  breadcrumbs={[
                    { label: "Case management", href: "#" },
                    { label: "Cases", href: "#" },
                  ]}
                  title={savedRecord.title}
                  recordId={savedRecord.id}
                  status={getShellStatus(savedRecord.status)}
                  metadata={
                    <>
                      {savedRecord.customer}
                      {" • "}
                      {savedRecord.assignee}
                    </>
                  }
                  actions={
                    <Button variant="secondary" onClick={() => undefined}>
                      Edit
                    </Button>
                  }
                />

                <FormPageLayout>
                  <FormSection
                    title="Section layout"
                    description="Form section spacing and control alignment inside the current layout primitives."
                  >
                    <FieldGroupStack>
                      <Field label="Assignee">
                        <Input
                          size="sm"
                          value={draftRecord.assignee}
                          onChange={(event) => updateDraft("assignee", event.target.value)}
                        />
                      </Field>
                    </FieldGroupStack>
                  </FormSection>
                </FormPageLayout>
              </div>
            </RecordSection>
          </div>
        </div>
      </PageContent>
    </main>
  )
}
