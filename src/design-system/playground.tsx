import { useState } from "react"
import Button from "./components/Button"
import CaseStatusBadge from "./components/CaseStatusBadge"
import Field from "./components/Field"
import Input from "./components/Input"
import Link from "./components/Link"
import ReadOnlyValue from "./components/ReadOnlyValue"
import RecordShellBar from "./components/RecordShellBar"
import Select from "./components/Select"
import StatusBadge from "./components/StatusBadge"
import Tabs from "./components/Tabs"
import Textarea from "./components/Textarea"

export default function App() {
  const [activeTab, setActiveTab] = useState("components")

  const tabs = [
    { id: "components", label: "Components" },
    { id: "compositions", label: "Compositions" },
  ]

  const contentWidth = activeTab === "components"
    ? "max-w-[var(--content-width-md)]"
    : "max-w-[1280px]"

  return (
    <main className="min-h-screen bg-page p-[var(--space-section-md)] text-text-default [font-family:var(--font-sans)]">
      <div className={`mx-auto ${contentWidth} space-y-[var(--space-section-md)]`}>
          <div className="space-y-[var(--space-stack-sm)]">
            <h1 className="text-2xl font-semibold">
              Button Playground
            </h1>
            <p className="text-base text-text-muted">
              Testing hierarchy, spacing, and interaction states.
            </p>
          </div>

          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "components" ? (
            <>
              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Variants</h2>
                <div className="flex flex-wrap gap-actions-md">
                  <Button variant="primary">Save changes</Button>
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="ghost">View details</Button>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Sizes</h2>
                <div className="flex flex-wrap items-center gap-actions-md">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Disabled</h2>
                <div className="flex flex-wrap gap-actions-md">
                  <Button disabled>Save changes</Button>
                  <Button variant="secondary" disabled>
                    Cancel
                  </Button>
                  <Button variant="ghost" disabled>
                    View details
                  </Button>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Status badges</h2>
                <p className="text-sm text-text-muted">
                  Compact semantic states for case headers, shell bars, and record summaries.
                </p>

                <div className="space-y-[var(--space-stack-xs)]">
                  <p className="text-xs font-medium uppercase tracking-[0.04em] text-text-muted">
                    Primitive tones
                  </p>
                  <div className="flex flex-wrap items-center gap-actions-md">
                    <StatusBadge tone="info">New</StatusBadge>
                    <StatusBadge tone="neutral">In progress</StatusBadge>
                    <StatusBadge tone="warning">Waiting on customer</StatusBadge>
                    <StatusBadge tone="danger">Escalated</StatusBadge>
                    <StatusBadge tone="success">Resolved</StatusBadge>
                    <StatusBadge tone="neutral">Closed</StatusBadge>
                  </div>
                </div>

                <div className="space-y-[var(--space-stack-xs)]">
                  <p className="text-xs font-medium uppercase tracking-[0.04em] text-text-muted">
                    Case statuses
                  </p>
                  <div className="flex flex-wrap items-center gap-actions-md">
                    <CaseStatusBadge status="new" />
                    <CaseStatusBadge status="in_progress" />
                    <CaseStatusBadge status="waiting_on_customer" />
                    <CaseStatusBadge status="escalated" />
                    <CaseStatusBadge status="resolved" />
                    <CaseStatusBadge status="closed" />
                  </div>
                </div>

                <div className="space-y-[var(--space-stack-xs)]">
                  <p className="text-xs font-medium uppercase tracking-[0.04em] text-text-muted">
                    Case status sizes
                  </p>
                  <div className="flex flex-wrap items-center gap-actions-md">
                    <CaseStatusBadge status="in_progress" size="sm" />
                    <CaseStatusBadge status="in_progress" size="md" />
                    <CaseStatusBadge status="resolved" size="sm" />
                    <CaseStatusBadge status="resolved" size="md" />
                  </div>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Inputs</h2>
                <div className="grid gap-[var(--space-stack-md)] md:grid-cols-2">
                  <Field
                    label="Customer name"
                    hint="Use the legal or billing name."
                  >
                    <Input placeholder="Acme S.L." />
                  </Field>
                  <Field
                    label="Email"
                    hint="We will send updates here."
                  >
                    <Input
                      type="email"
                      size="sm"
                      placeholder="team@example.com"
                    />
                  </Field>
                  <Field
                    label="VAT number"
                    error="Please enter a valid VAT number."
                    required
                  >
                    <Input defaultValue="ES-" />
                  </Field>
                  <Field label="ERP code">
                    <Input
                      placeholder="Auto-generated"
                      disabled
                    />
                  </Field>
                  <Field
                    label="Case notes"
                    hint="Add the latest customer context for the team."
                  >
                    <Textarea placeholder="Summarize the latest discussion, blockers, and next steps." />
                  </Field>
                  <Field
                    label="Internal summary"
                    error="Please add an internal summary before saving."
                  >
                    <Textarea defaultValue="Pending review..." />
                  </Field>
                  <Field
                    label="Archived notes"
                    hint="This record is locked."
                  >
                    <Textarea
                      defaultValue="Imported from the previous ERP migration."
                      disabled
                    />
                  </Field>
                  <Field
                    label="Account owner"
                    hint="Choose the teammate responsible for this record."
                  >
                    <Select defaultValue="maria">
                      <option value="maria">Maria Lopez</option>
                      <option value="diego">Diego Romero</option>
                      <option value="ana">Ana Perez</option>
                    </Select>
                  </Field>
                  <Field label="Region" hint="This record is locked.">
                    <Select defaultValue="emea" disabled>
                      <option value="emea">EMEA</option>
                      <option value="na">North America</option>
                      <option value="latam">LATAM</option>
                    </Select>
                  </Field>
                  <Field
                    label="Approval status"
                    error="Please choose an approval status."
                    required
                  >
                    <Select defaultValue="">
                      <option value="" disabled>
                        Select a status
                      </option>
                      <option value="draft">Draft</option>
                      <option value="review">In review</option>
                      <option value="approved">Approved</option>
                    </Select>
                  </Field>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Read-only values</h2>
                <div className="grid gap-[var(--space-stack-md)] md:grid-cols-2">
                  <Field
                    label="Locked ERP code"
                    hint="Boxed treatment for dense form layouts."
                  >
                    <ReadOnlyValue value="ERP-2026-00418" />
                  </Field>
                  <Field
                    label="Status"
                    hint="Synchronized from the approval workflow."
                  >
                    <ReadOnlyValue value="Approved for invoicing" />
                  </Field>
                  <Field
                    label="Imported notes"
                    hint="Imported during the migration review."
                  >
                    <ReadOnlyValue multiline>
                      Imported from SAP legacy notes.
                      {"\n"}
                      Last audit confirmed the line-item mapping.
                      {"\n"}
                      Record remains locked until the next sync window.
                    </ReadOnlyValue>
                  </Field>
                </div>
              </section>

              <section className="space-y-[var(--space-stack-sm)]">
                <h2 className="text-lg font-semibold">Compact read-only values</h2>
                <div className="grid gap-[var(--space-stack-md)] md:grid-cols-2">
                  <Field
                    label="ERP code"
                    hint="Generated from the locked master record."
                    variant="tight"
                  >
                    <ReadOnlyValue
                      value="ERP-2026-00418"
                      variant="compact"
                    />
                  </Field>
                  <Field
                    label="Status"
                    hint="Synchronized from the approval workflow."
                    variant="tight"
                  >
                    <ReadOnlyValue
                      value="Approved for invoicing"
                      variant="compact"
                    />
                  </Field>
                  <Field
                    label="Imported notes"
                    hint="Imported during the migration review."
                    variant="tight"
                  >
                    <ReadOnlyValue
                      multiline
                      variant="compact"
                    >
                      Imported from SAP legacy notes.
                      {"\n"}
                      Last audit confirmed the line-item mapping.
                      {"\n"}
                      Record remains locked until the next sync window.
                    </ReadOnlyValue>
                  </Field>
                </div>
              </section>
            </>
          ) : (
            <section className="space-y-[var(--space-stack-sm)]">
              <h2 className="text-lg font-semibold">Compositions</h2>
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-divider)] bg-[color-mix(in_srgb,var(--color-surface-elevated)_70%,transparent)]">
                <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-8">
                  <RecordShellBar
                    breadcrumbs={[
                      { label: "Service", href: "/service" },
                      { label: "Cases", href: "/service/cases" },
                    ]}
                    title="Payment failed after renewal"
                    recordId="CS-10842"
                    status="waiting_on_customer"
                    metadata={
                      <>
                        High priority
                        {" • "}
                        Owner: <Link href="#">Maria Chen</Link>
                        {" • "}
                        Updated 2h ago
                      </>
                    }
                    actions={
                      <>
                        <Button variant="ghost">More</Button>
                        <Button variant="secondary">Assign</Button>
                        <Button variant="primary">Edit</Button>
                      </>
                    }
                  />

                  <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-divider)] bg-[color-mix(in_srgb,var(--color-surface-muted)_40%,var(--color-surface-elevated))] px-4 py-5 text-sm leading-normal text-[var(--color-text-muted)]">
                    Placeholder record content
                  </div>
                </div>
              </div>
            </section>
          )}
      </div>
    </main>
  )
}
