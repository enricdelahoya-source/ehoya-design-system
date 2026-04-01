# System Contract

## Purpose

This file explains the design-system rules for this project so code assistants can make changes without drifting.

Project goal:

* build ERP-style product primitives first
* keep the system calm, structured, and scalable
* apply the system to case management screens
* layer AI features later

Tech stack:

* React + Vite
* Tailwind v4
* semantic tokens via `@theme`

---

## Core principles

### 1. Structure over decoration

The UI should feel clear and organized, not expressive or ornamental.

Use:

* spacing
* alignment
* grouping
* hierarchy
* consistent component rhythm

Do not rely on:

* strong gradients
* unnecessary shadows
* decorative color usage
* visual novelty for its own sake

### 2. Semantics over hardcoded styling

Prefer semantic tokens and reusable patterns over one-off values.

Avoid:

* random hex colors
* ad hoc spacing values
* custom sizing per component without reason

Prefer:

* semantic color roles
* shared spacing scale
* shared type scale
* shared control sizing

### 3. Consistency beats cleverness

If a choice improves reuse and predictability, prefer it over something visually special.

### 4. Enterprise clarity

This system is for ERP-style workflows.

That means:

* dense information can exist, but should be well-structured
* actions should be easy to scan
* labels, helper text, and status should be explicit
* controls should feel stable and trustworthy

### 5. Interaction through layout first

Hierarchy should come mainly from:

* component weight
* placement
* spacing
* grouping

Not mainly from color.

---

## Visual character

The system should feel:

* calm
* modern
* slightly warm
* professional
* restrained

It should not feel:

* playful
* flashy
* overly consumer-like
* overly minimalist to the point of ambiguity

---

## Component philosophy

### Primitives come first

Build and stabilize primitives before expanding into patterns.

Current primitive direction:

* Button
* Input
* Textarea
* read-only field states
* labels and helper text

Later patterns:

* form sections
* case headers
* timelines
* status blocks
* recommendation cards

### Prefer extension over duplication

If a new need is close to an existing primitive, first consider:

* variant
* state
* slot
* prop

Create a separate component only when the behavior or meaning is materially different.

### Do not create duplicate variants casually

Before adding a new variant, ask:

* is this a true new semantic role?
* or is this just a styling tweak?

---

## Action hierarchy

### Button hierarchy

* `primary` = filled, main action
* `secondary` = bordered, visible but lower emphasis
* `ghost` = text-like, lightest action

Rules:

* one primary action per local area when possible
* secondary actions should not visually compete with the primary
* ghost is for lightweight or contextual actions

Do not:

* invent extra action styles unless necessary
* use color alone to communicate importance

---

## Control sizing

Controls should share a common sizing logic.

Goals:

* Button, Input, Textarea, and future controls should feel related
* labels, fields, and helper text should align cleanly
* size differences should be intentional, not accidental

Rules:

* use shared size tokens or shared control rules where possible
* avoid per-component height logic unless needed
* preserve visual balance between text size, line-height, and padding

When adjusting size:

* do not tune one control in isolation if it affects system rhythm
* check neighboring controls for consistency

---

## Form behavior

Forms should feel structured and calm.

Rules:

* labels stay close to their fields
* helper text aligns with the field content edge
* spacing between label, field, and helper should be consistent
* read-only states should still feel part of the same system

Read-only guidance:

* read-only should not look disabled unless it is truly unavailable
* preserve legibility and structure
* avoid making read-only fields feel broken or faded unnecessarily

---

## Color guidance

Color should support meaning, not carry the full interface.

Use color for:

* action priority support
* status meaning
* focus and accessibility
* subtle brand warmth

Do not use color for:

* decoration without meaning
* compensating for weak layout
* adding emphasis everywhere

Brand warmth guidance:

* warm accents are allowed
* keep them controlled and purposeful
* prefer subtle integration over loud surfaces

---

## Token rules

When editing styles:

* prefer existing semantic tokens first
* if a new token is needed, make it reusable and meaning-based
* do not add tokens that represent one-off screen tweaks

Good token logic:

* `--color-surface-muted`
* `--color-border-subtle`
* `--space-control-y-sm`

Weak token logic:

* `--orange-button-2`
* `--special-panel-padding`

---

## Change rules for code assistants

When making changes:

* preserve the existing public API unless explicitly asked to change it
* edit the smallest possible surface area
* do not rename files, props, or variants unnecessarily
* do not duplicate components to achieve a visual tweak
* do not hardcode values when tokens or shared rules should be used
* do not introduce new variants without a semantic reason
* do not change unrelated files

When unsure:

* prefer consistency with existing primitives
* prefer a smaller change over a larger rewrite

---

## What good changes look like

Good changes:

* improve alignment
* improve rhythm
* reduce drift between components
* make code more semantic
* preserve reuse
* clarify hierarchy

Bad changes:

* duplicate an existing variant
* introduce hardcoded fixes
* solve a local issue while weakening system consistency
* add styling that makes the product feel decorative

---

## ERP-specific direction

This system is meant to support complex workflows later.

That means components should eventually work well in:

* detail pages
* forms
* tables
* side panels
* timelines
* AI-assisted summaries and recommendations

So even early primitives should aim for:

* scalability
* composability
* readability under dense conditions

---

## AI layer direction

Later AI features should feel integrated into the product, not visually disconnected.

AI should be expressed through:

* useful summaries
* recommendations
* highlighted insights
* clear provenance or supporting signals when needed

Avoid making AI feel like:

* a gimmick
* a separate visual universe
* a decorative assistant panel with no workflow value

---

## Prompting notes for code assistants

Useful instruction style:

* say what to change
* define scope
* define constraints
* mention what must remain unchanged

Example:

"Adjust Input and Button so md size feels aligned. Keep current API. Reuse existing token logic where possible. Do not introduce new variants or duplicate components."

---

## Current priority order

1. stabilize primitives
2. align sizing and spacing
3. build small patterns
4. apply to case management screens
5. add AI-supported product behaviors

---

## Default bias

When there are multiple valid choices, prefer the one that is:

* simpler
* more reusable
* more semantic
* more structurally clear
* more likely to scale across ERP workflows
