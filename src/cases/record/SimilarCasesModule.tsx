import type { CaseRecord } from "./types"

type SimilarCasesModuleProps = {
  record: CaseRecord
}

type SimilarCaseReference = {
  id: string
  title: string
  matchReason: string
  status: string
  owner: string
  nextStep: string
}

function buildSimilarCaseReferences(record: CaseRecord): SimilarCaseReference[] {
  const priorityLabel = record.priority.trim() || "Standard"
  const queueLabel = record.queue.trim() || "Shared queue"
  const channelLabel = record.channel.toLowerCase()

  return [
    {
      id: "CS-20418",
      title: `${record.customer} ${channelLabel} follow-up review`,
      matchReason: `Similar ${priorityLabel.toLowerCase()} priority case with follow-up coordination before closure.`,
      status: "Resolved",
      owner: "Billing operations",
      nextStep: "Confirm the final customer reply and archive the resolution summary.",
    },
    {
      id: "CS-19862",
      title: `${queueLabel} handoff with pending customer confirmation`,
      matchReason: `Comparable queue context with a similar waiting pattern and ownership checkpoint.`,
      status: "Monitoring",
      owner: "Customer success",
      nextStep: "Review the checkpoint and confirm whether the customer has responded.",
    },
    {
      id: "CS-19307",
      title: `${record.channel} case with aligned next-step guidance`,
      matchReason: `Reference case for a structured ${channelLabel} response before the record moves forward.`,
      status: "Closed",
      owner: "Technical support",
      nextStep: "Send the final update, then close once the handoff notes are complete.",
    },
  ]
}

export default function SimilarCasesModule({ record }: SimilarCasesModuleProps) {
  const similarCases = buildSimilarCaseReferences(record)

  return (
    <section className="flex h-full min-h-0 flex-col space-y-[var(--space-4)]" aria-label="Similar cases">
      <div className="shrink-0 space-y-[var(--space-1)]">
        <p className="m-0 text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
          Related cases provide context only. Use them to compare ownership, pacing, and next-step patterns.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-[var(--space-3)] overflow-y-auto overscroll-contain">
        {similarCases.map((similarCase) => (
          <article
            key={similarCase.id}
            className="space-y-[var(--space-3)] rounded-[var(--radius-sm)] border border-[var(--color-border-divider)] bg-[var(--color-surface-base)] p-[var(--space-4)]"
          >
            <div className="space-y-[var(--space-1)]">
              <p className="m-0 text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                {similarCase.id}
              </p>
              <h3 className="m-0 text-[length:var(--text-md)] leading-[var(--leading-normal)] font-medium text-[color:var(--color-text-primary)]">
                {similarCase.title}
              </h3>
            </div>

            <p className="m-0 text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
              {similarCase.matchReason}
            </p>

            <dl className="grid gap-[var(--space-2)] text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)]">
              <div className="grid gap-[var(--space-half)]">
                <dt className="font-medium text-[color:var(--color-text-muted)]">Status</dt>
                <dd className="m-0 text-[color:var(--color-text-primary)]">{similarCase.status}</dd>
              </div>
              <div className="grid gap-[var(--space-half)]">
                <dt className="font-medium text-[color:var(--color-text-muted)]">Owner</dt>
                <dd className="m-0 text-[color:var(--color-text-primary)]">{similarCase.owner}</dd>
              </div>
              <div className="grid gap-[var(--space-half)]">
                <dt className="font-medium text-[color:var(--color-text-muted)]">Next step</dt>
                <dd className="m-0 text-[color:var(--color-text-primary)]">{similarCase.nextStep}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
