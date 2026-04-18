# Worklog — Case List Evolution (Triage System)

## Context

Started from a traditional ERP-style case list:

* columns: status, priority, assignee, updated
* static information display
* weak support for decision-making

Goal evolved during the session:
→ turn the list into a **decision surface for case triage**

---

## 1. Core Model Redefined

### Separation of concerns

Reframed the system into three distinct concepts:

* **State** → who is expected to act next
* **Urgency** → what requires intervention now
* **Priority** → how important the case is overall

This replaced the previous mixed model where:

* time, ownership, and escalation were conflated

---

## 2. State System

### Problems identified

* “No activity” used as a state (invalid)
* “Escalated” used as a standalone state (ambiguous)
* inconsistent mental model

### Final model

Base states:

* Waiting on customer
* In progress
* Waiting on internal
* Needs assignment
* Resolved

Modifiers:

* Escalated (as prefix, not state)

Narrative format:

* `Waiting on customer · 21h`
* `Escalated · needs assignment · 23h`

### Key decision

→ State always answers: **who acts next**

---

## 3. Urgency System

### Problems identified

* too many cases marked as “Breached”
* urgency derived from inactivity only
* lack of comparability
* misleading precision for unassigned cases

### Key changes

#### A. Introduced intervention-based urgency

Two types of urgency:

* **Deadline urgency**

  * Today
  * 4h left
  * 2h left
  * Breached
* **Ownership urgency**

  * Needs owner

#### B. Dominance rule

If:

* `Needs assignment`

Then:

* urgency = `Needs owner`
* never show countdown (e.g. 4h left)

#### C. Reduced “Breached”

* no longer triggered by inactivity alone
* reserved for extreme / escalated conditions

#### D. Introduced explicit ranking

Urgency sort order:

1. Breached
2. Needs owner
3. 2h left
4. 4h left
5. Today
6. blank

---

## 4. Time Model

### Problems

* inconsistent time presence
* “no activity” wording unclear

### Fixes

* enforced time reference in all rows (`· Xh / Xd`)
* removed “no activity” / “no update”
* simplified to:

  * `In progress · 11d`
  * `Waiting on customer · 21h`

### Insight

→ time is a **signal**, not a state

---

## 5. Priority Reintroduced

### Decision

* Priority is **context**, not a driver of action

### Implementation

* inline with case ID:

  * `CASE-10504 · P2`

### Rationale

* avoids competing with urgency
* keeps triage logic clean
* maintains enterprise context

---

## 6. Layout Evolution

### Column model

Final structure:

* Case
* State
* Urgency
* Owner

### Key changes

* removed stacked “attention” column
* separated urgency and ownership clearly
* simplified scan path

---

## 7. Row Anatomy & Alignment

### Problems

* row felt like:

  * heavy left block (Case)
  * floating labels (State/Urgency)
* misalignment with title vs meta

### Key insights

* alignment should follow **semantic anchor (title)**, not case ID
* first column structure affects whole row perception
* small offsets are insufficient → needed structural thinking

### Fixes

* tightened Case vertical spacing
* aligned State/Urgency/Owner to title band
* removed reliance on arbitrary margin nudges

---

## 8. Final Visual Polish

### Adjustments

* **Urgency → left aligned**

  * reduces visual gap
  * improves scan continuity

* **Owner → right aligned**

  * preserves clean terminal edge

* **Chevron**

  * integrated into Owner cell
  * no longer floating

### Result

→ row reads cleanly left-to-right:

* what it is
* what’s happening
* what to do
* who owns it

---

## 9. Key Product Insights

### 1. Not all urgency is time-based

Ownership failure is a first-class urgency.

### 2. “Breached” must be rare

Otherwise it loses meaning.

### 3. Lists can be decision systems

Not just data tables.

### 4. Layout must reflect semantics

Alignment follows meaning, not structure.

---

## 10. Outcome

The case list evolved from:
→ static ERP table

to:
→ **triage-oriented decision surface**

Supports:

* prioritization
* ownership clarity
* intervention awareness
* operational scanning

---

## 11. Next Potential Steps (not executed)

* AI panel suggesting next actions per case
* advanced filters:

  * Assigned to me
  * Needs owner
  * Urgent
* bulk actions
* keyboard navigation

---

## Notes

* Iterative loop with Codex required multiple corrections:

  * model issues first
  * then layout
  * then perception

* Final improvements came from:

  * identifying structural vs visual problems
  * avoiding premature micro-polish
  * aligning UI with mental model

---

## Summary

Shifted from:

* describing cases

to:

* enabling decisions

---
