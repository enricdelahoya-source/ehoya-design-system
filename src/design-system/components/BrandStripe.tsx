type BrandStripeProps = {
  className?: string
}

/**
 * Small structural brand marker for top-level layouts.
 * Kept intentionally lightweight so it can be tuned or removed easily.
 */
export default function BrandStripe({ className = "" }: BrandStripeProps) {
  const stripeClasses = [
    "h-[var(--space-half)]",
    "w-full",
    "shrink-0",
    "bg-[var(--color-accent)]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div aria-hidden="true" className={stripeClasses} />
}
