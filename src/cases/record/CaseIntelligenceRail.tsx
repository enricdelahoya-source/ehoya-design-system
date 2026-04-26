import { useState, type ReactNode } from "react"
import Drawer from "../../design-system/components/Drawer"
import Link from "../../design-system/components/Link"
import type { CaseRecord } from "./types"
import type {
  CaseIntelligenceModuleId,
  DecisionPanelInsight,
} from "./caseIntelligenceRailTypes"
import DecisionPanelModule from "./DecisionPanelModule"
import ModuleSwitcher from "./ModuleSwitcher"
import SimilarCasesModule from "./SimilarCasesModule"

type CaseIntelligenceRailProps = {
  open: boolean
  updatedLabel: ReactNode
  insight: DecisionPanelInsight
  nextStepExplanation: string
  mainAction: {
    label: string
    onClick: () => void
  } | null
  otherActionLabels: string[]
  onRefreshInsights: () => void
  onToggle: () => void
  onClose: () => void
  record: CaseRecord
}

export default function CaseIntelligenceRail({
  open,
  updatedLabel,
  insight,
  nextStepExplanation,
  mainAction,
  otherActionLabels,
  onRefreshInsights,
  onToggle,
  onClose,
  record,
}: CaseIntelligenceRailProps) {
  const [activeModule, setActiveModule] = useState<CaseIntelligenceModuleId>("decision")

  function handleCloseRail() {
    onClose()
  }

  function handleModuleSelect(moduleId: CaseIntelligenceModuleId) {
    if (open && activeModule === moduleId) {
      return
    }

    setActiveModule(moduleId)

    if (!open) {
      onToggle()
    }
  }

  const drawerTitle = activeModule === "decision" ? "Decision panel" : "Similar cases"
  const drawerSubtitle =
    activeModule === "decision"
      ? "Generated from visible case details and recent activity."
      : "Reference cases with aligned ownership, pacing, and next-step patterns."
  const drawerMetadata = activeModule === "decision" ? updatedLabel : undefined
  const similarCasesScrollBoundaryClasses = [
    "min-h-0",
    "[&>section]:h-auto",
    "[&>section]:min-h-0",
    "[&>section>div:first-child]:border-b",
    "[&>section>div:first-child]:border-[var(--color-border-divider)]",
    "[&>section>div:first-child]:pb-[var(--space-4)]",
    "[&>section>div:last-child]:flex-none",
    "[&>section>div:last-child]:overflow-visible",
    "[&>section>div:last-child]:overscroll-auto",
  ].join(" ")
  const drawerActions =
    activeModule === "decision" ? (
      <Link
        href="#"
        className="text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        onClick={(event) => {
          event.preventDefault()
          onRefreshInsights()
        }}
      >
        Refresh insights
      </Link>
    ) : undefined

  return (
    <Drawer
      open={open}
      title={drawerTitle}
      subtitle={drawerSubtitle}
      metadata={drawerMetadata}
      actions={drawerActions}
      onToggle={onToggle}
      onClose={handleCloseRail}
      closeLabel={`Close ${drawerTitle}`}
      railContent={
        <ModuleSwitcher
          open={open}
          activeModule={activeModule}
          onModuleSelect={handleModuleSelect}
        />
      }
    >
      {activeModule === "decision" ? (
        <DecisionPanelModule
          insight={insight}
          nextStepExplanation={nextStepExplanation}
          mainAction={mainAction}
          otherActionLabels={otherActionLabels}
        />
      ) : (
        <div className={similarCasesScrollBoundaryClasses}>
          <SimilarCasesModule record={record} />
        </div>
      )}
    </Drawer>
  )
}
