import Button from "./components/Button"

export default function App() {
  return (
    <main className="min-h-screen bg-page p-[var(--space-section-md)] text-text-default [font-family:var(--font-sans)]">
      <div className="mx-auto max-w-[var(--content-width-md)] space-y-[var(--space-section-md)]">
        <div className="space-y-[var(--space-stack-sm)]">
          <h1 className="text-[var(--text-2xl)] font-semibold">
            Button Playground
          </h1>
          <p className="text-text-muted text-[var(--text-md)]">
            Testing hierarchy, spacing, and interaction states.
          </p>
        </div>

        <section className="space-y-[var(--space-stack-sm)]">
          <h2 className="text-[var(--text-lg)] font-semibold">Variants</h2>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Button variant="primary">Save changes</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">View details</Button>
          </div>
        </section>

        <section className="space-y-[var(--space-stack-sm)]">
          <h2 className="text-[var(--text-lg)] font-semibold">Sizes</h2>
          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
          </div>
        </section>

        <section className="space-y-[var(--space-stack-sm)]">
          <h2 className="text-[var(--text-lg)] font-semibold">Disabled</h2>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Button disabled>Save changes</Button>
            <Button variant="secondary" disabled>
              Cancel
            </Button>
            <Button variant="ghost" disabled>
              View details
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}