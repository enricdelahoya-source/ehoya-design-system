import Button from "./components/Button"
import Field from "./components/Field"
import Input from "./components/Input"
import ReadOnlyValue from "./components/ReadOnlyValue"
import Select from "./components/Select"
import Textarea from "./components/Textarea"

export default function App() {
  return (
    <main className="min-h-screen bg-page p-[var(--space-section-md)] text-text-default [font-family:var(--font-sans)]">
      <div className="mx-auto max-w-[var(--content-width-md)] space-y-[var(--space-section-md)]">
        <div className="space-y-[var(--space-stack-sm)]">
          <h1 className="text-2xl font-semibold">
            Button Playground
          </h1>
          <p className="text-base text-text-muted">
            Testing hierarchy, spacing, and interaction states.
          </p>
        </div>

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
      </div>
    </main>
  )
}
