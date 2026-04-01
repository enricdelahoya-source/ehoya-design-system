import { useState } from "react"
import Button from "./components/Button"
import type { CaseStatus } from "./components/CaseStatusBadge"
import Field from "./components/Field"
import FieldGrid from "./components/FieldGrid"
import FormFieldGrid from "./components/FormFieldGrid"
import FieldStack from "./components/FieldStack"
import FormLayout from "./components/FormLayout"
import FormSection from "./components/FormSection"
import Input from "./components/Input"
import Link from "./components/Link"
import PageContent from "./components/PageContent"
import ReadOnlyValue from "./components/ReadOnlyValue"
import RecordSection from "./components/RecordSection"
import RecordShellBar from "./components/RecordShellBar"
import Select from "./components/Select"
import Textarea from "./components/Textarea"

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

function getChannelReferenceValue(record: CaseRecord) {
  switch (record.channel) {
    case "Phone":
      return record.callReference
    case "Chat":
      return record.chatSessionId
    case "Email":
      return record.emailThreadId
    case "Portal":
    default:
      return ""
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

const aiSummary =
  "Customer appears blocked by an authentication loop after multiple password resets. Recent mail-delivery checks suggest the issue is not with the reset flow itself.\n\nAccount-state synchronization between identity services and the billing portal is the most likely cause. If confirmed, the next step is controlled account remediation rather than additional customer-driven resets."

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

const asideTitleStyles = {
  fontSize: "var(--text-aside-title)",
  lineHeight: "var(--leading-aside-title)",
  fontWeight: "var(--font-weight-bold)",
  letterSpacing: "normal",
  color: "var(--color-text-primary)",
} as const

export default function App() {
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [savedRecord, setSavedRecord] = useState(INITIAL_CASE_RECORD)
  const [draftRecord, setDraftRecord] = useState(INITIAL_CASE_RECORD)
  const [responseTargetEdited, setResponseTargetEdited] = useState(false)
  const [resolutionTargetEdited, setResolutionTargetEdited] = useState(false)
  const [touched, setTouched] = useState({
    title: false,
    priority: false,
  })
  const [saveAttempted, setSaveAttempted] = useState(false)

  const hasUnsavedChanges =
    JSON.stringify(savedRecord) !== JSON.stringify(draftRecord)

  const titleError = draftRecord.title.trim() ? undefined : "Title is required"
  const priorityError = draftRecord.priority ? undefined : "Priority is required"

  const visibleTitleError =
    touched.title || saveAttempted ? titleError : undefined
  const visiblePriorityError =
    touched.priority || saveAttempted ? priorityError : undefined

  const showDraftStatusReason = shouldShowStatusReason(draftRecord.status)
  const showDraftOnHoldUntil = shouldShowOnHoldUntil(draftRecord.status)
  const showSavedStatusReason = shouldShowStatusReason(savedRecord.status)
  const showSavedOnHoldUntil = shouldShowOnHoldUntil(savedRecord.status)
  const savedChannelReferenceLabel = getChannelReferenceLabel(savedRecord.channel)
  const draftChannelReferenceLabel = getChannelReferenceLabel(draftRecord.channel)

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

  function enterEditMode() {
    resetEditState(savedRecord)
    setMode("edit")
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

  function handleChannelReferenceChange(value: string) {
    switch (draftRecord.channel) {
      case "Email":
        updateDraft("emailThreadId", value)
        break
      case "Phone":
        updateDraft("callReference", value)
        break
      case "Chat":
        updateDraft("chatSessionId", value)
        break
      case "Portal":
      default:
        break
    }
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

    setSavedRecord(draftRecord)
    resetEditState(draftRecord)
    setMode("view")
  }

  return (
    <main className="min-h-screen bg-page text-text-default [font-family:var(--font-sans)]">
      <PageContent width="xl">
        {mode === "view" ? (
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
                <Button variant="secondary" onClick={enterEditMode}>
                  Edit
                </Button>
              }
            />

            <div className="grid items-start gap-[var(--space-section-sm)] xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
              <div className="min-w-0 space-y-[var(--space-4)]">
                <RecordSection
                  title="Status & ownership"
                  description="Current operational state, ownership, and hold information for the case."
                  className="pt-[var(--space-4)]"
                >
                  <FieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                    <Field label="Status" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.status)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Priority" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.priority)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Assignee" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.assignee)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Queue" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.queue)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>

                    {showSavedStatusReason ? (
                      <Field label="Status reason" variant="tight">
                        <ReadOnlyValue
                          size="sm"
                          value={getDisplayValue(savedRecord.statusReason)}
                          behavior="flexible"
                          variant="compact"
                        />
                      </Field>
                    ) : null}

                    {showSavedOnHoldUntil ? (
                      <Field label="On hold until" variant="tight">
                        <ReadOnlyValue
                          size="sm"
                          value={getDisplayValue(savedRecord.onHoldUntil)}
                          behavior="compact"
                          variant="compact"
                        />
                      </Field>
                    ) : null}
                  </FieldGrid>
                </RecordSection>

                <RecordSection
                  title="Classification"
                  description="Categorization details used to route, report, and triage the case."
                  className="pt-[var(--space-4)]"
                >
                  <FieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
                    <Field label="Channel" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.channel)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Severity" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.severity)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Region" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.region)}
                        behavior="compact"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Source" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.source)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Product area" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.productArea)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    <Field label="Category" variant="tight">
                      <ReadOnlyValue
                        size="sm"
                        value={getDisplayValue(savedRecord.category)}
                        behavior="flexible"
                        variant="compact"
                      />
                    </Field>
                    {savedChannelReferenceLabel ? (
                      <Field label={savedChannelReferenceLabel} variant="tight">
                        <ReadOnlyValue
                          size="sm"
                          value={getDisplayValue(getChannelReferenceValue(savedRecord))}
                          behavior="flexible"
                          variant="compact"
                        />
                      </Field>
                    ) : null}
                  </FieldGrid>
                </RecordSection>

                <RecordSection
                  title="SLA & timing"
                  description="Service-level settings, active targets, and timing signals for the current case."
                  className="pt-[var(--space-4)]"
                >
                  <FieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
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
                  </FieldGrid>
                </RecordSection>

                <RecordSection
                  title="Customer & context"
                  description="Customer identity, contact information, and commercial context for the case."
                  className="pt-[var(--space-4)]"
                >
                  <FieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
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
                  </FieldGrid>
                </RecordSection>

                <RecordSection
                  title="Case handling"
                  description="Escalation and approval settings that affect operational execution."
                  className="pt-[var(--space-4)]"
                >
                  <FieldGrid className="gap-y-[var(--space-3)] lg:grid-cols-2">
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
                  </FieldGrid>
                </RecordSection>

                <RecordSection
                  title="Description"
                  description="Current customer-facing summary of the reported issue."
                >
                  <FieldStack>
                    <ReadOnlyValue size="sm" value={getDisplayValue(savedRecord.description)} multiline />
                  </FieldStack>
                </RecordSection>

                <RecordSection
                  title="Internal notes"
                  description="Internal notes captured during investigation and follow-up."
                >
                  <FieldStack>
                    <ReadOnlyValue size="sm" value={getDisplayValue(savedRecord.internalNotes)} multiline />
                  </FieldStack>
                </RecordSection>
              </div>

              <aside className="min-w-0 space-y-[var(--space-5)] border-t border-[var(--color-border-divider)] pt-[var(--space-6)] xl:border-t-0 xl:pt-0 xl:pl-[var(--space-section-sm)]">
                <section className="space-y-[var(--space-2)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Summary
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-normal text-[color:var(--color-text-primary)]">
                    {aiSummary}
                  </p>
                </section>

                <section className="space-y-[var(--space-2)]">
                  <h3 className="m-0" style={asideTitleStyles}>
                    Suggested actions
                  </h3>
                  <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-1)]">
                    <Button className="w-full justify-start" size="sm" variant="secondary">
                      Review account state
                    </Button>
                    <Link className="text-sm leading-normal" href="#">
                      Send update
                    </Link>
                    <Link className="text-sm leading-normal" href="#">
                      Escalate to IAM
                    </Link>
                    <Link className="text-sm leading-normal" href="#">
                      Check tenant sync logs
                    </Link>
                  </div>
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

            <FormLayout>
              <form
                id="case-edit-form"
                className="space-y-[var(--space-section-md)]"
                onSubmit={handleSave}
              >
                <FormSection
                  title="Case identity"
                  description="Primary editable identity for the current case."
                >
                  <FieldStack>
                    <Field label="Title" required error={visibleTitleError}>
                      <Input
                        size="sm"
                        name="title"
                        value={draftRecord.title}
                        onChange={(event) => updateDraft("title", event.target.value)}
                        onBlur={() => markTouched("title")}
                      />
                    </Field>
                  </FieldStack>
                </FormSection>

                <FormSection
                  title="Status & ownership"
                  description="Operational state and ownership details for the current case."
                >
                  <FormFieldGrid>
                    <Field label="Status">
                      <Select
                        size="sm"
                        value={draftRecord.status}
                        onChange={(event) => handleStatusChange(event.target.value as CaseRecord["status"])}
                      >
                        <option>New</option>
                        <option>In progress</option>
                        <option>Waiting on customer</option>
                        <option>Escalated</option>
                        <option>Resolved</option>
                      </Select>
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

                    <Field label="Assignee">
                      <Input
                        size="sm"
                        value={draftRecord.assignee}
                        onChange={(event) => updateDraft("assignee", event.target.value)}
                      />
                    </Field>

                    <Field label="Queue">
                      <Input
                        size="sm"
                        value={draftRecord.queue}
                        onChange={(event) => updateDraft("queue", event.target.value)}
                      />
                    </Field>

                    {showDraftStatusReason ? (
                      <div className="md:col-span-2">
                        <Field label="Status reason">
                          <Input
                            size="sm"
                            value={draftRecord.statusReason}
                            onChange={(event) => updateDraft("statusReason", event.target.value)}
                          />
                        </Field>
                      </div>
                    ) : null}

                    {showDraftOnHoldUntil ? (
                      <Field label="On hold until">
                        <Input
                          size="sm"
                          type="date"
                          value={draftRecord.onHoldUntil}
                          onChange={(event) => updateDraft("onHoldUntil", event.target.value)}
                        />
                      </Field>
                    ) : null}
                  </FormFieldGrid>
                </FormSection>

                <FormSection
                  title="Classification"
                  description="Routing and reporting fields that classify the case."
                >
                  <FormFieldGrid>
                    <Field label="Channel">
                      <Select
                        size="sm"
                        value={draftRecord.channel}
                        onChange={(event) => handleChannelChange(event.target.value as CaseRecord["channel"])}
                      >
                        <option>Email</option>
                        <option>Phone</option>
                        <option>Portal</option>
                        <option>Chat</option>
                      </Select>
                    </Field>

                    <Field label="Severity">
                      <Select
                        size="sm"
                        value={draftRecord.severity}
                        onChange={(event) => handleSeverityChange(event.target.value as CaseRecord["severity"])}
                      >
                        <option>Minor</option>
                        <option>Major</option>
                        <option>Critical</option>
                      </Select>
                    </Field>

                    <Field label="Region">
                      <Select
                        size="sm"
                        value={draftRecord.region}
                        onChange={(event) => updateDraft("region", event.target.value as CaseRecord["region"])}
                      >
                        <option>Southern Europe</option>
                        <option>Central Europe</option>
                        <option>North America</option>
                        <option>Latin America</option>
                      </Select>
                    </Field>

                    <Field label="Source">
                      <Input
                        size="sm"
                        value={draftRecord.source}
                        onChange={(event) => updateDraft("source", event.target.value)}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Product area">
                        <Input
                          size="sm"
                          value={draftRecord.productArea}
                          onChange={(event) => updateDraft("productArea", event.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Category">
                        <Input
                          size="sm"
                          value={draftRecord.category}
                          onChange={(event) => updateDraft("category", event.target.value)}
                        />
                      </Field>
                    </div>

                    {draftChannelReferenceLabel ? (
                      <div className="md:col-span-2">
                        <Field label={draftChannelReferenceLabel}>
                          <Input
                            size="sm"
                            value={getChannelReferenceValue(draftRecord)}
                            onChange={(event) => handleChannelReferenceChange(event.target.value)}
                          />
                        </Field>
                      </div>
                    ) : null}
                  </FormFieldGrid>
                </FormSection>

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
                  <FieldStack>
                    <Field>
                      <Textarea
                        size="sm"
                        value={draftRecord.description}
                        onChange={(event) => updateDraft("description", event.target.value)}
                      />
                    </Field>
                  </FieldStack>
                </FormSection>

                <FormSection
                  title="Internal notes"
                  description="Internal working notes for routing, remediation, and follow-up."
                  className="pt-[var(--space-2)]"
                >
                  <FieldStack>
                    <Field hint="Internal only. This content is not shown to the customer.">
                      <Textarea
                        size="sm"
                        value={draftRecord.internalNotes}
                        onChange={(event) => updateDraft("internalNotes", event.target.value)}
                      />
                    </Field>
                  </FieldStack>
                </FormSection>
              </form>
            </FormLayout>
          </div>
        )}
      </PageContent>
    </main>
  )
}
