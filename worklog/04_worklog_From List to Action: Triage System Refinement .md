# From List to Action: Triage System Refinement  
**Date:** 2026-04-11

## Context

This session focused on refining the case list and record experience into a credible operational surface for an ERP-style case management system. The goal was not feature expansion, but improving clarity, stability, and system consistency, aligned with core principles like structure over decoration and interaction driven by structure rather than color :contentReference[oaicite:0]{index=0}.

---

## 1. Status Summary Cards → Filters

### Problem
Top cards behaved like passive metrics instead of interactive controls.

### Decision
Convert them into **single-select status filters**.

### Changes
- Click → filters list
- Single-select behavior (no multi-select)
- Visual state aligned with input focus:
  - single orange border
  - neutral surface
- Removed font-weight changes (avoids layout jump)

### Insight
Filters should feel like **controls**, not dashboards.

---

## 2. Component Strategy

### Question
Extract a generic “card” component?

### Decision
- ❌ No generic card abstraction  
- ✅ Extract only `SummaryCard` as a **visual primitive**

### Reasoning
Avoid premature abstraction. Keep behavior local, pattern specific.

---

## 3. Sorting System

### Issues
- Only one column looked sortable
- Inconsistent icons
- Visual glitch (black divider)
- Priority not supported

### Changes
- Sorting enabled for:
  - Updated (default)
  - Priority
- Introduced:
  - inactive → subtle double chevron
  - active → single strong chevron
- Fixed divider flicker (render bug)

### Insight
Sorting is a **credibility feature**, not a feature set.

---

## 4. Priority Handling

### Decision
- Default sort → Updated
- Allow → Priority sort (with Updated as secondary)

### Reasoning
Reflects real workflows:
- recency first
- severity as optional lens

---

## 5. Avoiding Overbuilding

### Explicitly avoided
- batch actions
- delete flows
- complex empty states

### Reasoning
The list is a **triage surface**, not the product.

Focus stays on:
- case record
- AI layer

---

## 6. Case Creation

### Problem
Empty form = dead prototype

### Decision
Prefill with realistic data

### Result
- Immediate usability
- Faster evaluation of flow
- More believable system

---

## 7. Record Layout + AI Drawer

### Goals
- Content always left-aligned
- AI always right-aligned
- No layout instability

### Final behavior
- Closed → gap = space-8
- Open → gap = space-4
- Drawer anchored right
- Content never shifts

### Key insight
Perceived spacing ≠ actual spacing  
Fix required layout adjustments, not token changes.

---

## 8. Spacing System Discipline

### Consideration
Introduce `space-16`

### Decision
❌ Do not extend spacing scale

### Reasoning
- Problem was layout, not tokens
- Protect system consistency

---

## 9. Drawer Default State

### Decision
Drawer opens by default

### Reasoning
- Makes AI visible immediately
- Strengthens case study narrative

### Note
This is a **prototype choice**, not necessarily production behavior

---

## 10. Debug Workflow

Used structured debug mode to fix issues instead of iterating blindly:
- isolate behavior
- identify exact file
- apply smallest fix

This followed the project’s Codex workflow principles for minimal, controlled changes :contentReference[oaicite:1]{index=1}.

---

## 11. System Outcome

The system now demonstrates:

- Clear hierarchy
- Stable interactions (no jumps)
- Consistent focus language
- Legible sorting
- Controlled use of color (meaning over decoration)
- Clean separation:
  - list → triage
  - record → decision-making
  - AI → assistance

---

## Meta Takeaway

Progress came from:
- removing ambiguity
- aligning patterns
- fixing perception issues

Not from:
- adding features
- increasing complexity
- expanding the surface

---

## Core Principle Reinforced

**Structure over surface**

This iteration reflects how real enterprise systems evolve:
tightening behavior and consistency rather than adding more UI.