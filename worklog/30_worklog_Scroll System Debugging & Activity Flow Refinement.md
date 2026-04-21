# Worklog — Scroll System Debugging & Activity Flow Refinement

**Date:** 2026-04-22

## Context

Goal was to evaluate and stabilize the main case flows through a live deployed prototype (Vercel), focusing on real interaction rather than static design. The session shifted into debugging scroll behavior under a fixed-shell layout.

---

## What I worked on

### 1. Deployment & testing setup

* Deployed the app to Vercel for real flow testing
* Enabled shareable URL to review full case flows end-to-end
* Identified that ChatGPT cannot reliably navigate client-side rendered apps → switched to screenshot + manual walkthrough

---

### 2. Flow definition (from real data)

* Extracted main actionable case flows from list view
* Prioritized flows based on:

  * urgency
  * frequency
  * clarity of “next step”

Key flows identified:

* Reply to customer (ETA / status update)
* Assign case
* Escalate case
* Close case
* Record internal note
* Follow-up / nudge

---

### 3. Decision panel iteration

* Improved:

  * Case summary → now meaningful
  * Next step detection → ETA surfaced correctly for CASE-10543
* Issues found:

  * “Reply” action initially too generic
  * AI summary redundant (“Hi Irene…” problem)
* Direction:

  * Shift from generic reply → **goal-driven reply (ETA, unblock, confirm, etc.)**

---

### 4. Timeline / email UX refinement

* Problem:

  * Showing only “Hi Irene” after sending → useless
* Iteration:

  * Introduced **AI-generated summary for sent emails**
  * Added expand/collapse to reveal full email
* Insight:

  * Better to show:

    * summary (always visible)
    * full email (expandable)
  * Avoid replacing summary with full content (loss of scannability)

---

### 5. Interaction polish

* Fixed:

  * hover/selection feedback after sending
* Issue:

  * highlight removed → reintroduced with animation
* Tradeoff:

  * highlight duration slightly long, but acceptable

---

### 6. Shellbar + layout system

* Goal:

  * fixed shellbar + independent scroll areas
* Achieved:

  * shellbar now stays fixed correctly
* Remaining issue:

  * bottom content clipping in tabs

---

### 7. Scroll system debugging (major part of session)

#### Initial assumption (wrong)

* Problem was scroll ownership (which container scrolls)

#### Built debugging system

* Added:

  * visual outlines for layout containers
  * live debug overlay with:

    * clientHeight
    * scrollHeight
    * overflow
    * canScroll
    * scroll owner detection
* Huge step → enabled real diagnosis

#### Findings

**Details tab**

* `tab-panel-scroll` is correct scroll owner
* scroll works and reaches max
* issue is only visual (no spacing at bottom)

**Activity tab**

* no scroll owner initially
* after fix:

  * scroll container exists (`activity-wrapper`)
  * BUT no overflow

Key insight:

> The problem is NOT scroll ownership anymore
> The problem is that content is constrained and not growing

**Root cause**

* ActivityTimeline is height-constrained
* content does not exceed container → no scroll triggered

---

### 8. Similar cases panel

* Same class of issue:

  * content exists but lacks proper scroll container or growth
* Partial improvement but not fully solved

---

## Key insights

### 1. Scroll bugs are often not scroll bugs

* Started as:

  * “who should scroll?”
* Ended as:

  * “content is not allowed to grow”

---

### 2. Debug instrumentation was a breakthrough

* Moving from guessing → measuring
* Overlay + logs made invisible layout behavior explicit

---

### 3. System behavior is now understood

* Shellbar → fixed
* Details → correct scroll model
* Activity → height constraint issue
* Similar cases → same pattern

---

### 4. Product direction reinforced

* Case = timeline + decision panel + minimal actions
* AI should:

  * clarify next step
  * not generate generic content
* Summary-first UI works well for operational scanning

---

## Open issues

```text
- Activity tab: timeline constrained, does not overflow → no scroll
- Similar cases: body scroll still inconsistent
- Details: no bottom breathing space (minor)
- Debug overlay still present (to remove later)
```

---

## Next steps (clear)

1. Fix ActivityTimeline height:

   * remove constraints (h-full / flex compression)
   * allow natural content growth

2. Validate:

   * Activity scroll works (scrollHeight > clientHeight)

3. Apply same pattern to:

   * Similar cases panel

4. Remove debug overlay

5. Move to next flow:

   * Assign case (high value for portfolio)

---

## Meta

* This session risked becoming a rabbit hole
* Stopped before over-investing
* Reached correct diagnosis (not just partial fixes)

---

## Takeaway

Not a failed fix.

A correct decomposition of the problem:

> Scroll system → ownership → height → constraint

That’s the real value of today.
