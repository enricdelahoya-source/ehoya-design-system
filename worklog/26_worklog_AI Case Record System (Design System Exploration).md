# Worklog — AI Case Record System (Design System Exploration)
Date: 2026-04-20

---

## Context

Today focused on evolving the case record from a collection of components into a coherent product surface, integrating:
- Activity timeline
- Tabs (Details / Activity)
- AI assistance surface via drawer

This work is part of an ERP-style design system exploration focused on:
- structure over decoration
- semantic tokens (Tailwind v4 @theme)
- system primitives → product composition → AI layer :contentReference[oaicite:0]{index=0}

---

## Objective

Move from:
- isolated components in playground

To:
- a realistic case record experience with:
  - primary navigation
  - structured history
  - assistive AI surface

---

## Key Steps

### 1. Activity Timeline (Component → Product-ready)

- Built a structured timeline with:
  - clear hierarchy (date → event → content)
  - semantic event types (email, internal note, system, status change)

- Iterated layout:
  - moved from multi-column → stacked rows
  - simplified grouping (flat, not threaded)
  - improved readability through hierarchy instead of decoration

- Introduced semantic meaning through color:
  - customer (external) → green
  - company (internal) → orange
  - system → blue

Insight:
Flat timelines are more robust than threaded ones for operational systems.

---

### 2. Tabs Integration (Structure over features)

- Introduced tabs as primary navigation:
  - Details
  - Activity

- Kept tabs restrained:
  - no pills
  - no heavy styling
  - structure-driven (underline + text hierarchy)

- Integrated timeline inside Activity tab

Decision:
AI should NOT be a tab. It is not a primary mode of understanding the record.

---

### 3. AI Surface (Inline → Drawer)

Initial state:
- AI lived as a right column inside layout

Problem:
- felt like just another content section
- competed with core record information

Refactor:
- moved AI into a right-side drawer
- drawer:
  - pushes content (not overlay)
  - aligns with shell bar
  - collapsible

Insight:
AI is assistive, not core content → should behave as a secondary surface.

---

### 4. Drawer System (New primitive)

Created a reusable Drawer component:
- right-aligned
- collapsible
- token-driven
- non-modal

Supports:
- title
- metadata
- content
- actions

Key behavior:
- pushes layout instead of covering it
- remains persistent when open

---

### 5. Rail Control (Discovery + Control)

Added a vertical rail:
- persists when drawer is closed
- acts as main toggle
- labeled “AI”

Refinements:
- rail becomes primary control
- header close button becomes secondary
- reduced redundancy with shell controls

Insight:
Persistent affordances improve discoverability in enterprise systems.

---

### 6. Layout Refinement

Improved boundaries and spacing:
- added breathing room between content and drawer
- introduced right-side containment border
- aligned drawer with shell bar
- refined vertical separators

Watchout:
Approaching too many competing lines:
- shell divider
- tabs underline
- section separators
- timeline separators
- drawer boundaries
- rail/stripe

Needs future consolidation into fewer semantic border tokens.

---

### 7. Token Evolution

Shift observed:

Before:
- tokens applied mostly at component level

Today:
- tokens applied at layout and system level

Areas improved:
- semantic color usage (event types)
- surface hierarchy (main vs drawer)
- spacing rhythm between regions
- structural vs decorative boundaries

Areas to audit:
- border token consolidation
- rail spacing + width tokenization
- surface layering consistency

---

## System Pattern Achieved

Final structure:

Record Shell  
  ├── Tabs (Details / Activity)  
  ├── Main Content  
  └── Right Drawer (AI)  
        └── Rail (persistent control)

Enables:
- stable primary workflow
- optional AI augmentation
- scalable side-surface pattern

---

## Key Design Decisions

- AI is not a tab → secondary, contextual
- Drawer pushes layout → preserves context
- Timeline remains flat → avoids complexity
- Rail persists → maintains discoverability
- Color encodes meaning, not decoration
- Structure drives interaction

---

## Learnings

1. AI integration is mostly layout and hierarchy, not UI widgets  
2. Secondary surfaces should feel structural, not floating  
3. Timeline clarity depends more on hierarchy than styling  
4. Tokens matter more at layout level than at component level  
5. Reuse pressure naturally improves system consistency  

---

## Next Steps

- Consolidate border tokens (reduce visual noise)
- Make AI context-aware (Details vs Activity)
- Define Drawer as a reusable system primitive
- Connect AI outputs with real interactions (edit / actions)

---

## Reflection

This moved the project from:
- component library

to:
- system-level product thinking

The result is a realistic ERP pattern:
- structured data
- operational timeline
- assistive AI surface

This is directly applicable to:
- case management
- support tools
- internal operations platforms