# Worklog — Token System Refactor + Button Primitive

## Context

This project is part of an ongoing exploration to build a design system for ERP-style products, with a focus on structure, semantics, and future AI integration. 

The goal is not just visual consistency, but creating a system that can scale to complex operational workflows (case management) and support non-deterministic layers like AI.

---

## What I worked on

### 1. Token system refactor

The original setup had all tokens in a single file. It worked, but it mixed different abstraction levels:

* typography and spacing scales
* semantic UI meaning (surface, text, border)
* component-specific decisions (actions, fields)
* layout primitives

This made the system harder to reason about.

### Decision

Split tokens by **responsibility**, not by visual category.

New structure:

* foundation → raw primitives (type, spacing, radius, shadow, sizing)
* semantic → UI meaning (surfaces, text, borders, feedback, focus)
* components → action, field, and table-specific tokens
* layout → semantic spacing and content widths

Instead of changing how the app consumes tokens, I introduced a **facade layer**:

* `tokens.css` remains the single entry point
* it now imports the new partial files

### Why this approach

* zero impact on components
* safe rollback
* avoids breaking Tailwind v4 `@theme` behavior
* keeps the system evolvable without rewriting usage

This was treated as a **migration**, not a refactor.

---

### 2. Button primitive

Built a first system-level Button component with:

* semantic variants: `primary`, `secondary`, `ghost`
* shared sizing aligned with control heights
* token-driven styling (no hardcoded values)
* clear separation of:

  * base (structure)
  * variant (meaning)
  * size (density)

### Key principles applied

* primary = filled
* secondary = bordered
* ghost = text-level action
* interaction driven by structure, not color 

### What worked

* hierarchy is clear without relying on color tricks
* spacing and sizing feel consistent with control tokens
* disabled states are visible but not noisy
* the system is readable directly from the code

---

## Issues / observations

### 1. Token abstraction mismatch

The component API is semantic (`primary`, `secondary`, `ghost`), but token names are still color-oriented (`--color-primary`, etc).

This creates a subtle gap:

* components express meaning
* tokens express color roles

This will become a problem when adding more complex states (AI actions, recommendations, inline decisions).

---

### 2. Secondary action ambiguity

The secondary button currently mixes:

* its own border tokens
* ghost-like hover/active backgrounds

Visually it works, but semantically it’s not fully consistent.

This is a good example of where **tokens should be questioned, not the component**.

---

### 3. Ghost affordance

Ghost buttons work well in isolation, but may lose clarity in dense layouts (tables, rows, timelines).

This will need validation in real product contexts.

---

## What I learned

* Splitting tokens is not about organization, it’s about **separating levels of responsibility**
* Keeping a stable entry point (`tokens.css`) makes structural changes safe
* It’s easier to evolve a system when components don’t know about internal token structure
* Design systems break more often at the **semantic layer** than at the visual layer
* ERP contexts require stronger affordances than typical SaaS UI

---

## Next steps

* Apply Button inside real contexts (case list, record view, timeline)
* Build Input using the same principles (shared control system)
* Validate ghost and secondary actions in dense operational layouts
* Start aligning token naming with component semantics (action-focused tokens)
* Continue toward case management screens and introduce AI-assisted actions later 

---

## Notes

The focus is intentionally on:

* structure over decoration
* system clarity over flexibility
* safe evolution over ideal architecture

This is less about building a perfect design system, and more about building one that can **survive real product constraints**.
