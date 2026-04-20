# Case System — Work Log  
## Date: 2026-04-12

## Context

This project is a design system exploration for ERP-style products, focused on building structured, scalable UI and layering AI into real workflows :contentReference[oaicite:0]{index=0}.

Stack:
- React + Vite
- Tailwind v4 (semantic tokens via @theme)

Goal:
Move from UI exploration to a system that behaves like a real operator tool.

---

## Starting point

The system initially had:
- Case record layout (details + timeline)
- AI drawer with:
  - summary
  - suggested actions
- Suggested actions behaving like “related activity”

Main issue:
The system showed information, but did not behave like a coherent workflow.

---

## Phase 1 — Suggested actions → real actions

Initial behavior:
- Click → highlight related timeline item

Problem:
- No execution layer
- AI explained, but did not help act

Decision:
Move from:
AI explains → AI helps act

Implementation:
- Introduced "Reply to customer"
- Inline composer (in timeline context)
- Prefilled draft
- Send action

Insight:
Timeline becomes the source of truth  
Evidence → Action

---

## Phase 2 — Action execution model

Changes:
- Inline composer instead of modal/drawer
- Action stays in context of the timeline
- User retains control (edit / send / discard)

Insight:
Highlight = justification  
Action = value

---

## Phase 3 — Follow-up action (correction)

Initial mistake:
- Follow-up modeled as delayed reply
- Created duplication

Correction:
Follow-up redefined as:
“We already contacted the customer, now we need to nudge them”

Logic:
- Last message from company
- No customer reply

Insight:
Reply = we owe them  
Follow-up = they owe us  

---

## Phase 4 — Action lifecycle

Problem:
- Actions remained after execution

Fix:
- Actions become ephemeral
- Appear when needed
- Disappear after completion

Insight:
Suggested actions are derived from system state

---

## Phase 5 — Case State (major shift)

Problem:
Same idea repeated across:
- Status
- Blocker
- Summary
- Actions

Solution:
Introduce **Case State**

Model:
Timeline → State → Actions

State examples:
- Waiting for first response
- Waiting for customer response
- Waiting for internal review
- In investigation

Insight:
State becomes the single source of truth

---

## Phase 6 — Status vs State separation

Problem:
- Status duplicated State

Example:
- Status: Waiting on customer
- State: Waiting for customer response

Decision:
Status = lifecycle  
State = current condition

Implementation:
- Status normalized to:
  - In progress
  - Resolved
  - Closed
- State remains derived

Result:
- Clear separation
- Reduced duplication

---

## Phase 7 — UI cleanup (removing redundancy)

Problems:
State repeated across:
- Header
- Signals
- Summary
- Actions

Fixes:
- Removed summary banner
- Removed blocker/status reason duplication
- Reduced signals to:
  - State
  - Priority
  - Assignee

Insight:
Each layer expresses one concept

---

## Phase 8 — Header refinement

Goal:
Improve scanability

Changes:
- Added metadata row:
  - Account
  - Assignee
  - Priority
- Kept status in badge
- Avoided duplication of state

Result:
Header quickly communicates:
- What case
- What state
- Who owns it
- How urgent it is

---

## Phase 9 — Truth alignment

Problem:
Inconsistencies between:
- Timeline
- State
- Summary
- Actions

Fixes:
- Removed duplicate timeline entries
- Fixed action naming (user-facing)
- Aligned summary with actual events
- Ensured state matches timeline

Insight:
System must tell one coherent story

---

## Current system model

Timeline = evidence  
State = interpretation  
Actions = next step  
Status = lifecycle context  

---

## Key learnings

1. Code prototype drives clarity  
- Forces real behavior  
- Exposes inconsistencies immediately  

2. AI is not the feature  
- Must be grounded in structure  
- Must enable action  
- Must be explainable  

3. Redundancy is the biggest risk  
- Same idea expressed multiple times  
- Fix: express each concept once  

4. State is the backbone  
- Aligns actions  
- Simplifies UI  
- Makes system believable  

---

## Next steps

- Introduce escalation (multi-actor workflow)
- Map State → Actions strictly
- Add ownership and reassignment flows

---

## Notes

This work evolved from UI exploration into system design.

The main outcome is not the interface itself,  
but the interaction model and decision framework behind it.