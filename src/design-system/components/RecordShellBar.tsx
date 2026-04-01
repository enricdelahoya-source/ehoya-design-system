import type { ReactNode } from "react"
import BrandStripe from "./BrandStripe"
import CaseStatusBadge, { type CaseStatus } from "./CaseStatusBadge"
import Link from "./Link"

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
type RecordShellBarBreadcrumb = {
  label: string
  href: string
}

type RecordShellBarProps = {
  breadcrumbs?: RecordShellBarBreadcrumb[]
  title: string
  recordId?: string
  status?: CaseStatus
  metadata?: ReactNode
  actions?: ReactNode
}

/**
 * ========================================
 * 2. COMPONENT
 * ========================================
 */
export default function RecordShellBar({
  breadcrumbs,
  title,
  recordId,
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
    "items-start",
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

  const breadcrumbRow = [
    "flex",
    "flex-wrap",
    "items-center",
    "gap-x-[var(--space-2)]",
    "gap-y-[var(--space-1)]",
  ].join(" ")

  const breadcrumbLinkClasses = [
    "text-xs",
    "font-medium",
    "text-[var(--color-text-muted)]",
    "leading-normal",
    "hover:text-[var(--color-text-default)]",
  ].join(" ")

  const breadcrumbSeparatorClasses = [
    "text-xs",
    "leading-normal",
    "text-[var(--color-text-subtle)]",
  ].join(" ")

  const titleRow = [
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-baseline",
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

  const recordIdClasses = [
    "text-sm",
    "font-medium",
    "leading-normal",
    "text-[var(--color-text-default)]",
  ].join(" ")

  const identityMetaRow = [
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-center",
    "gap-x-[var(--space-2)]",
    "gap-y-[0.125rem]",
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
    "self-start",
  ].join(" ")

  /**
   * ========================================
   * 4. RENDER
   * ========================================
   */
  return (
    <section className={container} aria-label="Record shell bar">
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className={breadcrumbRow}>
          {breadcrumbs.map((breadcrumb, index) => (
            <span key={breadcrumb.href} className="inline-flex items-center gap-[var(--space-2)]">
              {index > 0 ? (
                <span aria-hidden="true" className={breadcrumbSeparatorClasses}>
                  /
                </span>
              ) : null}
              <Link href={breadcrumb.href} className={breadcrumbLinkClasses}>
                {breadcrumb.label}
              </Link>
            </span>
          ))}
        </nav>
      ) : null}

      <div className={contentRow}>
        <div className={identity}>
          <div className={titleRow}>
            <h2 className={titleClasses}>{title}</h2>

            {status ? (
              <CaseStatusBadge
                status={status}
                emphasis="subtle"
                size="md"
                className="-translate-y-[3px] self-center"
              />
            ) : null}
          </div>

          {recordId || metadata ? (
            <div className={identityMetaRow}>
              {recordId ? (
                <div className={recordIdClasses}>{recordId}</div>
              ) : null}

              {recordId && metadata ? (
                <span aria-hidden="true" className={metadataClasses}>
                  •
                </span>
              ) : null}

              {metadata ? (
                <div className={metadataClasses}>{metadata}</div>
              ) : null}
            </div>
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
