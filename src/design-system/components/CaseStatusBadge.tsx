import StatusBadge, {
  type StatusBadgeEmphasis,
  type StatusBadgeTone,
  type StatusBadgeSize,
} from "./StatusBadge"

/**
 * ========================================
 * CASE STATUS BADGE
 * Product-level case status mapping
 * ========================================
 *
 * This wrapper keeps case-specific business meaning out of the
 * generic StatusBadge primitive. Product code should use this
 * component when rendering case workflow statuses.
 */

export type CaseStatus =
  | "new"
  | "in_progress"
  | "waiting_on_customer"
  | "escalated"
  | "resolved"
  | "closed"

type CaseStatusConfig = {
  label: string
  tone: StatusBadgeTone
  emphasis: StatusBadgeEmphasis
}

type CaseStatusBadgeProps = {
  status: CaseStatus
  emphasis?: StatusBadgeEmphasis
  size?: StatusBadgeSize
  className?: string
}

const CASE_STATUS_CONFIG: Record<CaseStatus, CaseStatusConfig> = {
  new: {
    label: "New",
    tone: "info",
    emphasis: "strong",
  },
  in_progress: {
    label: "In progress",
    tone: "info",
    emphasis: "subtle",
  },
  waiting_on_customer: {
    label: "Waiting on customer",
    tone: "warning",
    emphasis: "strong",
  },
  escalated: {
    label: "Escalated",
    tone: "danger",
    emphasis: "strong",
  },
  resolved: {
    label: "Resolved",
    tone: "success",
    emphasis: "strong",
  },
  closed: {
    label: "Closed",
    tone: "neutral",
    emphasis: "subtle",
  },
}

export default function CaseStatusBadge({
  status,
  emphasis,
  size = "sm",
  className = "",
}: CaseStatusBadgeProps) {
  const config = CASE_STATUS_CONFIG[status]

  return (
    <StatusBadge
      tone={config.tone}
      emphasis={emphasis ?? config.emphasis}
      size={size}
      className={className}
    >
      {config.label}
    </StatusBadge>
  )
}
