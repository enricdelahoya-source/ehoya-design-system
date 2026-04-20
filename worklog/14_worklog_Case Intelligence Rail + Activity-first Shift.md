# Worklog — Case Intelligence Rail + Activity-first Shift

## Context

Continued evolution of the case record toward a decision-support system.

Focus areas:
- Formalizing the right rail into a scalable pattern
- Introducing multiple AI-driven modules (Decision panel, Similar cases)
- Improving interaction clarity and system consistency
- Shifting the record toward action and timeline-driven usage

---

## 1. Right rail → Case Intelligence Rail

### Before
- Single-purpose "AI assistance" panel
- One entry point (square AI button)
- No scalability for additional modules

### After
- Introduced **Case Intelligence Rail** as a system pattern
- Supports multiple modules:
  - Decision panel (primary)
  - Similar cases (secondary)
- Rail becomes a **decision-support surface**, not just an AI output container

### Key decision
Treat the rail as:
> a modular decision-support system, not a feature panel

---

## 2. Module model

Defined two distinct roles:

### Decision panel
- Primary surface
- Answers:
  - What is happening?
  - Why does it matter?
  - What should I do next?
- Contains:
  - Case summary
  - Situation
  - Next step
  - Actions

### Similar cases
- Secondary surface
- Answers:
  - Have we seen this before?
  - What happened in similar situations?
- No major workflow actions (reference only)

### Insight
Avoid treating modules as equal “AI features”.  
They serve different cognitive roles: **decision vs reference**.

---

## 3. Module switcher (major iteration)

### Initial attempt
- Implemented as small buttons
- Looked like pills / segmented control
- Active state unclear (looked dimmed)

### Problems
- Read as generic UI components
- Not aligned with system principles (structure over decoration)
- Did not feel attached to the rail

---

## 4. Final switcher pattern

Evolved into:

> **Vertical tab indicator mounted on the rail edge**

### Characteristics
- Not buttons
- Not tabs component
- Not segmented control

### Structure
- Single vertical stack
- Thin separators between items
- Shared container

### States

**Selected**
- Bold text
- Orange vertical bar (left edge)
- Bar touches rail edge
- No pill / no box styling

**Default**
- Quiet, readable
- No background

**Hover**
- Slightly stronger than default
- Subtle

---

## 5. Key refinements

### A. Rail anchoring
- Switcher moved to top
- Aligned with:
  - Close button
  - "Refresh insights"
- Feels part of rail chrome, not content

### B. Edge alignment
- Orange bar is flush with rail edge
- Connects visually with panel structure

### C. Inset content
- Introduced 2–4px horizontal padding
- Content and separators inset
- Bar ignores inset (absolute positioning)

### D. Separator fix
- Moved separators inside padded content
- Prevents them from touching rail edge
- Maintains stacked rhythm

---

## 6. Bug fix — collapsed rail

### Issue
- DP appeared selected even when rail was closed

### Fix
- Suppress selected state when collapsed
- Preserve internal state
- Restore selection on reopen

### Insight
Selected state must reflect **visible content**, not internal state.

---

## 7. Activity-first shift

### Change
- Default tab: Activity
- Tab order: Activity | Details

### Reasoning

#### Before
- Details-first = record-centric

#### After
- Activity-first = action-centric

### Benefits
- Matches user intent (what happened, what changed)
- Aligns with Decision panel:
  - Left = evidence (Activity)
  - Right = interpretation (Decision panel)
- Creates:
  > evidence → decision flow

---

## 8. System-level outcome

The record is no longer:

> a static object with fields

It is now:

> a live operational surface for decision-making

### Structure
- Shell: identity + status
- Left: Activity (signals)
- Right: Decision panel (interpretation)
- Secondary: Similar cases (reference)

---

## 9. Mobile direction (not implemented)

Explored approach:

### Closed
- Keep a minimal rail affordance visible

### Open
- Overlay panel over content (not push)

### Principle
- Desktop: ambient support
- Mobile: summoned support

### Decision
Deferred — requires separate iteration

---

## 10. Key learnings

### 1. Avoid generic components
Buttons, tabs, segmented controls were all wrong abstractions.

The correct pattern emerged only after:
- focusing on structure
- aligning with product meaning

---

### 2. Visual alignment = meaning
Small details mattered a lot:
- bar touching rail edge
- separator inset
- top alignment

These created:
> system coherence, not just visual polish

---

### 3. State must reflect reality
Showing "selected" while collapsed broke the mental model.

---

### 4. Product > UI
Biggest shift:
- from “AI panel”
- to “decision-support system”

---

## 11. Next steps

- Define Similar cases content more deeply
- Explore adding a 3rd module (test scalability)
- Mobile adaptation (separate workstream)
- Evaluate if Decision panel becomes the conceptual center of the record

---

## Status

✔ Rail pattern established  
✔ Module system working  
✔ Switcher readable and consistent  
✔ Activity-first flow implemented  

→ Ready to move from structure to product depth