# Worklog — Record Shell Bar, Status System, and Brand Integration

## Context

Continuing the design system exploration for an ERP-style product, focused on moving from primitives into real product surfaces.
The goal remains consistent: structure over decoration, semantic clarity, and composability across real workflows 

---

## 1. Status Badge — from UI element to system signal

Started by defining the **StatusBadge** as a core semantic primitive.

Key decisions:

* Two emphasis levels: `subtle` and `strong`
* Tone system: neutral, info, success, warning, danger
* Avoided “button-like” appearance
* Reduced roundness to remove CTA ambiguity
* Color used strictly for meaning, not decoration

Iteration highlights:

* Strong variant initially felt like buttons → reduced radius + adjusted contrast
* Introduced a blue-ish tone for “New”, then removed ambiguity with “In progress”
* Final balance: subtle is primary usage, strong is contextual

Outcome:

* Badge reads as **state**, not action
* Works inside dense enterprise contexts (headers, lists, timelines)

---

## 2. Moving into composition — RecordShellBar

Shifted from primitives to first real product surface:
👉 **RecordShellBar**

Purpose:

* unify identity, state, metadata, and actions
* act as the anchor for record pages (case management)

Structure evolved into:

* Breadcrumb: `Cases` (link)
* Title row:

  * Title
  * Status badge
  * Actions (right-aligned)
* Metadata row:

  * `CS-10842`
  * Priority
  * Owner (link)
  * Last updated

Key refinements:

* Actions reordered: ghost → secondary → primary (right-aligned anchor)
* Badge optically centered with title (not baseline-aligned)
* Removed redundant identity row (ID merged into metadata)
* Introduced link styling (previously missing primitive)

Outcome:

* Header feels **operational**, not decorative
* Identity hierarchy is clear: title > state > metadata

---

## 3. Layout realism — from component to page

Realized components cannot be evaluated in isolation.

Introduced:

* fake page container (max-width, padding)
* later replaced with **Tabs-based playground views**:

  * Components
  * Compositions

This solved:

* width constraints (desktop realism)
* scanning issues in playground
* separation between primitives and real UI

Outcome:

* ability to evaluate **true layout behavior**
* early emergence of page-level system thinking

---

## 4. Link primitive — missing system piece

Discovered lack of consistent link styling.

Defined:

* calm, integrated link style (not blue, not button-like)
* medium weight + subtle brand color
* underline only on hover

Applied to:

* breadcrumb (`Cases`)
* metadata (`Maria Chen`)

Outcome:

* links are now **discoverable at rest**
* interaction layer becomes part of system language

---

## 5. Brand layer — introducing the stripe

Explored how to introduce brand without breaking enterprise tone.

Initial approach:

* full-width top stripe → read as global app chrome ❌

Refined approach:

* attached to shell bar → still felt decorative ❌

Final solution:
👉 **bottom stripe as branded separator**

Characteristics:

* thin (2–3px)
* horizontal gradient
* warm orange → red
* replaces neutral divider

Key insight:

* stripe becomes **structural + brand**, not decoration

---

## 6. Color strategy — separating meaning from identity

Important distinction emerged:

* Red → functional (actions, danger, system states)
* Orange → emotional (brand warmth)

Applied to:

* stripe uses warmer orange tones
* warning badge slightly aligned but remains semantic

Result:

* brand and system colors coexist without conflict

---

## 7. Final refinement — shell compression

Once stripe became structural:

* reduced shell vertical padding
* tightened spacing between rows

Result:

* more compact header
* stronger “product surface” feeling
* less card-like, more architectural

---

## Key learnings

### 1. Composition reveals problems primitives don’t

Most issues (alignment, hierarchy, spacing) only appeared once components were combined.

### 2. Visual balance > strict rules

Badge alignment required optical correction, not pure typographic logic.

### 3. Brand should attach to structure

The stripe only worked once it became a **separator**, not decoration.

### 4. Interaction needs a visual language

Links were invisible until explicitly defined as a system primitive.

### 5. Density is a feature in enterprise UI

Reducing height improved clarity and confidence.

---

## Current state

* Stable StatusBadge system
* First version of RecordShellBar
* Link primitive introduced
* Brand stripe integrated as structural separator
* Playground supports both primitives and compositions

---

## Next steps

* Expand shell into full record page (tabs, activity, details)
* Introduce right rail (AI assistant)
* Define layout primitives (PageContainer, sections)
* Explore how brand tone extends into AI interactions

---

## Reflection

This iteration marks the transition from:

* **design system primitives**
  to:
* **real product structure**

The most important shift was not visual, but conceptual:

> from styling components → to shaping behavior and hierarchy

This is where the system starts to feel like a product.
