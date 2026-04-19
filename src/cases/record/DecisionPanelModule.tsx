import ActionList from "../../design-system/components/ActionList"
import Button from "../../design-system/components/Button"
import type { DecisionPanelInsight } from "./caseIntelligenceRailTypes"

type DecisionPanelModuleProps = {
  insight: DecisionPanelInsight
  nextStepExplanation: string
  mainAction: {
    label: string
    onClick: () => void
  } | null
  otherActionLabels: string[]
}

const sectionTitleStyles = {
  fontSize: "var(--text-aside-title)",
  lineHeight: "var(--leading-aside-title)",
  fontWeight: "var(--font-weight-bold)",
  letterSpacing: "normal",
  color: "var(--color-text-primary)",
} as const

export default function DecisionPanelModule({
  insight,
  nextStepExplanation,
  mainAction,
  otherActionLabels,
}: DecisionPanelModuleProps) {
  return (
    <>
      <section className="space-y-[var(--space-2)]">
        <h3
          className="m-0 text-[color:var(--color-text-primary)]"
          style={sectionTitleStyles}
        >
          Case summary
        </h3>
        <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
          {insight.caseSummary.map((item) => (
            <p
              key={item}
              className="m-0 text-sm leading-normal text-[color:var(--color-text-primary)]"
            >
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-[var(--space-6)] space-y-[var(--space-2)]">
        <h3
          className="m-0 text-[color:var(--color-text-primary)]"
          style={sectionTitleStyles}
        >
          Situation
        </h3>
        <div className="space-y-[var(--space-1)] pt-[var(--space-1)]">
          {insight.situation.map((item) => (
            <div key={`${item.badge.label}-${item.ownership}`} className="space-y-[var(--space-1)]">
              <p className="m-0 text-sm leading-normal text-[color:var(--color-text-primary)]">
                {item.badge.label}
              </p>
              <p className="m-0 text-[length:var(--text-meta)] leading-[var(--leading-normal)] text-[color:var(--color-text-primary)]">
                {`Owned by ${item.ownership}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[var(--space-6)] border-b border-[var(--color-border-divider)] pb-[var(--space-5)]">
        <div className="space-y-[var(--space-3)] pt-[var(--space-1)]">
          <div className="space-y-[var(--space-1)]">
            <h3
              className="m-0 text-[color:var(--color-text-primary)]"
              style={sectionTitleStyles}
            >
              Next step
            </h3>
            <div className="space-y-[var(--space-1)] pt-[var(--space-half)]">
              <p className="m-0 text-sm leading-normal text-[color:var(--color-text-primary)]">
                {nextStepExplanation}
              </p>
            </div>
          </div>

          {mainAction ? (
            <div className="pt-[var(--space-half)]">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={mainAction.onClick}
              >
                {mainAction.label}
              </Button>
            </div>
          ) : null}

          {otherActionLabels.length > 0 ? (
            <div className="space-y-[var(--space-1)] pt-[var(--space-2)]">
              <p className="m-0 text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-muted)]">
                Other actions
              </p>
              <div className="pt-[var(--space-half)]">
                <ActionList
                  ariaLabel="Other actions"
                  items={otherActionLabels.map((actionLabel) => ({
                    label: actionLabel,
                  }))}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
