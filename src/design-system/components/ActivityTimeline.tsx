import { useEffect, useState, type ReactNode } from "react"
import Button from "./Button"
import StatusBadge, {
  type StatusBadgeEmphasis,
  type StatusBadgeTone,
} from "./StatusBadge"
import Select from "./controls/Select"
import Textarea from "./controls/Textarea"

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
  aiSummary?: ReactNode
  actor?: ReactNode
  source?: ReactNode
  subtype?: ReactNode
  organization?: ReactNode
  secondaryMeta?: ReactNode
}

export type ActiveSuggestedAction = {
  label: "Reply to customer" | "Follow up with customer"
  referenceId: string
  reason?: string
  composerOpen: boolean
}

type ActivityTimelineProps = {
  items: ActivityTimelineItem[]
  ariaLabel?: string
  emptyMessage?: ReactNode
  className?: string
  scrollListOnly?: boolean
  highlightedItemId?: string | null
  activeSuggestedAction?: ActiveSuggestedAction | null
  onAppendTimelineItem?: (item: ActivityTimelineItem) => void
  onCompleteSuggestedAction?: (actionLabel: ActiveSuggestedAction["label"]) => void
  onSendSuggestedAction?: (actionLabel: ActiveSuggestedAction["label"]) => void
  onDismissSuggestedAction?: () => void
  onOpenSuggestedActionComposer?: () => void
  replyDraftContext?: {
    customerName?: string
    situation?: string
    nextStep?: string
    reason?: string
    ownerName?: string
  }
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

type ComposerActivityType = "internal-note" | "email-sent"

const COMPOSER_ACTIVITY_TYPE_OPTIONS: {
  value: ComposerActivityType
  label: string
}[] = [
  { value: "internal-note", label: "Internal note" },
  { value: "email-sent", label: "Email sent" },
]

const COLLAPSED_CONTENT_LENGTH = 180
const MAX_VISIBLE_AI_SUMMARIES = 2
const ELIGIBLE_AI_SUMMARY_TYPES: ActivityTimelineEventType[] = [
  "comment",
  "internal",
  "internal-note",
  "outgoing",
  "incoming",
]

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

function buildAISummary(content: string) {
  const normalizedContent = content.trim().replace(/\s+/g, " ")

  if (!normalizedContent || normalizedContent.length <= COLLAPSED_CONTENT_LENGTH) {
    return undefined
  }

  const firstSentenceMatch = normalizedContent.match(/^(.+?[.!?])(?:\s|$)/)

  if (firstSentenceMatch && firstSentenceMatch[1].length <= 120) {
    return firstSentenceMatch[1]
  }

  return `${normalizedContent.slice(0, 117).trimEnd()}...`
}

function getVisibleAISummaryItemIds(items: ActivityTimelineItem[]) {
  const visibleIds = new Set<string>()
  const dateKeysWithVisibleSummary = new Set<string>()

  for (const item of [...items].reverse()) {
    if (visibleIds.size >= MAX_VISIBLE_AI_SUMMARIES) {
      break
    }

    if (!item.aiSummary || typeof item.content !== "string") {
      continue
    }

    if (item.content.length <= COLLAPSED_CONTENT_LENGTH) {
      continue
    }

    if (!ELIGIBLE_AI_SUMMARY_TYPES.includes(item.type)) {
      continue
    }

    const dateKey = getActivityDateKey(item.timestampDateTime)

    if (dateKeysWithVisibleSummary.has(dateKey)) {
      continue
    }

    visibleIds.add(item.id)
    dateKeysWithVisibleSummary.add(dateKey)
  }

  return visibleIds
}

export default function ActivityTimeline({
  items,
  ariaLabel = "Activity timeline",
  emptyMessage = "No activity yet.",
  className = "",
  scrollListOnly = false,
  highlightedItemId = null,
  activeSuggestedAction = null,
  onAppendTimelineItem,
  onCompleteSuggestedAction,
  onSendSuggestedAction,
  onDismissSuggestedAction,
  onOpenSuggestedActionComposer,
  replyDraftContext,
}: ActivityTimelineProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [composerActivityType, setComposerActivityType] =
    useState<ComposerActivityType>("internal-note")
  const [draftNote, setDraftNote] = useState("")
  const [draftItems, setDraftItems] = useState<ActivityTimelineItem[]>([])
  const [expandedItemIds, setExpandedItemIds] = useState<Record<string, boolean>>({})
  const [replyDraft, setReplyDraft] = useState("")
  const [replyComposerItemId, setReplyComposerItemId] = useState<string | null>(null)
  const timelineItems = [...items, ...draftItems]
  const visibleAISummaryItemIds = getVisibleAISummaryItemIds(timelineItems)
  const groups = groupActivityTimelineItems(timelineItems)
  const orderedGroups = [...groups].reverse()
  const trimmedDraftNote = draftNote.trim()
  const composerPlaceholder =
    composerActivityType === "email-sent"
      ? "Add an email update"
      : "Add an internal note"

  const rootClasses = [
    "w-full",
    scrollListOnly ? "flex h-full min-h-0 flex-col" : "",
    className,
  ].filter(Boolean).join(" ")
  const composerClasses = [
    "space-y-[var(--space-3)]",
    "border-y",
    "border-[var(--color-border-divider)]",
    "py-[var(--space-4)]",
  ].join(" ")
  const composerMetaClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")
  const composerFieldLabelClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-secondary)]",
  ].join(" ")
  const groupsClasses = ["space-y-[var(--space-stack-md)]"].join(" ")
  const scrollRegionClasses = [
    "min-h-0",
    "flex-1",
    "overflow-y-auto",
    "pt-[var(--space-stack-md)]",
  ].join(" ")

  const groupClasses = [
    "space-y-[var(--space-stack-sm)]",
  ].join(" ")

  const groupHeaderWrapClasses = [
    "border-y",
    "border-[var(--color-border-divider)]",
    "bg-[var(--color-surface-structural-muted)]",
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
    "transition-[background-color,border-color,box-shadow]",
    "duration-700",
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
  const collapsedContentClasses = [
    "overflow-hidden",
    "[display:-webkit-box]",
    "[-webkit-box-orient:vertical]",
    "[-webkit-line-clamp:2]",
  ].join(" ")
  const summaryWrapClasses = [
    "mt-[var(--space-2)]",
    "border-l",
    "border-[var(--color-border-divider)]",
    "px-[var(--space-2)]",
    "py-[var(--space-1)]",
  ].join(" ")
  const summaryLabelClasses = [
    "text-[length:var(--text-xs)]",
    "leading-[var(--leading-normal)]",
    "[font-weight:var(--font-weight-medium)]",
    "tracking-[0.01em]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")
  const summaryClasses = [
    "pt-[var(--space-half)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")
  const collapsedSummaryClasses = [
    "overflow-hidden",
    "[display:-webkit-box]",
    "[-webkit-box-orient:vertical]",
    "[-webkit-line-clamp:1]",
  ].join(" ")
  const actionAreaClasses = [
    "flex",
    "flex-wrap",
    "items-center",
    "gap-[var(--space-2)]",
    "pt-[var(--space-2)]",
  ].join(" ")
  const actionButtonClasses = [
    "inline-flex",
    "items-center",
    "rounded-[var(--radius-sm)]",
    "px-[var(--space-1)]",
    "py-[var(--space-half)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-secondary)]",
    "transition-colors",
    "hover:bg-[var(--color-surface-muted)]",
    "hover:text-[color:var(--color-text-primary)]",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-[var(--color-focus-ring)]",
  ].join(" ")
  const itemDeleteClasses = [
    "text-[color:var(--color-text-muted)]",
  ].join(" ")
  const inlineReplyClasses = [
    "mt-[var(--space-3)]",
    "space-y-[var(--space-3)]",
    "rounded-[var(--radius-sm)]",
    "border",
    "border-[var(--color-border-divider)]",
    "bg-[var(--color-surface)]",
    "p-[var(--space-3)]",
  ].join(" ")
  const inlineReplyTitleClasses = [
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "[font-weight:var(--font-weight-medium)]",
    "text-[color:var(--color-text-primary)]",
  ].join(" ")
  const inlineReplyMetaClasses = [
    "text-[length:var(--text-xs)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
  ].join(" ")

  const emptyStateClasses = [
    "py-[var(--space-4)]",
    "text-[length:var(--text-meta)]",
    "leading-[var(--leading-normal)]",
    "text-[color:var(--color-text-muted)]",
    "border-y",
    "border-[var(--color-border-divider)]",
  ].join(" ")

  function handleOpenComposer() {
    setComposerActivityType("internal-note")
    setIsComposerOpen(true)
  }

  function handleOpenReplyComposer(itemId: string) {
    const replyTargetItem = timelineItems.find((timelineItem) => timelineItem.id === itemId)

    setReplyComposerItemId(itemId)
    setReplyDraft(replyTargetItem ? buildAIDraftReply(replyTargetItem) : "")
  }

  function getCustomerFirstName(item: ActivityTimelineItem) {
    if (typeof item.actor === "string" && item.type === "incoming") {
      return item.actor.split(" ")[0]
    }

    const itemIndex = timelineItems.findIndex((timelineItem) => timelineItem.id === item.id)

    if (itemIndex <= 0) {
      return "there"
    }

    for (let index = itemIndex - 1; index >= 0; index -= 1) {
      const candidate = timelineItems[index]

      if (candidate.type === "incoming" && typeof candidate.actor === "string") {
        return candidate.actor.split(" ")[0]
      }
    }

    return "there"
  }

  function getCustomerDisplayName(item: ActivityTimelineItem) {
    if (typeof item.actor === "string" && item.actor.trim()) {
      return item.actor.trim()
    }

    if (typeof replyDraftContext?.customerName === "string" && replyDraftContext.customerName.trim()) {
      return replyDraftContext.customerName.trim()
    }

    return "customer"
  }

  function getOwnerSignOffName() {
    if (typeof replyDraftContext?.ownerName === "string" && replyDraftContext.ownerName.trim()) {
      return replyDraftContext.ownerName.trim().split(" ")[0]
    }

    return "Support"
  }

  function getItemTextContent(item: ActivityTimelineItem) {
    return typeof item.content === "string" ? item.content.trim() : ""
  }

  function getLatestCustomerQuestion(item: ActivityTimelineItem) {
    const currentItemContent = getItemTextContent(item)

    if (currentItemContent) {
      return currentItemContent
    }

    const itemIndex = timelineItems.findIndex((timelineItem) => timelineItem.id === item.id)

    if (itemIndex <= 0) {
      return ""
    }

    for (let index = itemIndex - 1; index >= 0; index -= 1) {
      const candidate = timelineItems[index]

      if (candidate.type === "incoming") {
        const candidateContent = getItemTextContent(candidate)

        if (candidateContent) {
          return candidateContent
        }
      }
    }

    return ""
  }

  function getCustomerPromptLine(message: string) {
    if (!message) {
      return ""
    }

    if (message.length <= 140) {
      return `You asked: "${message}"`
    }

    return `You asked for an update on ${message.slice(0, 137).trimEnd()}...`
  }

  function buildAIDraftReply(item: ActivityTimelineItem) {
    const customerFirstName = getCustomerFirstName(item)
    const ownerSignOffName = getOwnerSignOffName()
    const nextStep = replyDraftContext?.nextStep?.trim().toLowerCase() ?? ""
    const situation = replyDraftContext?.situation?.trim().toLowerCase() ?? ""
    const reason = replyDraftContext?.reason?.trim() ?? ""
    const latestCustomerQuestion = getLatestCustomerQuestion(item)
    const customerPromptLine = getCustomerPromptLine(latestCustomerQuestion)
    const shouldRequestConfirmation =
      situation === "waiting on customer" ||
      nextStep.includes("confirmation")
    const shouldSendClosureSummary =
      nextStep.includes("closure summary") ||
      nextStep.includes("close the case")
    const shouldProvideStatusUpdate =
      nextStep.includes("update") ||
      nextStep.includes("investigation") ||
      nextStep.includes("review")

    if (shouldSendClosureSummary) {
      return `Hi ${customerFirstName},

Thanks for the confirmation. ${customerPromptLine || "I wanted to close the loop on this case."}

The correction is complete on our side, and no additional issue is currently open. If anything still looks off after you review the latest update, please let me know. Otherwise, we can close the case from here.

Best,
${ownerSignOffName}`
    }

    if (shouldRequestConfirmation) {
      return `Hi ${customerFirstName},

Thanks for your message. ${customerPromptLine || "Following up on the update we shared."}

At this point we are waiting for your confirmation so we can move the case forward. When you have a moment, please let us know whether everything now looks correct on your side or if there is still one detail you want us to review.

Best,
${ownerSignOffName}`
    }

    if (shouldProvideStatusUpdate) {
      return `Hi ${customerFirstName},

Thanks for checking in. ${customerPromptLine || "I wanted to share the current status of the case."}

We are still working through the current review on our side and the next step is ${replyDraftContext?.nextStep?.trim() || "to complete the active investigation"}. ${reason ? `At the moment, ${reason.charAt(0).toLowerCase()}${reason.slice(1)}` : "I will send another update as soon as there is a confirmed change to share."}

Best,
${ownerSignOffName}`
    }

    return `Hi ${customerFirstName},

Thanks for your message. ${customerPromptLine || "I’m reviewing the latest case activity now."}

The next step on our side is ${replyDraftContext?.nextStep?.trim() || "to continue moving the case forward"}. If there is anything else you want us to take into account, feel free to reply here and I will include it in the review.

Best,
${ownerSignOffName}`
  }

  useEffect(() => {
    if (!activeSuggestedAction || !activeSuggestedAction.composerOpen) {
      setReplyDraft("")
      return
    }

    const replyTargetItem = timelineItems.find(
      (item) => item.id === activeSuggestedAction.referenceId,
    )

    if (!replyTargetItem) {
      setReplyDraft("")
      return
    }

    setReplyDraft(buildAIDraftReply(replyTargetItem))
  }, [
    activeSuggestedAction?.composerOpen,
    activeSuggestedAction?.label,
    activeSuggestedAction?.referenceId,
  ])

  function handleCancelComposer() {
    setDraftNote("")
    setComposerActivityType("internal-note")
    setIsComposerOpen(false)
  }

  function handleSaveNote() {
    if (!trimmedDraftNote) {
      return
    }

    const createdAt = new Date()

    setDraftItems((current) => [
      ...current,
      {
        id: `activity-note-${createdAt.getTime()}`,
        timestamp: createdAt.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        timestampDateTime: createdAt.toISOString(),
        type: composerActivityType === "email-sent" ? "outgoing" : "comment",
        actor: "You",
        subtype: composerActivityType === "email-sent" ? "Support agent" : "Internal note",
        organization: "VivaLaVita",
        content: trimmedDraftNote,
        aiSummary: buildAISummary(trimmedDraftNote),
      },
    ])
    setDraftNote("")
    setComposerActivityType("internal-note")
    setIsComposerOpen(false)
  }

  function toggleExpandedItem(itemId: string) {
    setExpandedItemIds((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }))
  }

  function handleDeleteItem(itemId: string) {
    setDraftItems((current) => current.filter((item) => item.id !== itemId))
    setExpandedItemIds((current) => {
      const next = { ...current }
      delete next[itemId]
      return next
    })
  }

  function handleDiscardReply() {
    setReplyDraft("")
    setReplyComposerItemId(null)
    onDismissSuggestedAction?.()
  }

  function handleSendReply(item: ActivityTimelineItem) {
    const trimmedReplyDraft = replyDraft.trim()

    if (!trimmedReplyDraft) {
      return
    }

    const createdAt = new Date()

    const nextReplyItem: ActivityTimelineItem = {
      id: `activity-reply-${createdAt.getTime()}`,
      timestamp: createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      timestampDateTime: createdAt.toISOString(),
      type: "outgoing",
      actor: "You",
      subtype: "Support agent",
      organization: item.organization ?? "VivaLaVita",
      content: trimmedReplyDraft,
      aiSummary: buildAISummary(trimmedReplyDraft),
    }

    onAppendTimelineItem?.(nextReplyItem)
    if (activeSuggestedAction) {
      onCompleteSuggestedAction?.(activeSuggestedAction.label)
      onSendSuggestedAction?.(activeSuggestedAction.label)
    }
    setReplyDraft("")
    setReplyComposerItemId(null)
    onDismissSuggestedAction?.()
  }

  return (
    <div className={rootClasses}>
      <style>
        {`
          @keyframes activity-timeline-sent-highlight {
            from {
              background-color: transparent;
            }

            12% {
              background-color: var(--color-surface-feedback);
            }

            76% {
              background-color: var(--color-surface-feedback);
            }

            to {
              background-color: transparent;
            }
          }
        `}
      </style>
      <section className={composerClasses} aria-label={`${ariaLabel}: add internal note`}>
        {isComposerOpen ? (
          <div className="space-y-[var(--space-3)]">
            <div className="space-y-[var(--space-1)]">
              <label htmlFor="activity-timeline-composer-type" className={composerFieldLabelClasses}>
                Activity type
              </label>
              <Select
                id="activity-timeline-composer-type"
                size="sm"
                value={composerActivityType}
                onChange={(event) =>
                  setComposerActivityType(event.target.value as ComposerActivityType)
                }
                aria-label="Activity type"
              >
                {COMPOSER_ACTIVITY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              size="sm"
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder={composerPlaceholder}
              aria-label="New timeline entry"
            />

            <div className="flex flex-wrap items-center gap-[var(--space-2)]">
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={!trimmedDraftNote}
                onClick={handleSaveNote}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelComposer}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <p className={composerMetaClasses}>Add an internal note to the timeline.</p>
            <Button type="button" variant="secondary" size="sm" onClick={handleOpenComposer}>
              Add internal note
            </Button>
          </div>
        )}
      </section>

      <div className={scrollListOnly ? scrollRegionClasses : groupsClasses}>
        {timelineItems.length === 0 ? (
          <p className={emptyStateClasses}>{emptyMessage}</p>
        ) : (
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
                    const textContent =
                      typeof item.content === "string" ? item.content : null
                    const isTextContent = textContent !== null
                    const isLongContent =
                      isTextContent && textContent.length > COLLAPSED_CONTENT_LENGTH
                    const isExpanded = expandedItemIds[item.id] ?? false
                    const isDeletableInternalNote =
                      item.actor === "You" &&
                      item.type === "comment" &&
                      item.subtype === "Internal note"
                    const hasAISummary = visibleAISummaryItemIds.has(item.id)
                    const showReplyComposer =
                      (activeSuggestedAction?.referenceId === item.id &&
                        activeSuggestedAction.composerOpen) ||
                      replyComposerItemId === item.id
                    const showFollowUpActionBar =
                      activeSuggestedAction?.label === "Follow up with customer" &&
                      activeSuggestedAction.referenceId === item.id &&
                      !activeSuggestedAction.composerOpen
                    const showReplyAction =
                      item.type === "incoming" && !showReplyComposer && !showFollowUpActionBar
                    const isFreshSentReply =
                      highlightedItemId === item.id && item.type === "outgoing"

                    return (
                      <li
                        key={item.id}
                        id={item.id}
                        className={itemClasses}
                        style={
                          isFreshSentReply
                            ? {
                                animation: "activity-timeline-sent-highlight 1150ms ease-out",
                              }
                            : undefined
                        }
                      >
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
                          <div
                            className={[
                              contentClasses,
                              isLongContent && !isExpanded ? collapsedContentClasses : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {item.content}
                          </div>
                          {hasAISummary ? (
                            <div className={summaryWrapClasses}>
                              <div className={summaryLabelClasses}>AI summary</div>
                              <p
                                className={[
                                  summaryClasses,
                                  !isExpanded ? collapsedSummaryClasses : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {item.aiSummary}
                              </p>
                            </div>
                          ) : null}
                          {isLongContent || isDeletableInternalNote || showReplyAction ? (
                            <div className={actionAreaClasses}>
                              {isLongContent ? (
                                <button
                                  type="button"
                                  className={actionButtonClasses}
                                  onClick={() => toggleExpandedItem(item.id)}
                                >
                                  {isExpanded ? "Show less" : "Show more"}
                                </button>
                              ) : null}

                              {isDeletableInternalNote ? (
                                <button
                                  type="button"
                                  className={`${actionButtonClasses} ${itemDeleteClasses}`}
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  Delete
                                </button>
                              ) : null}

                              {showReplyAction ? (
                                <button
                                  type="button"
                                  className={actionButtonClasses}
                                  onClick={() => handleOpenReplyComposer(item.id)}
                                >
                                  Reply
                                </button>
                              ) : null}
                            </div>
                          ) : null}
                          {showFollowUpActionBar ? (
                            <div className={inlineReplyClasses}>
                              <div className="space-y-[var(--space-1)]">
                                <div className={inlineReplyTitleClasses}>Follow-up suggested</div>
                                <p className={inlineReplyMetaClasses}>
                                  {activeSuggestedAction.reason ?? "Waiting for customer confirmation"}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={onOpenSuggestedActionComposer}
                                >
                                  Send follow-up
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={onDismissSuggestedAction}
                                >
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          ) : null}
                          {showReplyComposer ? (
                            <div className={inlineReplyClasses}>
                              <div className="space-y-[var(--space-1)]">
                                <div className={inlineReplyTitleClasses}>
                                  {`Reply to ${getCustomerDisplayName(item)}`}
                                </div>
                                <p className={inlineReplyMetaClasses}>
                                  Draft reply based on recent case activity and the current next step.
                                </p>
                              </div>

                              <Textarea
                                size="sm"
                                value={replyDraft}
                                onChange={(event) => setReplyDraft(event.target.value)}
                                aria-label={
                                  activeSuggestedAction?.label === "Follow up with customer"
                                    ? "Follow up with customer"
                                    : "Reply to customer"
                                }
                              />

                              <div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-fit"
                                  onClick={() => setReplyDraft(buildAIDraftReply(item))}
                                >
                                  Rewrite
                                </Button>
                              </div>

                              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                                <Button
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  disabled={!replyDraft.trim()}
                                  onClick={() => handleSendReply(item)}
                                >
                                  Send
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDiscardReply}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
