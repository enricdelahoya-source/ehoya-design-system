# Case System — Work Log (AI + Actions + State)

## Context

This work builds a case management system prototype using:
- React + Tailwind v4
- Semantic tokens
- Structured design system
- AI layer for summaries and suggested actions

Goal:
Design a system where AI is not decorative, but integrated into real workflows.

---

## Starting point

The system initially had:
- Case record layout (details + timeline)
- AI drawer with:
  - summary
  - suggested actions
- Basic suggested actions behaving like “related activity”

Main issue:
The system showed information, but didn’t behave like a coherent operator tool.

---

## Phase 1 — Suggested actions

Initial behavior:
- Click → highlight related timeline item

Outcome:
- Good traceability
- No real action

Decision:
Move from “AI explains things” to “AI helps you act”

Implementation:
- Introduced “Reply to customer”
- Click → highlight message
- Inline composer with prefilled draft
- Send action

Insight:
Evidence → Action

---

## Phase 2 — Action execution

Improvements:
- Inline composer (not modal, not drawer)
- Action happens in context of timeline
- User control preserved (edit, send, discard)

Insight:
Highlight = justification  
Action = value

---

## Phase 3 — Follow-up action

Initial mistake:
- Follow-up modeled as delayed reply
- Result: duplication and confusion

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
Actions remained after execution

Fix:
Actions become ephemeral:
- Appear when needed
- Disappear after completion

Rule:
Suggested actions are derived from state

---

## Phase 5 — Case State (major shift)

Problem:
Multiple elements expressed the same idea:
- Status
- Blocker
- Summary
- Actions

Solution:
Introduce Case State

Model:
Timeline → State → Actions

Examples:
- Waiting for first response
- Waiting for customer response
- Waiting for internal review
- In investigation

Insight:
State = single source of truth for current condition

---

## Phase 6 — Status vs State

Problem:
Status and State overlapped

Example:
- Status: Waiting on customer
- State: Waiting for customer response

Decision:
Status = lifecycle  
State = condition

Implementation:
- Status normalized to:
  - In progress
  - Resolved
  - Closed
- State derived dynamically

Result:
- Removed duplication
- Improved clarity

---

## Phase 7 — UI cleanup

Problems:
- State repeated across:
  - Header
  - Signals
  - Summary
  - Actions

Fixes:
- Removed summary banner
- Removed blocker / status reason duplication
- Reduced signals to:
  - State
  - Priority
  - Assignee

Insight:
Each layer should express one thing

---

## Phase 8 — Header refinement

Goal:
Improve scanability

Changes:
- Added metadata row:
  - Account
  - Assignee
  - Priority
- Kept state in badge
- Avoided duplication

Result:
Header answers quickly:
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

1. Code prototype changes decisions  
- Forces real behavior  
- Exposes inconsistencies  
- Makes system thinking concrete  

2. AI is not the feature  
- Must be grounded in structure  
- Must drive real actions  
- Must be explainable  

3. Redundancy is the biggest risk  
- Same idea repeated in multiple ways  
- Fix: express each concept once  

4. State is the backbone  
- Aligns actions  
- Simplifies UI  
- Makes system believable  

---

## Next steps

- Escalate internally (multi-actor workflow)
- State → Actions strict mapping
- Ownership and reassignment flows

---

## Notes

This project evolved from UI exploration to system design under constraints.

The main outcome is not the UI,
but the interaction model and decision framework behind it.