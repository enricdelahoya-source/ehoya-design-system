# Template System — Work Log

## Starting point

- Components and some structure already existed
- `CasesListTemplate` was partially defined
- Record page had structure but layout rules were implicit
- AI panel existed but felt disconnected
- `playground.tsx` was handling both layout and usage

Main issue:
The UI worked visually, but the system rules were not explicit.

---

## Problems identified

### List vs Record inconsistency
- Different shellbar behavior
- Different width logic
- Felt like separate systems

### AI panel integration
- Felt attached, not integrated
- Spacing felt accidental
- Relationship with content unclear

### Layout instability
- Content moved or resized between states
- No clear left/right anchors

### Architecture confusion
- Domain (cases) mixed with system
- Templates not explicit
- Playground mixing responsibilities

---

## Core decisions

### 1. Define page templates

- CollectionPageTemplate
- RecordPageTemplate

Shift:
From screens → to reusable page contracts

---

### 2. Separate system from product

- design-system → reusable UI
- cases → product/domain
- prototype → sandbox

Key idea:
Templates should not depend on domain logic

---

### 3. Record layout model

- Content is left aligned
- AI is right aligned
- Both remain stable
- Only the space between them changes

---

### 4. AI behavior

State is expressed through spacing, not layout changes

- Closed → larger gap
- Open → smaller gap

No:
- content resizing
- layout reflow
- centering

---

### 5. Width strategy

- List pages → fluid
- Record pages → constrained (readable width)
- Details and Activity share the same system
- AI does not affect content width

---

### 6. Simplify header

- Case number moved to breadcrumb
- Metadata reduced
- Clear separation between identity and information

---

## Architecture changes

### Before

- Templates implicit
- Layout logic inside pages
- Mixed responsibilities

### After

design-system/
  templates/
  components/
  tokens/

cases/
  list/
  record/

prototype/

Key result:
Clear separation between system and product

---

## What became explicit

### Collection template
- Shellbar
- Summary strip
- Filters
- Data surface

### Record template
- Shellbar
- Content column
- AI system
- State-based spacing behavior

---

## Key insight

AI should integrate through spatial relationships, not layout changes

Do not:
- move content
- resize content
- reflow layout

Instead:
adjust the distance between content and AI

---

## Tradeoffs

- Edit mode not templated yet
- Record pattern still case-specific
- AI usefulness not solved yet (only layout)
- Avoided over-abstraction

---

## Not finished

- Section prioritization in record
- AI interaction quality
- Generic record pattern (beyond cases)
- Edit mode template

---

## Why this matters

This work demonstrates:
- System-level thinking
- Stable layout design under dynamic states
- Integration of AI into structured workflows
- Clear separation between system and domain

---

## One-line summary

Defined a reusable collection and record template system and integrated AI as a stable secondary surface using state-driven spacing instead of layout changes.