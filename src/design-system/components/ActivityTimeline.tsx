import type { ReactNode } from "react"
import StatusBadge, {
  type StatusBadgeEmphasis,
  type StatusBadgeTone,
} from "./StatusBadge"

export type ActivityTimelineEventType =
  | "incoming"
  | "outgoing"
  | "internal-note"
  | "system"
  | "internal"
  | "comment"
  | "status-change"

export type ActivityTimelineItem = {
  id: string
  timestamp: ReactNode
  timestampDateTime?: string
  type: ActivityTimelineEventType
  typeLabel?: string
  content: ReactNode
  actor?: ReactNode
  source?: ReactNode
  subtype?: ReactNode
  organization?: ReactNode
  secondaryMeta?: ReactNode
}

type ActivityTimelineProps = {
  items: ActivityTimelineItem[]
  ariaLabel?: string
  emptyMessage?: ReactNode
  className?: string
}

const DEFAULT_TYPE_LABELS: Record<ActivityTimelineEventType, string> = {
  incoming: "Email received",
  outgoing: "Email sent",
  "internal-note": "Internal note",
  system: "System update",
  internal: "Internal note",
  comment: "Internal note",
  "status-change": "Status change",
}

const DEFAULT_ROLE_LABELS: Record<ActivityTimelineEventType, string> = {
  incoming: "Customer",
  outgoing: "Support agent",
  "internal-note": "Support operations",
  system: "System",
  internal: "Support operations",
  comment: "Support operations",
  "status-change": "System",
}

type ActivityTimelineOrigin = "customer" | "company" | "system"

const BADGE_TONE_BY_ORIGIN: Record<ActivityTimelineOrigin, StatusBadgeTone> = {
  customer: "success",
  company: "warning",
  system: "info",
}

const BADGE_EMPHASIS_BY_ORIGIN: Record<ActivityTimelineOrigin, StatusBadgeEmphasis> = {
  customer: "subtle",
  company: "subtle",
  system: "subtle",
}

type ActivityTimelineGroup = {
  key: string
  label: string
  items: ActivityTimelineItem[]
}

const DATE_KEY_PATTERN = /^(\d{4}-\d{2}-\d{2})/

function getActivityDateKey(timestampDateTime?: string) {
  if (!timestampDateTime) {
    return "undated"
  }

  const matchedDate = timestampDateTime.match(DATE_KEY_PATTERN)

  if (matchedDate) {
    return matchedDate[1]
  }

  const parsedDate = new Date(timestampDateTime)

  if (Number.isNaN(parsedDate.getTime())) {
    return "undated"
  }

  return parsedDate.toISOString().slice(0, 10)
}

function formatActivityDateLabel(dateKey: string) {
  if (dateKey === "undated") {
    return "Undated"
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T00:00:00Z`))
}

function formatActivityRowDate(timestampDateTime?: string) {
  if (!timestampDateTime) {
    return null
  }

  const parsedDate = new Date(timestampDateTime)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${getActivityDateKey(timestampDateTime)}T00:00:00Z`))
}

function formatActivityRowTime(timestampDateTime?: string) {
  if (!timestampDateTime) {
    return null
  }

  const parsedDate = new Date(timestampDateTime)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate)
}

function groupActivityTimelineItems(items: ActivityTimelineItem[]) {
  return items.reduce<ActivityTimelineGroup[]>((groups, item) => {
    const dateKey = getActivityDateKey(item.timestampDateTime)
    const currentGroup = groups[groups.length - 1]

    if (currentGroup && currentGroup.key === dateKey) {
      currentGroup.items.push(item)
      return groups
    }

    groups.push({
      key: dateKey,
      label: formatActivityDateLabel(dateKey),
      items: [item],
    })

    return groups
  }, [])
}

function getActivityOrigin(
  item: ActivityTimelineItem,
  roleLabel?: ReactNode,
): ActivityTimelineOrigin {
  if (item.type === "system" || item.type === "status-change") {
    return "system"
  }

  if (typeof roleLabel === "string") {
    const normalizedRole = roleLabel.trim().toLowerCase()

    if (normalizedRole.includes("customer")) {
      return "customer"
    }

    if (normalizedRole.includes("system")) {
      return "system"
    }
  }

  return "company"
}

export default function ActivityTimeline({
  items,
  ariaLabel = "Activity timeline",
  emptyMessage = "No activity yet.",
  className = "",
}: ActivityTimelineProps) {
  const groups = groupActivityTimelineItems(items)
  const orderedGroups = [...groups].reverse()

  const rootClasses = ["w-full", className].filter(Boolean).join(" ")

  const groupsClasses = ["space-y-[var(--space-stack-md)]"].join(" ")

  const groupClasses = [
    "space-y-[var(--space-stack-sm)]",
  ].join(" ")

  const groupHeaderWrapClasses = [
    "border-y",
    "border-[var(--color-border-divider)]",
    "bg-[var(--color-surface-elevated)]",
    "px-[var(--space-inline-sm)]",
    "py-[var(--space-2)]",
  ].join(" ")

  const groupHeaderClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "[font-weight:var(--font-weight-medium)]",
    "text-[color:var(--color-text-primary)]",
  ].join(" ")

  const listClasses = ["space-y-[var(--space-stack-sm)]"].join(" ")

  const itemClasses = [
    "min-w-0",
    "space-y-[var(--space-stack-xs)]",
    "border-t",
    "border-[var(--color-border-divider)]",
    "pt-[var(--space-3)]",
    "first:border-t-0",
    "first:pt-0",
  ].join(" ")

  const identityRowClasses = [
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-baseline",
    "gap-x-[var(--space-actions-sm)]",
    "gap-y-[var(--space-stack-2xs)]",
  ].join(" ")

  const rowDateClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "[font-weight:var(--font-weight-medium)]",
    "text-[color:var(--color-text-primary)]",
  ].join(" ")

  const rowTimeClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const sourceRowClasses = [
    "min-w-0",
    "flex",
    "flex-wrap",
    "items-start",
    "gap-x-[var(--space-2)]",
    "gap-y-[var(--space-stack-2xs)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
  ].join(" ")

  const sourceClasses = [
    "min-w-0",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const roleClasses = [
    "min-w-0",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  const organizationClasses = [
    "min-w-0",
    "[font-weight:var(--font-weight-medium)]",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const contentRowClasses = [
    "min-w-0",
    "pt-[var(--space-1)]",
  ].join(" ")

  const contentClasses = [
    "min-w-0",
    "whitespace-pre-wrap",
    "break-words",
    "text-[length:var(--text-field-value)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")

  const emptyStateClasses = [
    "py-[var(--space-4)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
    "border-y",
    "border-[var(--color-border-divider)]",
  ].join(" ")

  if (items.length === 0) {
    return (
      <div className={rootClasses}>
        <p className={emptyStateClasses}>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={rootClasses}>
      <div className={groupsClasses}>
        {orderedGroups.map((group, groupIndex) => (
          <section
            key={`${group.key}-${groupIndex}`}
            aria-label={`${ariaLabel}: ${group.label}`}
            className={groupClasses}
          >
            <div className={groupHeaderWrapClasses}>
              <h3 className={groupHeaderClasses}>{group.label}</h3>
            </div>

            <ol className={listClasses}>
              {[...group.items].reverse().map((item) => {
                const typeLabel = item.typeLabel ?? DEFAULT_TYPE_LABELS[item.type]
                const rowDate = formatActivityRowDate(item.timestampDateTime)
                const rowTime = formatActivityRowTime(item.timestampDateTime)
                const sourceIdentity =
                  item.actor ?? item.source ?? item.secondaryMeta
                const roleLabel = item.subtype ?? DEFAULT_ROLE_LABELS[item.type]
                const organizationLabel = item.organization
                const origin = getActivityOrigin(item, roleLabel)
                const badgeTone = BADGE_TONE_BY_ORIGIN[origin]
                const badgeEmphasis = BADGE_EMPHASIS_BY_ORIGIN[origin]

                return (
                  <li key={item.id} className={itemClasses}>
                    <div className={identityRowClasses}>
                      <span
                        className="inline-flex shrink-0 align-middle"
                        style={{
                          transform:
                            "translateY(var(--offset-status-badge-inline))",
                        }}
                      >
                        <StatusBadge
                          tone={badgeTone}
                          emphasis={badgeEmphasis}
                          size="sm"
                        >
                          {typeLabel}
                        </StatusBadge>
                      </span>

                      {rowDate ? (
                        <span className={rowDateClasses}>{rowDate}</span>
                      ) : null}

                      {item.timestampDateTime ? (
                        <time
                          className={rowTimeClasses}
                          dateTime={item.timestampDateTime}
                        >
                          {rowTime ?? item.timestamp}
                        </time>
                      ) : (
                        <span className={rowTimeClasses}>{item.timestamp}</span>
                      )}
                    </div>

                    {sourceIdentity || roleLabel || organizationLabel ? (
                      <div className={sourceRowClasses}>
                        {sourceIdentity ? (
                          <span className={sourceClasses}>{sourceIdentity}</span>
                        ) : null}

                        {sourceIdentity && roleLabel ? (
                          <span aria-hidden="true" className={roleClasses}>
                            ·
                          </span>
                        ) : null}

                        {roleLabel ? (
                          <span className={roleClasses}>{roleLabel}</span>
                        ) : null}

                        {(sourceIdentity || roleLabel) && organizationLabel ? (
                          <span aria-hidden="true" className={organizationClasses}>
                            ·
                          </span>
                        ) : null}

                        {organizationLabel ? (
                          <span className={organizationClasses}>{organizationLabel}</span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className={contentRowClasses}>
                      <div className={contentClasses}>{item.content}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
