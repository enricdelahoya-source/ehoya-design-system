# BADGE.md

## Purpose

This file documents how badges should be used and aligned in this project, with special attention to shell-bar title badges.

Use this before changing:

* `src/design-system/components/StatusBadge.tsx`
* `src/design-system/components/CaseStatusBadge.tsx`
* `src/design-system/components/RecordShellBar.tsx`

The goal is to prevent repeated alignment regressions and avoid chasing visual issues with ineffective utility classes.

---

## Core principles

### 1. Reuse the badge primitive

Always use the existing primitives first:

* `StatusBadge` for generic labels
* `CaseStatusBadge` for case workflow statuses

Do not create one-off badge components just to solve alignment.

### 2. Keep shell-bar badge behavior local to the shell bar

If a badge needs optical alignment next to the record title, solve that in `RecordShellBar`, not inside `StatusBadge`.

Reason:

* `StatusBadge` is a reusable primitive
* the shell bar title has a specific font size and line-height
* the optical correction is contextual, not universal

### 3. Prefer explicit layout over guesswork

If visual alignment is failing:

* inspect the row alignment
* inspect the title line-height
* inspect the badge wrapper behavior
* verify whether the CSS utility you are relying on is actually emitted

Do not assume a Tailwind class is working just because it appears in JSX.

---

## Shell bar badge rules

### Working title-row setup

The current shell-bar title row works because of this combination:

* title row uses `items-baseline`
* badge wrapper uses `inline-flex`
* badge wrapper uses `self-center`
* badge wrapper applies an explicit inline transform

Current intent:

* the badge sits beside the title
* the badge is optically nudged for the shell-bar title only
* the badge primitive itself stays generic

### Current working pattern

In `RecordShellBar.tsx`, keep the title badge setup structurally like this:

```tsx
const titleRow = [
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-baseline",
  "gap-x-[var(--space-2)]",
  "gap-y-[0.125rem]",
].join(" ")

const titleBadgeClasses = [
  "inline-flex",
  "shrink-0",
  "self-center",
].join(" ")

const titleBadgeStyles = {
  transform: "translateY(3px)",
} as const
```

And render the badge through a wrapper:

```tsx
<span className={titleBadgeClasses} style={titleBadgeStyles}>
  <StatusBadge tone="neutral" emphasis="subtle" size="md">
    Editing
  </StatusBadge>
</span>
```

Use the same wrapper pattern for `CaseStatusBadge` when it appears in the shell bar title row.

---

## Important failure learned here

### Tailwind translate utility was not reliable for this case

During debugging, badge alignment failed repeatedly because Tailwind was not emitting the expected arbitrary translate utility in the built CSS.

Examples that looked correct in JSX but did not reliably solve the issue:

* `-translate-y-[3px]`
* `translate-y-[3px]`

Key lesson:

* if the badge does not move visually, verify the generated CSS before continuing to tweak layout

Do not keep iterating on flex alignment if the offset utility itself is missing.

### Safer approach for shell-bar title badges

For shell-bar title badge alignment, prefer:

* an explicit wrapper
* a small inline `transform`

This is acceptable here because:

* it is a tiny, local, context-specific correction
* it avoids a fragile dependency on an emitted arbitrary utility
* it keeps the primitive API untouched

---

## Troubleshooting checklist

If a badge looks wrong in the shell bar:

1. Confirm the title row is still `items-baseline`.
2. Confirm the badge is wrapped in an `inline-flex` wrapper.
3. Confirm the wrapper still has `self-center`.
4. Confirm the wrapper still has the explicit `transform: "translateY(3px)"`.
5. Confirm the badge primitive itself was not modified in a way that changes its intrinsic height.
6. If you try a Tailwind transform utility, verify it exists in built CSS before trusting it.
7. Use a screenshot to validate the optical result, not just DOM inspection.

---

## What not to do

Do not:

* change `StatusBadge` just to fix shell-bar title alignment
* create a special edit-mode badge component
* rely on repeated trial-and-error with `top`, `mt`, or translate classes without verifying output
* move the entire title row alignment unless you are sure the issue is the row, not the badge offset
* add decorative styling to make alignment issues less noticeable

---

## When to update this file

Update `BADGE.md` if:

* badge alignment strategy changes
* shell-bar typography tokens change in a way that affects optical alignment
* Tailwind config or token generation changes and makes utility behavior more reliable
* a new badge placement pattern is introduced and becomes a project convention
