import type {
  CaseRecord,
  CaseRecordSectionOptions,
  FieldConfig,
  FieldOption,
  SectionConfig,
} from "./types"

function shouldShowStatusReason(status: CaseRecord["status"]) {
  return status === "Waiting on customer" || status === "Escalated" || status === "Resolved"
}

function shouldShowBlockingReason(status: CaseRecord["status"]) {
  return status === "Waiting on customer"
}

function shouldShowOnHoldUntil(status: CaseRecord["status"]) {
  return status === "Waiting on customer"
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

export const STATUS_OPTIONS: FieldOption[] = [
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

const BLOCKING_REASON_OPTIONS: FieldOption[] = [
  { value: "", label: "Select blocking reason" },
  { value: "none", label: "No blocking reason" },
  { value: "awaiting_customer_reply", label: "Awaiting customer reply" },
  { value: "awaiting_customer_validation", label: "Awaiting customer validation" },
  { value: "awaiting_approval", label: "Awaiting approval" },
  { value: "awaiting_engineering_fix", label: "Awaiting engineering fix" },
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
  visiblePriorityError?: string,
  markPriorityTouched?: () => void,
  onStatusChange?: (value: CaseRecord["status"]) => void,
  onFieldChange?: CaseRecordSectionOptions["onFieldChange"]
): SectionConfig {
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
        onChange: onFieldChange
          ? (value) => onFieldChange("priority", value as CaseRecord["priority"])
          : undefined,
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
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "blockingReason",
        label: "Blocking reason",
        type: "select",
        options: BLOCKING_REASON_OPTIONS,
        when: (currentRecord) => shouldShowBlockingReason(currentRecord.status),
        span: 2,
      },
      {
        key: "statusReason",
        label: "Status reason",
        type: "text",
        when: (currentRecord) => shouldShowStatusReason(currentRecord.status),
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "onHoldUntil",
        label: "On hold until",
        type: "text",
        when: (currentRecord) => shouldShowOnHoldUntil(currentRecord.status),
        inputType: "date",
      },
    ],
  }
}

function getClassificationSectionConfig(
  record: CaseRecord,
  onChannelChange?: (value: CaseRecord["channel"]) => void,
  onSeverityChange?: (value: CaseRecord["severity"]) => void
): SectionConfig {
  const channelReferenceLabel = getChannelReferenceLabel(record.channel)
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
          span: 2,
          displayBehavior: "flexible",
        },
      ]
    : []

  return {
    id: "classification",
    title: "Classification",
    description: "Categorization details used to route, report, and triage the case.",
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
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "productArea",
        label: "Product area",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      ...channelReferenceField,
    ],
  }
}

function getCaseIdentitySectionConfig(
  visibleTitleError?: string,
  markTitleTouched?: () => void
): SectionConfig {
  return {
    id: "case-identity",
    title: "Case identity",
    description: "Primary identity and summary for the current case.",
    visibleIn: ["edit"],
    layout: "stack",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
        error: visibleTitleError,
        displayBehavior: "flexible",
        onBlur: markTitleTouched,
      },
    ],
  }
}

function getSlaTimingSectionConfig(
  onFieldChange?: CaseRecordSectionOptions["onFieldChange"],
  onResponseTargetEdit?: () => void,
  onResolutionTargetEdit?: () => void
): SectionConfig {
  return {
    id: "sla-timing",
    title: "SLA & timing",
    description: "Service levels, timestamps, and timing risk indicators.",
    fields: [
      {
        key: "timelinePolicy",
        label: "Timeline policy",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "responseTarget",
        label: "Response target",
        type: "text",
        onChange: onFieldChange
          ? (value) => {
              onResponseTargetEdit?.()
              onFieldChange("responseTarget", value as CaseRecord["responseTarget"])
            }
          : undefined,
      },
      {
        key: "resolutionTarget",
        label: "Resolution target",
        type: "text",
        onChange: onFieldChange
          ? (value) => {
              onResolutionTargetEdit?.()
              onFieldChange("resolutionTarget", value as CaseRecord["resolutionTarget"])
            }
          : undefined,
      },
      {
        key: "firstResponse",
        label: "First response",
        type: "text",
      },
      {
        key: "lastUpdate",
        label: "Last update",
        type: "text",
      },
      {
        key: "slaStatus",
        label: "SLA status",
        type: "select",
        options: [
          { value: "On track", label: "On track" },
          { value: "At risk", label: "At risk" },
          { value: "Breached", label: "Breached" },
        ],
      },
      {
        key: "breachRisk",
        label: "Breach risk",
        type: "select",
        options: [
          { value: "Low", label: "Low" },
          { value: "Medium", label: "Medium" },
          { value: "High", label: "High" },
        ],
      },
    ],
  }
}

function getCustomerContextSectionConfig(): SectionConfig {
  return {
    id: "customer-context",
    title: "Customer & context",
    description: "Customer identity and commercial context connected to the case.",
    fields: [
      {
        key: "customer",
        label: "Customer",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "contact",
        label: "Contact",
        type: "text",
      },
      {
        key: "email",
        label: "Email",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "accountTier",
        label: "Account tier",
        type: "text",
      },
      {
        key: "contractType",
        label: "Contract type",
        type: "text",
        displayBehavior: "flexible",
      },
    ],
  }
}

function getCaseHandlingSectionConfig(): SectionConfig {
  return {
    id: "case-handling",
    title: "Case handling",
    description: "Operational settings that affect routing and approval handling.",
    fields: [
      {
        key: "routingGroup",
        label: "Routing group",
        type: "text",
        span: 2,
        displayBehavior: "flexible",
      },
      {
        key: "approvalRequired",
        label: "Approval required",
        type: "select",
        span: 2,
        options: [
          { value: "No", label: "No" },
          { value: "Yes", label: "Yes" },
        ],
      },
      {
        key: "approvalReason",
        label: "Approval reason",
        type: "text",
        when: (currentRecord) => currentRecord.approvalRequired === "Yes",
        span: 2,
        displayBehavior: "flexible",
      },
    ],
  }
}

function getDescriptionSectionConfig(): SectionConfig {
  return {
    id: "description",
    title: "Description",
    description: "Current customer-facing summary of the reported issue.",
    layout: "stack",
    fields: [
      {
        key: "description",
        label: "Description",
        type: "textarea",
        multiline: true,
        displayBehavior: "full-width",
        readOnlyVariant: "boxed",
      },
    ],
  }
}

function getInternalNotesSectionConfig(): SectionConfig {
  return {
    id: "internal-notes",
    title: "Internal notes",
    description: "Internal working notes for routing, remediation, and follow-up.",
    layout: "stack",
    fields: [
      {
        key: "internalNotes",
        label: "Internal notes",
        type: "textarea",
        multiline: true,
        helper: "Internal only. This content is not shown to the customer.",
        displayBehavior: "full-width",
        readOnlyVariant: "boxed",
      },
    ],
  }
}

export function getCaseRecordSections(
  record: CaseRecord,
  options: CaseRecordSectionOptions = {}
): SectionConfig[] {
  return [
    getCaseIdentitySectionConfig(
      options.visibleTitleError,
      options.markTitleTouched
    ),
    getStatusOwnershipSectionConfig(
      options.visiblePriorityError,
      options.markPriorityTouched,
      options.onStatusChange,
      options.onFieldChange
    ),
    getClassificationSectionConfig(
      record,
      options.onChannelChange,
      options.onSeverityChange
    ),
    getSlaTimingSectionConfig(
      options.onFieldChange,
      options.onResponseTargetEdit,
      options.onResolutionTargetEdit
    ),
    getCustomerContextSectionConfig(),
    getCaseHandlingSectionConfig(),
    getDescriptionSectionConfig(),
    getInternalNotesSectionConfig(),
  ]
}
