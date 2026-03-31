import type { ReactNode } from "react"
import BrandStripe from "./BrandStripe"
import Link from "./Link"
import StatusBadge from "./StatusBadge"

/**
 * ========================================
 * RECORD SHELL BAR
 * Record-page shell bar composition
 * ========================================
 *
 * This component is a first product-level composition for ERP-style
 * record pages. It frames identity, state, metadata, and actions in
 * one calm operational surface.
 */

/**
 * ========================================
 * 1. PUBLIC API
 * ========================================
 */
type RecordShellBarProps = {
  recordType: string
  title: string
  recordId?: string
  status?: {
    label: string
    tone?: "neutral" | "info" | "success" | "warning" | "danger"
    emphasis?: "subtle" | "strong"
  }
  metadata?: ReactNode
  actions?: ReactNode
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function RecordShellBar({
  recordType,
  title,
  status,
  metadata,
  actions,
}: RecordShellBarProps) {
  /**
   * ========================================
   * 3. LAYOUT
   * ========================================
   *
   * Keep the shell bar compact and structured:
   * identity on the left, actions on the right,
   * identifier between title and metadata.
   */
  const container = [
    "flex",
    "flex-col",
    "gap-[var(--space-2)]",
  ].join(" ")

  const contentRow = [
    "flex",
    "items-center",
    "justify-between",
    "gap-[var(--space-stack-md)]",
  ].join(" ")

  const identity = [
    "flex",
    "min-w-0",
    "flex-1",
    "flex-col",
    "gap-[var(--space-2)]",
  ].join(" ")

  const parentLinkClasses = [
    "text-xs",
    "font-medium",
    "text-[var(--color-text-muted)]",
    "leading-normal",
  ].join(" ")

  const titleRow = [
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-center",
    "gap-x-[var(--space-2)]",
    "gap-y-[0.125rem]",
  ].join(" ")

  const titleClasses = [
    "min-w-0",
    "text-xl",
    "font-semibold",
    "leading-[1.2]",
    "text-[var(--color-text-default)]",
  ].join(" ")

  const metadataClasses = [
    "min-w-0",
    "text-sm",
    "leading-normal",
    "text-[var(--color-text-muted)]",
  ].join(" ")

  const actionsClasses = [
    "flex",
    "shrink-0",
    "items-center",
    "gap-actions-md",
    "self-center",
  ].join(" ")

  /**
   * ========================================
   * 4. RENDER
   * ========================================
   */
  return (
    <section className={container} aria-label={`${recordType} shell bar`}>
      <div className={contentRow}>
        <div className={identity}>
          <Link href="#" className={parentLinkClasses}>
            {recordType}
          </Link>

          <div className={titleRow}>
            <h2 className={titleClasses}>{title}</h2>

            {status ? (
              <StatusBadge
                tone={status.tone}
                emphasis={status.emphasis}
                size="md"
                className="-translate-y-[1px] self-center"
              >
                {status.label}
              </StatusBadge>
            ) : null}
          </div>

          {metadata ? (
            <div className={metadataClasses}>{metadata}</div>
          ) : null}
        </div>

        {actions ? (
          <div className={actionsClasses}>{actions}</div>
        ) : null}
      </div>

      <BrandStripe className="mt-[2px]" />
    </section>
  )
}
