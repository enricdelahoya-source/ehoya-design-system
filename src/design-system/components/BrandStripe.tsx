type BrandStripeProps = {
  className?: string
}

/**
 * Small structural brand marker for top-level layouts.
 * Kept intentionally lightweight so it can be tuned or removed easily.
 */
export default function BrandStripe({ className = "" }: BrandStripeProps) {
  const stripeClasses = [
    "h-[2px]",
    "w-full",
    "shrink-0",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      aria-hidden="true"
      className={stripeClasses}
      style={{
        background:
          "linear-gradient(to right, rgba(200, 106, 42, 0.72) 0%, rgba(200, 106, 42, 0.88) 74%, var(--color-action-brand) 100%)",
      }}
    />
  )
}
