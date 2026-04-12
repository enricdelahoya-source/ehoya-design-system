# Worklog — Case Model, AI Drawer, and Data Alignment

## Context

Continued development of the case management prototype (React + Tailwind v4) with focus on aligning the data model, list behavior, and AI assistance layer.

The goal of today was not to add features, but to make the system **coherent, believable, and operationally useful**.

---

## 1. Core model decisions

### Separation of concepts

Defined and enforced a clean distinction between:

* **Status (lifecycle)**

  * New
  * In progress
  * Resolved

* **State (operational condition)**

  * Waiting on customer
  * Needs assignment
  * Escalated
  * Blocked

* **Signals (advisory context → later renamed)**

  * Non-blocking, attention-guiding information

Key decision:
State should only exist when it meaningfully affects workflow. No default or filler states.

---

## 2. Case list improvements

### State visibility

* Moved state badge to the **primary scan line (next to case ID)**
* Removed weak/default states (e.g. “In investigation”)
* Reduced visual weight of badges (subtle tones instead of strong fills)

Result:

* List now supports **fast triage**
* Cases with meaningful states stand out without visual noise

---

## 3. Status vs State vs Signals cleanup

* Removed duplication between state and signals

* Prevented signals from repeating:

  * status
  * state
  * priority

* Signals redefined as:
  → optional, advisory, non-blocking context

Later renamed:

* **“Signals” → “Key factors”** (more natural, less AI-sounding)

---

## 4. Mock data refactor (major step)

Reworked the entire dataset to ensure **story consistency per case**.

For each case aligned:

* Title
* Customer message
* Internal notes
* System events
* Classification / product area
* State and ownership

Key rule introduced:

> Each case must tell one coherent story.

Also defined a hierarchy:

* Title → user-facing problem
* Timeline → source of truth
* Classification → internal framing

This removed contradictions between:

* list
* record
* AI drawer

---

## 5. AI drawer restructuring

Replaced generic “Summary” with structured sections:

* Case summary
* Key factors
* Situation
* Recommended actions
* Based on

### Case summary

* Now derived from timeline (not title only)
* Focuses on:

  * user problem
  * impact
  * optional context

---

## 6. Situation redesign (key iteration)

Initial issue:

* Too narrative
* Repeating metadata
* Not actionable

Final structure:

1. **State (badge)**
2. **Ownership**
3. **Operational constraint**

Example:

* Escalated
* Owned by Amelie Laurent · Platform Escalations
* Approval pending for tax-rule override before invoice release

Key rules:

* No prose
* No history (“after”, “because”)
* Must express **what is currently blocking the case**

---

## 7. Language and tone refinement

Shifted from:

* descriptive / AI-like text

To:

* **structured, system-like expressions**

Examples:

* “Amelie Laurent · Platform Escalations”
  → “Owned by Amelie Laurent · Platform Escalations”

* “Approval pending”
  → “Approval pending for tax-rule override before invoice release”

Focus:

* explicit
* compact
* operational

---

## 8. Recommended actions (initial refinement)

* Reduced generic actions
* Started tying actions to:

  * state
  * constraint

Improved pattern:

Instead of:

* “Review case”
* “Continue follow-up”

Now:

* “Confirm approval owner for tax-rule change”
* “Route case to approval workflow”

Still pending further tightening.

---

## 9. Trust layer (Based on)

Reintroduced grounding through:

* “Based on” section referencing timeline entries

Identified next step:
→ make entries clickable to highlight timeline items

This is key for:

* explainability
* trust in AI output

---

## 10. System-level insight

Main shift of the day:

From:

* AI describing the case

To:

* **system exposing state + AI guiding action**

This required:

* strong data consistency
* clear model boundaries
* removal of redundant or decorative information

---

## 11. Current state of the prototype

Now the system:

* scans well in the list
* has clear operational states
* tells a coherent story per case
* presents AI assistance that is grounded and structured
* separates:

  * what the case is
  * what is happening
  * what to do next

---

## 12. Next steps

Planned for next session:

1. Refine **Recommended actions**

   * make them feel inevitable and case-specific

2. Implement **Based on → timeline highlight**

   * clickable references
   * scroll + subtle highlight

3. Improve **list triage**

   * filtering by state (e.g. Escalated, Needs attention)

4. (Optional) Add **Similar cases**

   * small curated set, not large dataset

---

## Notes for portfolio

This iteration is important because it shows:

* ability to design **data models, not just UI**
* handling of **AI trust and explainability**
* integration of:

  * design system
  * interaction
  * data consistency
  * AI layer

This is closer to **product architecture** than interface design.

---


