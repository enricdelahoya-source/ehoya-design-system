import type {
  StatusBadgeEmphasis,
  StatusBadgeTone,
} from "../../design-system/components/StatusBadge"

export type CaseIntelligenceModuleId = "decision" | "similarCases"

export type DecisionPanelInsight = {
  situation: {
    badge: {
      label: string
      tone: StatusBadgeTone
      emphasis: StatusBadgeEmphasis
    }
    ownership: string
    condition?: string
  }[]
  caseSummary: string[]
  signals: string[]
  actions: {
    label: string
    referenceId?: string
    reason?: string
  }[]
  basedOn: string[]
}
