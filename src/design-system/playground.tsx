import Button from "./components/Button"
import Field from "./components/Field"
import FieldGrid from "./components/FieldGrid"
import FieldStack from "./components/FieldStack"
import Link from "./components/Link"
import PageContent from "./components/PageContent"
import ReadOnlyValue from "./components/ReadOnlyValue"
import RecordShellBar from "./components/RecordShellBar"
import RecordSection from "./components/RecordSection"

const caseRecord = {
  title: "Customer cannot access invoice portal",
  id: "CASE-10482",
  status: "Open",
  priority: "High",
  severity: "Major",
  sla: "First response due in 00:42",
  assignedTeam: "Support Ops",
  assignedAgent: "Lucia Fernandez",
  customer: "Viva la Vita Clinics SL",
  customerTier: "Enterprise Plus",
  region: "Southern Europe",
  contact: "Marta Ruiz",
  email: "marta@vivalavita.com",
  channel: "Email",
  source: "Customer Support Mailbox",
  createdDate: "2026-04-01 08:54 CET",
  updatedDate: "2026-04-01 09:41 CET",
  productArea: "Billing Portal",
  category: "Access & Authentication / Multi-factor Access Recovery",
  externalReference: "PORTAL-INC-2026-04-01-EU-447118",
  contractReference: "VLV-ENT-CLINICS-SOUTH-2026-00184",
  portalEnvironment: "Production - EU Primary Tenant Cluster B",
  summary:
    "Customer reset password twice and still cannot access the billing portal.",
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
  {
    actor: "Marta Ruiz",
    timestamp: "Today, 10:08",
    detail: "Confirmed the issue affects two finance users in the same clinic group.",
  },
  {
    actor: "Support Ops",
    timestamp: "Today, 10:16",
    detail: "Attached prior password reset attempts to the internal notes.",
  },
  {
    actor: "Billing Portal engineering",
    timestamp: "Today, 10:31",
    detail: "Acknowledged a possible tenant-state mismatch.",
  },
  {
    actor: "Lucia Fernandez",
    timestamp: "Today, 10:44",
    detail: "Scheduled the next customer update after the IAM validation window.",
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
  return (
    <main className="min-h-screen bg-page text-text-default [font-family:var(--font-sans)]">
      <PageContent width="xl">
        <RecordShellBar
          breadcrumbs={[
            { label: "Case management", href: "#" },
            { label: "Cases", href: "#" },
          ]}
          title={caseRecord.title}
          recordId={caseRecord.id}
          metadata={
            <>
              {caseRecord.customer}
              {" • "}
              {caseRecord.assignedTeam}
            </>
          }
          actions={
            <>
              <Button variant="ghost">More</Button>
              <Button variant="secondary">Assign</Button>
              <Button variant="primary">Reply to customer</Button>
            </>
          }
        />

        <div className="grid items-start gap-[var(--space-section-sm)] xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <div className="min-w-0 space-y-[var(--space-4)]">
            <RecordSection
              title="Overview"
              description="Core case identity and routing details for the current record."
            >
              <FieldStack className="gap-[var(--space-6)]">
                <FieldGrid>
                  <Field label="Case ID" variant="tight">
                    <ReadOnlyValue value={caseRecord.id} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Status" variant="tight">
                    <ReadOnlyValue value={caseRecord.status} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Priority" variant="tight">
                    <ReadOnlyValue value={caseRecord.priority} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Severity" variant="tight">
                    <ReadOnlyValue value={caseRecord.severity} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="SLA" variant="tight">
                    <ReadOnlyValue value={caseRecord.sla} behavior="flexible" variant="compact" />
                  </Field>
                  <Field label="Assigned team" variant="tight">
                    <ReadOnlyValue value={caseRecord.assignedTeam} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Assigned agent" variant="tight">
                    <ReadOnlyValue value={caseRecord.assignedAgent} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Customer" variant="tight">
                    <ReadOnlyValue value={caseRecord.customer} behavior="flexible" variant="compact" />
                  </Field>
                  <Field label="Customer tier" variant="tight">
                    <ReadOnlyValue value={caseRecord.customerTier} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Region" variant="tight">
                    <ReadOnlyValue value={caseRecord.region} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Source" variant="tight">
                    <ReadOnlyValue value={caseRecord.source} behavior="flexible" variant="compact" />
                  </Field>
                  <Field label="Created date" variant="tight">
                    <ReadOnlyValue value={caseRecord.createdDate} behavior="compact" variant="compact" />
                  </Field>
                  <Field label="Updated date" variant="tight">
                    <ReadOnlyValue value={caseRecord.updatedDate} behavior="compact" variant="compact" />
                  </Field>
                </FieldGrid>

                <FieldStack className="gap-[var(--space-4)]">
                  <Field label="External reference" variant="tight">
                    <ReadOnlyValue value={caseRecord.externalReference} behavior="full-width" variant="compact" />
                  </Field>
                  <Field label="Contract reference" variant="tight">
                    <ReadOnlyValue value={caseRecord.contractReference} behavior="full-width" variant="compact" />
                  </Field>
                  <Field label="Portal environment" variant="tight">
                    <ReadOnlyValue value={caseRecord.portalEnvironment} behavior="full-width" variant="compact" />
                  </Field>
                </FieldStack>
              </FieldStack>
            </RecordSection>

            <RecordSection
              title="Contact"
              description="Primary customer contact details for follow-up and ownership."
            >
              <FieldGrid>
                <Field label="Contact" variant="tight">
                  <ReadOnlyValue value={caseRecord.contact} behavior="compact" variant="compact" />
                </Field>
                <Field label="Email" variant="tight">
                  <ReadOnlyValue value={caseRecord.email} behavior="flexible" variant="compact" />
                </Field>
                <Field label="Channel" variant="tight">
                  <ReadOnlyValue value={caseRecord.channel} behavior="compact" variant="compact" />
                </Field>
              </FieldGrid>
            </RecordSection>

            <RecordSection
              title="Classification"
              description="Categorization fields that help route and report on the case."
            >
              <FieldGrid>
                <Field label="Product area" variant="tight">
                  <ReadOnlyValue value={caseRecord.productArea} behavior="flexible" variant="compact" />
                </Field>
                <Field label="Category" variant="tight">
                  <ReadOnlyValue value={caseRecord.category} behavior="flexible" variant="compact" />
                </Field>
              </FieldGrid>
            </RecordSection>

            <RecordSection
              title="Notes"
              description="Current customer context captured as a static view-only summary."
            >
              <FieldStack>
                <Field label="Summary">
                  <ReadOnlyValue value={caseRecord.summary} multiline />
                </Field>
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
                <Link className="text-sm leading-normal" href="#">
                  Notify Billing Portal team
                </Link>
                <Link className="text-sm leading-normal" href="#">
                  Draft customer workaround
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
      </PageContent>
    </main>
  )
}
