import Button from "./components/Button"
import Field from "./components/Field"
import FieldGrid from "./components/FieldGrid"
import FieldStack from "./components/FieldStack"
import PageContent from "./components/PageContent"
import ReadOnlyValue from "./components/ReadOnlyValue"
import RecordShellBar from "./components/RecordShellBar"
import RecordSection from "./components/RecordSection"

const caseRecord = {
  title: "Customer cannot access invoice portal",
  id: "CASE-10482",
  status: "Open",
  priority: "High",
  assignedTeam: "Support Ops",
  customer: "Viva la Vita Clinics SL",
  contact: "Marta Ruiz",
  email: "marta@vivalavita.com",
  channel: "Email",
  productArea: "Billing Portal",
  category: "Access & Authentication",
  summary:
    "Customer reset password twice and still cannot access the billing portal.",
}

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

        <RecordSection
          title="Overview"
          description="Core case identity and routing details for the current record."
        >
          <FieldGrid>
            <Field label="Case title" variant="tight">
              <ReadOnlyValue value={caseRecord.title} variant="compact" />
            </Field>
            <Field label="Case ID" variant="tight">
              <ReadOnlyValue value={caseRecord.id} variant="compact" />
            </Field>
            <Field label="Status" variant="tight">
              <ReadOnlyValue value={caseRecord.status} variant="compact" />
            </Field>
            <Field label="Priority" variant="tight">
              <ReadOnlyValue value={caseRecord.priority} variant="compact" />
            </Field>
            <Field label="Assigned team" variant="tight">
              <ReadOnlyValue value={caseRecord.assignedTeam} variant="compact" />
            </Field>
            <Field label="Customer" variant="tight">
              <ReadOnlyValue value={caseRecord.customer} variant="compact" />
            </Field>
          </FieldGrid>
        </RecordSection>

        <RecordSection
          title="Contact"
          description="Primary customer contact details for follow-up and ownership."
        >
          <FieldGrid>
            <Field label="Contact" variant="tight">
              <ReadOnlyValue value={caseRecord.contact} variant="compact" />
            </Field>
            <Field label="Email" variant="tight">
              <ReadOnlyValue value={caseRecord.email} variant="compact" />
            </Field>
            <Field label="Channel" variant="tight">
              <ReadOnlyValue value={caseRecord.channel} variant="compact" />
            </Field>
          </FieldGrid>
        </RecordSection>

        <RecordSection
          title="Classification"
          description="Categorization fields that help route and report on the case."
        >
          <FieldGrid>
            <Field label="Product area" variant="tight">
              <ReadOnlyValue value={caseRecord.productArea} variant="compact" />
            </Field>
            <Field label="Category" variant="tight">
              <ReadOnlyValue value={caseRecord.category} variant="compact" />
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
      </PageContent>
    </main>
  )
}
