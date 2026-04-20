# Worklog — Field system, read-only patterns, and density

## Context

This project is a design system exploration for ERP-style products. The goal is to build primitives and apply them to a case management product, with AI layered later. 

Stack:

* React + Vite
* Tailwind v4 (@theme)
* Semantic tokens

Principles:

* structure over decoration
* interaction driven by structure, not color
* consistency over cleverness

---

## 1. Input → Field extraction

Started with Input doing everything:

* label
* hint
* error
* control

This doesn’t scale.

Refactored into:

* **Field**

  * owns label, hint, error
  * spacing + accessibility
* **Input**

  * control only

Key outcome:

* same structure reused across Input, Textarea, Select
* no duplication of label/error logic

This was the first moment where it felt like a system instead of components.

---

## 2. Focus vs error clarity

Initial issue:

* focus and error looked too similar
* both relied on color

Fix:

* border thickness = interaction (focus)
* border color = meaning (error)
* ring = secondary interaction cue

Result:

* default → thin neutral
* focus → thicker neutral + ring
* error → thin red
* focus + error → thicker red + ring

Important detail:
kept the **border jump on focus** instead of removing it. It gives a physical snap when navigating fields.

---

## 3. Spacing and hierarchy

Problem:

* label, input, helper had equal spacing
* everything felt like siblings

Fix:

* nested stacks inside Field
* label closer to input
* helper slightly separated

Rule defined:

* label → input = tight
* input → helper = tighter
* field → field = larger

This improved scanning more than any visual styling change.

---

## 4. Token drift and cleanup

Tokens started to scatter:

* mix of Tailwind typography + CSS variables
* inconsistent usage

Decision:

* keep tokens for:

  * color
  * spacing
  * radius
  * control sizes
* use Tailwind for typography (text-sm, text-xs, etc.)

Also hit a Tailwind issue:
`text-[var(--text-xs)]` didn’t work due to ambiguity (color vs font-size)

Solution:

* either use `text-[length:var(--...)]`
* or avoid and use Tailwind scale

Chose the simpler route for now.

---

## 5. Textarea

Built Textarea as a control-only primitive using Field.

Key points:

* same states as Input
* vertical resize only
* multiline support
* error + focus behavior reused

Validated that Field abstraction works across control types.

---

## 6. Read-only values (important shift)

Realized disabled inputs were wrong for ERP context.

Need:

* values that are visible, important, but not editable

Built:

* **ReadOnlyValue (boxed)**

Characteristics:

* same structure as inputs
* readable
* not “disabled”
* no interaction affordance

Use cases:

* ERP codes
* system values
* locked fields

---

## 7. Compact read-only variant

Wanted lighter version for metadata.

First attempt failed:

* Codex duplicated boxed version instead of changing pattern

Fixed by explicitly defining behavior:

Compact read-only:

* no border
* no box
* label on top
* value below, very tight spacing
* helper optional

Result:

* much better for summaries and metadata
* keeps alignment but reduces visual weight

Now system has:

1. **Editable fields (Input, Textarea, Select)**
2. **Boxed read-only (form-like)**
3. **Compact read-only (metadata-like)**

---

## 8. Field density variants

Introduced concept of **density via spacing**, not new components.

Field now supports:

* default (form)
* tight (compact stacked)

This avoids:

* duplicating components
* creating “special cases”

This was a key system insight:
→ density is controlled by spacing, not structure changes

---

## 9. Debugging Codex behavior

Ran into recurring issue:

* Codex replaces instead of extending

Fix:

* much stricter prompts:

  * “do not replace”
  * “restore exactly”
  * “add below”

Also using structured prompting mode to reduce drift. 

---

## 10. Current state

Working primitives:

* Button
* Input
* Textarea
* Select
* Field
* ReadOnlyValue (boxed)
* ReadOnlyValue (compact)

System supports:

* editable forms
* mixed edit/read views
* ERP-style record structures

---

## Key learnings

* Most problems were solved with **spacing**, not visuals
* “Read-only” is not the same as “disabled”
* Systems need multiple density modes
* Separating Field from controls unlocks everything
* Codex needs strict constraints to avoid destructive changes

---

## Next step

Move from primitives to composition:

→ build a **Case Detail page**

Mix:

* editable fields
* compact metadata
* boxed system values
* textareas
* AI layer later

That’s where the system will be truly tested.

---
