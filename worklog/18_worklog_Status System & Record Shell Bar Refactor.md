# Worklog — Status System & Record Shell Bar Refactor

## Context

While building the case management interface, the system started to show early signs of drift between:

* design-system primitives (StatusBadge)
* product-level usage (case statuses, shell bar)

The RecordShellBar in particular mixed concerns:

* recordType acting as a pseudo-breadcrumb
* inline status configuration (label, tone, emphasis)
* optional statusBadge slot allowing arbitrary overrides

This created multiple ways to represent the same concept, increasing the risk of one-off implementations and inconsistency.

---

## Problem

The system lacked a clear separation between:

* visual primitives (how something looks)
* business meaning (what something represents)

As a result:

* status styling decisions could be made ad hoc in product code
* the shell bar API was flexible but ambiguous
* identity elements (title, ID, navigation) were not structurally defined

This is a typical failure mode in design systems: flexibility at the component level leads to inconsistency at the product level.

---

## Key Decisions

### 1. Separate primitive from business meaning

Introduced a new layer:

* StatusBadge → remains a pure visual primitive
* CaseStatusBadge → owns business semantics

```tsx
<CaseStatusBadge status="waiting_on_customer" />
```

Instead of:

```tsx
<StatusBadge tone="warning">Waiting on customer</StatusBadge>
```

#### Why

* Prevents tone/label decisions from being scattered across the product
* Creates a single source of truth for status representation
* Keeps the primitive reusable and system-focused

---

### 2. Remove one-off escape hatches

Removed from RecordShellBar:

* inline status object (label, tone, emphasis)
* statusBadge?: ReactNode

#### Why

These allowed:

* arbitrary styling
* inconsistent usage patterns
* bypassing system rules

The component is now stricter, but more predictable.

---

### 3. Replace recordType with real breadcrumbs

Previous:

* recordType: string rendered as a link

Now:

```tsx
breadcrumbs?: { label: string; href: string }[]
```

Example:

Service / Cases

#### Why

* Makes navigation explicit instead of implied
* Scales beyond a single level
* Aligns with ERP patterns (hierarchical context)

---

### 4. Make record identity explicit

Repositioned identity elements into a clear hierarchy:

1. breadcrumbs
2. title + status
3. record ID
4. metadata

recordId is now:

* always part of identity
* visually stronger than metadata
* displayed inline with metadata using a subtle separator

#### Why

* Record ID is not extra information
* It is a core operational reference in ERP contexts

---

### 5. Move breadcrumbs above the main row

Breadcrumbs were lifted outside the main two-column layout.

#### Why

* Aligns actions with the title instead of the breadcrumb
* Creates a cleaner structural rhythm
* Reduces visual competition in the identity block

---

### 6. Contextualize status appearance

In the shell bar:

* CaseStatusBadge uses emphasis="subtle"

#### Why

* Shell bar is a structural surface, not a feedback surface
* Status should be visible but not dominant
* Separates semantic meaning from contextual intensity

---

## Result

The RecordShellBar evolved from a flexible container into a product-level composition with clear responsibilities:

* single path for status rendering
* explicit navigation model
* structured identity hierarchy
* reduced API ambiguity

System improvements:

* eliminates one-off styling paths
* enforces consistency through composition
* keeps primitives clean and reusable
* aligns with structure over decoration principle

---

## Tradeoffs & Notes

### Badge alignment

The status badge required a small optical adjustment:

```tsx
-translate-y-[3px]
```

#### Interpretation

* Not ideal, but acceptable as a local alignment correction
* Likely caused by:

  * heading line-height vs badge height
  * baseline vs center alignment mismatch

#### Decision

* Accept current solution for visual correctness
* Revisit later if alignment becomes a recurring issue

---

### System boundary clarified

This refactor reinforces a key rule:

* Primitives define appearance
* Wrappers define meaning
* Compositions define structure

Breaking this boundary is what creates one-offs.

---

## Outcome

This iteration did not introduce new UI patterns.

Instead, it:

* removed ambiguity
* reduced flexibility in the right places
* strengthened the system’s internal logic

The result is a calmer, more predictable ERP interface that scales better as complexity increases.

---

## Key Learning

Design systems do not usually break because of missing components.

They break because:

* meaning is defined at the wrong layer
* components allow too many ways to do the same thing
* structure is implied instead of explicit

This refactor was about correcting those failure modes early.

