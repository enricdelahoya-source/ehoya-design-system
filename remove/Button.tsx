// ==============================
// 1. COMPONENT API (PUBLIC CONTRACT)
// ==============================
// Defines what consumers of the component are allowed to control
type ButtonProps = {
  // Content inside the button (text, icon, etc.)
  children: React.ReactNode

  // Visual intent (should map to semantic roles, not colors)
  variant?: "primary" | "secondary" | "ghost"

  // Size scale (affects height, padding, typography)
  size?: "sm" | "md" | "lg"

// Extend native button behavior (onClick, disabled, type, aria-*...)
} & React.ButtonHTMLAttributes<HTMLButtonElement>


// ==============================
// 2. COMPONENT IMPLEMENTATION
// ==============================
export default function Button({
  children,
  variant = "primary", // default = system bias
  size = "md",         // default = baseline density
  ...props             // pass-through native behavior
}: ButtonProps) {

  // ==============================
  // 3. BASE STYLES (STRUCTURE)
  // ==============================
  // Styles that NEVER change across variants or sizes
  // Defines layout, alignment, and interaction baseline
  const base =
    "inline-flex items-center justify-center font-medium transition rounded-xl focus:outline-none"


  // ==============================
  // 4. VARIANTS (SEMANTIC MEANING)
  // ==============================
  // Each variant represents a different level of emphasis or intent
  // NOTE: currently hardcoded colors -> should later use tokens
  const variants = {
    // High emphasis action (primary CTA)
    primary: "bg-blue-600 text-white hover:bg-blue-700",

    // Neutral action (secondary importance)
    secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",

    // Low emphasis (inline / tertiary actions)
    ghost: "text-slate-700 hover:bg-slate-100",
  }


  // ==============================
  // 5. SIZES (SCALE SYSTEM)
  // ==============================
  // Controls ergonomics: height + padding + font scale together
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  }


  // ==============================
  // 6. RENDER (COMPOSITION)
  // ==============================
  // Combine structure + meaning + scale into final UI
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]}`}

      // Spread native props (onClick, disabled, aria-*, etc.)
      {...props}
    >
      {children}
    </button>
  )
}
