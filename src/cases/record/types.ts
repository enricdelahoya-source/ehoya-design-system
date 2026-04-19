import type { ReadOnlyValueBehavior } from "../../design-system/components/controls/ReadOnlyValue"

export type CaseStatus = "new" | "in_progress" | "resolved"

export type CaseSignals = {
  waitingOnCustomer: boolean
  escalated: boolean
  needsAssignment: boolean
  waitingForFirstResponse: boolean
}

export type CasePrimarySignal =
  | "waiting_on_customer"
  | "escalated"
  | "needs_assignment"
  | "waiting_for_first_response"
  | null

export type CaseState =
  | ""
  | "Needs assignment"
  | "Waiting for first response"
  | "Waiting on customer"
  | "Waiting for internal review"
  | "In investigation"
  | "Escalated"
  | "Ready to resolve"

export type CaseSituation =
  | ""
  | "New"
  | "Needs owner"
  | "In progress"
  | "Waiting on customer"
  | "Waiting on internal team"
  | "Escalated"
  | "Ready to close"
  | "Closed"

export type CaseUrgency =
  | ""
  | "Breached"
  | "2h left"
  | "Today"
  | "This week"
  | "Low"
  | "No action needed"

export type CaseRecord = {
  title: string
  id: string
  status: CaseStatus
  signals: CaseSignals
  primarySignal: CasePrimarySignal
  situation: CaseSituation
  urgency: CaseUrgency
  owner: string
  nextStep: string
  checkpoint: string
  reason: string
  blockingReason:
    | ""
    | "none"
    | "awaiting_customer_reply"
    | "awaiting_customer_validation"
    | "awaiting_approval"
    | "awaiting_engineering_fix"
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

export type FieldOption = {
  value: string
  label: string
}

export type SchemaMode = "view" | "edit"

export type UpdateCaseRecordField = <K extends keyof CaseRecord>(
  field: K,
  value: CaseRecord[K]
) => void

export type CaseRecordFieldKey = {
  [K in keyof CaseRecord]: CaseRecord[K] extends string ? K : never
}[keyof CaseRecord]

export type FieldConfig = {
  key: CaseRecordFieldKey
  label: string
  type: "text" | "textarea" | "select"
  visibleIn?: SchemaMode[]
  when?: (record: CaseRecord) => boolean
  span?: 1 | 2
  editable?: boolean
  helper?: string
  options?: FieldOption[]
  required?: boolean
  inputType?: "text" | "date"
  displayBehavior?: ReadOnlyValueBehavior
  readOnlyVariant?: "boxed" | "compact"
  multiline?: boolean
  error?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

export type SectionConfig = {
  id: string
  title: string
  description?: string
  visibleIn?: SchemaMode[]
  layout?: "grid" | "stack"
  className?: string
  fields: FieldConfig[]
}

export type CaseRecordSectionOptions = {
  visibleTitleError?: string
  visiblePriorityError?: string
  markTitleTouched?: () => void
  markPriorityTouched?: () => void
  onStatusChange?: (value: CaseRecord["status"]) => void
  onChannelChange?: (value: CaseRecord["channel"]) => void
  onSeverityChange?: (value: CaseRecord["severity"]) => void
  onFieldChange?: UpdateCaseRecordField
  onResponseTargetEdit?: () => void
  onResolutionTargetEdit?: () => void
}
