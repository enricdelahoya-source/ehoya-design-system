# Worklog — 2026-04-13  
## State-driven AI Action System Exploration

## Context

Continued development of an ERP-style case management prototype as part of a design system exploration focused on structure, consistency, and AI-assisted workflows :contentReference[oaicite:0]{index=0}

The goal evolved from:
- building UI components and layouts

to:
- defining how **AI can support decision-making within structured systems**

---

## 1. Shift from “recommended actions” to “next step”

Reframed the AI panel from:
- a list of recommendations

to:
- a **state-driven decision surface**

New structure:
- “Next step” (single primary action)
- short explanation
- secondary actions

Outcome:
- reduced ambiguity
- clearer hierarchy
- more operational tone

---

## 2. Defined state-driven action model

Extracted logic into a system layer:

- state → defines available actions
- one primary action per state
- secondary actions as alternatives

Removed decision logic from UI components.

Key principle:
> system defines actions, AI explains them

---

## 3. Introduced action vocabulary

Created a finite, reusable set of actions:
- no AI-generated actions
- all actions map to real system operations

Outcome:
- consistency
- trust
- no hallucinated workflows

---

## 4. Added signal-based refinement

Introduced first signal:
- SLA risk

Behavior:
- escalated → route to specialist
- escalated + high SLA risk → notify stakeholder

Important constraint:
- signals **refine priority**
- they do **not introduce new actions**

---

## 5. Fixed hierarchy issues

Issue:
- primary action appeared again in secondary

Fix:
- filtered secondary actions to exclude primary

Outcome:
- cleaner hierarchy
- clearer decision model

---

## 6. Expanded realistic scenarios

Added multiple cases to stress-test the system:

- pending approval
- waiting on customer
- ready to resolve
- escalated
- escalated with SLA risk

Validated:
- same UI pattern holds across all states
- actions adapt correctly

---

## 7. Aligned state and action (CASE-10526)

Issue:
- visible state: “In investigation”
- primary action: “Resolve case”

Decision:
- updated state to “Ready to resolve”

Outcome:
- consistent mental model
- clearer system behavior

---

## 8. Introduced edge cases

### A. Conflicting signals
- pending approval + high SLA risk
- primary remains approval (constraint > urgency)
- explanation reflects urgency

### B. No-action state
- waiting on customer + noActionAvailable
- no primary action rendered
- explanation communicates intentional waiting

Outcome:
- system handles ambiguity and constraint
- avoids fake or redundant actions

---

## 9. Refined UI behavior

Handled “no primary action” case:
- removed button
- preserved layout structure
- ensured spacing feels intentional

Also clarified interaction layers:
- AI panel → decision
- timeline → history
- “more actions” → manual control

Avoided adding actions to timeline entries.

---

## 10. System architecture crystallized

Final structure:

- **List** → navigation and prioritization  
- **Case view** → details + timeline (context)  
- **AI panel** → decision layer  

Key insight:
> a case is just state + history + next step

---

## 11. Diagramming and documentation

Created:
- system flow diagram (state → signals → decision → UI)
- edge-case diagram (conflict + no-action)
- decision model documentation (state, actions, signals)

---

## 12. Data realism strategy

Decided against scraping real support data.

Instead:
- use structured mock data
- inspired by real ticket datasets
- maintain domain coherence

Focus:
- believable state distribution
- realistic timelines
- consistent decision outputs

---

## 13. Strategic insight

Shifted perspective from:

- “AI recommendations in UI”

to:

> **AI as a constrained decision layer inside structured systems**

Key principle:
> AI should not expand the decision space.  
> It should help users move within a constrained one.

---

## 14. Product insight

Reduced complex case management to:

- one list
- one record view
- one decision panel

Outcome:
- minimal UI
- high clarity
- strong operational model

---

## 15. Execution concerns

Identified risk of making actions executable too early.

Decision:
- do not fully implement workflows yet
- consider limited execution (2–3 actions max)
- focus on decision model first

---

## Key learnings

- one primary action dramatically improves clarity
- constraints must override urgency
- signals should refine, not replace, state logic
- showing no action is better than showing a bad action
- separating decision from UI is critical
- AI works best as explanation, not generator

---

## Outcome

The system evolved from:
- a UI experiment

to:
- a structured **decision system for case management**

With:
- state model
- action model
- signal overrides
- edge case handling
- clear architectural layers

---

## Reflection

Initially expected complex UI to handle complex systems.

Current understanding:
- complexity should live in the **model**, not the interface

The system works with:
- one list
- one case view
- one decision layer

Everything else is noise.

---

## Next steps

- optionally implement limited action execution (2–3 actions)
- add list filters (state, SLA risk, ownership)
- refine explanation structure
- start shaping portfolio narrative