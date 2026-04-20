# Worklog — Template System & Architecture Refactor
Date: April 10, 2026

---

## Context

This project is an ERP-style design system exploration focused on structure, scalability, and AI integration.

Goal:
- Build reusable system primitives
- Apply them to a case management product
- Introduce AI as a structured layer

Tech:
- React + Vite
- Tailwind v4 (@theme tokens)

---

## Starting point

- CasesListTemplate already existed as a partial collection template
- Record page had structure but:
  - layout rules were implicit
  - AI panel felt attached, not integrated
- playground.tsx handled both layout and usage
- Design system and domain (cases) were mixed

Main issue:
The UI worked visually, but the system rules were not explicit

---

## Problems identified

### List vs Record inconsistency
- Different width logic
- Different shellbar behavior
- Felt like separate systems

### AI panel integration
- Felt like an add-on
- Relationship with content unclear
- Spacing felt accidental

### Layout instability
- Content shifted between states
- No clear anchors

### Architecture confusion
- Domain mixed with system
- Templates not explicit
- Playground mixing responsibilities

---

## Key decisions

### Define page templates

- CollectionPageTemplate
- RecordPageTemplate

Shift:
From screen composition to reusable page contracts

---

### Separate system from product

- design-system → reusable logic
- cases → domain implementation
- prototype → sandbox

Key idea:
Templates should not depend on domain (cases)

---

### Record layout model

- Content is left aligned
- AI is right aligned
- Both remain stable
- Only the space between them changes

---

### AI behavior model

State is expressed through spacing:

- Closed → large gap (AI passive)
- Open → smaller gap (AI active)

Avoid:
- resizing content
- reflowing layout
- centering

Key idea:
State = spacing change, not layout change

---

### Width strategy

- List pages → fluid
- Record pages → constrained (readable width)
- Activity and Details share the same layout system
- AI does not affect content width

---

### Header simplification

- Case number moved to breadcrumb
- Metadata reduced
- Identity and content separated

---

## Architecture changes

Before:
- Templates implicit
- Layout logic inside pages
- Mixed responsibilities

After:

design-system/
  templates/
  components/
  tokens/

cases/
  list/
  record/

prototype/

Key result:
Clear separation between system and domain

---

## What became explicit

Collection template defines:
- Shellbar
- Summary strip
- Filters
- Data surface

Record template defines:
- Shellbar
- Content column
- AI system
- State-based spacing behavior

---

## Biggest insight

AI should integrate through spatial relationships, not layout changes

Do not:
- move content
- resize content
- reflow layout

Instead:
adjust proximity between content and AI

---

## Tradeoffs

- Edit mode not templated yet
- Record pattern still case-specific
- AI usefulness not solved yet (layout only)
- Avoided over-abstraction

---

## Not finished

- Section prioritization in record
- AI interaction quality
- Generalizing record pattern beyond cases
- Edit mode template

---

## Efficiency

- ~ $17.58 token usage
- High output: architecture, templates, layout system
- Low iteration waste due to structured prompting

---

## Outcome

- Defined reusable collection and record templates
- Integrated AI as a stable secondary surface
- Established clear system vs product separation
- Improved scalability and reasoning of the system

---

## One-line summary

Defined a reusable page template system and integrated AI as a stable secondary surface using state-driven spacing instead of layout changes.