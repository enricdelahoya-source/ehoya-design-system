# Worklog — From System Definition to Product Coherence (AI Case Prototype)

Date: 2026-04-20

## Context

Continued development of a case management prototype built on a custom design system (React + Tailwind v4, semantic tokens) with the goal of exploring AI-assisted workflows in ERP-style products .

Focus of this session:

* move from “working prototype” to **coherent product system**
* align data, UI, and AI layers
* improve trust, clarity, and operational usefulness

---

## 1. Shift from UI to system design

Key realization:

* problems were not visual, but **structural**

Work focused on:

* defining and refining **core model**
* ensuring UI, data, and AI all reflect the same system

Model clarified:

* Status → lifecycle
* State → operational condition
* Ownership → responsibility
* Signals → advisory (later refined)

---

## 2. Case list as primary operational surface

Improved list behavior:

* moved **state badge to primary scan line**
* reduced badge visual weight (less color dominance)
* removed weak/default states (“In investigation”)
* ensured only meaningful states appear

Outcome:

* list supports **fast triage**
* attention emerges from structure, not color

---

## 3. State vs Signals refinement

Key iteration:

* removed overlap between:

  * state
  * signals
  * priority

Redefined signals:

* optional
* advisory
* non-blocking

Renamed:

* **Signals → Key factors** (more natural, less AI-like)

Rule introduced:

* if signals are weak → remove section entirely

---

## 4. Full mock data refactor (major milestone)

Reworked entire dataset to ensure:

👉 each case tells one coherent story

Aligned for every case:

* title
* customer messages
* internal notes
* system events
* classification
* state
* ownership

Introduced “truth hierarchy”:

1. customer messages
2. internal notes
3. system events
4. title (fallback)

Impact:

* removed contradictions between list, record, and AI drawer
* enabled AI to produce believable output

---

## 5. AI drawer redesign (from summary → system view)

Replaced generic structure with:

* Case summary
* Key factors
* Situation
* Recommended actions
* Based on

### Case summary

* now derived from timeline (not title)
* focuses on:

  * user problem
  * impact
  * optional context

Shift:
👉 from classification → to **user reality**

---

## 6. Situation redesign (multiple iterations)

Initial problems:

* too narrative
* repeated metadata
* not actionable

Final structure:

1. **State (badge)**
2. **Ownership**
3. **Constraint (what is blocking)**

Example:

* Escalated
* Owned by Amelie Laurent · Platform Escalations
* Approval pending for tax-rule override before invoice release

Key rules:

* no prose
* no history (“after”, “because”)
* no repetition
* must express **current constraint**

Important refinement:

* constraint must include **object + purpose**
  (not just “approval pending”)

---

## 7. Language and clarity tuning

Shifted from:

* AI-style descriptions

To:

* **operator-readable system language**

Examples:

* “Amelie Laurent · Platform Escalations”
  → “Owned by Amelie Laurent · Platform Escalations”

* “Approval pending”
  → “Approval pending for tax-rule override before invoice release”

Goal:

* 1-second understanding
* explicit relationships
* no ambiguity

---

## 8. Recommended actions (in progress)

Improved:

* reduced generic actions
* tied actions to:

  * state
  * constraint

Still pending:

* make actions feel **inevitable**, not suggested
* connect them more directly to case context

---

## 9. Trust layer (Based on)

Reintroduced:

* “Based on” section referencing timeline

Identified next step:

* click → scroll to timeline
* highlight referenced entry

Purpose:

* traceability
* explainability
* increase trust in AI output

---

## 10. Iterative workflow (process insight)

Work was highly iterative:

* build small slice (MVP)
* test in context (list / record / drawer)
* identify structural issues
* refine model
* repeat

AI enabled:

* rapid iteration cycles
* fast validation of system decisions

Key insight:
👉 speed came from **clear system + strong judgment**, not just AI

---

## 11. Key product insight

Major shift:

From:

* AI describing the case

To:

* **system exposing state + AI guiding action**

This required:

* consistent data
* aligned model
* removal of redundant information
* grounding in timeline

---

## 12. Current state of the prototype

System now:

* supports fast triage in list
* has clear operational states
* maintains coherent case narratives
* presents AI assistance as structured, grounded output
* separates:

  * what the case is
  * what is happening
  * what to do next

Feels like:
👉 a usable operator tool, not a demo

---

## 13. Next steps

Planned for next session:

1. Refine **Recommended actions**

   * make them specific and state-driven

2. Implement **Based on → timeline highlight**

   * clickable references
   * subtle highlight

3. Improve **list triage**

   * filtering (e.g. Escalated, Needs attention)

4. (Optional) Add **Similar cases**

   * small curated set, not large dataset

---

## 14. Portfolio positioning

This project demonstrates:

* system-level thinking (not just UI)
* ability to work in constraints (previous NetSuite cases)
* ability to redesign underlying model
* AI integration with:

  * trust
  * grounding
  * actionability

Key narrative:

> Previous work improved case systems and introduced AI within constraints.
> This project shows how those problems can be solved when the system itself is redesigned.

---

## 15. Reflection

Main takeaway:

👉 Designing the system makes everything else easier.

Once:

* model is clear
* data is consistent
* responsibilities are defined

Then:

* UI becomes straightforward
* AI becomes reliable
* iteration becomes fast

This project validates:
👉 system design + AI = high-leverage product work

---
