import { useEffect, useState } from "react"
import CasesListTemplate from "../cases/list/CasesListTemplate"
import CaseRecordTemplate from "../cases/record/CaseRecordTemplate"
import { EMPTY_CASE_SIGNALS, getPrimarySignal } from "../cases/record/caseSignals"
import { renderCaseRecordSection } from "../cases/record/renderers"
import { getCaseRecordSections, STATUS_OPTIONS } from "../cases/record/schema"
import type { CasePrimarySignal, CaseRecord, CaseState, SectionConfig } from "../cases/record/types"
import Button from "../design-system/components/Button"
import CaseStatusBadge, { type CaseStatus } from "../design-system/components/CaseStatusBadge"
import ActivityTimeline, {
  type ActiveSuggestedAction,
  type ActivityTimelineItem,
} from "../design-system/components/ActivityTimeline"
import Input from "../design-system/components/controls/Input"
import ReadOnlyValue from "../design-system/components/controls/ReadOnlyValue"
import Field from "../design-system/components/fields/Field"
import FieldGroupStack from "../design-system/components/field-groups/FieldGroupStack"
import FormFieldGrid from "../design-system/components/field-groups/FormFieldGrid"
import FilterChip from "../design-system/components/FilterChip"
import Link from "../design-system/components/Link"
import FormPageLayout from "../design-system/components/layouts/FormPageLayout"
import PageContent from "../design-system/components/PageContent"
import FormSection from "../design-system/components/sections/FormSection"
import RecordSection from "../design-system/components/sections/RecordSection"
import RecordShellBar from "../design-system/components/RecordShellBar"
import StatusBadge, {
  type StatusBadgeEmphasis,
  type StatusBadgeTone,
} from "../design-system/components/StatusBadge"
import SummaryCard from "../design-system/components/SummaryCard"
import Tabs from "../design-system/components/Tabs"
import {
  activityTimelineItems,
  activityTimelineItemsByCaseId,
  EXAMPLE_CASES,
  INITIAL_CASE_RECORD,
} from "./mockData"

type AICaseInput = {
  caseId: string
  title: string
  status: CaseRecord["status"]
  state: CaseState
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

type AICaseSignals = {
  breachRisk: string
  hasExternalDependency: boolean
  hasMultiEntityImpact: boolean
  hasRevenueImpact: boolean
  isReopened: boolean
}

type AIEvidenceSignal = {
  intent: "blocked" | "progress" | "resolved"
  blockingReason: CaseRecord["blockingReason"]
  selectedEvent?: ActivityTimelineItem
}

function isCustomerResponseRequest(item: ActivityTimelineItem) {
  if (item.type !== "outgoing" || typeof item.content !== "string") {
    return false
  }

  const normalizedContent = item.content.toLowerCase()

  return [
    "confirm",
    "let us know",
    "could you",
    "when you have a moment",
    "validation",
    "still need help",
    "reply",
    "approved",
    "which entity",
  ].some((phrase) => normalizedContent.includes(phrase))
}

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
  return status
}

function getCaseStatusLabel(status: CaseRecord["status"]) {
  switch (status) {
    case "resolved":
      return "Resolved"
    case "new":
      return "New"
    case "in_progress":
    default:
      return "In progress"
  }
}

function getDisplayValue(value: string | null | undefined) {
  if (typeof value !== "string") {
    return "—"
  }

  return value.trim() ? value : "—"
}

function parseCaseListDateTime(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const [datePart, timePart] = trimmed.split(" ")

  if (!datePart) {
    return null
  }

  const normalizedTime =
    timePart && /^\d{2}:\d{2}$/.test(timePart) ? timePart : "00:00"
  const parsedDate = new Date(`${datePart}T${normalizedTime}:00`)

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getCaseAgeLabel(value: string, referenceTime = Date.now()) {
  const parsedDate = parseCaseListDateTime(value)

  if (!parsedDate) {
    return null
  }

  const diffInMilliseconds = referenceTime - parsedDate.getTime()

  if (diffInMilliseconds <= 0) {
    return "1h"
  }

  const diffInHours = Math.max(1, Math.floor(diffInMilliseconds / (1000 * 60 * 60)))

  if (diffInHours < 24) {
    return `${diffInHours}h`
  }

  return `${Math.floor(diffInHours / 24)}d`
}

function getCaseListUrgencyReferenceTime(records: CaseRecord[]) {
  const latestReferenceTime = records.reduce((latest, record) => {
    const recordTime = getCaseUpdatedSortValue(record.lastUpdate)

    return recordTime > latest ? recordTime : latest
  }, 0)

  return latestReferenceTime || Date.now()
}

function isSameCaseListDay(value: string, referenceTime: number) {
  const firstDate = parseCaseListDateTime(value)
  const secondDate = new Date(referenceTime)

  if (!firstDate || !secondDate) {
    return false
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function getFallbackCaseAgeLabel(record: CaseRecord) {
  if (record.status === "new" || record.signals.waitingForFirstResponse) {
    return "1h"
  }

  const numericId = Number.parseInt(record.id.replace(/\D/g, ""), 10)

  if (Number.isNaN(numericId)) {
    return "1d"
  }

  return numericId % 2 === 0 ? `${(numericId % 8) + 1}h` : `${(numericId % 6) + 1}d`
}

function getCaseListRelativeTimeLabel(record: CaseRecord, referenceTime: number) {
  return getCaseAgeLabel(record.lastUpdate, referenceTime) ?? getFallbackCaseAgeLabel(record)
}

function getCaseListRelativeAgeHours(record: CaseRecord, referenceTime: number) {
  const relativeTimeLabel = getCaseListRelativeTimeLabel(record, referenceTime)
  const numericValue = Number.parseInt(relativeTimeLabel, 10)

  if (Number.isNaN(numericValue)) {
    return 24
  }

  return relativeTimeLabel.endsWith("d") ? numericValue * 24 : numericValue
}

function getCaseListState(record: CaseRecord, referenceTime: number): {
  baseState: CaseListBaseState
  narrativeState: string
} {
  const ageLabel = getCaseListRelativeTimeLabel(record, referenceTime)
  const ageSuffix = ` · ${ageLabel}`
  const hasAssignee = record.assignee.trim().length > 0

  if (record.status === "resolved") {
    return {
      baseState: "Resolved",
      narrativeState: `Resolved${ageSuffix}`,
    }
  }

  if (record.signals.needsAssignment) {
    if (record.signals.escalated) {
      return {
        baseState: "Needs assignment",
        narrativeState: `Escalated · needs assignment${ageSuffix}`,
      }
    }

    return {
      baseState: "Needs assignment",
      narrativeState: `Needs assignment${ageSuffix}`,
    }
  }

  if (record.signals.waitingOnCustomer) {
    return {
      baseState: "Waiting on customer",
      narrativeState: `Waiting on customer${ageSuffix}`,
    }
  }

  if (record.signals.escalated) {
    if (record.blockingReason === "awaiting_approval") {
      return {
        baseState: "Waiting on internal",
        narrativeState: `Escalated · waiting on approval${ageSuffix}`,
      }
    }

    return {
      baseState: hasAssignee ? "In progress" : "Needs assignment",
      narrativeState: hasAssignee
        ? `Escalated · in progress${ageSuffix}`
        : `Escalated · needs assignment${ageSuffix}`,
    }
  }

  if (record.signals.waitingForFirstResponse) {
    return {
      baseState: hasAssignee ? "In progress" : "Needs assignment",
      narrativeState: hasAssignee
        ? `In progress${ageSuffix}`
        : `Needs assignment${ageSuffix}`,
    }
  }

  switch (record.blockingReason) {
    case "awaiting_approval":
      return {
        baseState: "Waiting on internal",
        narrativeState: `Waiting on internal · approval${ageSuffix}`,
      }
    case "awaiting_engineering_fix":
      return {
        baseState: "In progress",
        narrativeState: `In progress · internal fix${ageSuffix}`,
      }
    default:
      break
  }

  if (hasAssignee) {
    return {
      baseState: "In progress",
      narrativeState: `In progress${ageSuffix}`,
    }
  }

  return {
    baseState: "Needs assignment",
    narrativeState: `Needs assignment${ageSuffix}`,
  }
}

function getCaseUrgencySignal(record: CaseRecord, referenceTime: number) {
  const { baseState } = getCaseListState(record, referenceTime)
  const ageHours = getCaseListRelativeAgeHours(record, referenceTime)
  const ageDays = ageHours / 24
  const targetIsToday = isSameCaseListDay(record.resolutionTarget, referenceTime)

  if (baseState === "Resolved") {
    return {
      label: "",
      className: "text-[color:var(--color-text-secondary)]",
      sortValue: getCaseUrgencySortValue(""),
    }
  }

  if (baseState === "Needs assignment") {
    if (record.signals.escalated && ageDays >= 14) {
      return {
        label: "Breached",
        className: "text-[color:var(--color-text-danger)]",
        sortValue: getCaseUrgencySortValue("Breached"),
      }
    }

    return {
      label: "Needs owner",
      className: "text-[color:var(--color-text-warning)]",
      sortValue: getCaseUrgencySortValue("Needs owner"),
    }
  }

  if ((record.signals.escalated && ageDays >= 10) || ageDays >= 14) {
    return {
      label: "Breached",
      className: "text-[color:var(--color-text-danger)]",
      sortValue: getCaseUrgencySortValue("Breached"),
    }
  }

  if (baseState === "Waiting on customer") {
    if (record.signals.escalated || targetIsToday || ageDays >= 10) {
      return {
        label: "Today",
        className: "text-[color:var(--color-text-warning)]",
        sortValue: getCaseUrgencySortValue("Today"),
      }
    }

    return {
      label: "",
      className: "text-[color:var(--color-text-secondary)]",
      sortValue: getCaseUrgencySortValue(""),
    }
  }

  if (baseState === "Waiting on internal") {
    if (record.signals.escalated || ageDays >= 5 || targetIsToday) {
      return {
        label: "4h left",
        className: "text-[color:var(--color-text-warning)]",
        sortValue: getCaseUrgencySortValue("4h left"),
      }
    }

    if (ageDays >= 2) {
      return {
        label: "Today",
        className: "text-[color:var(--color-text-warning)]",
        sortValue: getCaseUrgencySortValue("Today"),
      }
    }

    return {
      label: "",
      className: "text-[color:var(--color-text-secondary)]",
      sortValue: getCaseUrgencySortValue(""),
    }
  }

  if (record.signals.escalated || (record.breachRisk === "High" && ageDays >= 8)) {
    return {
      label: "2h left",
      className: "text-[color:var(--color-text-warning)]",
      sortValue: getCaseUrgencySortValue("2h left"),
    }
  }

  if (ageDays >= 7 || (record.breachRisk === "Medium" && ageDays >= 5)) {
    return {
      label: "4h left",
      className: "text-[color:var(--color-text-warning)]",
      sortValue: getCaseUrgencySortValue("4h left"),
    }
  }

  if (ageDays >= 3 || targetIsToday) {
    return {
      label: "Today",
      className: "text-[color:var(--color-text-warning)]",
      sortValue: getCaseUrgencySortValue("Today"),
    }
  }

  return {
    label: "",
    className: "text-[color:var(--color-text-secondary)]",
    sortValue: getCaseUrgencySortValue(""),
  }
}

function getCaseOwnershipSignal(record: CaseRecord, currentAssignee: string) {
  const trimmedAssignee = record.assignee.trim()

  if (!trimmedAssignee) {
    return {
      label: "Unassigned",
      className: "text-[color:var(--color-text-muted)]",
    }
  }

  return {
    label: isCaseAssignedToDemoUser(record, currentAssignee) ? "You" : trimmedAssignee,
    className: "text-[color:var(--color-text-secondary)]",
  }
}

function getCaseUrgencySortValue(label: string) {
  return CASE_URGENCY_SORT_RANK[label] ?? 0
}

function getCasePriorityContextLabel(priority: CaseRecord["priority"]) {
  switch (priority) {
    case "Critical":
      return "P1"
    case "High":
      return "P2"
    case "Medium":
      return "P3"
    case "Low":
      return "P4"
    case "":
    default:
      return null
  }
}

function buildAICaseInput(
  record: CaseRecord,
  sections: SectionConfig[],
  caseState: CaseState,
): AICaseInput {
  const excludedTopLevelFieldLabels = new Set(["Status", "Priority"])

  return {
    caseId: record.id,
    title: record.title,
    status: record.status,
    state: caseState,
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

function getBlockingReasonAction(reason: CaseRecord["blockingReason"]) {
  switch (reason) {
    case "awaiting_customer_reply":
      return null
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
    input.state,
    input.priority ?? "",
    ...fieldEntries.flatMap((field) => [field.label, field.value ?? ""]),
  ]
    .join(" ")
    .toLowerCase()

  const approvalRequiredValue = fieldEntries.find(
    (field) => field.label === "Approval required"
  )?.value
  const breachRiskValue = fieldEntries.find(
    (field) => field.label === "Breach risk"
  )?.value ?? ""
  const categoryValue = fieldEntries.find(
    (field) => field.label === "Category"
  )?.value ?? ""
  const productAreaValue = fieldEntries.find(
    (field) => field.label === "Product area"
  )?.value ?? ""
  const hasKeyword = (keywords: string[]) =>
    keywords.some((keyword) => combinedCaseText.includes(keyword))

  return {
    breachRisk: breachRiskValue,
    hasExternalDependency:
      approvalRequiredValue === "Yes" ||
      input.blockingReason === "awaiting_approval" ||
      input.blockingReason === "awaiting_engineering_fix",
    hasMultiEntityImpact: hasKeyword(["merged", "merge", "multi-market", "multi-region", "across all clinics", "cross-border", "subset of clinics", "entities"]),
    hasRevenueImpact:
      [input.title, categoryValue, productAreaValue].join(" ").toLowerCase()
        .includes("payment") ||
      [input.title, categoryValue, productAreaValue].join(" ").toLowerCase()
        .includes("tax") ||
      [input.title, categoryValue, productAreaValue].join(" ").toLowerCase()
        .includes("settlement") ||
      [input.title, categoryValue, productAreaValue].join(" ").toLowerCase()
        .includes("remittance"),
    isReopened: hasKeyword(["reopened", "re-opened", "reopened the"]),
  }
}

function buildFakeSignalItems(signals: AICaseSignals): string[] {
  const items: string[] = []

  if (signals.breachRisk === "High") {
    items.push("SLA risk: High")
  }

  if (signals.hasMultiEntityImpact) {
    items.push("Multi-entity impact")
  }

  if (signals.hasRevenueImpact) {
    items.push("Revenue impact")
  }

  if (signals.hasExternalDependency) {
    items.push("External dependency")
  }

  if (signals.isReopened) {
    items.push("Reopened")
  }

  return items.slice(0, 2)
}

function getCaseIntent(input: Pick<AICaseInput, "status" | "blockingReason">): AIEvidenceSignal["intent"] {
  if (input.blockingReason !== "" && input.blockingReason !== "none") {
    return "blocked"
  }

  if (input.status === "resolved") {
    return "resolved"
  }

  return "progress"
}

function isFollowUpMessage(item?: ActivityTimelineItem) {
  if (!item || typeof item.content !== "string") {
    return false
  }

  const normalizedContent = item.content.toLowerCase()

  return (
    normalizedContent.includes("following up") ||
    normalizedContent.includes("checking in")
  )
}

function normalizeInsightSentence(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ")

  if (!trimmed) {
    return ""
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function getOperationalConstraintObject(record: CaseRecord) {
  const title = record.title.toLowerCase()

  if (title.includes("invoice portal")) {
    return "invoice portal access"
  }

  if (title.includes("duplicate payment confirmation")) {
    return "duplicate payment correction"
  }

  if (title.includes("nightly sync") || record.productArea === "Tenant Data Sync") {
    return "merged clinic invoice visibility"
  }

  if (title.includes("partial invoice list") || record.productArea === "Tenant Administration") {
    return "merged-entity invoice visibility"
  }

  if (title.includes("vat labels") || record.productArea === "Invoice Export") {
    return "VAT label configuration"
  }

  if (title.includes("settlement export") || record.productArea === "Settlement Export") {
    return "settlement export adjustments"
  }

  if (title.includes("invoice reminders") || record.productArea === "Invoice Notifications") {
    return "invoice reminder timing"
  }

  if (title.includes("statement branding") || record.productArea === "Statement Delivery") {
    return "statement branding confirmation"
  }

  if (title.includes("tax rule") || record.productArea === "Tax Rules Engine") {
    return "tax-rule correction"
  }

  if (title.includes("archived remittance") || record.productArea === "Remittance Archive") {
    return "archived remittance access"
  }

  return record.productArea.trim()
    ? record.productArea.trim().toLowerCase()
    : "case resolution"
}

function getBlockingReasonConstraint(record: CaseRecord) {
  const target = getOperationalConstraintObject(record)

  switch (record.blockingReason) {
    case "awaiting_customer_reply":
      return `Waiting on customer for ${target}`
    case "awaiting_customer_validation":
      return `Waiting on customer for ${target} validation`
    case "awaiting_approval":
      return `Approval pending for ${target}`
    case "awaiting_engineering_fix":
      return `Blocked by engineering fix for ${target}`
    default:
      return ""
  }
}

function compactOperationalConstraint(value: string, record: CaseRecord) {
  const target = getOperationalConstraintObject(record)
  let normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")

  if (!normalized) {
    return ""
  }

  if (/^awaiting first response while /i.test(normalized)) {
    normalized = normalized.split(/\s+while\s+/i)[1] ?? normalized
  }

  normalized = normalized
    .replace(/^keep the rollback window open(?:\s+until.*)?$/i, `Rollback window open for ${target}`)
    .replace(/^engineering is preparing a repair for the tenant-state sync job$/i, `Repair pending for ${target}`)
    .replace(/^platform engineering is actively reviewing the visibility scopes$/i, `Waiting on platform engineering for ${target}`)
    .replace(/^identity-service monitor detected (?:a|an) /i, "")
    .replace(/^reconciliation monitor flagged (?:a|an) /i, "")
    .replace(/^tenant propagation job reported /i, "")
    .replace(/^confirmed that /i, "")
    .replace(/^we confirm whether /i, "")
    .replace(/^the /i, "")
    .replace(/\s+(?:after|because|due to)\s+.*$/i, "")
    .replace(/\s+(?:before|until)\s+.*$/i, "")
    .replace(/^VAT labels can be configured per export template$/i, `Review pending for ${target}`)

  if (/awaiting customer confirmation/i.test(normalized)) {
    return `Waiting on customer for ${target} confirmation`
  }

  if (/tenant-state mismatch/i.test(normalized)) {
    return `Blocked by tenant-state mismatch for ${target}`
  }

  if (/duplicate confirmation/i.test(normalized)) {
    return `Review pending for ${target}`
  }

  if (/confirm whether/i.test(normalized) || /under review/i.test(normalized)) {
    return `Review pending for ${target}`
  }

  if (/repair pending/i.test(normalized) || /repair /i.test(normalized)) {
    return `Repair pending for ${target}`
  }

  return normalized
}

function extractOperationalConstraint(
  record: CaseRecord,
  timelineItems: ActivityTimelineItem[],
): string {
  if (record.status === "resolved") {
    return ""
  }

  const blockingReasonConstraint = getBlockingReasonConstraint(record)

  if (blockingReasonConstraint) {
    return blockingReasonConstraint
  }

  const compactStatusReason = record.statusReason
    .trim()
    .replace(/\s+/g, " ")
    .split(/\s+(?:after|because|due to)\s+/i)[0]
    .replace(/[.!?]+$/, "")
  const normalizedStatusConstraint = compactOperationalConstraint(compactStatusReason, record)

  if (
    normalizedStatusConstraint &&
    !normalizedStatusConstraint.toLowerCase().startsWith("escalated ") &&
    !normalizedStatusConstraint.toLowerCase().startsWith("customer confirmed closure") &&
    !normalizedStatusConstraint.toLowerCase().startsWith("archived files were restored")
  ) {
    return normalizedStatusConstraint
  }

  const latestOperationalEvent = [...timelineItems]
    .reverse()
    .find((item) =>
      (item.type === "comment" ||
        item.type === "internal" ||
        item.type === "internal-note" ||
        item.type === "system" ||
        item.type === "status-change") &&
      typeof item.content === "string"
    )

  if (!latestOperationalEvent || typeof latestOperationalEvent.content !== "string") {
    return ""
  }

  const candidateSentences = latestOperationalEvent.content
    .trim()
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/[.!?]+$/, "").trim())
    .filter(Boolean)
    .filter((sentence) => !/^(assigned to|case moved|case state moved|case ownership moved|chat intake routed|escalation routing matched)\b/i.test(sentence))

  const selectedSentence = candidateSentences[0] ?? ""

  return compactOperationalConstraint(selectedSentence, record)
}

function buildSituation(
  record: CaseRecord,
  timelineItems: ActivityTimelineItem[],
): AIRecordInsight["situation"] {
  const stateBadge = getCaseListStateBadge(record.primarySignal)
  const primaryStateLabel =
    stateBadge?.label ?? getCaseStatusLabel(record.status)
  const ownershipValue = record.assignee.trim() && record.queue.trim()
    ? `${record.assignee} · ${record.queue}`
    : record.queue.trim()
      ? record.queue
      : record.assignee.trim()
        ? record.assignee
        : "Unassigned"
  const operationalConstraint = extractOperationalConstraint(record, timelineItems)
  const badge = stateBadge ?? {
    label: primaryStateLabel,
    tone: "neutral" as const,
    emphasis: "subtle" as const,
  }

  return [{
    badge,
    ownership: ownershipValue,
    condition: operationalConstraint || undefined,
  }]
}

function splitInsightSentences(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? []
}

function containsSummaryKeyword(value: string, keywords: string[]) {
  const normalizedValue = value.toLowerCase()

  return keywords.some((keyword) => normalizedValue.includes(keyword))
}

function isIssueSentence(value: string) {
  return containsSummaryKeyword(value, [
    "cannot",
    "can't",
    "unable",
    "still",
    "missing",
    "delay",
    "delaying",
    "duplicate",
    "mismatch",
    "excluding",
    "exclude",
    "wrong",
    "partial",
    "question",
    "rename",
    "confirm whether",
    "look paid twice",
    "access",
    "sign in",
    "invoice",
  ])
}

function isImpactSentence(value: string) {
  return containsSummaryKeyword(value, [
    "blocking",
    "affect",
    "affects",
    "finance team",
    "all clinics",
    "across",
    "today",
    "manually",
    "partial",
    "same-day",
    "need executive visibility",
    "sign this off",
  ])
}

function isResolutionOnlySentence(value: string) {
  return containsSummaryKeyword(value, [
    "can close",
    "close the incident",
    "everything we need",
    "can sign in again",
    "access was restored",
    "invoices are visible",
    "thanks for the summary",
    "confirmed access was restored",
  ])
}

function normalizeSummarySentence(
  value: string,
  type: ActivityTimelineItem["type"],
): string {
  let normalizedValue = value.trim().replace(/\s+/g, " ")

  if (!normalizedValue) {
    return ""
  }

  if (type === "incoming") {
    normalizedValue = normalizedValue
      .replace(/^hi[, ]*/i, "")
      .replace(/\bwe're\b/ig, "Customer is")
      .replace(/\bwe are\b/ig, "Customer is")
      .replace(/\bwe still need to\b/ig, "Customer still needs to")
      .replace(/\bwe need to\b/ig, "Customer needs to")
      .replace(/\bwe still\b/ig, "Customer still")
      .replace(/\bwe\b/ig, "Customer")
      .replace(/\bour\b/ig, "their")

    if (normalizedValue.endsWith("?")) {
      return ""
    }
  } else {
    normalizedValue = normalizedValue
      .replace(/^confirmed that\b/i, "")
      .replace(/^internal note added to\b/i, "")
      .replace(/^case moved from .* after\b/i, "")
      .replace(/^routing engine\b/i, "The routing engine")
      .trim()
  }

  return normalizeInsightSentence(normalizedValue)
}

function buildFallbackCaseSummary(record: CaseRecord): string[] {
  const descriptionSentences = splitInsightSentences(record.description)

  if (descriptionSentences.length > 0) {
    return descriptionSentences
      .map((sentence) => normalizeInsightSentence(sentence))
      .filter(Boolean)
      .slice(0, 2)
  }

  const fallbackSummary = [normalizeInsightSentence(record.title)]
  const categoryContext = record.category.trim()
    ? normalizeInsightSentence(`Context: ${record.category}.`)
    : ""

  if (categoryContext) {
    fallbackSummary.push(categoryContext)
  }

  return fallbackSummary.filter(Boolean).slice(0, 2)
}

function findLatestCaseSummarySource(timelineItems: ActivityTimelineItem[]) {
  const latestCustomerIssue = [...timelineItems]
    .reverse()
    .find((item) =>
      item.type === "incoming" &&
      typeof item.content === "string" &&
      splitInsightSentences(item.content).some(
        (sentence) => isIssueSentence(sentence) && !isResolutionOnlySentence(sentence),
      )
    )

  if (latestCustomerIssue) {
    return latestCustomerIssue
  }

  const latestInternalNote = [...timelineItems]
    .reverse()
    .find((item) =>
      (item.type === "comment" || item.type === "internal" || item.type === "internal-note") &&
      typeof item.content === "string",
    )

  if (latestInternalNote) {
    return latestInternalNote
  }

  return [...timelineItems]
    .reverse()
    .find((item) =>
      (item.type === "system" || item.type === "status-change") &&
      typeof item.content === "string",
    )
}

function buildCaseSummary(record: CaseRecord, timelineItems: ActivityTimelineItem[]): string[] {
  const sourceItem = findLatestCaseSummarySource(timelineItems)
  const fallbackSummary = buildFallbackCaseSummary(record)

  if (!sourceItem || typeof sourceItem.content !== "string") {
    return fallbackSummary
  }

  const sourceSentences = splitInsightSentences(sourceItem.content)
  const descriptionSentences = splitInsightSentences(record.description)
  const rawProblemSentence =
    sourceSentences.find(
      (sentence) => isIssueSentence(sentence) && !isResolutionOnlySentence(sentence),
    ) ??
    sourceSentences[0] ??
    descriptionSentences[0] ??
    record.title

  const rawImpactSentence =
    sourceSentences.find(
      (sentence) =>
        sentence !== rawProblemSentence &&
        isImpactSentence(sentence) &&
        !isResolutionOnlySentence(sentence),
    ) ??
    descriptionSentences.find(
      (sentence) =>
        sentence !== rawProblemSentence &&
        isImpactSentence(sentence),
    )

  const normalizedProblemSentence =
    normalizeSummarySentence(rawProblemSentence, sourceItem.type) ||
    fallbackSummary[0] ||
    normalizeInsightSentence(record.title)

  const normalizedImpactSentence = rawImpactSentence
    ? normalizeSummarySentence(rawImpactSentence, sourceItem.type) ||
      normalizeInsightSentence(rawImpactSentence)
    : ""

  const summary = [
    normalizedProblemSentence,
    normalizedImpactSentence,
  ].filter(
    (sentence, index, sentences) =>
      sentence &&
      sentences.findIndex(
        (candidate) => candidate.toLowerCase() === sentence.toLowerCase(),
      ) === index,
  )

  if (summary.length < 2 && fallbackSummary[1]) {
    summary.push(fallbackSummary[1])
  }

  return summary.slice(0, 3)
}

function getTimelineItemTimeValue(item?: ActivityTimelineItem) {
  if (!item?.timestampDateTime) {
    return Number.NEGATIVE_INFINITY
  }

  const timeValue = new Date(item.timestampDateTime).getTime()

  return Number.isNaN(timeValue) ? Number.NEGATIVE_INFINITY : timeValue
}

function hasUnansweredCustomerMessage(
  latestCustomerMessage?: ActivityTimelineItem,
  latestAgentMessage?: ActivityTimelineItem,
) {
  return getTimelineItemTimeValue(latestCustomerMessage) >
    getTimelineItemTimeValue(latestAgentMessage)
}

function findLatestOutboundAwaitingCustomerResponse(
  timelineItems: ActivityTimelineItem[],
  latestCustomerMessage?: ActivityTimelineItem,
) {
  const latestCustomerTime = getTimelineItemTimeValue(latestCustomerMessage)

  return [...timelineItems]
    .reverse()
    .find(
      (item) =>
        item.type === "outgoing" &&
        getTimelineItemTimeValue(item) > latestCustomerTime &&
        isCustomerResponseRequest(item),
    )
}

function deriveCaseState(
  record: CaseRecord,
): CaseState {
  switch (record.primarySignal) {
    case "escalated":
      return "Escalated"
    case "needs_assignment":
      return "Needs assignment"
    case "waiting_for_first_response":
      return "Waiting for first response"
    case "waiting_on_customer":
      return "Waiting on customer"
    default:
      break
  }

  if (
    record.blockingReason === "awaiting_approval" ||
    record.blockingReason === "awaiting_engineering_fix"
  ) {
    return "Waiting for internal review"
  }

  if (record.statusReason.trim().toLowerCase().includes("ready to resolve")) {
    return "Ready to resolve"
  }

  if (record.status === "new") {
    return "Waiting for first response"
  }

  return "In investigation"
}

function buildEscalationTimelineItem(reason: string, note: string): ActivityTimelineItem {
  const createdAt = new Date()
  const normalizedNote = note.trim()
  const content = normalizedNote
    ? `Case state set to Escalated. Reason: ${reason}. Note: ${normalizedNote}`
    : `Case state set to Escalated. Reason: ${reason}.`

  return {
    id: `activity-escalation-${createdAt.getTime()}`,
    timestamp: createdAt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    timestampDateTime: createdAt.toISOString(),
    type: "status-change",
    typeLabel: "State change",
    actor: "You",
    subtype: "Support operations",
    organization: "VivaLaVita",
    content,
  }
}

function buildReassignmentTimelineItem(
  assignee: string,
  team: string,
  note: string,
): ActivityTimelineItem {
  const createdAt = new Date()
  const normalizedAssignee = assignee.trim()
  const normalizedTeam = team.trim()
  const normalizedNote = note.trim()
  const ownershipSummary = [
    normalizedAssignee ? `Assignee: ${normalizedAssignee}` : "",
    normalizedTeam ? `Team: ${normalizedTeam}` : "",
  ].filter(Boolean).join(". ")
  const content = normalizedNote
    ? `Case reassigned. ${ownershipSummary}. Note: ${normalizedNote}`
    : `Case reassigned. ${ownershipSummary}.`

  return {
    id: `activity-reassignment-${createdAt.getTime()}`,
    timestamp: createdAt.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    timestampDateTime: createdAt.toISOString(),
    type: "status-change",
    typeLabel: "Ownership change",
    actor: "You",
    subtype: "Support operations",
    organization: "VivaLaVita",
    content,
  }
}

function buildFakeActions(
  record: CaseRecord,
  evidenceSignal: AIEvidenceSignal,
  caseState: CaseState,
  timelineItems: ActivityTimelineItem[],
): {
  label: string
  referenceId?: string
  reason?: string
}[] {
  const actions: { label: string; referenceId?: string; reason?: string }[] = []
  const productAreaLabel = record.productArea.trim() || "current scope"
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
  const latestOutboundAwaitingCustomerResponse =
    findLatestOutboundAwaitingCustomerResponse(
      timelineItems,
      latestCustomerMessage,
    )
  const customerIsLastSpeaker = hasUnansweredCustomerMessage(
    latestCustomerMessage,
    latestAgentMessage,
  )
  const pushAction = (
    label: string,
    referenceId = actionReferenceId,
    reason?: string,
  ) => {
    if (actions.some((action) => action.label === label)) {
      return
    }

    actions.push({ label, referenceId, reason })
  }

  if (evidenceSignal.intent === "resolved" || record.status === "resolved") {
    if (selectedEventContent.includes("close") || selectedEventContent.includes("resolved")) {
      pushAction("Send closure confirmation", actionReferenceId, `Close the loop on ${productAreaLabel}.`)
    }

    pushAction("Document the resolution summary", actionReferenceId, "Capture the final customer-facing outcome.")
    return actions.slice(0, 2)
  }

  switch (caseState) {
    case "Escalated":
      if (blockingReasonAction) {
        pushAction(blockingReasonAction, actionReferenceId, `This is blocking progress for ${productAreaLabel}.`)
      }

      if (evidenceSignal.blockingReason === "awaiting_approval") {
        pushAction("Route case to approval workflow", actionReferenceId, `Approval is required before changing ${productAreaLabel}.`)
        pushAction("Notify stakeholder after routing", actionReferenceId, "Confirm the case is actively moving through escalation.")
      } else if (evidenceSignal.blockingReason === "awaiting_engineering_fix") {
        pushAction("Capture expected repair timing", actionReferenceId, `The next update depends on the ${productAreaLabel} repair window.`)
        pushAction("Send stakeholder update after timing is confirmed", actionReferenceId, "Share the expected next milestone once it is firm.")
      } else {
        pushAction("Confirm the escalation owner", actionReferenceId, "Ensure there is one accountable escalation lead.")
        pushAction("Document the next escalation step", actionReferenceId, "Make the immediate handoff or dependency explicit.")
      }
      break
    case "Waiting on customer": {
      const hasRecentFollowUp = isFollowUpMessage(
        latestOutboundAwaitingCustomerResponse,
      )

      if (latestOutboundAwaitingCustomerResponse && !hasRecentFollowUp) {
        pushAction(
          "Follow up with customer",
          latestOutboundAwaitingCustomerResponse.id,
          `Still waiting on customer confirmation for ${productAreaLabel}.`,
        )
      }

      pushAction("Confirm the exact validation still needed", actionReferenceId, "Name the customer response needed to move the case forward.")
      pushAction("Update the internal note with the pending customer dependency", actionReferenceId, "Keep the blocked condition explicit for the next owner.")
      break
    }
    case "Waiting for internal review":
      if (blockingReasonAction) {
        pushAction(blockingReasonAction, actionReferenceId, `This is the active blocker for ${productAreaLabel}.`)
      }

      if (evidenceSignal.blockingReason === "awaiting_approval") {
        pushAction("Route case to approval workflow", actionReferenceId, `Approval is required before proceeding with ${productAreaLabel}.`)
        pushAction("Notify stakeholder after routing", actionReferenceId, "Confirm the approval path and next checkpoint.")
      } else if (evidenceSignal.blockingReason === "awaiting_engineering_fix") {
        pushAction("Capture expected repair timing", actionReferenceId, `Engineering timing is needed before the next ${productAreaLabel} update.`)
        pushAction("Send customer update after timing is confirmed", actionReferenceId, "Translate the internal dependency into a clear external update.")
      } else {
        pushAction("Record the review outcome in the internal note", actionReferenceId, "Preserve the decision path for the next handoff.")
        pushAction("Prepare the next customer update", actionReferenceId, `Keep the customer informed about the ${productAreaLabel} review.`)
      }
      break
    case "Waiting for first response":
      if (customerIsLastSpeaker && latestCustomerMessage) {
        pushAction("Reply to customer", latestCustomerMessage.id, `Start the case with the first response on ${productAreaLabel}.`)
      }

      pushAction("Confirm the missing details needed to start work", actionReferenceId, "Collect the minimum detail needed to route or resolve the case.")
      pushAction("Set the next owner after the first response", actionReferenceId, "Make ownership explicit once the response is sent.")
      break
    case "Needs assignment":
      pushAction("Assign the case to the right team", actionReferenceId, `Route ${productAreaLabel} to the team that can act on it.`)
      pushAction("Set the initial assignee", actionReferenceId, "Make one operator accountable for the next step.")
      pushAction("Send the first response once ownership is set", actionReferenceId, "Avoid leaving the case unacknowledged after routing.")
      break
    case "In investigation":
      pushAction("Confirm the investigation owner", actionReferenceId, `Keep ownership clear while ${productAreaLabel} is under investigation.`)
      pushAction("Document the current working hypothesis", actionReferenceId, "Capture the leading explanation before the next handoff.")
      pushAction("Prepare the next customer update", actionReferenceId, "Turn the current finding into a concise external update.")
      break
    default:
      if (customerIsLastSpeaker && latestCustomerMessage) {
        pushAction("Reply to customer", latestCustomerMessage.id, `Respond with the next step for ${productAreaLabel}.`)
      }

      pushAction("Document the current blocker in the internal note", actionReferenceId, "Make the active dependency easy to scan.")
      pushAction("Prepare the next customer update", actionReferenceId, "Keep the next external step ready.")
      break
  }

  return actions.slice(0, 3)
}

function selectReferenceItems(
  input: AICaseInput,
  caseState: CaseState,
  timelineItems: ActivityTimelineItem[],
): ActivityTimelineItem[] {
  const references: ActivityTimelineItem[] = []
  const normalizedTimelineItems = [...timelineItems].reverse()
  const caseIntent = getCaseIntent(input)

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

  const findLatestOutboundCustomerRequest = () =>
    findLatestTimelineItem((item) => item.type === "outgoing" && isCustomerResponseRequest(item))

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

  if (caseState === "Waiting on customer") {
    addReference(findLatestOutboundCustomerRequest())
    addReference(findLatestCustomerMessage())
  } else if (caseIntent === "blocked") {
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

function buildTimelineTraceLabel(item: ActivityTimelineItem) {
  const content = typeof item.content === "string"
    ? item.content.trim().replace(/\s+/g, " ")
    : ""
  const shortContent =
    content.length > 80 ? `${content.slice(0, 77).trimEnd()}...` : content

  switch (item.type) {
    case "incoming":
      return `Customer: ${shortContent}`
    case "outgoing":
      return `Agent: ${shortContent}`
    case "comment":
    case "internal":
    case "internal-note":
      return `Internal note: ${shortContent}`
    case "status-change":
      return `State change: ${shortContent}`
    case "system":
    default:
      return `System: ${shortContent}`
  }
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
  record: CaseRecord,
  input: AICaseInput,
  _aiVersion: number,
  caseState: CaseState,
  timelineItems: ActivityTimelineItem[],
): AIRecordInsight {
  const signals = detectAICaseSignals(input)
  const referenceItems = selectReferenceItems(input, caseState, timelineItems)
  const evidenceSignal: AIEvidenceSignal = {
    intent: getCaseIntent(input),
    blockingReason: input.blockingReason ?? "",
    selectedEvent: referenceItems[0],
  }

  return {
    situation: buildSituation(record, timelineItems),
    caseSummary: buildCaseSummary(record, timelineItems),
    signals: buildFakeSignalItems(signals),
    actions: buildFakeActions(record, evidenceSignal, caseState, timelineItems),
    basedOn: referenceItems.map(buildTimelineTraceLabel),
  }
}

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

function getCaseListStateBadge(primarySignal: CasePrimarySignal) {
  switch (primarySignal) {
    case "escalated":
      return {
        label: "Escalated",
        tone: "danger" as const,
        emphasis: "subtle" as const,
      }
    case "waiting_on_customer":
      return {
        label: "Waiting on customer",
        tone: "warning" as const,
        emphasis: "subtle" as const,
      }
    case "waiting_for_first_response":
      return {
        label: "Waiting for first response",
        tone: "info" as const,
        emphasis: "subtle" as const,
      }
    case "needs_assignment":
      return {
        label: "Needs assignment",
        tone: "neutral" as const,
        emphasis: "subtle" as const,
      }
    case null:
    default:
      return null
  }
}

type CaseSignalFilterId =
  | "waiting_on_customer"
  | "escalated"
  | "needs_assignment"
  | "waiting_for_first_response"

type CaseSortColumn = "updated" | "priority"
type CaseSortDirection = "asc" | "desc"
type CaseListBaseState =
  | "Waiting on customer"
  | "In progress"
  | "Waiting on internal"
  | "Needs assignment"
  | "Resolved"

const DEMO_CURRENT_ASSIGNEE = "Lucia Fernandez"
const CASE_URGENCY_SORT_RANK: Record<string, number> = {
  Breached: 5,
  "Needs owner": 4,
  "2h left": 3,
  "4h left": 2,
  Today: 1,
  "": 0,
}

const CASE_SIGNAL_FILTERS: {
  id: CaseSignalFilterId
  label: string
}[] = [
  {
    id: "waiting_on_customer",
    label: "Waiting on customer",
  },
  {
    id: "escalated",
    label: "Escalated",
  },
  {
    id: "needs_assignment",
    label: "Needs assignment",
  },
]

const CASE_SIGNAL_FILTER_TO_KEY: Record<
  CaseSignalFilterId,
  keyof CaseRecord["signals"]
> = {
  waiting_on_customer: "waitingOnCustomer",
  escalated: "escalated",
  needs_assignment: "needsAssignment",
  waiting_for_first_response: "waitingForFirstResponse",
}

const CASES_LIST_GRID_COLUMNS =
  "md:grid-cols-[minmax(0,2.95fr)_minmax(0,2.05fr)_minmax(6rem,0.72fr)_minmax(8.25rem,0.9fr)_1.5rem]"

function isCaseUnassigned(record: CaseRecord) {
  return record.signals.needsAssignment
}

function isCaseAssignedToDemoUser(record: CaseRecord, assigneeName: string) {
  return record.assignee.trim().toLowerCase() === assigneeName.trim().toLowerCase()
}

function matchesCaseSignalFilter(record: CaseRecord, filterId: CaseSignalFilterId) {
  const signalKey = CASE_SIGNAL_FILTER_TO_KEY[filterId]

  return signalKey === "needsAssignment"
    ? isCaseUnassigned(record)
    : record.signals[signalKey]
}

function getCaseUpdatedSortValue(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return 0
  }

  const [datePart, timePart] = trimmed.split(" ")

  if (!datePart) {
    return 0
  }

  const normalizedTime =
    timePart && /^\d{2}:\d{2}$/.test(timePart) ? timePart : "00:00"
  const parsedDate = new Date(`${datePart}T${normalizedTime}:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return 0
  }

  return parsedDate.getTime()
}

function compareCasesByUpdatedDescending(a: CaseRecord, b: CaseRecord) {
  return getCaseUpdatedSortValue(b.lastUpdate) - getCaseUpdatedSortValue(a.lastUpdate)
}

function compareCasesByPriority(
  a: CaseRecord,
  b: CaseRecord,
  direction: CaseSortDirection,
  referenceTime: number
) {
  const priorityDiff =
    getCaseUrgencySignal(a, referenceTime).sortValue -
    getCaseUrgencySignal(b, referenceTime).sortValue

  if (priorityDiff !== 0) {
    return direction === "desc" ? -priorityDiff : priorityDiff
  }

  return compareCasesByUpdatedDescending(a, b)
}

function formatCaseTimestamp(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const formattedParts = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  )

  return `${formattedParts.year}-${formattedParts.month}-${formattedParts.day} ${formattedParts.hour}:${formattedParts.minute} CET`
}

function TableChevronIcon({
  direction,
  className = "",
}: {
  direction: "up" | "down" | "right"
  className?: string
}) {
  const directionClassName =
    direction === "up"
      ? "rotate-180"
      : direction === "right"
        ? "-rotate-90"
        : ""

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className={`h-[0.75rem] w-[0.75rem] ${directionClassName} ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4.25 6 7.75 9.5 4.25" />
    </svg>
  )
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean
  direction: CaseSortDirection
}) {
  if (active) {
    return (
      <span className="inline-flex h-[0.875rem] w-[0.875rem] items-center justify-center text-[color:var(--color-text-muted)]">
        <TableChevronIcon direction={direction === "asc" ? "up" : "down"} />
      </span>
    )
  }

  return (
    <span className="inline-flex h-[0.875rem] w-[0.875rem] flex-col items-center justify-center text-[color:var(--color-text-muted)] opacity-60">
      <TableChevronIcon direction="up" className="h-[0.5rem] w-[0.5rem]" />
      <TableChevronIcon direction="down" className="-mt-[0.1875rem] h-[0.5rem] w-[0.5rem]" />
    </span>
  )
}

function getNextCaseId(cases: CaseRecord[]) {
  const maxCaseNumber = cases.reduce((currentMax, record) => {
    const nextNumber = Number.parseInt(record.id.replace("CASE-", ""), 10)

    if (Number.isNaN(nextNumber)) {
      return currentMax
    }

    return Math.max(currentMax, nextNumber)
  }, 0)

  return `CASE-${String(maxCaseNumber + 1).padStart(5, "0")}`
}

function buildNewCaseRecord(): CaseRecord {
  const signals = {
    ...EMPTY_CASE_SIGNALS,
    waitingForFirstResponse: true,
  }

  return {
    ...INITIAL_CASE_RECORD,
    id: "",
    title: "Customer cannot update invoice recipient after clinic transfer",
    status: "new",
    signals,
    primarySignal: getPrimarySignal(signals),
    blockingReason: "",
    priority: "Medium",
    assignee: "Lucia Fernandez",
    queue: "General Support",
    statusReason: "",
    onHoldUntil: "",
    channel: "Email",
    severity: "Minor",
    productArea: "",
    category: "",
    region: "Southern Europe",
    source: "Support intake",
    timelinePolicy: "Standard Support",
    responseTarget: "",
    resolutionTarget: "",
    firstResponse: "",
    lastUpdate: "",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: INITIAL_CASE_RECORD.customer,
    contact: "",
    email: "",
    accountTier: "",
    contractType: "",
    routingGroup: "General Support",
    approvalRequired: "No",
    approvalReason: "",
    description: "",
    internalNotes: "",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "",
  }
}

function removeRedundantStatusOwnershipFields(
  sections: SectionConfig[],
  record: CaseRecord,
) {
  if (record.id !== INITIAL_CASE_RECORD.id) {
    return sections
  }

  return sections.map((section) => {
    if (section.id !== "status-ownership") {
      return section
    }

    return {
      ...section,
      fields: section.fields.filter(
        (field) => field.key !== "blockingReason" && field.key !== "statusReason",
      ),
    }
  })
}

export function CaseScreenPage() {
  const [recordTab, setRecordTab] = useState<"details" | "activity">("details")
  const [screenView, setScreenView] = useState<"list" | "record">("list")
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(true)
  const [cases, setCases] = useState(EXAMPLE_CASES)
  const [selectedCaseId, setSelectedCaseId] = useState(EXAMPLE_CASES[0]?.id ?? "")
  const [draftRecord, setDraftRecord] = useState(EXAMPLE_CASES[0] ?? INITIAL_CASE_RECORD)
  const [caseSearch, setCaseSearch] = useState("")
  const [caseStatusFilter, setCaseStatusFilter] = useState<CaseRecord["status"] | null>(null)
  const [activeCaseSignalFilters, setActiveCaseSignalFilters] = useState<CaseSignalFilterId[]>([])
  const [showAssignedToMeOnly, setShowAssignedToMeOnly] = useState(false)
  const [caseSort, setCaseSort] = useState<{
    column: CaseSortColumn
    direction: CaseSortDirection
  }>({
    column: "updated",
    direction: "desc",
  })
  const [createCaseBaseline, setCreateCaseBaseline] = useState<CaseRecord | null>(null)
  const [aiVersion, setAiVersion] = useState(1)
  const [aiUpdatedAt, setAiUpdatedAt] = useState(() => Date.now())
  const [pendingTimelineReferenceId, setPendingTimelineReferenceId] = useState<string | null>(null)
  const [highlightedTimelineItemId, setHighlightedTimelineItemId] = useState<string | null>(null)
  const [activeSuggestedAction, setActiveSuggestedAction] =
    useState<ActiveSuggestedAction | null>(null)
  const [appendedTimelineItemsByCaseId, setAppendedTimelineItemsByCaseId] = useState<
    Record<string, ActivityTimelineItem[]>
  >({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [responseTargetEdited, setResponseTargetEdited] = useState(false)
  const [resolutionTargetEdited, setResolutionTargetEdited] = useState(false)
  const [touched, setTouched] = useState({
    title: false,
    priority: false,
    customer: false,
  })
  const [saveAttempted, setSaveAttempted] = useState(false)
  const isCreatingCase = createCaseBaseline !== null
  const selectedCase =
    cases.find((record) => record.id === selectedCaseId) ?? null
  const savedRecord =
    (isCreatingCase ? createCaseBaseline : selectedCase) ??
    cases[0] ??
    INITIAL_CASE_RECORD

  const hasUnsavedChanges =
    JSON.stringify(isCreatingCase ? createCaseBaseline : savedRecord) !==
    JSON.stringify(draftRecord)

  const titleError = draftRecord.title.trim() ? undefined : "Title is required"
  const customerError = draftRecord.customer.trim() ? undefined : "Customer is required"
  const priorityError =
    isCreatingCase || draftRecord.priority ? undefined : "Priority is required"

  const visibleTitleError =
    touched.title || saveAttempted ? titleError : undefined
  const visibleCustomerError =
    touched.customer || saveAttempted ? customerError : undefined
  const visiblePriorityError =
    touched.priority || saveAttempted ? priorityError : undefined

  const viewRecordSections = removeRedundantStatusOwnershipFields(
    getCaseRecordSections(savedRecord),
    savedRecord,
  )
  const baseEditRecordSections = removeRedundantStatusOwnershipFields(getCaseRecordSections(draftRecord, {
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
  }), draftRecord)
  const editRecordSections = baseEditRecordSections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => {
      if (field.key === "customer") {
        return {
          ...field,
          required: isCreatingCase,
          error: visibleCustomerError,
          onBlur: isCreatingCase ? () => markTouched("customer") : field.onBlur,
        }
      }

      if (field.key === "priority" && isCreatingCase) {
        return {
          ...field,
          required: false,
          error: undefined,
          onBlur: undefined,
        }
      }

      return field
    }),
  }))
  const aiSourceSections = viewRecordSections.filter((section) =>
    section.id === "status-ownership" || section.id === "classification"
  )
  const baseSelectedActivityTimelineItems =
    activityTimelineItemsByCaseId[selectedCaseId] ?? activityTimelineItems
  const selectedActivityTimelineItems = [
    ...baseSelectedActivityTimelineItems,
    ...(appendedTimelineItemsByCaseId[selectedCaseId] ?? []),
  ]
  const caseState = deriveCaseState(savedRecord)
  const showEscalateAction =
    savedRecord.status !== "resolved" && !savedRecord.signals.escalated
  const aiCaseInput = buildAICaseInput(savedRecord, aiSourceSections, caseState)
  const aiRecordInsight = getFakeAIRecordInsight(
    savedRecord,
    aiCaseInput,
    aiVersion,
    caseState,
    selectedActivityTimelineItems
  )
  const aiUpdatedLabel = formatAIUpdatedLabel(aiUpdatedAt)
  const caseListSummaryItems = STATUS_OPTIONS.map((option) => ({
    value: option.value as CaseRecord["status"],
    label: option.label,
    count: cases.filter((record) => record.status === option.value).length,
  }))
  const trimmedCaseSearch = caseSearch.trim()
  const activeCaseFilters = [
    ...(trimmedCaseSearch !== ""
      ? [
          {
            id: "search" as const,
            label: `Search: ${trimmedCaseSearch}`,
            clear: () => setCaseSearch(""),
          },
        ]
      : []),
    ...(showAssignedToMeOnly
      ? [
          {
            id: "assigned-to-me" as const,
            label: "Assigned to me",
            clear: () => setShowAssignedToMeOnly(false),
          },
        ]
      : []),
  ]
  const hasActiveCaseSignalFilters = activeCaseSignalFilters.length > 0
  const hasActiveCaseListFilters =
    activeCaseFilters.length > 0 ||
    caseStatusFilter !== null ||
    hasActiveCaseSignalFilters
  const showClearAllCaseFilters = hasActiveCaseListFilters
  const filteredCases = cases.filter((record) => {
    const matchesSearch =
      trimmedCaseSearch === "" ||
      [record.id, record.title, record.customer, record.assignee]
        .join(" ")
        .toLowerCase()
        .includes(trimmedCaseSearch.toLowerCase())

    const matchesStatus =
      caseStatusFilter === null || record.status === caseStatusFilter

    const matchesSignals = activeCaseSignalFilters.every((filterId) =>
      matchesCaseSignalFilter(record, filterId)
    )

    const matchesAssignedToMe =
      !showAssignedToMeOnly || isCaseAssignedToDemoUser(record, DEMO_CURRENT_ASSIGNEE)

    return matchesSearch && matchesStatus && matchesSignals && matchesAssignedToMe
  })
  const caseListUrgencyReferenceTime = getCaseListUrgencyReferenceTime(cases)
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (caseSort.column === "priority") {
      return compareCasesByPriority(a, b, caseSort.direction, caseListUrgencyReferenceTime)
    }

    const updatedDiff = compareCasesByUpdatedDescending(a, b)

    return caseSort.direction === "desc" ? updatedDiff : -updatedDiff
  })
  const caseResultsLabel = hasActiveCaseListFilters
    ? `${sortedCases.length} ${sortedCases.length === 1 ? "result" : "results"}`
    : `${cases.length} ${cases.length === 1 ? "case" : "cases"}`

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

  useEffect(() => {
    if (!toastMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null)
    }, 2400)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  function resetEditState(nextDraft: CaseRecord) {
    setDraftRecord(nextDraft)
    setResponseTargetEdited(false)
    setResolutionTargetEdited(false)
    setTouched({
      title: false,
      priority: false,
      customer: false,
    })
    setSaveAttempted(false)
  }

  function refreshAIInsights() {
    setAiVersion((current) => current + 1)
    setAiUpdatedAt(() => Date.now())
  }

  function enterEditMode() {
    resetEditState(savedRecord)
    setRecordTab("details")
    setIsAIDrawerOpen(false)
    setActiveSuggestedAction(null)
    setCreateCaseBaseline(null)
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
    setIsAIDrawerOpen(true)
    setActiveSuggestedAction(null)
    setCreateCaseBaseline(null)
    setMode("view")
    setScreenView("record")
    refreshAIInsights()
  }

  function handleCreateCase() {
    const nextCase = buildNewCaseRecord()

    setSelectedCaseId("")
    setCreateCaseBaseline(nextCase)
    resetEditState(nextCase)
    setRecordTab("details")
    setIsAIDrawerOpen(false)
    setActiveSuggestedAction(null)
    setMode("edit")
    setScreenView("record")
  }

  function markTouched(field: "title" | "priority" | "customer") {
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
    setDraftRecord((current) => {
      const nextSignals =
        nextStatus === "resolved" ? EMPTY_CASE_SIGNALS : current.signals

      return {
        ...current,
        status: nextStatus,
        signals: nextSignals,
        primarySignal: getPrimarySignal(nextSignals),
      }
    })
  }

  function handleChannelChange(nextChannel: CaseRecord["channel"]) {
    updateDraft("channel", nextChannel)
  }

  function handleCaseSort(column: CaseSortColumn) {
    setCaseSort((current) => {
      if (current.column === column) {
        return {
          column,
          direction: current.direction === "desc" ? "asc" : "desc",
        }
      }

      return {
        column,
        direction: "desc",
      }
    })
  }

  function handleToggleCaseSignalFilter(filterId: CaseSignalFilterId) {
    setActiveCaseSignalFilters((current) => (
      current.includes(filterId)
        ? current.filter((item) => item !== filterId)
        : [...current, filterId]
    ))
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

    setCreateCaseBaseline(null)
    setActiveSuggestedAction(null)
    setScreenView("list")
  }

  function handleAppendTimelineItem(item: ActivityTimelineItem) {
    if (!selectedCaseId) {
      return
    }

    setAppendedTimelineItemsByCaseId((current) => ({
      ...current,
      [selectedCaseId]: [...(current[selectedCaseId] ?? []), item],
    }))

    if (item.type !== "outgoing") {
      return
    }

    setPendingTimelineReferenceId(item.id)

    const nextLastUpdate =
      typeof item.timestamp === "string" && item.timestamp.trim()
        ? item.timestamp
        : new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })

    const updateRecordAfterReply = (record: CaseRecord) => {
      const nextSignals = {
        ...record.signals,
        waitingOnCustomer: true,
        escalated: false,
        needsAssignment: false,
        waitingForFirstResponse: false,
      }

      return {
        ...record,
        situation: "Waiting on customer" as const,
        nextStep: "Wait for customer confirmation",
        reason: "Awaiting customer confirmation after the latest reply.",
        statusReason: "Waiting on customer confirmation after the latest reply.",
        blockingReason: "awaiting_customer_reply" as const,
        signals: nextSignals,
        primarySignal: getPrimarySignal(nextSignals),
        lastUpdate: nextLastUpdate,
      }
    }

    setCases((currentCases) =>
      currentCases.map((record) => (
        record.id === selectedCaseId
          ? updateRecordAfterReply(record)
          : record
      ))
    )
    setDraftRecord((current) => (
      current.id === selectedCaseId
        ? updateRecordAfterReply(current)
        : current
    ))
  }

  function handleEscalateCase(reason: string, note: string) {
    if (!selectedCaseId || savedRecord.status === "resolved" || savedRecord.signals.escalated) {
      return
    }

    const trimmedReason = reason.trim()
    const trimmedNote = note.trim()

    if (!trimmedReason) {
      return
    }

    const nextEscalationItem = buildEscalationTimelineItem(trimmedReason, trimmedNote)

    setCases((currentCases) =>
      currentCases.map((record) => (
        record.id === selectedCaseId
          ? (() => {
              const nextSignals = {
                ...record.signals,
                escalated: true,
              }

              return {
                ...record,
                signals: nextSignals,
                primarySignal: getPrimarySignal(nextSignals),
              }
            })()
          : record
      ))
    )
    setDraftRecord((current) => (
      current.id === selectedCaseId
        ? (() => {
            const nextSignals = {
              ...current.signals,
              escalated: true,
            }

            return {
              ...current,
              signals: nextSignals,
              primarySignal: getPrimarySignal(nextSignals),
            }
          })()
        : current
    ))
    handleAppendTimelineItem(nextEscalationItem)
    setRecordTab("activity")
    setPendingTimelineReferenceId(nextEscalationItem.id)
    setToastMessage("Case escalated")
  }

  function handleReassignCase(assignee: string, team: string, note: string) {
    if (!selectedCaseId) {
      return
    }

    const trimmedAssignee = assignee.trim()
    const trimmedTeam = team.trim()
    const trimmedNote = note.trim()

    if (!trimmedAssignee && !trimmedTeam) {
      return
    }

    const nextReassignmentItem = buildReassignmentTimelineItem(
      trimmedAssignee,
      trimmedTeam,
      trimmedNote,
    )

    setCases((currentCases) =>
      currentCases.map((record) => (
        record.id === selectedCaseId
          ? (() => {
              const nextAssignee = trimmedAssignee || record.assignee
              const nextSignals = {
                ...record.signals,
                needsAssignment:
                  nextAssignee.trim() === "" ||
                  nextAssignee.trim().toLowerCase() === "unassigned",
              }

              return {
                ...record,
                assignee: nextAssignee,
                queue: trimmedTeam || record.queue,
                signals: nextSignals,
                primarySignal: getPrimarySignal(nextSignals),
              }
            })()
          : record
      ))
    )
    setDraftRecord((current) => (
      current.id === selectedCaseId
        ? (() => {
            const nextAssignee = trimmedAssignee || current.assignee
            const nextSignals = {
              ...current.signals,
              needsAssignment:
                nextAssignee.trim() === "" ||
                nextAssignee.trim().toLowerCase() === "unassigned",
            }

            return {
              ...current,
              assignee: nextAssignee,
              queue: trimmedTeam || current.queue,
              signals: nextSignals,
              primarySignal: getPrimarySignal(nextSignals),
            }
          })()
        : current
    ))
    handleAppendTimelineItem(nextReassignmentItem)
    setRecordTab("activity")
    setPendingTimelineReferenceId(nextReassignmentItem.id)
    setToastMessage("Case reassigned")
  }

  function handleCancel() {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("Discard unsaved changes?")

      if (!confirmed) {
        return
      }
    }

    if (isCreatingCase) {
      setCreateCaseBaseline(null)
      resetEditState(draftRecord)
      setScreenView("list")
      setMode("view")
      return
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
      customer: true,
    })

    if (titleError || customerError || priorityError) {
      return
    }

    const nextRecord = isCreatingCase
      ? {
          ...draftRecord,
          id: getNextCaseId(cases),
          lastUpdate: formatCaseTimestamp(new Date()),
        }
      : draftRecord

    if (isCreatingCase) {
      setCases((currentCases) => [nextRecord, ...currentCases])
      setSelectedCaseId(nextRecord.id)
      setCreateCaseBaseline(null)
    } else {
      setCases((currentCases) =>
        currentCases.map((record) => (
          record.id === savedRecord.id ? nextRecord : record
        ))
      )
    }

    resetEditState(nextRecord)
    setMode("view")
    refreshAIInsights()
  }

  const canCreateCase =
    draftRecord.title.trim() !== "" && draftRecord.customer.trim() !== ""

  return (
    <main className={`${screenView === "list" ? "min-h-screen" : "flex h-screen flex-col overflow-hidden"} bg-page text-text-default [font-family:var(--font-sans)]`}>
      {screenView === "list" ? (
        <CasesListTemplate
          actions={
            <Button variant="primary" onClick={handleCreateCase}>
              Create case
            </Button>
          }
          compactFilterSpacing={
            hasActiveCaseListFilters && filteredCases.length === 0
          }
          resultsRegionId="case-list-results"
          overview={
            <>
              <div aria-hidden="true" className="col-span-full h-[var(--space-4)]" />
              <div className="col-span-full flex flex-nowrap gap-[var(--space-2)] overflow-x-auto">
                {caseListSummaryItems.map((item) => (
                  <SummaryCard
                    key={item.value}
                    label={item.label}
                    value={item.count}
                    selected={caseStatusFilter === item.value}
                    aria-controls="case-list-results"
                    onClick={() => {
                      setCaseStatusFilter((current) => (
                        current === item.value ? null : item.value
                      ))
                    }}
                  />
                ))}
              </div>
            </>
          }
          filterControls={
            <div className="space-y-[var(--space-3)]">
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
              </div>

              <div
                role="group"
                aria-label="Filter cases by signal"
                className="flex flex-wrap items-center gap-[var(--space-2)]"
              >
                {CASE_SIGNAL_FILTERS.map((filter) => {
                  const selected = activeCaseSignalFilters.includes(filter.id)

                  return (
                    <FilterChip
                      key={filter.id}
                      selected={selected}
                      aria-controls="case-list-results"
                      onClick={() => handleToggleCaseSignalFilter(filter.id)}
                    >
                      {filter.label}
                    </FilterChip>
                  )
                })}

                <FilterChip
                  selected={showAssignedToMeOnly}
                  aria-controls="case-list-results"
                  onClick={() => setShowAssignedToMeOnly((current) => !current)}
                >
                  Assigned to me
                </FilterChip>

                {hasActiveCaseSignalFilters || showAssignedToMeOnly ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCaseSignalFilters([])
                      setShowAssignedToMeOnly(false)
                    }}
                    aria-controls="case-list-results"
                    className="rounded-[var(--radius-sm)] text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-brand)] transition-[color,text-decoration-color] hover:text-[var(--color-action-brand-hover)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
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

              {showClearAllCaseFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setCaseStatusFilter(null)
                    setCaseSearch("")
                    setActiveCaseSignalFilters([])
                    setShowAssignedToMeOnly(false)
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
              <div className="bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)]">
                <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                  {caseResultsLabel}
                </p>
              </div>
              <div className={`hidden gap-[var(--space-3)] border-y border-[var(--color-border-divider)] bg-[var(--color-surface-structural-muted)] px-[var(--space-4)] py-[var(--space-3)] md:grid ${CASES_LIST_GRID_COLUMNS}`}>
                <div className="min-w-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-secondary)]">
                  Case
                </div>
                <div className="min-w-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-secondary)]">
                  State
                </div>
                <div className="min-w-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-secondary)]">
                  <button
                    type="button"
                    onClick={() => handleCaseSort("priority")}
                    className={`inline-flex w-full min-w-0 appearance-none items-center justify-start gap-[var(--space-1)] border-0 bg-transparent p-0 text-left transition-colors hover:text-[color:var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] ${
                      caseSort.column === "priority"
                        ? "text-[color:var(--color-text-primary)]"
                        : ""
                    }`}
                    aria-label="Sort cases by priority"
                  >
                    <span className="min-w-0 truncate">Urgency</span>
                    <SortIndicator
                      active={caseSort.column === "priority"}
                      direction={caseSort.direction}
                    />
                  </button>
                </div>
                <div className="min-w-0 text-right text-[length:var(--text-meta)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-secondary)] md:col-start-4 md:col-span-2">
                  Owner
                </div>
              </div>

              {sortedCases.length > 0 ? (
                <div>
                  {sortedCases.map((record) => {
                    const stateNarrative = getCaseListState(
                      record,
                      caseListUrgencyReferenceTime
                    ).narrativeState
                    const [stateNarrativeLead, stateNarrativeSuffix] =
                      stateNarrative.split(/ · (?=[^·]+$)/)
                    const urgencySignal = getCaseUrgencySignal(record, caseListUrgencyReferenceTime)
                    const ownershipSignal = getCaseOwnershipSignal(record, DEMO_CURRENT_ASSIGNEE)
                    const priorityContextLabel = getCasePriorityContextLabel(record.priority)

                    return (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => openCase(record.id)}
                        className={`group grid w-full appearance-none cursor-pointer gap-[var(--space-2)] border-x-0 border-b-0 border-t border-[var(--color-border-divider)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] text-left transition-[background-color,border-color,opacity] duration-100 first:border-t-0 hover:bg-[var(--color-surface-muted)] focus-visible:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)] md:grid-rows-[auto_auto_auto] md:gap-x-[var(--space-3)] md:gap-y-[calc(var(--space-half)/2)] ${CASES_LIST_GRID_COLUMNS}`}
                        aria-label={`Open case ${record.id}`}
                      >
                        <div className="min-w-0 md:col-start-1 md:row-start-1">
                          <p className="inline-flex flex-wrap items-center gap-[var(--space-1)] text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-text-primary)] group-focus-visible:text-[color:var(--color-text-primary)]">
                            <span>{record.id}</span>
                            {priorityContextLabel ? (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{priorityContextLabel}</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                        <div className="min-w-0 md:col-start-1 md:row-start-2">
                          <p className="min-w-0 text-[length:var(--text-md)] leading-[var(--leading-snug)] font-medium text-[color:var(--color-text-primary)] transition-colors group-hover:text-[color:var(--color-text-brand)] group-focus-visible:text-[color:var(--color-text-brand)]">
                            {record.title}
                          </p>
                        </div>
                        <div className="min-w-0 md:col-start-1 md:row-start-3">
                          <p className="min-w-0 text-sm leading-normal text-[color:var(--color-text-secondary)]">
                            {getDisplayValue(record.customer)}
                          </p>
                        </div>
                        <div className="min-w-0 text-sm leading-normal text-[color:var(--color-text-secondary)] md:col-start-2 md:row-start-2 md:self-start md:pr-[var(--space-3)]">
                          <p className="min-w-0 text-sm leading-normal font-medium text-[color:var(--color-text-secondary)]">
                            <span>{stateNarrativeLead}</span>
                            {stateNarrativeSuffix ? (
                              <span className="text-[color:var(--color-text-muted)]">{` · ${stateNarrativeSuffix}`}</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="min-w-0 text-sm leading-[var(--leading-normal)] md:col-start-3 md:row-start-2 md:self-start">
                          <p className={`text-sm leading-[var(--leading-normal)] font-medium ${urgencySignal.className}`}>
                            {urgencySignal.label || <span aria-hidden="true">&nbsp;</span>}
                          </p>
                        </div>
                        <div className="min-w-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] md:col-start-4 md:col-span-2 md:row-start-2 md:flex md:self-start md:items-center md:justify-end md:gap-[var(--space-2)] md:text-right">
                          <p className={`text-[length:var(--text-meta)] leading-[var(--leading-normal)] ${ownershipSignal.className}`}>
                            {ownershipSignal.label}
                          </p>
                          <TableChevronIcon
                            direction="right"
                            className="hidden text-[color:var(--color-text-muted)] transition-colors group-hover:text-[color:var(--color-text-secondary)] group-focus-visible:text-[color:var(--color-text-secondary)] md:block"
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
                          setCaseStatusFilter(null)
                          setCaseSearch("")
                          setActiveCaseSignalFilters([])
                          setShowAssignedToMeOnly(false)
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
      ) : mode === "view" ? (
        <CaseRecordTemplate
          record={savedRecord}
          status={getShellStatus(savedRecord.status)}
          sections={viewRecordSections}
          updateField={updateDraft}
          getDisplayValue={getDisplayValue}
          recordTab={recordTab}
          onRecordTabChange={(tab) => setRecordTab(tab)}
          onBackToCases={handleBackToCases}
          onEnterEditMode={enterEditMode}
          onEscalateCase={handleEscalateCase}
          onReassignCase={handleReassignCase}
          showEscalateAction={showEscalateAction}
          selectedActivityTimelineItems={selectedActivityTimelineItems}
          highlightedTimelineItemId={highlightedTimelineItemId}
          activeSuggestedAction={activeSuggestedAction}
          onAppendTimelineItem={handleAppendTimelineItem}
          onDismissSuggestedAction={() => setActiveSuggestedAction(null)}
          onOpenSuggestedActionComposer={() =>
            setActiveSuggestedAction((current) =>
              current
                ? {
                    ...current,
                    composerOpen: true,
                  }
                : current,
            )
          }
          onActivateSuggestedAction={(action) => {
            setPendingTimelineReferenceId(action.referenceId)
            setActiveSuggestedAction(action)
          }}
          isAIDrawerOpen={isAIDrawerOpen}
          onToggleAIDrawer={() => setIsAIDrawerOpen((current) => !current)}
          onCloseAIDrawer={() => setIsAIDrawerOpen(false)}
          aiUpdatedLabel={aiUpdatedLabel}
          aiRecordInsight={aiRecordInsight}
          onRefreshAIInsights={refreshAIInsights}
          onSendSuggestedAction={() => {}}
        />
      ) : (
        <>
          <RecordShellBar
            title={draftRecord.title || (isCreatingCase ? "Create case" : "Untitled case")}
            mode="edit"
            recordId={isCreatingCase ? undefined : draftRecord.id}
            actions={
              <>
                <div className="text-xs leading-[var(--leading-normal)] font-normal text-[color:var(--color-text-muted)]">
                  {hasUnsavedChanges ? "Unsaved changes" : ""}
                </div>
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  form="case-edit-form"
                  type="submit"
                  variant="primary"
                  disabled={isCreatingCase && !canCreateCase}
                >
                  {isCreatingCase ? "Create case" : "Save"}
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
                      autoFocusFieldKey: isCreatingCase ? "title" : undefined,
                    })
                  )}
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {toastMessage ? (
        <div className="fixed right-[var(--space-6)] bottom-[var(--space-6)] z-50">
          <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-success)] bg-[var(--color-surface-elevated)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
            {toastMessage}
          </div>
        </div>
      ) : null}
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
