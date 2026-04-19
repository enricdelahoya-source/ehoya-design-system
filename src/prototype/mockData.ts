import type { ActivityTimelineItem } from "../design-system/components/ActivityTimeline"
import { getPrimarySignal } from "../cases/record/caseSignals"
import type { CaseRecord, CaseSignals } from "../cases/record/types"

type MockCaseRecord = CaseRecord & { followUpsSent?: number }
type MockCaseRecordBase = Omit<
  MockCaseRecord,
  "primarySignal" | "situation" | "urgency" | "owner" | "nextStep" | "checkpoint" | "reason"
>

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

function createCaseSignals(overrides: Partial<CaseSignals> = {}): CaseSignals {
  return {
    waitingOnCustomer: false,
    escalated: false,
    needsAssignment: false,
    waitingForFirstResponse: false,
    ...overrides,
  }
}

function buildCaseRecord(record: MockCaseRecord | Omit<MockCaseRecord, "primarySignal">): MockCaseRecord {
  const {
    primarySignal: _primarySignal,
    situation,
    urgency,
    owner,
    nextStep,
    checkpoint,
    reason,
    ...baseRecord
  } = record as MockCaseRecord
  const derivedSituation: CaseRecord["situation"] = situation.trim()
    ? situation
    : deriveSituation(baseRecord)
  const derivedOwner = owner.trim() ? owner : deriveOwner(baseRecord)
  const derivedNextStep = nextStep.trim()
    ? nextStep
    : deriveNextStep(baseRecord, derivedSituation)
  const derivedCheckpoint = checkpoint.trim()
    ? checkpoint
    : deriveCheckpoint(baseRecord, derivedSituation)
  const derivedUrgency: CaseRecord["urgency"] = urgency.trim()
    ? urgency
    : deriveUrgency(baseRecord, derivedSituation, derivedCheckpoint)
  const derivedReason = reason.trim() ? reason : deriveReason(baseRecord, derivedSituation)

  return {
    ...baseRecord,
    primarySignal: getPrimarySignal(baseRecord.signals),
    situation: derivedSituation,
    urgency: derivedUrgency,
    owner: derivedOwner,
    nextStep: derivedNextStep,
    checkpoint: derivedCheckpoint,
    reason: derivedReason,
  }
}

function formatDateLabel(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return value
  }

  const [, year, month, day] = match
  const monthIndex = Number.parseInt(month, 10) - 1
  const dayOfMonth = Number.parseInt(day, 10)

  if (monthIndex < 0 || monthIndex >= MONTH_LABELS.length || Number.isNaN(dayOfMonth)) {
    return value
  }

  return `${MONTH_LABELS[monthIndex]} ${dayOfMonth}, ${year}`
}

function deriveSituation(
  record: MockCaseRecordBase
): NonNullable<CaseRecord["situation"]> {
  const normalizedStatusReason = record.statusReason.trim().toLowerCase()

  if (record.status === "resolved") {
    return "Closed"
  }

  if (record.signals.escalated) {
    return "Escalated"
  }

  if (
    record.signals.waitingOnCustomer ||
    record.blockingReason === "awaiting_customer_reply" ||
    record.blockingReason === "awaiting_customer_validation"
  ) {
    return "Waiting on customer"
  }

  if (
    record.blockingReason === "awaiting_approval" ||
    record.blockingReason === "awaiting_engineering_fix"
  ) {
    return "Waiting on internal team"
  }

  if (normalizedStatusReason.includes("ready to resolve")) {
    return "Ready to close"
  }

  if (record.signals.needsAssignment) {
    return "Needs owner"
  }

  if (record.signals.waitingForFirstResponse || record.status === "new") {
    return "New"
  }

  return "In progress"
}

function deriveUrgency(
  record: MockCaseRecordBase,
  situation: NonNullable<CaseRecord["situation"]>,
  checkpoint: string
): NonNullable<CaseRecord["urgency"]> {
  const checkpointMoment = getCheckpointMoment(checkpoint)

  if (record.slaStatus === "Breached") {
    return "Breached"
  }

  if (record.status === "resolved") {
    return "Low"
  }

  if (situation === "Waiting on customer" || situation === "Waiting on internal team") {
    if (record.onHoldUntil.trim() && checkpointMoment) {
      return `On hold until ${checkpointMoment}` as CaseRecord["urgency"]
    }

    if (checkpointMoment) {
      return `Review on ${checkpointMoment}` as CaseRecord["urgency"]
    }

    return "Waiting (safe)" as CaseRecord["urgency"]
  }

  if (record.priority === "Critical") {
    return "2h left"
  }

  if (record.priority === "High" || record.breachRisk === "High" || record.signals.escalated) {
    return "Today"
  }

  if (
    record.priority === "Medium" ||
    record.breachRisk === "Medium" ||
    record.signals.needsAssignment ||
    record.signals.waitingForFirstResponse
  ) {
    if (checkpointMoment) {
      return `Review on ${checkpointMoment}` as CaseRecord["urgency"]
    }

    return "This week"
  }

  return record.priority === "Low" || record.breachRisk === "Low"
    ? "Low"
    : "This week"
}

function deriveOwner(record: MockCaseRecordBase) {
  const assignee = record.assignee.trim()
  const queue = record.queue.trim()

  if (assignee) {
    return assignee
  }

  if (queue) {
    return `Unassigned - ${queue} queue`
  }

  return "Unassigned"
}

function deriveNextStep(
  record: MockCaseRecordBase,
  situation: NonNullable<CaseRecord["situation"]>
) {
  const checkpointMoment = getCheckpointMoment(deriveCheckpoint(record, situation))

  if (record.status === "resolved") {
    return "No further action planned"
  }

  if (!record.assignee.trim() || record.signals.needsAssignment) {
    return record.signals.escalated ? "Assign an escalation owner" : "Assign an owner"
  }

  if (
    record.signals.waitingOnCustomer ||
    record.blockingReason === "awaiting_customer_reply" ||
    record.blockingReason === "awaiting_customer_validation"
  ) {
    return (record.followUpsSent ?? 0) >= 2
      ? checkpointMoment
        ? `Wait for customer confirmation (close after ${checkpointMoment} if no reply)`
        : "Wait for customer confirmation"
      : "Wait for customer confirmation"
  }

  if (record.blockingReason === "awaiting_approval") {
    return "Wait for approval to proceed"
  }

  if (record.blockingReason === "awaiting_engineering_fix") {
    return "Wait for the internal fix and review the outcome"
  }

  if (situation === "New") {
    return "Review the issue and send the first response"
  }

  if (situation === "Ready to close") {
    return "Send the closure summary and close the case"
  }

  if (situation === "Escalated") {
    return "Coordinate the specialist response"
  }

  return "Continue investigation and update the customer"
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

function deriveCheckpoint(
  record: MockCaseRecordBase,
  situation: NonNullable<CaseRecord["situation"]>
) {
  if (record.status === "resolved") {
    return "No checkpoint set"
  }

  if (record.onHoldUntil.trim()) {
    return `Follow up on ${formatDateLabel(record.onHoldUntil)}`
  }

  if (!record.firstResponse.trim() && record.responseTarget.trim()) {
    return `First response due ${record.responseTarget}`
  }

  if (
    situation === "Waiting on customer" ||
    situation === "Waiting on internal team" ||
    situation === "Escalated" ||
    situation === "Ready to close"
  ) {
    return record.resolutionTarget.trim()
      ? `Review by ${record.resolutionTarget}`
      : "No checkpoint set"
  }

  if (record.responseTarget.trim()) {
    return `Review by ${record.responseTarget}`
  }

  return record.resolutionTarget.trim()
    ? `Review by ${record.resolutionTarget}`
    : "No checkpoint set"
}

function deriveReason(
  record: MockCaseRecordBase,
  situation: NonNullable<CaseRecord["situation"]>
) {
  if (record.statusReason.trim()) {
    return record.statusReason.trim()
  }

  if (!record.assignee.trim() || record.signals.needsAssignment) {
    return "No owner is currently accountable for progressing the next step."
  }

  switch (record.blockingReason) {
    case "awaiting_customer_reply":
      return "The team is waiting for the customer to reply before progressing the case."
    case "awaiting_customer_validation":
      return "The team is waiting for the customer to confirm the corrected outcome."
    case "awaiting_approval":
      return "A required approval is still pending before the corrective action can proceed."
    case "awaiting_engineering_fix":
      return "An internal engineering repair is required before the case can move forward."
    default:
      break
  }

  if (record.signals.waitingForFirstResponse || situation === "New") {
    return "The case is newly opened and still needs its first operational response."
  }

  if (situation === "Escalated") {
    return "The case requires specialist handling to move forward."
  }

  if (situation === "Closed") {
    return "Work is complete and the case is now closed."
  }

  return "The case is actively in progress and does not have a blocking dependency right now."
}

const initialCaseSignals = createCaseSignals({
  waitingOnCustomer: true,
})

export const INITIAL_CASE_RECORD: CaseRecord = {
  title: "Finance team still cannot access the invoice portal after password resets",
  id: "CASE-10482",
  status: "in_progress",
  signals: initialCaseSignals,
  primarySignal: getPrimarySignal(initialCaseSignals),
  situation: "",
  urgency: "",
  owner: "",
  nextStep: "",
  checkpoint: "",
  reason: "",
  blockingReason: "awaiting_customer_validation",
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
  approvalReason: "",
  description:
    "Customer reset password twice and still cannot access the billing portal. Recent routing notes suggest a tenant-state mismatch between identity services and the billing portal.",
  internalNotes:
    "Coordinate with IAM before asking the customer to retry. Preserve the current session logs and confirm whether the issue affects all finance users in the clinic group.",
  emailThreadId: "THR-884291",
  callReference: "CALL-2026-04-01-1184",
  chatSessionId: "CHAT-SES-440218",
}

export const EXAMPLE_CASES: CaseRecord[] = [
  buildCaseRecord(INITIAL_CASE_RECORD),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10463",
    title: "Duplicate payment confirmations are making some invoices look paid twice",
    status: "in_progress",
    signals: createCaseSignals(),
    blockingReason: "none",
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
    firstResponse: "2026-04-01 08:55 CET",
    lastUpdate: "2026-04-01 11:22 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Nordstern Dental Group",
    contact: "Eva Kruger",
    email: "eva.kruger@nordstern.example",
    accountTier: "Enterprise",
    contractType: "Enterprise subscription",
    routingGroup: "Payments Reconciliation",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Customer reports duplicate payment confirmation emails and mismatched invoice statuses after a batch of portal-submitted payments.",
    internalNotes:
      "Cross-check payment gateway webhooks against billing reconciliation logs before reprocessing any invoices.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10511",
    title: "Merged clinic invoices stay missing in the portal until the nightly sync completes",
    status: "in_progress",
    signals: createCaseSignals(),
    blockingReason: "awaiting_engineering_fix",
    priority: "High",
    assignee: "Marco Silva",
    queue: "Billing Integrations",
    statusReason: "",
    onHoldUntil: "",
    channel: "Portal",
    severity: "Major",
    productArea: "Tenant Data Sync",
    category: "Visibility & Permissions / Post-migration propagation",
    region: "Central Europe",
    source: "Customer Self-Service Portal",
    timelinePolicy: "Enterprise Plus - Standard Incident",
    responseTarget: "2026-04-01 11:00 CET",
    resolutionTarget: "2026-04-02 15:00 CET",
    firstResponse: "2026-04-01 10:05 CET",
    lastUpdate: "2026-04-01 12:06 CET",
    slaStatus: "At risk",
    breachRisk: "Medium",
    customer: "Clinica Sorella",
    contact: "Paolo Vitale",
    email: "paolo.vitale@clinicasorella.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Billing Integrations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Merged clinic invoices are not visible until the nightly tenant sync completes, leaving finance teams with partial invoice views throughout the day.",
    internalNotes:
      "Platform engineering is preparing a sync repair for the tenant-state propagation job. Keep the customer updated while the internal fix is in progress.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10504",
    title: "Finance admins can only see a partial invoice list after the tenant migration",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
    }),
    blockingReason: "none",
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
    firstResponse: "2026-04-01 09:26 CET",
    lastUpdate: "2026-04-01 12:34 CET",
    slaStatus: "At risk",
    breachRisk: "Medium",
    customer: "Northlake Medical Network",
    contact: "Sofia Bennett",
    email: "sofia.bennett@northlake.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Finance admins from merged entities can see only a partial subset of invoices after a tenant migration and permissions sync.",
    internalNotes:
      "Keep the rollback window open until visibility results are confirmed across all merged entities.",
    emailThreadId: "",
    callReference: "CALL-2026-04-01-1219",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10388",
    title: "Can VAT labels be renamed in invoice exports?",
    status: "new",
    signals: createCaseSignals({
      waitingForFirstResponse: true,
    }),
    blockingReason: "",
    priority: "",
    assignee: "Anais Martin",
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
    lastUpdate: "2026-04-01 14:16 CET",
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
      "Need to confirm whether VAT labels are configurable per export template or only at account level before sending the first response.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "CHAT-SES-440901",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10412",
    title: "Finance users lost billing portal access at one clinic",
    status: "resolved",
    signals: createCaseSignals(),
    blockingReason: "none",
    priority: "Medium",
    assignee: "Chiara Marino",
    queue: "Customer Operations",
    statusReason: "Customer confirmed closure after receiving the written resolution summary.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Minor",
    productArea: "Billing Portal",
    category: "Access & Authentication / Portal access restoration",
    region: "Southern Europe",
    source: "Customer Support Mailbox",
    timelinePolicy: "Enterprise Standard",
    responseTarget: "2026-03-31 14:00 CET",
    resolutionTarget: "2026-04-01 17:00 CET",
    firstResponse: "2026-03-31 13:42 CET",
    lastUpdate: "2026-04-02 10:14 CET",
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
      "Finance users lost access to the billing portal until the account-state issue was repaired. The customer later requested a written resolution summary for their records.",
    internalNotes:
      "Keep the IAM repair reference and written resolution summary linked in the record in case the clinic asks for the incident trail again.",
    emailThreadId: "THR-884140",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10516",
    title: "Low-volume clinic adjustments are missing from the daily settlement export",
    status: "in_progress",
    signals: createCaseSignals(),
    blockingReason: "none",
    priority: "Low",
    assignee: "Nadia Romero",
    queue: "Finance Integrations",
    statusReason: "",
    onHoldUntil: "",
    channel: "Email",
    severity: "Minor",
    productArea: "Settlement Export",
    category: "Reporting / Adjustment visibility",
    region: "Southern Europe",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-10 11:30 CET",
    resolutionTarget: "2026-04-11 18:00 CET",
    firstResponse: "2026-04-10 11:04 CET",
    lastUpdate: "2026-04-11 08:27 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Clinica Mar Azul",
    contact: "Irene Costa",
    email: "irene.costa@marazul.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Finance Integrations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "The settlement export omits low-volume adjustment rows for a subset of clinic entities, forcing the finance team to reconcile them manually.",
    internalNotes:
      "Initial analysis suggests the export job is skipping adjustments that are posted after the batch window but before summary generation.",
    emailThreadId: "THR-884514",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10518",
    title: "Can overdue invoice reminders be delayed by two business days?",
    status: "new",
    signals: createCaseSignals({
      needsAssignment: true,
      waitingForFirstResponse: true,
    }),
    blockingReason: "",
    priority: "Medium",
    assignee: "",
    queue: "General Support",
    statusReason: "",
    onHoldUntil: "",
    channel: "Chat",
    severity: "Minor",
    productArea: "Invoice Notifications",
    category: "Configuration / Reminder cadence",
    region: "North America",
    source: "Live chat",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-11 09:30 CET",
    resolutionTarget: "2026-04-14 17:00 CET",
    firstResponse: "",
    lastUpdate: "2026-04-11 08:19 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Harborview Clinics",
    contact: "Tessa Morgan",
    email: "tessa.morgan@harborview.example",
    accountTier: "Standard",
    contractType: "Standard monthly plan",
    routingGroup: "General Support",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Customer wants to know whether overdue invoice reminders can be delayed by two business days for a subset of self-pay clinics.",
    internalNotes:
      "Confirm whether reminder cadence can be configured per clinic segment or only at account level before assigning the case to the notifications owner.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "CHAT-SES-441102",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10519",
    title: "Customer still needs to confirm corrected statement branding across all clinics",
    status: "in_progress",
    signals: createCaseSignals({
      waitingOnCustomer: true,
    }),
    blockingReason: "awaiting_customer_reply",
    priority: "Medium",
    assignee: "Lucia Fernandez",
    queue: "Document Delivery",
    statusReason: "Waiting for the customer to confirm the corrected branding on regenerated statements.",
    onHoldUntil: "2026-04-12",
    channel: "Email",
    severity: "Minor",
    productArea: "Statement Delivery",
    category: "Document templates / Regional branding",
    region: "Latin America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-10 10:00 CET",
    resolutionTarget: "2026-04-12 17:00 CET",
    firstResponse: "2026-04-10 10:18 CET",
    lastUpdate: "2026-04-10 11:08 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Grupo Medico Esperanza",
    contact: "Valeria Soto",
    email: "valeria.soto@esperanza.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Document Delivery",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Regenerated customer statements include the updated regional branding, but the customer has not yet confirmed the final output across all clinics.",
    internalNotes:
      "Leave the case in the waiting state until the customer validates the corrected statement layout in their production tenant.",
    emailThreadId: "THR-884602",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10521",
    title: "Cross-border invoice bundle is calculating with the wrong tax rule",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
    }),
    blockingReason: "awaiting_approval",
    priority: "Critical",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason: "Escalated after finance leadership flagged a tax-rule mismatch affecting a same-day invoice release.",
    onHoldUntil: "",
    channel: "Phone",
    severity: "Critical",
    productArea: "Tax Rules Engine",
    category: "Tax configuration / Cross-border invoice bundle",
    region: "Central Europe",
    source: "Executive escalation hotline",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-11 09:00 CET",
    resolutionTarget: "2026-04-11 15:00 CET",
    firstResponse: "2026-04-11 08:52 CET",
    lastUpdate: "2026-04-11 09:18 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Helios Care Network",
    contact: "Lena Fischer",
    email: "lena.fischer@helioscare.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "Yes",
    approvalReason: "Tax-engine rule override requires product and compliance approval before execution.",
    description:
      "A cross-border invoice bundle is calculating with the wrong tax rule for a subset of clinics, and leadership requested an immediate executive escalation.",
    internalNotes:
      "Track approvals tightly before applying any corrective override to the production tax-rule set.",
    emailThreadId: "",
    callReference: "CALL-2026-04-11-0907",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10536",
    title: "Escalated invoice correction is paused until the customer confirms the legal entity split",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
      waitingOnCustomer: true,
    }),
    blockingReason: "awaiting_customer_validation",
    priority: "High",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason: "Escalated case is waiting on customer validation before the corrective invoice split can be released.",
    onHoldUntil: "2026-04-13",
    channel: "Phone",
    severity: "Major",
    productArea: "Invoice Split Logic",
    category: "Billing correction / Legal entity validation",
    region: "Central Europe",
    source: "Executive escalation hotline",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-12 10:00 CET",
    resolutionTarget: "2026-04-13 17:00 CET",
    firstResponse: "2026-04-12 09:14 CET",
    lastUpdate: "2026-04-12 13:42 CET",
    slaStatus: "At risk",
    breachRisk: "Medium",
    customer: "Belvista Health Group",
    contact: "Klara Hoffmann",
    email: "klara.hoffmann@belvista.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Leadership escalated an invoice correction issue for merged clinics, but the production change is now paused until the customer confirms the legal entity split that should appear on the corrected bundle.",
    internalNotes:
      "Engineering has the patch ready. Do not release it until the customer confirms the final entity mapping for the affected clinics.",
    emailThreadId: "THR-884671",
    callReference: "CALL-2026-04-12-1011",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10531",
    title: "Approval is still pending for the corrective tax-rule release before billing cutoff",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
    }),
    blockingReason: "awaiting_approval",
    priority: "Critical",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason: "Approval is still pending and the case is now urgent because the billing cutoff is approaching.",
    onHoldUntil: "",
    channel: "Phone",
    severity: "Critical",
    productArea: "Tax Rules Engine",
    category: "Tax configuration / Corrective release approval",
    region: "Central Europe",
    source: "Executive escalation hotline",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-12 09:00 CET",
    resolutionTarget: "2026-04-12 12:30 CET",
    firstResponse: "2026-04-12 08:42 CET",
    lastUpdate: "2026-04-12 10:18 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Alpen Care Group",
    contact: "Nora Weiss",
    email: "nora.weiss@alpencare.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "Yes",
    approvalReason: "Product and compliance approval are both required before the corrective tax-rule release can proceed.",
    description:
      "The corrective tax-rule release is ready, but the production change cannot proceed until the required approvals are completed before billing cutoff.",
    internalNotes:
      "Keep the approval path moving and make sure finance leadership receives the next checkpoint before the cutoff window.",
    emailThreadId: "",
    callReference: "CALL-2026-04-12-0839",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10527",
    title: "Escalated invoice visibility repair is still blocking the daily release window",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
    }),
    blockingReason: "awaiting_engineering_fix",
    priority: "Critical",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason: "Escalated repair remains in progress and the account is now at high SLA risk before the daily invoice release window closes.",
    onHoldUntil: "",
    channel: "Phone",
    severity: "Critical",
    productArea: "Invoice Visibility Cache",
    category: "Visibility & Permissions / Cache propagation failure",
    region: "North America",
    source: "Executive escalation hotline",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-12 09:00 CET",
    resolutionTarget: "2026-04-12 13:00 CET",
    firstResponse: "2026-04-12 08:47 CET",
    lastUpdate: "2026-04-12 11:36 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Summit Surgical Partners",
    contact: "Rachel Kim",
    email: "rachel.kim@summitsurgical.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "A cache propagation failure is still hiding same-day invoices for multiple surgical centers, and leadership needs the daily release restored before the finance cutoff.",
    internalNotes:
      "Engineering owns the repair, but stakeholder updates must stay ahead of the SLA risk while the escalation remains active.",
    emailThreadId: "",
    callReference: "CALL-2026-04-12-0844",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10537",
    title: "Escalated remittance export defect is waiting for a named escalation owner",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
      needsAssignment: true,
    }),
    blockingReason: "none",
    priority: "High",
    assignee: "",
    queue: "Platform Escalations",
    statusReason: "Escalated after release review, but the specialist owner is still not assigned for the next repair step.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Major",
    productArea: "Remittance Export",
    category: "Escalation routing / Specialist assignment",
    region: "North America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Enterprise Plus - Standard Incident",
    responseTarget: "2026-04-12 11:15 CET",
    resolutionTarget: "2026-04-13 18:00 CET",
    firstResponse: "2026-04-12 10:46 CET",
    lastUpdate: "2026-04-12 12:08 CET",
    slaStatus: "At risk",
    breachRisk: "Medium",
    customer: "Northlake Ambulatory Partners",
    contact: "Sharon Mills",
    email: "sharon.mills@northlake-ambulatory.example",
    accountTier: "Enterprise",
    contractType: "Enterprise subscription",
    routingGroup: "Platform Escalations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "A remittance export defect was escalated after standard triage confirmed a release regression, but the specialist owner has not yet been assigned inside the escalation queue.",
    internalNotes:
      "Queue accepted the escalation, but ownership is still open. Assign the repair owner before the next customer update window.",
    emailThreadId: "THR-884676",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10532",
    title: "Customer has not responded after repeated follow-ups on corrected invoice branding",
    status: "in_progress",
    signals: createCaseSignals({
      waitingOnCustomer: true,
    }),
    blockingReason: "awaiting_customer_reply",
    priority: "Low",
    assignee: "Lucia Fernandez",
    queue: "Document Delivery",
    statusReason: "Waiting on customer response after all scheduled follow-ups were already sent.",
    onHoldUntil: "2026-04-14",
    channel: "Email",
    severity: "Minor",
    productArea: "Statement Delivery",
    category: "Document templates / Final customer confirmation",
    region: "Latin America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-12 10:30 CET",
    resolutionTarget: "2026-04-14 17:00 CET",
    firstResponse: "2026-04-12 10:05 CET",
    lastUpdate: "2026-04-13 11:12 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Grupo Medico Esperanza",
    contact: "Valeria Soto",
    email: "valeria.soto@esperanza.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Document Delivery",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "The corrected invoice branding was delivered, but the customer has not replied after the planned follow-up sequence and the case is now paused on customer input.",
    internalNotes:
      "Do not send another proactive follow-up unless the customer re-engages or the hold date expires.",
    emailThreadId: "THR-884655",
    callReference: "",
    chatSessionId: "",
    followUpsSent: 2,
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10509",
    title: "Customer needs access to archived remittance files from the prior fiscal quarter",
    status: "resolved",
    signals: createCaseSignals(),
    blockingReason: "none",
    priority: "Low",
    assignee: "Chiara Marino",
    queue: "Customer Operations",
    statusReason: "Archived files were restored and the customer confirmed access to the prior quarter package.",
    onHoldUntil: "",
    channel: "Portal",
    severity: "Minor",
    productArea: "Remittance Archive",
    category: "Data access / Archived financial records",
    region: "Southern Europe",
    source: "Customer Self-Service Portal",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-09 14:00 CET",
    resolutionTarget: "2026-04-10 17:00 CET",
    firstResponse: "2026-04-09 13:41 CET",
    lastUpdate: "2026-04-09 17:36 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Clinica Vista Serena",
    contact: "Miguel Ortega",
    email: "miguel.ortega@vistaserena.example",
    accountTier: "Standard",
    contractType: "Standard annual plan",
    routingGroup: "Customer Operations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Customer asked for access to archived remittance files from the prior fiscal quarter after their finance audit reopened a closed reconciliation task.",
    internalNotes:
      "Link the restored archive package reference in the record and close the case once the audit request is fully documented.",
    emailThreadId: "",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10524",
    title: "Customer still needs to confirm corrected payer mapping in the remittance export",
    status: "in_progress",
    signals: createCaseSignals({
      waitingOnCustomer: true,
    }),
    blockingReason: "awaiting_customer_validation",
    priority: "Medium",
    assignee: "Lucia Fernandez",
    queue: "Remittance Operations",
    statusReason: "Waiting on customer validation after the corrected payer mapping was regenerated for review.",
    onHoldUntil: "2026-04-13",
    channel: "Email",
    severity: "Minor",
    productArea: "Remittance Export",
    category: "Export validation / Payer mapping",
    region: "North America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-12 11:00 CET",
    resolutionTarget: "2026-04-13 17:00 CET",
    firstResponse: "2026-04-12 10:24 CET",
    lastUpdate: "2026-04-12 14:06 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Harborview Specialty Clinics",
    contact: "Megan Holt",
    email: "megan.holt@harborview-specialty.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Remittance Operations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "Support corrected the payer mapping used in the remittance export, but the customer still needs to confirm the regenerated file matches the clinic-level accounting split.",
    internalNotes:
      "Do not close the case until the customer confirms the regenerated export is correct for the affected payer groups.",
    emailThreadId: "THR-884633",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10526",
    title: "Corrected settlement export now includes the missing insurance adjustment codes",
    status: "in_progress",
    signals: createCaseSignals(),
    blockingReason: "none",
    priority: "Medium",
    assignee: "Nadia Romero",
    queue: "Finance Integrations",
    statusReason: "Ready to resolve after the corrected export was verified and the closure summary is ready to send.",
    onHoldUntil: "",
    channel: "Portal",
    severity: "Minor",
    productArea: "Settlement Export",
    category: "Reporting / Adjustment codes",
    region: "Southern Europe",
    source: "Customer Self-Service Portal",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-12 09:30 CET",
    resolutionTarget: "2026-04-13 16:00 CET",
    firstResponse: "2026-04-12 09:11 CET",
    lastUpdate: "2026-04-12 15:22 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Clinica Mar Azul",
    contact: "Irene Costa",
    email: "irene.costa@marazul.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Finance Integrations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "The settlement export was omitting insurance adjustment codes for a subset of clinics, but the corrected export has now been regenerated and verified.",
    internalNotes:
      "Validation is complete and no blocker remains. Send the customer-facing closure summary and resolve the case.",
    emailThreadId: "THR-884647",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10542",
    title: "Customer reviewed the corrected statement header but still needs one clarification",
    status: "in_progress",
    signals: createCaseSignals({
      waitingOnCustomer: true,
    }),
    situation: "Waiting on customer",
    urgency: "",
    owner: "Lucia Fernandez",
    nextStep: "Wait for customer confirmation",
    checkpoint: "Follow up on Apr 14, 2026",
    reason:
      "Customer is reviewing the corrected statement header but needs clarification about archived statements before confirming.",
    blockingReason: "awaiting_customer_validation",
    priority: "Low",
    assignee: "Lucia Fernandez",
    queue: "Document Delivery",
    statusReason:
      "Customer asked whether archived statements also reflect the corrected header before they confirm the final statement set.",
    onHoldUntil: "2026-04-14",
    channel: "Email",
    severity: "Minor",
    productArea: "Statement Delivery",
    category: "Document templates / Archived statement clarification",
    region: "Latin America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-13 10:30 CET",
    resolutionTarget: "2026-04-14 17:00 CET",
    firstResponse: "2026-04-13 10:08 CET",
    lastUpdate: "2026-04-13 15:42 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Grupo Medico Esperanza",
    contact: "Valeria Soto",
    email: "valeria.soto@esperanza.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Document Delivery",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "The corrected statement header was shared for review, but the customer still needs to know whether archived statements will reflect the same update before they confirm closure.",
    internalNotes:
      "Reply with the archive behavior and keep the case in a waiting state until the customer confirms the full statement set.",
    emailThreadId: "THR-884688",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10543",
    title: "Customer is asking for an update while the remittance correction is still in progress",
    status: "in_progress",
    signals: createCaseSignals(),
    situation: "In progress",
    urgency: "Today",
    owner: "Nadia Romero",
    nextStep: "Continue investigation and update the customer",
    checkpoint: "Review by Apr 15, 2026, 16:00 CET",
    reason:
      "Engineering is validating the remittance correction before the next export run and the customer needs a status update.",
    blockingReason: "awaiting_engineering_fix",
    priority: "High",
    assignee: "Nadia Romero",
    queue: "Finance Integrations",
    statusReason:
      "Internal validation is still in progress and the customer has asked whether the corrected remittance file will be ready before tomorrow's batch.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Major",
    productArea: "Remittance Export",
    category: "Correction validation / Batch readiness",
    region: "Southern Europe",
    source: "Customer Support Mailbox",
    timelinePolicy: "Enterprise Standard",
    responseTarget: "2026-04-15 10:00 CET",
    resolutionTarget: "2026-04-15 16:00 CET",
    firstResponse: "2026-04-15 09:12 CET",
    lastUpdate: "2026-04-15 14:18 CET",
    slaStatus: "At risk",
    breachRisk: "Medium",
    customer: "Clinica Mar Azul",
    contact: "Irene Costa",
    email: "irene.costa@marazul.example",
    accountTier: "Professional",
    contractType: "Professional annual plan",
    routingGroup: "Finance Integrations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "A corrected remittance file is being validated after adjustment totals posted incorrectly, and the customer wants to know whether the repair will be ready before the next scheduled export.",
    internalNotes:
      "Give the customer a grounded status update without overcommitting before engineering confirms the corrected file is safe to release.",
    emailThreadId: "THR-884691",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10544",
    title: "Customer confirmed the corrected export but asked for one final audit clarification",
    status: "in_progress",
    signals: createCaseSignals(),
    situation: "Ready to close",
    urgency: "",
    owner: "Chiara Marino",
    nextStep: "Send the closure summary and close the case",
    checkpoint: "Review by Apr 16, 2026, 13:00 CET",
    reason:
      "The fix is confirmed and only a brief audit clarification remains before the case can close.",
    blockingReason: "none",
    priority: "Medium",
    assignee: "Chiara Marino",
    queue: "Customer Operations",
    statusReason:
      "Customer confirmed the corrected export is usable, but asked whether any earlier exports were affected for audit tracking.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Minor",
    productArea: "Billing Contact Export",
    category: "Export correction / Audit clarification",
    region: "Central Europe",
    source: "Customer Support Mailbox",
    timelinePolicy: "Standard Support",
    responseTarget: "2026-04-16 09:30 CET",
    resolutionTarget: "2026-04-16 13:00 CET",
    firstResponse: "2026-04-16 09:11 CET",
    lastUpdate: "2026-04-16 11:26 CET",
    slaStatus: "On track",
    breachRisk: "Low",
    customer: "Nordstern Dental Group",
    contact: "Eva Kruger",
    email: "eva.kruger@nordstern.example",
    accountTier: "Enterprise",
    contractType: "Enterprise subscription",
    routingGroup: "Customer Operations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "The billing contact export has been corrected and validated, but the customer wants one final clarification for their audit notes before the case is closed.",
    internalNotes:
      "Reply with the audit clarification, then send the closure summary and resolve the case if no new issue appears.",
    emailThreadId: "THR-884694",
    callReference: "",
    chatSessionId: "",
  }),
  buildCaseRecord({
    ...INITIAL_CASE_RECORD,
    id: "CASE-10545",
    title: "Escalated billing portal repair missed the last update window and needs a new ETA",
    status: "in_progress",
    signals: createCaseSignals({
      escalated: true,
    }),
    situation: "Escalated",
    urgency: "Today",
    owner: "Amelie Laurent",
    nextStep: "Coordinate the specialist response",
    checkpoint: "Review by Apr 15, 2026, 11:00 CET",
    reason:
      "The repair is delayed and the customer needs a clear ETA from the escalation owner.",
    blockingReason: "awaiting_engineering_fix",
    priority: "High",
    assignee: "Amelie Laurent",
    queue: "Platform Escalations",
    statusReason:
      "The repair update slipped past the committed window, and the customer is now asking for a new ETA and explanation.",
    onHoldUntil: "",
    channel: "Email",
    severity: "Critical",
    productArea: "Billing Portal",
    category: "Escalation management / Delayed repair update",
    region: "North America",
    source: "Customer Support Mailbox",
    timelinePolicy: "Enterprise Plus - Executive Escalation",
    responseTarget: "2026-04-15 09:15 CET",
    resolutionTarget: "2026-04-15 18:00 CET",
    firstResponse: "2026-04-15 08:58 CET",
    lastUpdate: "2026-04-15 10:22 CET",
    slaStatus: "At risk",
    breachRisk: "High",
    customer: "Northlake Medical Network",
    contact: "Sofia Bennett",
    email: "sofia.bennett@northlake.example",
    accountTier: "Enterprise Plus",
    contractType: "Enterprise subscription with executive escalation coverage",
    routingGroup: "Platform Escalations",
    approvalRequired: "No",
    approvalReason: "",
    description:
      "A billing portal repair remains escalated after the last customer update window slipped, and leadership now needs a firm ETA plus a clear explanation of what is still outstanding.",
    internalNotes:
      "Coordinate the next customer-facing update with the specialist owner so the new ETA is explicit and supportable.",
    emailThreadId: "THR-884699",
    callReference: "",
    chatSessionId: "",
  }),
]

export const activityTimelineItems: ActivityTimelineItem[] = [
  {
    id: "activity-0",
    timestamp: "Apr 1, 2026, 08:54 CET",
    timestampDateTime: "2026-04-01T08:54:00+02:00",
    type: "incoming",
    actor: "Marta Ruiz",
    subtype: "Customer",
    organization: "Viva la Vita Clinics SL",
    content:
      "Hi, we're still unable to access the invoice portal after resetting the password twice. This is blocking our finance team. Could you take a look?",
  },
  {
    id: "activity-1",
    timestamp: "Apr 1, 2026, 09:07 CET",
    timestampDateTime: "2026-04-01T09:07:00+02:00",
    type: "outgoing",
    actor: "Lucia Fernandez",
    subtype: "Support agent",
    organization: "VivaLaVita",
    content:
      "Thanks for flagging this, Marta. We've opened the case and are reviewing the invoice portal access state now. Please hold off on any additional password resets while we investigate.",
  },
  {
    id: "activity-2",
    timestamp: "Apr 1, 2026, 09:18 CET",
    timestampDateTime: "2026-04-01T09:18:00+02:00",
    type: "comment",
    actor: "Lucia Fernandez",
    subtype: "Support operations",
    organization: "VivaLaVita",
    content:
      "Customer confirmed the same access failure affects the finance lead in the clinic group. Preserve the current session logs while IAM validates the tenant-state mismatch.",
  },
  {
    id: "activity-3",
    timestamp: "Apr 1, 2026, 09:26 CET",
    timestampDateTime: "2026-04-01T09:26:00+02:00",
    type: "system",
    actor: "Identity monitor",
    subtype: "System",
    content:
      "Identity-service monitor detected a tenant-state mismatch between billing portal access roles and the clinic account profile.",
  },
  {
    id: "activity-4",
    timestamp: "Apr 1, 2026, 09:34 CET",
    timestampDateTime: "2026-04-01T09:34:00+02:00",
    type: "status-change",
    actor: "Auto-routing rule",
    subtype: "System",
    content:
      "Case moved from New to In progress and was assigned to Billing Portal Support after the portal access recovery workflow matched the incident pattern.",
  },
  {
    id: "activity-5",
    timestamp: "Apr 1, 2026, 09:41 CET",
    timestampDateTime: "2026-04-01T09:41:00+02:00",
    type: "outgoing",
    actor: "Lucia Fernandez",
    subtype: "Support agent",
    organization: "VivaLaVita",
    content:
      "We've corrected the account state and resynchronized the affected finance roles. When you have a moment, could you confirm that the impacted users can sign in again and see their invoices?",
  },
]

export const activityTimelineItemsByCaseId: Record<string, ActivityTimelineItem[]> = {
  "CASE-10482": activityTimelineItems,
  "CASE-10463": [
    {
      id: "case-10463-activity-0",
      timestamp: "Apr 1, 2026, 08:42 CET",
      timestampDateTime: "2026-04-01T08:42:00+02:00",
      type: "incoming",
      actor: "Eva Kruger",
      subtype: "Customer",
      organization: "Nordstern Dental Group",
      content:
        "We are seeing duplicate payment confirmation emails and some invoices look paid twice after this morning's payment batch.",
    },
    {
      id: "case-10463-activity-1",
      timestamp: "Apr 1, 2026, 08:49 CET",
      timestampDateTime: "2026-04-01T08:49:00+02:00",
      type: "system",
      actor: "Routing engine",
      subtype: "System",
      content:
        "Case ownership moved from General Support to Billing Operations after payment-batch signals matched the duplicate confirmation workflow.",
    },
    {
      id: "case-10463-activity-2",
      timestamp: "Apr 1, 2026, 08:55 CET",
      timestampDateTime: "2026-04-01T08:55:00+02:00",
      type: "outgoing",
      actor: "Jonas Weber",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks for reporting this. We're validating the duplicate confirmation pattern now and will confirm which invoices were actually affected before any corrections are made.",
    },
    {
      id: "case-10463-activity-3",
      timestamp: "Apr 1, 2026, 09:08 CET",
      timestampDateTime: "2026-04-01T09:08:00+02:00",
      type: "comment",
      actor: "Jonas Weber",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Confirmed that duplicate confirmation records are tied to a single reconciliation window. Billing operations is reviewing webhook deduplication before any invoice repair.",
    },
    {
      id: "case-10463-activity-4",
      timestamp: "Apr 1, 2026, 09:37 CET",
      timestampDateTime: "2026-04-01T09:37:00+02:00",
      type: "system",
      actor: "Payments monitor",
      subtype: "System",
      content:
        "Reconciliation monitor flagged a spike in duplicate confirmation events for the 08:00 CET payment batch.",
    },
    {
      id: "case-10463-activity-5",
      timestamp: "Apr 1, 2026, 11:22 CET",
      timestampDateTime: "2026-04-01T11:22:00+02:00",
      type: "outgoing",
      actor: "Jonas Weber",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've isolated the duplicate confirmation pattern and are validating affected invoices before we make any customer-visible corrections.",
    },
  ],
  "CASE-10511": [
    {
      id: "case-10511-activity-0",
      timestamp: "Apr 1, 2026, 09:54 CET",
      timestampDateTime: "2026-04-01T09:54:00+02:00",
      type: "incoming",
      actor: "Paolo Vitale",
      subtype: "Customer",
      organization: "Clinica Sorella",
      content:
        "Invoices from our merged clinic entity are still missing in the portal until the nightly sync finishes. This started right after the tenant migration.",
    },
    {
      id: "case-10511-activity-1",
      timestamp: "Apr 1, 2026, 10:05 CET",
      timestampDateTime: "2026-04-01T10:05:00+02:00",
      type: "outgoing",
      actor: "Marco Silva",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks, Paolo. We've confirmed the tenant migration detail and are checking why the merged clinic invoices do not appear until the nightly sync completes.",
    },
    {
      id: "case-10511-activity-2",
      timestamp: "Apr 1, 2026, 10:14 CET",
      timestampDateTime: "2026-04-01T10:14:00+02:00",
      type: "status-change",
      actor: "Marco Silva",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case moved from New to In progress after support confirmed the issue is reproducible and tied to a tenant-state sync delay.",
    },
    {
      id: "case-10511-activity-3",
      timestamp: "Apr 1, 2026, 11:03 CET",
      timestampDateTime: "2026-04-01T11:03:00+02:00",
      type: "system",
      actor: "Sync monitor",
      subtype: "System",
      content:
        "Tenant propagation job reported delayed sync completion for merged clinic entities after the latest migration window.",
    },
    {
      id: "case-10511-activity-4",
      timestamp: "Apr 1, 2026, 12:06 CET",
      timestampDateTime: "2026-04-01T12:06:00+02:00",
      type: "comment",
      actor: "Marco Silva",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Engineering is preparing a repair for the tenant-state sync job. Keep the case in active ownership until the internal fix is deployed.",
    },
  ],
  "CASE-10504": [
    {
      id: "case-10504-activity-0",
      timestamp: "Apr 1, 2026, 09:05 CET",
      timestampDateTime: "2026-04-01T09:05:00+02:00",
      type: "incoming",
      actor: "Sofia Bennett",
      subtype: "Customer",
      organization: "Northlake Medical Network",
      content:
        "Finance admins across our merged entities can only see a partial invoice list after the tenant migration. This needs executive visibility today.",
    },
    {
      id: "case-10504-activity-1",
      timestamp: "Apr 1, 2026, 09:18 CET",
      timestampDateTime: "2026-04-01T09:18:00+02:00",
      type: "status-change",
      typeLabel: "State change",
      actor: "Amelie Laurent",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case state moved to Escalated and ownership shifted to Platform Escalations after support confirmed the visibility issue affects multiple merged entities.",
    },
    {
      id: "case-10504-activity-2",
      timestamp: "Apr 1, 2026, 09:26 CET",
      timestampDateTime: "2026-04-01T09:26:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've escalated this to platform engineering and are treating it as a leadership-visible incident. We'll share the next confirmed findings in the next update window.",
    },
    {
      id: "case-10504-activity-3",
      timestamp: "Apr 1, 2026, 10:02 CET",
      timestampDateTime: "2026-04-01T10:02:00+02:00",
      type: "system",
      actor: "Routing engine",
      subtype: "System",
      content:
        "Escalation routing matched the case to the tenant migration visibility workflow and assigned executive escalation coverage.",
    },
    {
      id: "case-10504-activity-4",
      timestamp: "Apr 1, 2026, 11:08 CET",
      timestampDateTime: "2026-04-01T11:08:00+02:00",
      type: "comment",
      actor: "Amelie Laurent",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Keep the rollback window open until platform engineering confirms the full invoice visibility scope across all merged entities.",
    },
    {
      id: "case-10504-activity-5",
      timestamp: "Apr 1, 2026, 12:34 CET",
      timestampDateTime: "2026-04-01T12:34:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Platform engineering is actively reviewing the visibility scopes. We'll share the next confirmed findings in the next update window.",
    },
  ],
  "CASE-10388": [
    {
      id: "case-10388-activity-0",
      timestamp: "Apr 1, 2026, 14:12 CET",
      timestampDateTime: "2026-04-01T14:12:00+02:00",
      type: "incoming",
      actor: "Ana Perez",
      subtype: "Customer",
      organization: "Vida Clara Centro Medico",
      content:
        "Can VAT labels in invoice exports be renamed for our local market?",
    },
    {
      id: "case-10388-activity-1",
      timestamp: "Apr 1, 2026, 14:14 CET",
      timestampDateTime: "2026-04-01T14:14:00+02:00",
      type: "system",
      actor: "Chat routing rule",
      subtype: "System",
      content:
        "Chat intake routed the request to General Support because the customer asked for a configuration clarification rather than reporting an incident.",
    },
    {
      id: "case-10388-activity-2",
      timestamp: "Apr 1, 2026, 14:16 CET",
      timestampDateTime: "2026-04-01T14:16:00+02:00",
      type: "comment",
      actor: "Anais Martin",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Assigned to General Support. Awaiting first response while we confirm whether VAT labels can be configured per export template.",
    },
  ],
  "CASE-10412": [
    {
      id: "case-10412-activity-0",
      timestamp: "Mar 31, 2026, 13:34 CET",
      timestampDateTime: "2026-03-31T13:34:00+02:00",
      type: "incoming",
      actor: "Paolo Vitale",
      subtype: "Customer",
      organization: "Clinica Sorella",
      content:
        "Our finance users still cannot access the billing portal this afternoon. Password reset did not restore access.",
    },
    {
      id: "case-10412-activity-1",
      timestamp: "Mar 31, 2026, 13:42 CET",
      timestampDateTime: "2026-03-31T13:42:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks for reporting this. We have opened an incident and are reviewing the portal access state now.",
    },
    {
      id: "case-10412-activity-2",
      timestamp: "Mar 31, 2026, 13:49 CET",
      timestampDateTime: "2026-03-31T13:49:00+02:00",
      type: "status-change",
      actor: "Chiara Marino",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case moved from New to In progress after support confirmed the access failure affects multiple finance users.",
    },
    {
      id: "case-10412-activity-3",
      timestamp: "Mar 31, 2026, 14:06 CET",
      timestampDateTime: "2026-03-31T14:06:00+02:00",
      type: "system",
      actor: "Identity monitor",
      subtype: "System",
      content:
        "Identity-service monitor detected a tenant-state mismatch between billing portal access roles and the clinic account profile.",
    },
    {
      id: "case-10412-activity-4",
      timestamp: "Mar 31, 2026, 14:18 CET",
      timestampDateTime: "2026-03-31T14:18:00+02:00",
      type: "comment",
      actor: "Chiara Marino",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Captured current session logs and requested IAM validation before asking the customer to retry access.",
    },
    {
      id: "case-10412-activity-5",
      timestamp: "Mar 31, 2026, 15:02 CET",
      timestampDateTime: "2026-03-31T15:02:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We found an account-state issue and are applying a remediation. Please hold off on additional password resets while we complete the repair.",
    },
    {
      id: "case-10412-activity-6",
      timestamp: "Mar 31, 2026, 16:11 CET",
      timestampDateTime: "2026-03-31T16:11:00+02:00",
      type: "system",
      actor: "Access repair workflow",
      subtype: "System",
      content:
        "Tenant-state remediation completed and billing portal role assignments were resynchronized for the affected clinic account.",
    },
    {
      id: "case-10412-activity-7",
      timestamp: "Mar 31, 2026, 16:28 CET",
      timestampDateTime: "2026-03-31T16:28:00+02:00",
      type: "comment",
      actor: "Chiara Marino",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Internal validation passed for both finance users. Prepared customer follow-up asking for live confirmation from the clinic team.",
    },
    {
      id: "case-10412-activity-8",
      timestamp: "Apr 1, 2026, 08:37 CET",
      timestampDateTime: "2026-04-01T08:37:00+02:00",
      type: "incoming",
      actor: "Paolo Vitale",
      subtype: "Customer",
      organization: "Clinica Sorella",
      content:
        "Confirmed that both finance users can sign in again and invoices are visible. Please send us a written resolution summary for our records.",
    },
    {
      id: "case-10412-activity-9",
      timestamp: "Apr 1, 2026, 08:52 CET",
      timestampDateTime: "2026-04-01T08:52:00+02:00",
      type: "status-change",
      actor: "Chiara Marino",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case moved from In progress to Resolved after the customer confirmed access was restored and invoice visibility returned.",
    },
    {
      id: "case-10412-activity-10",
      timestamp: "Apr 1, 2026, 09:04 CET",
      timestampDateTime: "2026-04-01T09:04:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Shared a written resolution summary describing the account-state mismatch, the remediation performed, and the verification steps completed.",
    },
    {
      id: "case-10412-activity-11",
      timestamp: "Apr 1, 2026, 16:18 CET",
      timestampDateTime: "2026-04-01T16:18:00+02:00",
      type: "comment",
      actor: "Chiara Marino",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Filed the post-incident note, linked the IAM repair reference, and queued the case for standard closure confirmation tracking.",
    },
    {
      id: "case-10412-activity-12",
      timestamp: "Apr 2, 2026, 10:14 CET",
      timestampDateTime: "2026-04-02T10:14:00+02:00",
      type: "incoming",
      actor: "Paolo Vitale",
      subtype: "Customer",
      organization: "Clinica Sorella",
      content:
        "Thanks for the summary. We have everything we need and can close the incident on our side.",
    },
  ],
  "CASE-10519": [
    {
      id: "case-10519-activity-0",
      timestamp: "Apr 10, 2026, 09:44 CET",
      timestampDateTime: "2026-04-10T09:44:00+02:00",
      type: "incoming",
      actor: "Valeria Soto",
      subtype: "Customer",
      organization: "Grupo Medico Esperanza",
      content:
        "The regenerated statements look closer, but we still need to confirm whether the updated branding is correct across all clinics before we sign this off.",
    },
    {
      id: "case-10519-activity-1",
      timestamp: "Apr 10, 2026, 10:18 CET",
      timestampDateTime: "2026-04-10T10:18:00+02:00",
      type: "outgoing",
      actor: "Lucia Fernandez",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks, Valeria. When you have a moment, could you confirm whether the corrected branding is now approved for all clinic statements, or let us know which entity still needs adjustment?",
    },
    {
      id: "case-10519-activity-2",
      timestamp: "Apr 10, 2026, 11:08 CET",
      timestampDateTime: "2026-04-10T11:08:00+02:00",
      type: "comment",
      actor: "Lucia Fernandez",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Customer confirmation is still pending after the clarification request. Keep the case in the waiting state until they validate the final statement set.",
    },
  ],
  "CASE-10516": [
    {
      id: "case-10516-activity-0",
      timestamp: "Apr 10, 2026, 10:48 CET",
      timestampDateTime: "2026-04-10T10:48:00+02:00",
      type: "incoming",
      actor: "Irene Costa",
      subtype: "Customer",
      organization: "Clinica Mar Azul",
      content:
        "Today's settlement export is missing the low-volume adjustment rows for several clinics, so our finance team is reconciling them manually.",
    },
    {
      id: "case-10516-activity-1",
      timestamp: "Apr 10, 2026, 11:04 CET",
      timestampDateTime: "2026-04-10T11:04:00+02:00",
      type: "outgoing",
      actor: "Nadia Romero",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks for flagging this. We're validating the settlement export now and will confirm whether the missing adjustment rows are limited to the affected clinics.",
    },
    {
      id: "case-10516-activity-2",
      timestamp: "Apr 10, 2026, 11:26 CET",
      timestampDateTime: "2026-04-10T11:26:00+02:00",
      type: "system",
      actor: "Export monitor",
      subtype: "System",
      content:
        "Settlement export monitoring detected adjustment rows posted after the batch cutoff were omitted from the summary file for a subset of clinic entities.",
    },
    {
      id: "case-10516-activity-3",
      timestamp: "Apr 10, 2026, 12:03 CET",
      timestampDateTime: "2026-04-10T12:03:00+02:00",
      type: "status-change",
      actor: "Routing engine",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case ownership moved from Billing Operations to Finance Integrations after support confirmed the issue sits in settlement export logic rather than reconciliation workflow.",
    },
    {
      id: "case-10516-activity-4",
      timestamp: "Apr 11, 2026, 08:27 CET",
      timestampDateTime: "2026-04-11T08:27:00+02:00",
      type: "comment",
      actor: "Nadia Romero",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Initial analysis suggests the export job skips low-volume adjustments that post after the batch window but before summary generation. Investigation remains active while we validate the affected clinics.",
    },
  ],
  "CASE-10518": [
    {
      id: "case-10518-activity-0",
      timestamp: "Apr 11, 2026, 08:12 CET",
      timestampDateTime: "2026-04-11T08:12:00+02:00",
      type: "incoming",
      actor: "Tessa Morgan",
      subtype: "Customer",
      organization: "Harborview Clinics",
      content:
        "Can overdue invoice reminders be delayed by two business days for a subset of our self-pay clinics?",
    },
    {
      id: "case-10518-activity-1",
      timestamp: "Apr 11, 2026, 08:15 CET",
      timestampDateTime: "2026-04-11T08:15:00+02:00",
      type: "system",
      actor: "Chat routing rule",
      subtype: "System",
      content:
        "Chat intake routed the configuration request to General Support because no automation failure or delivery incident was detected.",
    },
    {
      id: "case-10518-activity-2",
      timestamp: "Apr 11, 2026, 08:19 CET",
      timestampDateTime: "2026-04-11T08:19:00+02:00",
      type: "comment",
      actor: "Triage queue",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Queued for assignment. Need to confirm whether reminder cadence can be configured per clinic segment before sending the first response.",
    },
  ],
  "CASE-10521": [
    {
      id: "case-10521-activity-0",
      timestamp: "Apr 11, 2026, 08:31 CET",
      timestampDateTime: "2026-04-11T08:31:00+02:00",
      type: "incoming",
      actor: "Lena Fischer",
      subtype: "Customer",
      organization: "Helios Care Network",
      content:
        "A subset of clinics in today's cross-border invoice bundle is calculating with the wrong tax rule. We need this corrected before the noon release.",
    },
    {
      id: "case-10521-activity-1",
      timestamp: "Apr 11, 2026, 08:52 CET",
      timestampDateTime: "2026-04-11T08:52:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've opened an executive escalation and are validating the affected clinics now. We'll confirm the approval path before any tax-rule override is applied.",
    },
    {
      id: "case-10521-activity-2",
      timestamp: "Apr 11, 2026, 09:03 CET",
      timestampDateTime: "2026-04-11T09:03:00+02:00",
      type: "status-change",
      typeLabel: "State change",
      actor: "Amelie Laurent",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case state moved to Escalated and ownership shifted to Platform Escalations because product and compliance approval is required before a production tax override.",
    },
    {
      id: "case-10521-activity-3",
      timestamp: "Apr 11, 2026, 09:11 CET",
      timestampDateTime: "2026-04-11T09:11:00+02:00",
      type: "system",
      actor: "Approval workflow",
      subtype: "System",
      content:
        "Approval workflow opened a product-and-compliance signoff request for the cross-border tax-rule override before the same-day invoice release.",
    },
    {
      id: "case-10521-activity-4",
      timestamp: "Apr 11, 2026, 09:18 CET",
      timestampDateTime: "2026-04-11T09:18:00+02:00",
      type: "comment",
      actor: "Amelie Laurent",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Track approvals tightly before applying any corrective override to the production tax-rule set. Finance leadership needs the next checkpoint as soon as signoff is complete.",
    },
  ],
  "CASE-10531": [
    {
      id: "case-10531-activity-0",
      timestamp: "Apr 12, 2026, 08:28 CET",
      timestampDateTime: "2026-04-12T08:28:00+02:00",
      type: "incoming",
      actor: "Nora Weiss",
      subtype: "Customer",
      organization: "Alpen Care Group",
      content:
        "We need confirmation that the corrective tax-rule release is still on track before billing cutoff. Please let us know whether approval is the only blocker left.",
    },
    {
      id: "case-10531-activity-1",
      timestamp: "Apr 12, 2026, 08:42 CET",
      timestampDateTime: "2026-04-12T08:42:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "The corrective release is ready, but we still need product and compliance approval before production can proceed. I'll share the next approval checkpoint as soon as it clears.",
    },
    {
      id: "case-10531-activity-2",
      timestamp: "Apr 12, 2026, 09:14 CET",
      timestampDateTime: "2026-04-12T09:14:00+02:00",
      type: "system",
      actor: "Approval workflow",
      subtype: "System",
      content:
        "Approval workflow escalated the corrective tax-rule release because the billing cutoff is approaching and final signoff is still pending.",
    },
    {
      id: "case-10531-activity-3",
      timestamp: "Apr 12, 2026, 10:18 CET",
      timestampDateTime: "2026-04-12T10:18:00+02:00",
      type: "comment",
      actor: "Amelie Laurent",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Approval remains the gating step and SLA risk is now high. Keep finance leadership updated while the signoff path remains active.",
    },
  ],
  "CASE-10527": [
    {
      id: "case-10527-activity-0",
      timestamp: "Apr 12, 2026, 08:36 CET",
      timestampDateTime: "2026-04-12T08:36:00+02:00",
      type: "incoming",
      actor: "Rachel Kim",
      subtype: "Customer",
      organization: "Summit Surgical Partners",
      content:
        "Our surgical centers still cannot see today's invoice batch, and the finance cutoff is approaching. We need a status update on the escalation now.",
    },
    {
      id: "case-10527-activity-1",
      timestamp: "Apr 12, 2026, 08:47 CET",
      timestampDateTime: "2026-04-12T08:47:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've kept the escalation active with platform engineering and are tracking the repair status closely. I'll send the next checkpoint before the release window closes.",
    },
    {
      id: "case-10527-activity-2",
      timestamp: "Apr 12, 2026, 09:22 CET",
      timestampDateTime: "2026-04-12T09:22:00+02:00",
      type: "status-change",
      typeLabel: "State change",
      actor: "Amelie Laurent",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case state remains Escalated while platform engineering repairs the invoice visibility cache propagation issue affecting the daily release window.",
    },
    {
      id: "case-10527-activity-3",
      timestamp: "Apr 12, 2026, 11:36 CET",
      timestampDateTime: "2026-04-12T11:36:00+02:00",
      type: "comment",
      actor: "Amelie Laurent",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Repair is still in progress and the case is now at high SLA risk. Keep leadership informed while engineering works the active escalation.",
    },
  ],
  "CASE-10532": [
    {
      id: "case-10532-activity-0",
      timestamp: "Apr 12, 2026, 10:01 CET",
      timestampDateTime: "2026-04-12T10:01:00+02:00",
      type: "incoming",
      actor: "Valeria Soto",
      subtype: "Customer",
      organization: "Grupo Medico Esperanza",
      content:
        "Please send the corrected invoice branding set when it's ready. We need to confirm it across the clinic group before closing this out.",
    },
    {
      id: "case-10532-activity-1",
      timestamp: "Apr 12, 2026, 10:05 CET",
      timestampDateTime: "2026-04-12T10:05:00+02:00",
      type: "outgoing",
      actor: "Lucia Fernandez",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've sent the corrected branding set. When you have a moment, please confirm whether it is approved across all clinics.",
    },
    {
      id: "case-10532-activity-2",
      timestamp: "Apr 12, 2026, 16:42 CET",
      timestampDateTime: "2026-04-12T16:42:00+02:00",
      type: "outgoing",
      actor: "Lucia Fernandez",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Following up on the corrected branding set in case you have already reviewed it. We still need your confirmation before we can close the case.",
    },
    {
      id: "case-10532-activity-3",
      timestamp: "Apr 13, 2026, 11:12 CET",
      timestampDateTime: "2026-04-13T11:12:00+02:00",
      type: "comment",
      actor: "Lucia Fernandez",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Two planned follow-ups have already been sent and there is still no customer reply. Hold the case until the customer re-engages or the hold date expires.",
    },
  ],
  "CASE-10509": [
    {
      id: "case-10509-activity-0",
      timestamp: "Apr 9, 2026, 13:28 CET",
      timestampDateTime: "2026-04-09T13:28:00+02:00",
      type: "incoming",
      actor: "Miguel Ortega",
      subtype: "Customer",
      organization: "Clinica Vista Serena",
      content:
        "We need access to the archived remittance files from the prior fiscal quarter because our finance audit reopened the reconciliation review.",
    },
    {
      id: "case-10509-activity-1",
      timestamp: "Apr 9, 2026, 13:41 CET",
      timestampDateTime: "2026-04-09T13:41:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks, Miguel. We're restoring the archived package now and will confirm access once the prior-quarter remittance files are available.",
    },
    {
      id: "case-10509-activity-2",
      timestamp: "Apr 9, 2026, 14:22 CET",
      timestampDateTime: "2026-04-09T14:22:00+02:00",
      type: "system",
      actor: "Archive retrieval workflow",
      subtype: "System",
      content:
        "Archive retrieval started for the prior fiscal quarter remittance package and restored the secure download workspace for the requesting account.",
    },
    {
      id: "case-10509-activity-3",
      timestamp: "Apr 9, 2026, 15:08 CET",
      timestampDateTime: "2026-04-09T15:08:00+02:00",
      type: "comment",
      actor: "Chiara Marino",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Validated that the restored package contains the full prior-quarter remittance file set requested by the finance audit team.",
    },
    {
      id: "case-10509-activity-4",
      timestamp: "Apr 9, 2026, 16:12 CET",
      timestampDateTime: "2026-04-09T16:12:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've restored access to the archived remittance package and shared the secure download instructions. Please confirm the files cover everything your audit team needs.",
    },
    {
      id: "case-10509-activity-5",
      timestamp: "Apr 9, 2026, 17:36 CET",
      timestampDateTime: "2026-04-09T17:36:00+02:00",
      type: "incoming",
      actor: "Miguel Ortega",
      subtype: "Customer",
      organization: "Clinica Vista Serena",
      content:
        "Confirmed that we can access the full prior-quarter package now. This covers everything the audit team needed.",
    },
  ],
  "CASE-10524": [
    {
      id: "case-10524-activity-0",
      timestamp: "Apr 12, 2026, 10:11 CET",
      timestampDateTime: "2026-04-12T10:11:00+02:00",
      type: "incoming",
      actor: "Megan Holt",
      subtype: "Customer",
      organization: "Harborview Specialty Clinics",
      content:
        "The payer mapping in yesterday's remittance export still grouped two clinic entities together. Can you regenerate it with the corrected split?",
    },
    {
      id: "case-10524-activity-1",
      timestamp: "Apr 12, 2026, 10:24 CET",
      timestampDateTime: "2026-04-12T10:24:00+02:00",
      type: "outgoing",
      actor: "Lucia Fernandez",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've regenerated the remittance export with the corrected payer mapping. When you have a moment, please confirm the updated file now matches the clinic-level accounting split you expected.",
    },
    {
      id: "case-10524-activity-2",
      timestamp: "Apr 12, 2026, 11:03 CET",
      timestampDateTime: "2026-04-12T11:03:00+02:00",
      type: "system",
      actor: "Export regeneration workflow",
      subtype: "System",
      content:
        "Remittance export regenerated with the corrected payer mapping and attached to the case for customer validation.",
    },
    {
      id: "case-10524-activity-3",
      timestamp: "Apr 12, 2026, 14:06 CET",
      timestampDateTime: "2026-04-12T14:06:00+02:00",
      type: "comment",
      actor: "Lucia Fernandez",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "No customer reply yet after sharing the regenerated export. Keep the case in a waiting state until they validate the corrected payer split.",
    },
  ],
  "CASE-10526": [
    {
      id: "case-10526-activity-0",
      timestamp: "Apr 12, 2026, 08:58 CET",
      timestampDateTime: "2026-04-12T08:58:00+02:00",
      type: "incoming",
      actor: "Irene Costa",
      subtype: "Customer",
      organization: "Clinica Mar Azul",
      content:
        "Today's settlement export is still missing the insurance adjustment codes for several clinics, which is blocking reconciliation.",
    },
    {
      id: "case-10526-activity-1",
      timestamp: "Apr 12, 2026, 09:11 CET",
      timestampDateTime: "2026-04-12T09:11:00+02:00",
      type: "outgoing",
      actor: "Nadia Romero",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We've isolated the export issue and are regenerating the affected settlement file now. I'll confirm once the corrected output is ready for review.",
    },
    {
      id: "case-10526-activity-2",
      timestamp: "Apr 12, 2026, 11:46 CET",
      timestampDateTime: "2026-04-12T11:46:00+02:00",
      type: "system",
      actor: "Settlement export workflow",
      subtype: "System",
      content:
        "Corrected settlement export generated with the previously missing insurance adjustment codes restored for the affected clinics.",
    },
    {
      id: "case-10526-activity-3",
      timestamp: "Apr 12, 2026, 15:22 CET",
      timestampDateTime: "2026-04-12T15:22:00+02:00",
      type: "comment",
      actor: "Nadia Romero",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Validated the regenerated export against the affected clinic records. The missing adjustment codes are present and the case is ready to resolve after sending the closure summary.",
    },
  ],
  "CASE-10542": [
    {
      id: "case-10542-activity-0",
      timestamp: "Apr 13, 2026, 09:54 CET",
      timestampDateTime: "2026-04-13T09:54:00+02:00",
      type: "incoming",
      actor: "Valeria Soto",
      subtype: "Customer",
      organization: "Grupo Medico Esperanza",
      content:
        "The updated statement header looks right for the current files. Will archived statements also show the same header, or do we need to approve those separately?",
    },
    {
      id: "case-10542-activity-1",
      timestamp: "Apr 13, 2026, 10:08 CET",
      timestampDateTime: "2026-04-13T10:08:00+02:00",
      type: "outgoing",
      actor: "Lucia Fernandez",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks for reviewing the current statement set. I'm checking the archive behavior now so we can confirm whether any separate approval is needed for the historical files.",
    },
    {
      id: "case-10542-activity-2",
      timestamp: "Apr 13, 2026, 10:41 CET",
      timestampDateTime: "2026-04-13T10:41:00+02:00",
      type: "comment",
      actor: "Lucia Fernandez",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Customer is close to confirming the correction, but they want a clear answer on archived statement behavior before they sign off.",
    },
    {
      id: "case-10542-activity-3",
      timestamp: "Apr 13, 2026, 15:42 CET",
      timestampDateTime: "2026-04-13T15:42:00+02:00",
      type: "incoming",
      actor: "Valeria Soto",
      subtype: "Customer",
      organization: "Grupo Medico Esperanza",
      content:
        "If archived statements stay unchanged, that's fine. We just need to know whether anything older than this month still needs approval from our finance lead.",
    },
  ],
  "CASE-10543": [
    {
      id: "case-10543-activity-0",
      timestamp: "Apr 15, 2026, 09:02 CET",
      timestampDateTime: "2026-04-15T09:02:00+02:00",
      type: "incoming",
      actor: "Irene Costa",
      subtype: "Customer",
      organization: "Clinica Mar Azul",
      content:
        "Can you confirm whether the corrected remittance file will be ready before tomorrow's finance batch? We need to plan around it if not.",
    },
    {
      id: "case-10543-activity-1",
      timestamp: "Apr 15, 2026, 09:12 CET",
      timestampDateTime: "2026-04-15T09:12:00+02:00",
      type: "outgoing",
      actor: "Nadia Romero",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "We're validating the corrected remittance file now and will update you as soon as engineering confirms whether it is safe for the next batch window.",
    },
    {
      id: "case-10543-activity-2",
      timestamp: "Apr 15, 2026, 11:26 CET",
      timestampDateTime: "2026-04-15T11:26:00+02:00",
      type: "system",
      actor: "Remittance validation workflow",
      subtype: "System",
      content:
        "Validation job completed the first pass on the corrected remittance file and flagged one clinic-level adjustment total for manual review.",
    },
    {
      id: "case-10543-activity-3",
      timestamp: "Apr 15, 2026, 12:04 CET",
      timestampDateTime: "2026-04-15T12:04:00+02:00",
      type: "comment",
      actor: "Nadia Romero",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Manual review is still in progress for one clinic total. We can reply with a grounded status update, but not a confirmed release time yet.",
    },
    {
      id: "case-10543-activity-4",
      timestamp: "Apr 15, 2026, 14:18 CET",
      timestampDateTime: "2026-04-15T14:18:00+02:00",
      type: "incoming",
      actor: "Irene Costa",
      subtype: "Customer",
      organization: "Clinica Mar Azul",
      content:
        "Checking again before our planning call. Should we expect the corrected file today, or is this moving to tomorrow?",
    },
  ],
  "CASE-10544": [
    {
      id: "case-10544-activity-0",
      timestamp: "Apr 16, 2026, 08:48 CET",
      timestampDateTime: "2026-04-16T08:48:00+02:00",
      type: "incoming",
      actor: "Eva Kruger",
      subtype: "Customer",
      organization: "Nordstern Dental Group",
      content:
        "The corrected billing contact export looks right now. Before we close this, can you confirm whether any files from last week were affected or only today's export?",
    },
    {
      id: "case-10544-activity-1",
      timestamp: "Apr 16, 2026, 09:11 CET",
      timestampDateTime: "2026-04-16T09:11:00+02:00",
      type: "outgoing",
      actor: "Chiara Marino",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "Thanks for confirming the corrected export. I'm checking the audit trail now so I can confirm whether any earlier files were affected before we send the closure summary.",
    },
    {
      id: "case-10544-activity-2",
      timestamp: "Apr 16, 2026, 10:06 CET",
      timestampDateTime: "2026-04-16T10:06:00+02:00",
      type: "system",
      actor: "Export audit trail",
      subtype: "System",
      content:
        "Audit review confirmed the contact-field correction only affected the Apr 16 export run and no prior billing contact files were modified.",
    },
    {
      id: "case-10544-activity-3",
      timestamp: "Apr 16, 2026, 11:26 CET",
      timestampDateTime: "2026-04-16T11:26:00+02:00",
      type: "incoming",
      actor: "Eva Kruger",
      subtype: "Customer",
      organization: "Nordstern Dental Group",
      content:
        "Perfect, thanks. If that only affected today's file, a short written note for our audit folder is enough and we can close it after that.",
    },
  ],
  "CASE-10545": [
    {
      id: "case-10545-activity-0",
      timestamp: "Apr 15, 2026, 08:42 CET",
      timestampDateTime: "2026-04-15T08:42:00+02:00",
      type: "incoming",
      actor: "Sofia Bennett",
      subtype: "Customer",
      organization: "Northlake Medical Network",
      content:
        "We did not receive the 08:30 update you committed to. What is the new ETA for the billing portal repair, and what is still blocking it?",
    },
    {
      id: "case-10545-activity-1",
      timestamp: "Apr 15, 2026, 08:58 CET",
      timestampDateTime: "2026-04-15T08:58:00+02:00",
      type: "outgoing",
      actor: "Amelie Laurent",
      subtype: "Support agent",
      organization: "VivaLaVita",
      content:
        "I've kept the escalation active and am pulling the latest repair status from the specialist owner now. I'll confirm the next ETA as soon as I have a supportable update.",
    },
    {
      id: "case-10545-activity-2",
      timestamp: "Apr 15, 2026, 09:07 CET",
      timestampDateTime: "2026-04-15T09:07:00+02:00",
      type: "status-change",
      typeLabel: "State change",
      actor: "Amelie Laurent",
      subtype: "Support operations",
      organization: "VivaLaVita",
      content:
        "Case state remains Escalated while platform engineering completes the active billing portal repair and prepares the next customer-facing ETA.",
    },
    {
      id: "case-10545-activity-3",
      timestamp: "Apr 15, 2026, 09:34 CET",
      timestampDateTime: "2026-04-15T09:34:00+02:00",
      type: "comment",
      actor: "Amelie Laurent",
      subtype: "Internal note",
      organization: "VivaLaVita",
      content:
        "Need a precise ETA from engineering before replying again. Avoid vague language because the missed update window is now part of the customer concern.",
    },
    {
      id: "case-10545-activity-4",
      timestamp: "Apr 15, 2026, 10:22 CET",
      timestampDateTime: "2026-04-15T10:22:00+02:00",
      type: "incoming",
      actor: "Sofia Bennett",
      subtype: "Customer",
      organization: "Northlake Medical Network",
      content:
        "Please confirm whether this is still expected today. Finance leadership is asking whether we need to activate the workaround for another full cycle.",
    },
  ],
}
