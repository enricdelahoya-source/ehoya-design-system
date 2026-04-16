# Worklog — Case List + Signals Model

## Context

Continued building the case management prototype using the design system (React + Tailwind v4, semantic tokens).
Focus of the session: move from a simple list to a more realistic operational filtering system.

---

## 1. From single state → status + signals model

### Problem

The initial system treated badges like a single state:

* “Waiting on customer”
* “Escalated”
* “Needs assignment”

Only one could exist at a time.

This conflicted with real workflows:

* a case can be escalated AND waiting on customer
* a case can be unassigned AND waiting for first response

### Decision

Split the model into:

* **Status (lifecycle)**

  * new
  * in_progress
  * resolved

* **Signals (non-exclusive conditions)**

  * waitingOnCustomer
  * escalated
  * needsAssignment
  * waitingForFirstResponse

* **primarySignal (derived)**

  * used for simplified UI (AI panel, compact contexts)

### Result

* model now supports real operational complexity
* UI can stay simple where needed (single badge)
* filtering becomes meaningful and combinable

---

## 2. Filtering system redesign

### Initial state

* status cards acted as both display and filter
* signals were unclear and not composable
* no clear hierarchy between search and filters

### Changes

#### Primary filters (cards)

* New / In progress / Resolved
* mutually exclusive
* represent workflow stage

#### Secondary filters (chips)

* Waiting on customer
* Escalated
* Needs assignment
* multi-select
* AND logic

#### Key rule

* cards filter by **status**
* chips filter by **signals**
* filters are combinable

### Result

* supports queries like:

  * “In progress + waiting on customer”
  * “New + needs assignment”
* aligns with real support workflows

---

## 3. Interaction and design system refinements

### FilterChip component

* extracted as its own component (not a Button variant)
* uses semantic tokens only

### States

* default: neutral surface + border
* hover: subtle background tint (system-wide rule)
* selected:

  * accent border (constant width)
  * subtle tinted background
  * optional inner ring (for cards)

### Key fix

Removed border width changes on selection:

* avoided layout shift
* improved perceived quality

### System rule established

* hover = background tint
* selection = border + tint
* no layout movement on interaction

---

## 4. Result feedback (orientation fix)

### Problem

After filtering, there was no feedback about:

* how many results are shown
* whether filters are active

### Solution

Added result count above the table:

* “18 cases” (default)
* “5 results” (filtered)

### Result

* closes the feedback loop
* improves confidence and usability
* connects cards + search + chips into one system

---

## 5. Hierarchy cleanup

### Problem

“Signals” label created confusion:

* looked like a form label (same as “Search”)
* but chips are not a field

### Decision

* removed “Signals” label entirely
* rely on chips as self-describing controls

### Result

* cleaner layout
* clearer mental model
* less UI noise

---

## 6. Data realism

Added combined-signal cases to validate the model:

* escalated + waitingOnCustomer
* needsAssignment + waitingForFirstResponse
* escalated + needsAssignment

### Result

* filtering logic validated
* UI tested against real scenarios
* revealed edge cases early

---

## 7. Debugging and stability

Issue:

* multi-filter initially returned no results
* required page reload

Likely causes:

* stale state / hot reload behavior
* filtering logic referencing old fields

Fix:

* verified filtering uses `signals` (not `primarySignal`)
* ensured AND logic across selected chips

---

## 8. Current state

The case list now:

* supports realistic filtering
* has clear hierarchy
* uses consistent interaction patterns
* avoids visual jitter
* feels like a real operational tool

---

## 9. Next steps

Move to **record view** and validate:

* how multiple signals are displayed
* how `primarySignal` is used in AI panel
* how “next step” reflects combined conditions

Key question:

> how to balance simplified summary vs full system truth

---

## Key takeaways

* separating **status vs signals** is critical for scalability
* UI clarity depends on **data model clarity**
* interaction consistency (hover, selection) has system-level impact
* small feedback elements (result count) significantly improve usability
* real data examples are necessary to validate design decisions
