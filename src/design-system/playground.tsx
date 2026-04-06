import { useState } from "react"
import Button from "./components/Button"
import CaseStatusBadge, { type CaseStatus } from "./components/CaseStatusBadge"
import Input from "./components/controls/Input"
import ReadOnlyValue, { type ReadOnlyValueBehavior } from "./components/controls/ReadOnlyValue"
import Select from "./components/controls/Select"
import Textarea from "./components/controls/Textarea"
import DisplayField from "./components/fields/DisplayField"
import Field from "./components/fields/Field"
import FieldGroupStack from "./components/field-groups/FieldGroupStack"
import FormFieldGrid from "./components/field-groups/FormFieldGrid"
import RecordFieldGrid from "./components/field-groups/RecordFieldGrid"
import Link from "./components/Link"
import FormPageLayout from "./components/layouts/FormPageLayout"
import PageContent from "./components/PageContent"
import FormSection from "./components/sections/FormSection"
import RecordSection from "./components/sections/RecordSection"
import RecordShellBar from "./components/RecordShellBar"
import StatusBadge from "./components/StatusBadge"
import Tabs from "./components/Tabs"

type CaseRecord = {
  title: string
  id: string
  status: "New" | "In progress" | "Waiting on customer" | "Escalated" | "Resolved"
  priority: "" | "Low" | "Medium" | "High" | "Critical"
  assignee: string
  queue: string
  statusReason: string
  onHoldUntil: string
  channel: "Email" | "Phone" | "Portal" | "Chat"
  severity: "Minor" | "Major" | "Critical"
  productArea: string
  category: string
  region: "Southern Europe" | "Central Europe" | "North America" | "Latin America"
  source: string
  timelinePolicy: string
  responseTarget: string
  resolutionTarget: string
  firstResponse: string
  lastUpdate: string
  slaStatus: "On track" | "At risk" | "Breached"
  breachRisk: "Low" | "Medium" | "High"
  customer: string
  contact: string
  email: string
  accountTier: string
  contractType: string
  routingGroup: string
  approvalRequired: "No" | "Yes"
  approvalReason: string
  description: string
  internalNotes: string
  emailThreadId: string
  callReference: string
  chatSessionId: string
}

type FieldOption = {
  value: string
  label: string
}

type FieldConfig = {
  key: keyof CaseRecord
  label: string
  type: "text" | "textarea" | "select"
  span?: 1 | 2
  editable?: boolean
  options?: FieldOption[]
  required?: boolean
  inputType?: "text" | "date"
  displayBehavior?: ReadOnlyValueBehavior
  error?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

type SectionConfig = {
  id: string
  title: string
  description?: string
  fields: FieldConfig[]
}

type AICaseInput = {
  caseId: string
  title: string
  status: string
  priority?: string
  sections: {
    title: string
    fields: {
      label: string
      value: string | null
    }[]
  }[]
}

type AIRecordInsight = {
  summary: string[]
  actions: string[]
}

type AICaseSignals = {
  isEscalated: boolean
  isWaitingOnCustomer: boolean
  isHighPriority: boolean
  needsApproval: boolean
  isMigrationRelated: boolean
  isVisibilityIssue: boolean
  isAuthRelated: boolean
}

const INITIAL_CASE_RECORD: CaseRecord = {
  title: "Customer cannot access invoice portal",
  id: "CASE-10482",
  status: "Waiting on customer",
  priority: "High",
  assignee: "Lucia Fernandez",
  queue: "Billing Portal Support",
  statusReason: "Awaiting customer confirmation after account remediation.",
  onHoldUntil: "2026-04-02",
  channel: "Email",
  severity: "Major",
  productArea: "Billing Portal",
  category: "Access & Authentication / Multi-factor Access Recovery",
  region: "Southern Europe",
  source: "Customer Support Mailbox",
  timelinePolicy: "Enterprise Plus - Standard Incident",
  responseTarget: "2026-04-01 10:15 CET",
  resolutionTarget: "2026-04-02 17:00 CET",
  firstResponse: "2026-04-01 09:07 CET",
  lastUpdate: "2026-04-01 09:41 CET",
  slaStatus: "At risk",
  breachRisk: "Medium",
  customer: "Viva la Vita Clinics SL",
  contact: "Marta Ruiz",
  email: "marta@vivalavita.com",
  accountTier: "Enterprise Plus",
  contractType: "Enterprise subscription with 24/7 support addendum",
  routingGroup: "Portal Access Recovery",
  approvalRequired: "No",
  approvalReason: "Leadership approval needed for accelerated customer credit.",
  description:
    "Customer reset password twice and still cannot access the billing portal. Recent routing notes suggest a tenant-state mismatch between identity services and the billing portal.",
  internalNotes:
    "Coordinate with IAM before asking the customer to retry. Preserve the current session logs and confirm whether the issue affects all finance users in the clinic group.",
  emailThreadId: "THR-884291",
  callReference: "CALL-2026-04-01-1184",
  chatSessionId: "CHAT-SES-440218",
}

const EXAMPLE_CASES: CaseRecord[] = [
  INITIAL_CASE_RECORD,
  {
    ...INITIAL_CASE_RECORD,
    id: "CASE-10463",
    title: "European clinic cannot reconcile duplicate payment confirmations in billing portal",
    status: "In progress",
    priority: "Critical",
    assignee: "Jonas Weber",
    queue: "Billing Operations",
    statusReason: "",
    onHoldUntil: "",
    channel: "Portal",
    severity: "Critical",
    productArea: "Payments Reconciliation",
    category: "Transactions / Duplicate confirmation records",
    region: "Central Europe",
    source: "Customer Self-Service Portal",
    responseTarget: "2026-04-01 09:15 CET",
    resolutionTarget: "2026-04-01 13:00 CET",
    firstResponse: "2026-04-01 08:58 CET",
    lastUpdate: "2026-04-01 11:22 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Nordstern Dental Group",
    contact: "Eva Kruger",
    email: "eva.kruger@nordstern.example",
    accountTier: "Enterprise",
    contractType: "Enterprise subscription",
    routingGroup: "Payments Escalations",
    description:
      "Customer reports duplicate payment confirmation emails and mismatched invoice statuses after a batch of portal-submitted payments.",
    internalNotes:
      "Cross-check payment gateway webhooks against billing reconciliation logs before reprocessing any invoices.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "",
  },
  {
    ...INITIAL_CASE_RECORD,
    id: "CASE-10412",
    title: "Regional operations lead requests closure confirmation for resolved access incident",
    status: "Resolved",
    priority: "Medium",
    assignee: "Chiara Marino",
    queue: "Customer Operations",
    statusReason: "Access restored and customer notified. Waiting for formal closure acknowledgement.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Minor",
    productArea: "",
    category: "",
    region: "Southern Europe",
    source: "",
    timelinePolicy: "Enterprise Standard",
    responseTarget: "2026-03-31 14:00 CET",
    resolutionTarget: "2026-04-01 17:00 CET",
    firstResponse: "2026-03-31 13:42 CET",
    lastUpdate: "2026-04-01 16:18 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Clinica Sorella",
    contact: "Paolo Vitale",
    email: "paolo.vitale@clinicasorella.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Customer Operations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Customer requested written confirmation that portal access was fully restored after the previous incident.",
    internalNotes:
      "Sparse routing metadata is intentional here to test read-only fallback handling in the record sections.",
    emailThreadId: "THR-884140",
    callReference: "",
    chatSessionId: "",
  },
  {
    ...INITIAL_CASE_RECORD,
    id: "CASE-10504",
    title: "Escalated review for multi-market invoice visibility issue affecting finance administrators across merged clinic entities after tenant migration",
    status: "Escalated",
    priority: "High",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason: "Escalated to platform engineering after tenant migration logs showed inconsistent visibility scopes.",
    onHoldUntil: "",
    channel: "Phone",
    severity: "Major",
    productArea: "Tenant Administration",
    category: "Visibility & Permissions / Cross-entity access",
    region: "North America",
    source: "Executive escalation hotline",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-01 10:00 CET",
    resolutionTarget: "2026-04-02 12:00 CET",
    firstResponse: "2026-04-01 09:18 CET",
    lastUpdate: "2026-04-01 12:34 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Northlake Medical Network",
    contact: "Sofia Bennett",
    email: "sofia.bennett@northlake.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "Yes",
    approvalReason: "Engineering manager approval required before running tenant visibility repair.",
    description:
      "Finance admins from merged entities can see only a partial subset of invoices after a tenant migration and permissions sync.",
    internalNotes:
      "Keep the rollback window open until visibility results are confirmed across all merged entities.",
    emailThreadId: "",
    callReference: "CALL-2026-04-01-1219",
    chatSessionId: "",
  },
  {
    ...INITIAL_CASE_RECORD,
    id: "CASE-10388",
    title: "New onboarding question about VAT labels in the invoice export",
    status: "New",
    priority: "",
    assignee: "",
    queue: "General Support",
    statusReason: "",
    onHoldUntil: "",
    channel: "Chat",
    severity: "Minor",
    productArea: "Invoice Export",
    category: "Configuration / Tax labels",
    region: "Latin America",
    source: "Live chat",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-01 15:00 CET",
    resolutionTarget: "2026-04-03 17:00 CET",
    firstResponse: "",
    lastUpdate: "2026-04-01 14:12 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Vida Clara Centro Medico",
    contact: "Ana Perez",
    email: "ana.perez@vidaclara.example",
    accountTier: "Standard",
    contractType: "Standard monthly plan",
    routingGroup: "General Support",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Customer wants to understand whether VAT labels in exported invoices can be renamed for a local market workflow.",
    internalNotes:
      "Useful sparse record to test missing owner and priority in both list and detail views.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "CHAT-SES-440901",
  },
  {
    ...INITIAL_CASE_RECORD,
    id: "CASE-10495",
    title: "Customer asked when suspended invoice reminders will resume after account verification",
    status: "Waiting on customer",
    priority: "Low",
    assignee: "Lucia Fernandez",
    queue: "Billing Communications",
    statusReason: "Waiting for the customer to confirm the compliance contact who should receive reminder emails.",
    onHoldUntil: "2026-04-05",
    channel: "Email",
    severity: "Minor",
    productArea: "Reminder Communications",
    category: "Notifications / Compliance recipient update",
    region: "Southern Europe",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-01 13:30 CET",
    resolutionTarget: "2026-04-05 17:00 CET",
    firstResponse: "2026-04-01 13:02 CET",
    lastUpdate: "2026-04-01 13:44 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Viva la Vita Labs",
    contact: "Irene Costa",
    email: "irene.costa@vivalavitalabs.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Billing Communications",
    description:
      "Customer needs confirmation on when automated reminders restart after updating the authorized reminder recipient.",
    internalNotes:
      "Hold until the customer confirms the compliance contact to avoid re-enabling reminders to the wrong mailbox.",
    emailThreadId: "THR-884302",
    callReference: "",
    chatSessionId: "",
  },
]

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

function getChannelReferenceLabel(channel: CaseRecord["channel"]) {
  switch (channel) {
    case "Phone":
      return "Call reference"
    case "Chat":
      return "Chat session ID"
    case "Email":
      return "Email thread ID"
    case "Portal":
    default:
      return null
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

function shouldShowStatusReason(status: CaseRecord["status"]) {
  return status === "Waiting on customer" || status === "Escalated" || status === "Resolved"
}

function shouldShowOnHoldUntil(status: CaseRecord["status"]) {
  return status === "Waiting on customer"
}

function getDisplayValue(value: string) {
  return value.trim() ? value : "—"
}

const STATUS_OPTIONS: FieldOption[] = [
  { value: "New", label: "New" },
  { value: "In progress", label: "In progress" },
  { value: "Waiting on customer", label: "Waiting on customer" },
  { value: "Escalated", label: "Escalated" },
  { value: "Resolved", label: "Resolved" },
]

const PRIORITY_OPTIONS: FieldOption[] = [
  { value: "", label: "Select priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
]

const CHANNEL_OPTIONS: FieldOption[] = [
  { value: "Email", label: "Email" },
  { value: "Phone", label: "Phone" },
  { value: "Portal", label: "Portal" },
  { value: "Chat", label: "Chat" },
]

const SEVERITY_OPTIONS: FieldOption[] = [
  { value: "Minor", label: "Minor" },
  { value: "Major", label: "Major" },
  { value: "Critical", label: "Critical" },
]

const REGION_OPTIONS: FieldOption[] = [
  { value: "Southern Europe", label: "Southern Europe" },
  { value: "Central Europe", label: "Central Europe" },
  { value: "North America", label: "North America" },
  { value: "Latin America", label: "Latin America" },
]

function getStatusOwnershipSectionConfig(
  record: CaseRecord,
  visiblePriorityError?: string,
  markPriorityTouched?: () => void,
  onStatusChange?: (value: CaseRecord["status"]) => void,
  onFieldChange?: <K extends keyof CaseRecord>(field: K, value: CaseRecord[K]) => void
): SectionConfig {
  const updateField = onFieldChange ?? (() => {})

  return {
    id: "status-ownership",
    title: "Status & ownership",
    description: "Current operational state, ownership, and hold information for the case.",
    fields: [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: STATUS_OPTIONS,
        onChange: onStatusChange
          ? (value) => onStatusChange(value as CaseRecord["status"])
          : undefined,
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: PRIORITY_OPTIONS,
        required: true,
        error: visiblePriorityError,
        onBlur: markPriorityTouched,
        onChange: (value) => updateField("priority", value as CaseRecord["priority"]),
      },
      {
        key: "assignee",
        label: "Assignee",
        type: "text",
      },
      {
        key: "queue",
        label: "Queue",
        type: "text",
        displayBehavior: "flexible",
      },
      ...(
        shouldShowStatusReason(record.status)
          ? [
              {
                key: "statusReason",
                label: "Status reason",
                type: "text",
                span: 2,
                displayBehavior: "flexible",
              },
            ]
          : []
      ) as FieldConfig[],
      ...(
        shouldShowOnHoldUntil(record.status)
          ? [
              {
                key: "onHoldUntil",
                label: "On hold until",
                type: "text",
                inputType: "date",
              },
            ]
          : []
      ) as FieldConfig[],
    ],
  }
}

function getClassificationSectionConfig(
  record: CaseRecord,
  renderMode: "view" | "edit",
  onChannelChange?: (value: CaseRecord["channel"]) => void,
  onSeverityChange?: (value: CaseRecord["severity"]) => void
): SectionConfig {
  const channelReferenceLabel = getChannelReferenceLabel(record.channel)
  const editSpan = renderMode === "edit" ? 2 : undefined
  const channelReferenceField: FieldConfig[] = channelReferenceLabel
    ? [
        {
          key:
            record.channel === "Email"
              ? "emailThreadId"
              : record.channel === "Phone"
                ? "callReference"
                : "chatSessionId",
          label: channelReferenceLabel,
          type: "text",
          span: editSpan,
          displayBehavior: "flexible",
        },
      ]
    : []

  return {
    id: "classification",
    title: "Classification",
    description:
      renderMode === "view"
        ? "Categorization details used to route, report, and triage the case."
        : "Routing and reporting fields that classify the case.",
    fields: [
      {
        key: "channel",
        label: "Channel",
        type: "select",
        options: CHANNEL_OPTIONS,
        onChange: onChannelChange
          ? (value) => onChannelChange(value as CaseRecord["channel"])
          : undefined,
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        options: SEVERITY_OPTIONS,
        onChange: onSeverityChange
          ? (value) => onSeverityChange(value as CaseRecord["severity"])
          : undefined,
      },
      {
        key: "region",
        label: "Region",
        type: "select",
        options: REGION_OPTIONS,
      },
      {
        key: "source",
        label: "Source",
        type: "text",
        displayBehavior: "flexible",
      },
      {
        key: "productArea",
        label: "Product area",
        type: "text",
        span: editSpan,
        displayBehavior: "flexible",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
        span: editSpan,
        displayBehavior: "flexible",
      },
      ...channelReferenceField,
    ],
  }
}

function buildAICaseInput(record: CaseRecord, sections: SectionConfig[]): AICaseInput {
  const excludedTopLevelFieldLabels = new Set(["Status", "Priority"])

  return {
    caseId: record.id,
    title: record.title,
    status: record.status,
    priority: record.priority || undefined,
    sections: sections.map((section) => ({
      title: section.title,
      fields: section.fields
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

function buildFakeSummary(signals: AICaseSignals): string[] {
  const summary: string[] = []

  if (signals.isEscalated) {
    summary.push("The case shows escalation signals.")
  } else if (signals.isWaitingOnCustomer) {
    summary.push("The case is currently blocked on customer input.")
  } else if (signals.isHighPriority) {
    summary.push("The case carries elevated operational priority.")
  } else {
    summary.push("The case is active and still needs operational review.")
  }

  if (signals.isMigrationRelated && signals.isVisibilityIssue) {
    summary.push("Likely cause: migration or permissions drift is affecting visibility.")
  } else if (signals.isAuthRelated) {
    summary.push("Likely cause: identity or access state is out of sync.")
  } else if (signals.isMigrationRelated) {
    summary.push("Likely cause: migration or tenant-state mismatch.")
  } else if (signals.isVisibilityIssue) {
    summary.push("Likely cause: visibility scope or permissions are misaligned.")
  } else {
    summary.push("Likely cause: the current case record still points to an unresolved workflow issue.")
  }

  if (signals.needsApproval) {
    summary.push("Approval may be required before repair or customer-impacting action.")
  }

  if (signals.isWaitingOnCustomer) {
    summary.push("Progress is likely to remain limited until the customer responds.")
  } else if (signals.isHighPriority) {
    summary.push("Current case details suggest the issue should stay in active ownership.")
  } else {
    summary.push("Current case details suggest the next step is controlled follow-up.")
  }

  return summary.slice(0, 4)
}

function buildFakeActions(signals: AICaseSignals, aiVersion: number): string[] {
  const actions: string[] = []

  if (signals.isMigrationRelated) {
    actions.push("Review migration logs.")
  }

  if (signals.isVisibilityIssue) {
    actions.push("Validate visibility scope by entity.")
  }

  if (signals.isAuthRelated) {
    actions.push("Compare identity and access records.")
  }

  if (signals.needsApproval) {
    actions.push("Review approval path before repair.")
  }

  if (signals.isWaitingOnCustomer) {
    actions.push("Request customer confirmation.")
  }

  if (signals.isEscalated) {
    actions.push("Maintain engineering ownership.")
  }

  if (signals.isHighPriority && !signals.isEscalated) {
    actions.push("Send a customer update.")
  }

  const genericActions = [
    "Update case notes.",
    "Capture current findings.",
  ]

  actions.push(genericActions[aiVersion % genericActions.length])

  return Array.from(new Set(actions)).slice(0, 4)
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

function getFakeAIRecordInsight(input: AICaseInput, aiVersion: number): AIRecordInsight {
  const signals = detectAICaseSignals(input)
  return {
    summary: buildFakeSummary(signals),
    actions: buildFakeActions(signals, aiVersion),
  }
}

const recentActivity = [
  {
    actor: "Marta Ruiz",
    timestamp: "Today, 09:14",
    detail: "Reported a third failed login after resetting the password.",
  },
  {
    actor: "Support Ops",
    timestamp: "Today, 09:26",
    detail: "Confirmed the reset emails were delivered successfully.",
  },
  {
    actor: "Routing engine",
    timestamp: "Today, 09:41",
    detail: "Moved the case to Billing Portal support for account-state review.",
  },
  {
    actor: "Lucia Fernandez",
    timestamp: "Today, 09:52",
    detail: "Requested identity logs from the central authentication service team.",
  },
]

const playgroundTabs = [
  { id: "screen", label: "Case screen" },
  { id: "components", label: "Components" },
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

function getPriorityDisplay(priority: CaseRecord["priority"]) {
  switch (priority) {
    case "Critical":
      return {
        label: "Critical 4",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "High":
      return {
        label: "High 3",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "Medium":
      return {
        label: "Medium 2",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "Low":
      return {
        label: "Low 1",
        className: "text-[color:var(--color-text-primary)]",
      }
    case "":
    default:
      return {
        label: "Not set 0",
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

export default function App() {
  const [playgroundView, setPlaygroundView] = useState<"screen" | "components">("screen")
  const [screenView, setScreenView] = useState<"list" | "record">("list")
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [cases, setCases] = useState(EXAMPLE_CASES)
  const [selectedCaseId, setSelectedCaseId] = useState(EXAMPLE_CASES[0]?.id ?? "")
  const [draftRecord, setDraftRecord] = useState(EXAMPLE_CASES[0] ?? INITIAL_CASE_RECORD)
  const [caseSearch, setCaseSearch] = useState("")
  const [caseStatusFilter, setCaseStatusFilter] = useState<"all" | CaseRecord["status"]>("all")
  const [aiVersion, setAiVersion] = useState(1)
  const [aiUpdatedAt, setAiUpdatedAt] = useState(() => Date.now())
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

  const viewStatusOwnershipSection = getStatusOwnershipSectionConfig(savedRecord)
  const editStatusOwnershipSection = getStatusOwnershipSectionConfig(
    draftRecord,
    visiblePriorityError,
    () => markTouched("priority"),
    handleStatusChange,
    updateDraft
  )
  const viewClassificationSection = getClassificationSectionConfig(savedRecord, "view")
  const editClassificationSection = getClassificationSectionConfig(
    draftRecord,
    "edit",
    handleChannelChange,
    handleSeverityChange
  )
  const aiSourceSections = [
    viewStatusOwnershipSection,
    viewClassificationSection,
  ]
  const aiCaseInput = buildAICaseInput(savedRecord, aiSourceSections)
  const aiRecordInsight = getFakeAIRecordInsight(aiCaseInput, aiVersion)
  const aiUpdatedLabel = formatAIUpdatedLabel(aiUpdatedAt)
  const openCaseCount = cases.filter((record) => record.status !== "Resolved").length
  const waitingCaseCount = cases.filter((record) => record.status === "Waiting on customer").length
  const onHoldCaseCount = cases.filter((record) => Boolean(record.onHoldUntil)).length
  const highPriorityCaseCount = cases.filter(
    (record) => record.priority === "High" || record.priority === "Critical"
  ).length
  const filteredCases = cases.filter((record) => {
    const matchesSearch =
      caseSearch.trim() === "" ||
      [record.id, record.title, record.customer, record.assignee]
        .join(" ")
        .toLowerCase()
        .includes(caseSearch.trim().toLowerCase())

    const matchesStatus =
      caseStatusFilter === "all" || record.status === caseStatusFilter

    return matchesSearch && matchesStatus
  })

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

  function enterEditMode() {
    resetEditState(savedRecord)
    setMode("edit")
  }

  function openCase(caseId: string) {
    const nextCase = cases.find((record) => record.id === caseId)

    if (!nextCase) {
      return
    }

    setSelectedCaseId(caseId)
    resetEditState(nextCase)
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

  function renderSectionField(
    field: FieldConfig,
    record: CaseRecord,
    renderMode: "view" | "edit"
  ) {
    const fieldValue = record[field.key]
    const wrapperClassName = field.span === 2 ? "md:col-span-2" : undefined
    const displayBehavior = field.displayBehavior ?? "compact"
    const handleFieldChange = (nextValue: string) => {
      if (field.onChange) {
        field.onChange(nextValue)
        return
      }

      updateDraft(field.key, nextValue as CaseRecord[typeof field.key])
    }

    const displayField = (
      <DisplayField label={field.label} variant="tight">
        <ReadOnlyValue
          size="sm"
          value={getDisplayValue(fieldValue)}
          behavior={displayBehavior}
          variant="compact"
        />
      </DisplayField>
    )

    if (renderMode === "view" || field.editable === false) {
      return (
        <div key={field.key} className={wrapperClassName}>
          {displayField}
        </div>
      )
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className={wrapperClassName}>
          <Field label={field.label} required={field.required} error={field.error}>
            <Select
              size="sm"
              name={field.key}
              value={fieldValue}
              onChange={(event) => handleFieldChange(event.target.value)}
              onBlur={field.onBlur}
            >
              {field.options?.map((option) => (
                <option key={option.value || option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} className={wrapperClassName}>
          <Field label={field.label} required={field.required}>
            <Textarea
              size="sm"
              name={field.key}
              value={fieldValue}
              onChange={(event) => handleFieldChange(event.target.value)}
              onBlur={field.onBlur}
            />
          </Field>
        </div>
      )
    }

    return (
      <div key={field.key} className={wrapperClassName}>
        <Field label={field.label} required={field.required}>
          <Input
            size="sm"
            name={field.key}
            type={field.inputType ?? "text"}
            value={fieldValue}
            onChange={(event) => handleFieldChange(event.target.value)}
            onBlur={field.onBlur}
          />
        </Field>
      </div>
    )
  }

  function renderSchemaSection(
    section: SectionConfig,
    record: CaseRecord,
    renderMode: "view" | "edit"
  ) {
    const fields = section.fields.map((field) =>
      renderSectionField(field, record, renderMode)
    )

    if (renderMode === "view") {
      return (
        <RecordSection
          title={section.title}
          description={section.description}
          className="pt-[var(--space-4)]"
        >
          <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
            {fields}
          </RecordFieldGrid>
        </RecordSection>
      )
    }

    return (
      <FormSection title={section.title} description={section.description}>
        <FormFieldGrid>{fields}</FormFieldGrid>
      </FormSection>
    )
  }

  return (
    <main className="min-h-screen bg-page text-text-default [font-family:var(--font-sans)]">
      <PageContent width="xl">
        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <div className="space-y-[var(--space-half)]">
              <h1 className="m-0 text-record-title">Design system playground</h1>
              <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                Switch between the case screen and a component gallery to test primitives in isolation.
              </p>
            </div>
            <Tabs
              tabs={[...playgroundTabs]}
              activeTab={playgroundView}
              onChange={(tabId) => setPlaygroundView(tabId as "screen" | "components")}
            />
          </div>

        {playgroundView === "screen" ? (
          screenView === "list" ? (
          <div className="space-y-[var(--space-4)]">
            <section className="space-y-[var(--space-2)] px-[var(--space-section-sm)] pt-[var(--space-4)] md:px-[var(--space-section-md)]">
              <div className="space-y-[var(--space-half)]">
                <h2 className="m-0 text-section-title">Cases</h2>
                <p className="max-w-[var(--content-width-md)] text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                  A lightweight list-detail flow for browsing operational cases and opening the existing record screen.
                </p>
              </div>
            </section>

            <section className="grid gap-[var(--space-2)] px-[var(--space-section-sm)] md:grid-cols-2 xl:grid-cols-4 md:px-[var(--space-section-md)]">
              {[
                { label: "Open", value: openCaseCount },
                { label: "Waiting on customer", value: waitingCaseCount },
                { label: "On hold", value: onHoldCaseCount },
                { label: "High priority", value: highPriorityCaseCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border-divider)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)]"
                >
                  <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
                    {item.label}
                  </p>
                  <p className="pt-[var(--space-1)] text-xl leading-[var(--leading-snug)] text-[color:var(--color-text-primary)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="space-y-[var(--space-3)] bg-[var(--color-surface)] px-[var(--space-section-sm)] py-[var(--space-4)] md:px-[var(--space-section-md)]">
              <div className="grid gap-[var(--space-3)] md:grid-cols-[minmax(0,2fr)_minmax(12rem,0.8fr)]">
                <Field label="Search" variant="tight">
                  <Input
                    size="sm"
                    value={caseSearch}
                    onChange={(event) => setCaseSearch(event.target.value)}
                    placeholder="Search by case, title, customer, or assignee"
                  />
                </Field>

                <Field label="Status" variant="tight">
                  <Select
                    size="sm"
                    value={caseStatusFilter}
                    onChange={(event) => setCaseStatusFilter(event.target.value as "all" | CaseRecord["status"])}
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

              <div className="overflow-hidden">
                <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(10rem,1.2fr)_minmax(10rem,1fr)_minmax(8rem,0.9fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_1.5rem] gap-[var(--space-3)] bg-[var(--color-surface-muted)] px-[var(--space-4)] py-[var(--space-3)] md:grid">
                  {["Case", "Customer", "Status", "Priority", "Assignee", "Updated", ""].map((label, index) => (
                    <div
                      key={`${label}-${index}`}
                      className={`text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] ${index === 6 ? "text-right" : ""}`}
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
                          className="group grid w-full cursor-pointer gap-[var(--space-2)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-4)] text-left transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:bg-[var(--color-surface-muted)] focus-visible:outline-none md:grid-cols-[minmax(0,2.4fr)_minmax(10rem,1.2fr)_minmax(10rem,1fr)_minmax(8rem,0.9fr)_minmax(10rem,1fr)_minmax(9rem,0.9fr)_1.5rem] md:items-center md:gap-[var(--space-3)]"
                        >
                          <div className="min-w-0 space-y-[var(--space-half)]">
                            <p className="text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-text-primary)] group-focus-visible:text-[color:var(--color-text-primary)]">
                              {record.id}
                            </p>
                            <div className="flex min-w-0 items-start justify-between gap-[var(--space-2)]">
                              <p className="min-w-0 text-sm leading-normal text-[color:var(--color-text-primary)] transition-colors group-hover:text-[color:var(--color-text-brand)] group-focus-visible:text-[color:var(--color-text-brand)]">
                                {record.title}
                              </p>
                            </div>
                          </div>
                          <div className="min-w-0 text-sm leading-normal text-[color:var(--color-text-primary)]">
                            {getDisplayValue(record.customer)}
                          </div>
                          <div className={`text-sm leading-normal ${statusDisplay.className}`}>
                            {statusDisplay.label}
                          </div>
                          <div className={`text-sm leading-normal ${priorityDisplay.className}`}>
                            {priorityDisplay.label}
                          </div>
                          <div className="min-w-0 text-sm leading-normal text-[color:var(--color-text-primary)]">
                            {getDisplayValue(record.assignee)}
                          </div>
                          <div className="space-y-[var(--space-half)]">
                            <p className="text-sm leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
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
                  <div className="px-[var(--space-4)] py-[var(--space-6)] text-sm leading-normal text-[color:var(--color-text-secondary)]">
                    No cases match the current filters.
                  </div>
                )}
              </div>
            </section>
          </div>
          ) : mode === "view" ? (
          <div className="space-y-[var(--space-4)]">
            <div className="px-[var(--space-section-sm)] pt-[var(--space-4)] md:px-[var(--space-section-md)]">
              <Button type="button" variant="ghost" onClick={handleBackToCases}>
                Back to cases
              </Button>
            </div>
            <RecordShellBar
              breadcrumbs={[
                { label: "Service", href: "#" },
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

            <div className="grid items-start gap-[var(--space-section-sm)] xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <div className="min-w-0 space-y-[var(--space-4)]">
                {renderSchemaSection(viewStatusOwnershipSection, savedRecord, "view")}
                {renderSchemaSection(viewClassificationSection, savedRecord, "view")}

                <RecordSection
                  title="SLA & timing"
                  description="Service-level settings, active targets, and timing signals for the current case."
                  className="pt-[var(--space-4)]"
                >
                  <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                    <Field label="Timeline policy" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.timelinePolicy)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Response target" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.responseTarget)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Resolution target" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.resolutionTarget)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="First response" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.firstResponse)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Last update" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.lastUpdate)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="SLA status" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.slaStatus)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Breach risk" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.breachRisk)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                  </RecordFieldGrid>
                </RecordSection>

                <RecordSection
                  title="Customer & context"
                  description="Customer identity, contact information, and commercial context for the case."
                  className="pt-[var(--space-4)]"
                >
                  <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                    <Field label="Customer" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.customer)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Contact" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.contact)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Email" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.email)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Account tier" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.accountTier)}
                        behavior="compact"
                        variant="compact"
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
                  </RecordFieldGrid>
                </RecordSection>

                <RecordSection
                  title="Case handling"
                  description="Escalation and approval settings that affect operational execution."
                  className="pt-[var(--space-4)]"
                >
                  <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                    <Field label="Routing group" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.routingGroup)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Approval required" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.approvalRequired)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    {savedRecord.approvalRequired === "Yes" ? (
                      <Field label="Approval reason" variant="tight">
                        <ReadOnlyValue
                          size="sm"
                          value={getDisplayValue(savedRecord.approvalReason)}
                          behavior="flexible"
                          variant="compact"
                        />
                      </Field>
                    ) : null}
                  </RecordFieldGrid>
                </RecordSection>

                <RecordSection
                  title="Description"
                  description="Current customer-facing summary of the reported issue."
                >
                  <FieldGroupStack>
                    <ReadOnlyValue size="sm" value={getDisplayValue(savedRecord.description)} multiline />
                  </FieldGroupStack>
                </RecordSection>

                <RecordSection
                  title="Internal notes"
                  description="Internal notes captured during investigation and follow-up."
                >
                  <FieldGroupStack>
                    <ReadOnlyValue size="sm" value={getDisplayValue(savedRecord.internalNotes)} multiline />
                  </FieldGroupStack>
                </RecordSection>
              </div>

              <aside className="min-w-0 space-y-[var(--space-5)] border-t border-[var(--color-border-divider)] pt-[var(--space-6)] xl:border-t-0 xl:pt-0 xl:pl-[var(--space-section-sm)]">
                <section className="space-y-[var(--space-2)]">
                  <div className="flex items-center justify-between gap-[var(--space-3)]">
                    <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                      {aiUpdatedLabel}
                    </p>
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
                  </div>
                  <h3 className="m-0" style={asideTitleStyles}>
                    Summary
                  </h3>
                  <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                    Generated from visible case details and recent activity.
                  </p>
                  <ul className="list-outside list-disc space-y-[var(--space-1)] pt-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
                    {aiRecordInsight.summary.map((item) => (
                      <li key={item} className="text-sm leading-normal text-[color:var(--color-text-primary)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-[var(--space-2)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Suggested actions
                  </h3>
                  <p className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                    Suggested next steps. Review before action.
                  </p>
                  <ol className="list-outside list-decimal space-y-[var(--space-2)] pt-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
                    {aiRecordInsight.actions.map((action) => (
                      <li key={action} className="text-sm leading-normal text-[color:var(--color-text-primary)]">
                        {action}
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="space-y-[var(--space-2)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Recent activity
                  </h3>
                  <ul className="list-outside list-disc space-y-[var(--space-1)] pl-[var(--space-4)] marker:text-[color:var(--color-text-secondary)]">
                    {recentActivity.map((item) => (
                      <li key={`${item.actor}-${item.timestamp}`} className="space-y-[var(--space-1)]">
                        <p className="text-sm leading-normal text-[color:var(--color-text-primary)]">
                          <span className="font-medium">{item.actor}</span>
                          <span className="text-[color:var(--color-text-secondary)]">, {item.timestamp}</span>
                        </p>
                        <p className="text-sm leading-normal text-[color:var(--color-text-secondary)]">
                          {item.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        ) : (
          <div className="space-y-[var(--space-4)]">
            <div className="px-[var(--space-section-sm)] pt-[var(--space-4)] md:px-[var(--space-section-md)]">
              <Button type="button" variant="ghost" onClick={handleBackToCases}>
                Back to cases
              </Button>
            </div>
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

            <FormPageLayout>
              <form
                id="case-edit-form"
                className="space-y-[var(--space-section-md)]"
                onSubmit={handleSave}
              >
                <FormSection
                  title="Case identity"
                  description="Primary editable identity for the current case."
                >
                  <FieldGroupStack>
                    <Field label="Title" required error={visibleTitleError}>
                      <Input
                        size="sm"
                        name="title"
                        value={draftRecord.title}
                        onChange={(event) => updateDraft("title", event.target.value)}
                        onBlur={() => markTouched("title")}
                      />
                    </Field>
                  </FieldGroupStack>
                </FormSection>

                {renderSchemaSection(editStatusOwnershipSection, draftRecord, "edit")}
                {renderSchemaSection(editClassificationSection, draftRecord, "edit")}

                <FormSection
                  title="SLA & timing"
                  description="Service levels, timestamps, and timing risk indicators."
                >
                  <FormFieldGrid>
                    <div className="md:col-span-2">
                      <Field label="Timeline policy">
                        <Input
                          size="sm"
                          value={draftRecord.timelinePolicy}
                          onChange={(event) => updateDraft("timelinePolicy", event.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Response target">
                      <Input
                        size="sm"
                        value={draftRecord.responseTarget}
                        onChange={(event) => {
                          setResponseTargetEdited(true)
                          updateDraft("responseTarget", event.target.value)
                        }}
                      />
                    </Field>

                    <Field label="Resolution target">
                      <Input
                        size="sm"
                        value={draftRecord.resolutionTarget}
                        onChange={(event) => {
                          setResolutionTargetEdited(true)
                          updateDraft("resolutionTarget", event.target.value)
                        }}
                      />
                    </Field>

                    <Field label="First response">
                      <Input
                        size="sm"
                        value={draftRecord.firstResponse}
                        onChange={(event) => updateDraft("firstResponse", event.target.value)}
                      />
                    </Field>

                    <Field label="Last update">
                      <Input
                        size="sm"
                        value={draftRecord.lastUpdate}
                        onChange={(event) => updateDraft("lastUpdate", event.target.value)}
                      />
                    </Field>

                    <Field label="SLA status">
                      <Select
                        size="sm"
                        value={draftRecord.slaStatus}
                        onChange={(event) => updateDraft("slaStatus", event.target.value as CaseRecord["slaStatus"])}
                      >
                        <option>On track</option>
                        <option>At risk</option>
                        <option>Breached</option>
                      </Select>
                    </Field>

                    <Field label="Breach risk">
                      <Select
                        size="sm"
                        value={draftRecord.breachRisk}
                        onChange={(event) => updateDraft("breachRisk", event.target.value as CaseRecord["breachRisk"])}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </Select>
                    </Field>
                  </FormFieldGrid>
                </FormSection>

                <FormSection
                  title="Customer & context"
                  description="Customer identity and commercial context connected to the case."
                >
                  <FormFieldGrid>
                    <div className="md:col-span-2">
                      <Field label="Customer">
                        <Input
                          size="sm"
                          value={draftRecord.customer}
                          onChange={(event) => updateDraft("customer", event.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Contact">
                      <Input
                        size="sm"
                        value={draftRecord.contact}
                        onChange={(event) => updateDraft("contact", event.target.value)}
                      />
                    </Field>

                    <Field label="Email">
                      <Input
                        size="sm"
                        value={draftRecord.email}
                        onChange={(event) => updateDraft("email", event.target.value)}
                      />
                    </Field>

                    <Field label="Account tier">
                      <Input
                        size="sm"
                        value={draftRecord.accountTier}
                        onChange={(event) => updateDraft("accountTier", event.target.value)}
                      />
                    </Field>

                    <Field label="Contract type">
                      <Input
                        size="sm"
                        value={draftRecord.contractType}
                        onChange={(event) => updateDraft("contractType", event.target.value)}
                      />
                    </Field>
                  </FormFieldGrid>
                </FormSection>

                <FormSection
                  title="Case handling"
                  description="Operational settings that affect routing and approval handling."
                >
                  <FormFieldGrid>
                    <div className="md:col-span-2">
                      <Field label="Routing group">
                        <Input
                          size="sm"
                          value={draftRecord.routingGroup}
                          onChange={(event) => updateDraft("routingGroup", event.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Approval required">
                        <Select
                          size="sm"
                          value={draftRecord.approvalRequired}
                          onChange={(event) =>
                            updateDraft("approvalRequired", event.target.value as CaseRecord["approvalRequired"])
                          }
                        >
                          <option>No</option>
                          <option>Yes</option>
                        </Select>
                      </Field>
                    </div>

                    {draftRecord.approvalRequired === "Yes" ? (
                      <div className="md:col-span-2">
                        <Field label="Approval reason">
                          <Input
                            size="sm"
                            value={draftRecord.approvalReason}
                            onChange={(event) => updateDraft("approvalReason", event.target.value)}
                          />
                        </Field>
                      </div>
                    ) : null}
                  </FormFieldGrid>
                </FormSection>

                <FormSection
                  title="Description"
                  description="Editable customer-facing problem summary for the case."
                  className="pt-[var(--space-2)]"
                >
                  <FieldGroupStack>
                    <Field>
                      <Textarea
                        size="sm"
                        value={draftRecord.description}
                        onChange={(event) => updateDraft("description", event.target.value)}
                      />
                    </Field>
                  </FieldGroupStack>
                </FormSection>

                <FormSection
                  title="Internal notes"
                  description="Internal working notes for routing, remediation, and follow-up."
                  className="pt-[var(--space-2)]"
                >
                  <FieldGroupStack>
                    <Field hint="Internal only. This content is not shown to the customer.">
                      <Textarea
                        size="sm"
                        value={draftRecord.internalNotes}
                        onChange={(event) => updateDraft("internalNotes", event.target.value)}
                      />
                    </Field>
                  </FieldGroupStack>
                </FormSection>
              </form>
            </FormPageLayout>
          </div>
          )
        ) : (
          <div className="space-y-[var(--space-4)]">
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
              title="Controls"
              description="Interactive control primitives shown with shared field structure for alignment and validation testing."
              className="pt-[var(--space-4)]"
            >
              <FormFieldGrid>
                <Field label="Title" required error={visibleTitleError}>
                  <Input
                    size="sm"
                    name="title"
                    value={draftRecord.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    onBlur={() => markTouched("title")}
                  />
                </Field>

                <Field label="Priority" required error={visiblePriorityError}>
                  <Select
                    size="sm"
                    name="priority"
                    value={draftRecord.priority}
                    onChange={(event) => updateDraft("priority", event.target.value as CaseRecord["priority"])}
                    onBlur={() => markTouched("priority")}
                  >
                    <option value="">Select priority</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </Select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Internal notes" hint="Testing multiline rhythm and helper text alignment.">
                    <Textarea
                      size="sm"
                      value={draftRecord.internalNotes}
                      onChange={(event) => updateDraft("internalNotes", event.target.value)}
                    />
                  </Field>
                </div>
              </FormFieldGrid>
            </RecordSection>

            <RecordSection
              title="Read-only values"
              description="Read-only field states should remain structured, legible, and visually related to editable controls."
              className="pt-[var(--space-4)]"
            >
              <RecordFieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                <Field label="Compact value" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.customer)}
                    behavior="compact"
                    variant="compact"
                  />
                </Field>
                <Field label="Boxed value" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.assignee)}
                    behavior="compact"
                  />
                </Field>
                <Field label="Flexible value" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.contractType)}
                    behavior="flexible"
                    variant="compact"
                  />
                </Field>
                <Field label="Multiline" variant="tight">
                  <ReadOnlyValue
                    size="sm"
                    value={getDisplayValue(savedRecord.description)}
                    behavior="full-width"
                    multiline
                  />
                </Field>
              </RecordFieldGrid>
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
                    <Button variant="secondary" onClick={() => setMode("edit")}>
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
        )}
        </div>
      </PageContent>
    </main>
  )
}
