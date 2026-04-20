# Worklog — Case Record View (Layout → Density → Right Rail → Interaction)

## Context

This iteration focused on evolving a case detail screen from a clean design-system application into a **realistic, dense ERP surface**.

The goal was not visual polish, but:
- validating layout under pressure
- defining field behavior rules
- introducing a right rail for AI + actions
- ensuring the system holds with real data

This work builds on a token-driven design system using React + Tailwind v4 :contentReference[oaicite:0]{index=0}.

---

## Phase 1 — Base Record View

Started from a simple structure:

- Shell bar (title + actions)
- Sections:
  - Overview
  - Contact
  - Classification
  - Notes
- Field grid (2–3 columns)
- Read-only fields

### Key decisions
- Remove duplicated "case title" field from Overview
- Use sections for grouping instead of subsections
- Keep layout flat and structured

### Learning
A flat structure scales better than early hierarchy (no premature subsections).

---

## Phase 2 — Hierarchy & Vertical Rhythm

Main issue:
- Sections felt visually similar
- Weak distinction between page title and section titles

### Fixes
- Introduced clear H1 (record) vs H2 (sections)
- Tightened spacing between:
  - shell → first section
  - description → fields
- Reduced “floating” feeling at top of page

### Learning
Vertical rhythm is driven by **first spacing decision**, not global spacing.

---

## Phase 3 — Right Rail Introduction

Added a secondary column with:

- Summary (AI-generated)
- Suggested actions
- Recent activity

### Key constraints
- Main column remains primary
- Rail is supportive, not competing
- No heavy cards or visual noise

### Issues discovered
- Actions did not look interactive
- Rail headings too similar to labels
- Layout started to feel unbalanced

### Fixes
- Introduced:
  - primary action (button)
  - secondary actions (links)
- Added rail-specific heading hierarchy (H3 level)
- Structured rail as vertical system (not loose blocks)

### Learning
Right rail is not just layout — it’s **hierarchy across zones**.

---

## Phase 4 — Dense Case Stress Test

Expanded Overview to simulate real ERP data:

- 12–15 fields
- mixed lengths (short, medium, long)
- long identifiers and references
- realistic naming (enterprise customers, categories, IDs)

Expanded rail:
- longer summary
- 5–6 suggested actions
- full activity list

### What broke
- grid struggled with long fields
- some rows became uneven
- scanning slowed
- long identifiers dominated layout

### Key insight
Not all fields should behave the same.

---

## Phase 5 — Field Behavior System

Instead of manual column spans, introduced field types:

### 1. Compact
- single line
- truncates if needed
- fits grid

### 2. Flexible
- can wrap to 2 lines
- stays in grid

### 3. Full-width (long)
- breaks out of grid
- spans section width

### Implementation
- moved:
  - external reference
  - contract reference
  - portal environment  
  → into full-width rows

### Learning
Avoid:
- per-screen layout tweaks
- arbitrary column spanning

Prefer:
- **behavior-driven layout rules**

---

## Phase 6 — Interaction Layer (Actions)

Initial problem:
- actions looked like passive text

### Fixes
- introduced clear interaction hierarchy:
  - primary → button
  - secondary → colored links
- ensured links use action color (not label color)
- grouped actions as vertical list
- added hover affordance (conceptually)

### Learning
Interaction requires:
- semantic clarity
- visual affordance
- hierarchy

Not just “adding color”.

---

## Phase 7 — Activity Timeline Refinement

Improved from raw text → structured list:

- bullet-based entries
- actor + timestamp pattern
- consistent wrapping

### Result
- better scanability
- more realistic ERP behavior
- holds under longer histories

---

## Final State

The system now supports:

- dense data without collapsing
- mixed field types
- consistent scanning patterns
- secondary rail with AI + actions
- clear interaction hierarchy

### Key properties

- structure over decoration
- predictable layout behavior
- controlled exceptions (not ad-hoc fixes)
- scalable to new record types

---

## Key Learnings

### 1. Structure must be rigid
Consistency enables scanning and scale.

### 2. Exceptions must be intentional
Handled via field behavior types, not layout hacks.

### 3. Density reveals truth
Clean screens hide problems. Dense screens expose system quality.

### 4. Right rail is a hierarchy problem
Not just a layout addition.

### 5. Interaction is a separate layer
Layout can be correct while interaction is still unclear.

---

## Next Step

Move to **Edit Mode**:

- view ↔ edit model
- inline vs form editing
- save / cancel flows
- validation
- interaction with right rail

Goal:
Validate whether the system holds not just for reading, but for **editing and decision-making**.