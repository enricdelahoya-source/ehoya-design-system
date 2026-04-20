# Worklog — AI-Assisted Design System Development
Date: 2026-04-20

## Context

This session focused on evolving my workflow for building a design system using AI tools. The project itself is an ERP-style design system exploration with a long-term goal of layering AI capabilities on top. :contentReference[oaicite:0]{index=0}

Core stack:
- React + Vite
- Tailwind v4 (@theme semantic tokens)

Core principles:
- structure over decoration
- semantic tokens over hardcoded values
- consistency over visual novelty
- interaction driven by layout, not color

---

## Major Breakthroughs

### 1. Workflow Evolution (Biggest Shift)

Moved from a fragmented workflow:

- ChatGPT → Codex → Browser → repeat

To a much tighter loop:

- Decide → instruct Codex → validate in browser → inspect → adjust

Key changes:
- Reduced dependency on ChatGPT for execution
- Used ChatGPT mainly for thinking, critique, and system design
- Used Codex directly for implementation when intent was clear
- Used browser + inspect as the primary feedback loop

Result:
- significantly lower friction
- faster iteration cycles
- more confidence in changes

---

### 2. System Control via AGENTS.md and SYSTEM_CONTRACT.md

Introduced:
- SYSTEM_CONTRACT.md → defines philosophy and system rules
- AGENTS.md → defines strict execution constraints for Codex

Impact:
- Codex behavior became more predictable
- fewer unintended changes
- reduced need to restate rules in every prompt
- established a “portable system brain”

This effectively turned the workflow into:
- human defines system
- AI operates inside constraints

---

### 3. Understanding Components (Critical Unlock)

Key realization:

A React component is just:
1. Props (API)
2. Base styles
3. Variants (conditional logic)
4. Output (JSX)

This removed the need to “understand React” deeply.

Impact:
- components stopped feeling opaque
- easier to target changes precisely
- better prompts to Codex
- stronger system thinking (API design, not just visuals)

---

### 4. Understanding Tokens (Second Unlock)

Key shift:

Tokens are not abstract definitions.

They are:
→ decisions already made, captured in a reusable form

Impact:
- stopped guessing token structure upfront
- started extracting tokens from real UI decisions
- clearer distinction between:
  - token-level changes (global)
  - component-level changes (local reusable)
  - composition-level changes (screen-specific)

---

### 5. Building a Real Product Screen

Completed:
- full Case Record screen
  - view mode (read-only, dense information)
  - edit mode (form inputs, structured fields)

This validated:
- primitive completeness (Button, Input, Select, Textarea, Field, ReadOnlyValue)
- system behavior under real ERP complexity
- view/edit parity
- layout stability

This is a major milestone:
→ moved from component building to real product application

---

## System Evaluation

External review rated system at ~7.5–8/10 alignment.

Key insight:
- core system is strong and coherent
- remaining issues are localized

Main drift areas:
- playground.tsx (one-off styles, demo artifacts)
- legacy tokens.css file (duplicate system)
- small hardcoded values in components (optical fixes)

Important realization:
→ system maturity is higher than “compliance score” suggests

---

## Key Learnings

### 1. AI works best inside constraints
Without AGENTS.md / CONTRACT:
- drift
- duplication
- inconsistency

With them:
- predictable changes
- smaller diffs
- system alignment

---

### 2. Inspect > Reading code (at this stage)

Used browser inspect to:
- understand spacing
- debug layout
- map UI to structure

Code is now used selectively:
- API understanding
- variant logic
- token usage

---

### 3. Not all hardcoded values are bad

Important distinction:
- system gap → should be abstracted
- optical fix → can remain local

This avoids over-engineering.

---

### 4. Current phase shift

Moved from:
- building primitives

To:
- extracting patterns from real usage
- identifying system gaps
- evolving abstractions

---

## Next Steps

1. Remove or isolate legacy token system (tokens.css)
2. Use playground as diagnostic tool, not clean-up target
3. Extract missing tokens and patterns from real usage
4. Normalize components only where reuse is real
5. Expand product layer (case flows, timeline, AI interactions)

---

## Meta Insight

This session marked a shift from:

→ “using AI tools”

to:

→ “designing systems that AI operates within”

This aligns strongly with my goal of becoming an AI + systems-focused product designer.

---

## Reflection

Today’s biggest unlock was not technical.

It was understanding:

- where decisions live (tokens vs components vs composition)
- how to control AI through system constraints
- how to iterate at the right level of abstraction

This significantly increased both speed and confidence.