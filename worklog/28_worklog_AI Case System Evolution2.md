# Worklog — AI Case System Evolution  
**Date:** 2026-04-20

## Context
Continued development of a case management system built from scratch to explore how AI can be integrated into structured enterprise workflows. The project follows a system-first approach, where layout, state, and interaction models are defined before introducing AI. :contentReference[oaicite:0]{index=0}

---

## Focus of the session
- Finalize layout architecture and scroll behavior
- Turn activity into a real workspace
- Implement traceability (AI → timeline)
- Introduce deterministic evidence and action logic
- Start aligning AI outputs with system state

---

## 1. Layout & Scroll Architecture

### Problem
Initial layout behaved like a static page:
- whole page scrolling
- weak separation between regions
- drawer felt detached

### Solution
Redefined the page as a structured application layout:
- shellbar fixed at top
- two independent scroll lanes:
  - left: case content
  - right: AI drawer
- introduced container system for consistent alignment

### Refinement
- tabs fixed inside left column
- activity list becomes the only scrollable region
- drawer aligned with shellbar and container

### Outcome
- stable layout
- predictable navigation
- foundation for interaction (traceability)

---

## 2. Activity → Workspace Transformation

### Problem
Timeline behaved like a passive log

### Solution
Reframed activity as an operational surface:
- tabs define context (Details / Activity)
- “Add action” kept visible
- only activity list scrolls

### Insight
Shift from:
- “history view”
→ to
- “work surface”

---

## 3. AI Panel Structure

Moved away from chat-like AI.

### Final structure
- Signals → system facts
- Summary → interpretation
- Actions → next steps
- Related activity → evidence

### Outcome
- predictable
- readable
- aligned with system state

---

## 4. Traceability (Core Feature)

### Implemented
- “Related activity” is clickable
- click → scroll → highlight
- highlight confirms target

### Challenges
- scroll model had to be fixed first
- highlight caused layout shift → fixed using non-intrusive styling

### Outcome
AI is now:
- verifiable
- grounded in system data
- not “magic”

---

## 5. Evidence Selection Logic

### Problem
Naive selection (latest event) produced irrelevant references

### Solution
Introduced deterministic logic:

1. derive intent from state:
   - blocked
   - progress
   - resolved

2. select evidence accordingly:
   - blocked → event explaining blocker
   - progress → recent work
   - resolved → resolution step

### Outcome
- references feel intentional
- AI output aligns with system state

---

## 6. Action Logic (First Iteration)

### Problem
Actions were generic and sometimes incorrect:
- “Respond to customer” when already responded
- incorrect navigation targets

### Fixes

#### A. Conversation awareness
- compare last customer vs last agent message
- only suggest response if customer spoke last

#### B. Action vs Evidence separation
- evidence = explanatory
- action target = operational

Example:
- evidence → internal note
- action → latest agent update

### Outcome
- actions reflect real workflow
- reduced “AI feels wrong” moments

---

## 7. Navigation Actions

### Implemented
- actions trigger scroll + highlight
- reuse timeline system
- no state mutation yet (navigation only)

### Insight
AI becomes useful by:
- taking user to the right place
not
- doing everything automatically

---

## 8. Key Decisions

- Structure before intelligence
- Timeline as source of truth
- AI must be traceable
- Actions depend on temporal context (not just state)
- Interaction > output quality

---

## 9. Challenges & Learnings

- Scroll architecture is critical for complex tools
- Fixed elements introduce layering problems (visual + interaction)
- AI logic becomes complex when time and workflow are involved
- Evidence and actions should not share the same selection logic
- Deterministic rules > “smart” but unpredictable behavior

---

## 10. Next Steps

- refine evidence selection (better ranking)
- align summary tightly with selected evidence
- extend actions to prefill workflows (not just navigation)
- improve visual layering (activity header + highlight)
- introduce lightweight AI evaluation (example-based)

---

## Reflection

This session marked a shift from:
- building UI components

to:
- designing a system that behaves over time

The project evolved into:
- a structured case system
- with an AI layer grounded in real interactions

It now demonstrates:
- system thinking
- workflow design
- AI integration under constraints