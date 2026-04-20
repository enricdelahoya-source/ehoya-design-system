# Worklog — Case Management Edit Mode & View/Edit Integration  
**Date:** 2026-04-01

---

## Context

This work is part of an ongoing design system exploration focused on ERP-style products, with an emphasis on structure, semantics, and real product constraints rather than visual experimentation. :contentReference[oaicite:0]{index=0}

The goal of this session was to:
- Design a scalable edit experience
- Connect view mode and edit mode into a single workflow
- Stress-test the system with realistic field density
- Introduce validation and dependent logic
- Ensure coherence between data, layout, and behavior

---

## 1. Edit Mode — Structure & Layout Decisions

### Initial challenge
- Whether to use horizontal (label-left) vs vertical (label-top) fields
- Concern about scalability with many fields

### Decision
Moved to:
- **Vertical field layout as baseline**
- Introduced **2-column grid only for compact fields**

### Rationale
- Better label-to-input proximity
- Avoids optical misalignment issues
- Scales more predictably with real data

### Pattern established
- Single column → identity + writing fields
- 2-column grid → compact operational fields
- Full-width → long or high-importance fields

---

## 2. Density & Spacing System

### Iteration
- Initial spacing too loose
- First tightening pass too aggressive (fields felt “pinched”)
- Final balance achieved

### Final approach
- Field height: ~32px (dense but still readable)
- Tight label → input spacing
- Reduced field → field spacing
- Preserved section → section spacing

### Key insight
Density should come from:
- **field sizing + rhythm**
not layout hacks

---

## 3. Section Hierarchy Refinement

### Problem
Section titles, descriptions, and field labels were competing visually

### Fix
Defined clear hierarchy:
- Page title → strongest
- Section title → structural
- Section description → secondary
- Field label → functional

### Adjustments
- Increased section title contrast
- Reduced description prominence
- Added spacing between description and first field

---

## 4. Field System Expansion (Realistic Data Model)

Introduced a more complete case schema:

### New structured sections

#### Status & Ownership
- Status, Priority
- Assignee, Queue
- Status reason (conditional)
- On hold until (conditional)

#### Classification
- Channel, Severity
- Product area, Category
- Region, Source

#### SLA & Timing
- Timeline policy
- Response / Resolution targets
- First response / Last update
- SLA status, Breach risk

#### Customer & Context
- Customer, Contact, Email
- Account tier, Contract type

#### Case Handling
- Routing group
- Approval required (+ conditional reason)

### Result
- Form feels like a real operational tool
- Not just a UI exercise

---

## 5. Validation Layer

### Implemented
- Field-level validation (default + error states)
- Required fields (Title, Priority)
- Errors shown on blur or Save

### Behavior
- Save blocked on invalid data
- Errors shown inline
- No heavy UI (no banners/modals)

### Key principle
Validation should:
- guide, not interrupt
- stay local to fields

---

## 6. Dependent Fields

### Introduced logic
- Severity → suggests SLA targets
- Approval required → reveals Approval reason
- Channel → reveals contextual reference field

### Behavior design
- Auto-fill defaults
- Preserve user overrides
- Keep interactions predictable

### Insight
Dependencies should feel:
- operational
- not “AI magic”

---

## 7. View ↔ Edit Mode Integration

### Initial issue
- View shell + edit form rendered together
- Form reused in read-only state → broke UX

### Fix
Implemented proper mode architecture:

- `mode = "view" | "edit"`
- Shared data model:
  - `savedRecord`
  - `draftRecord`

### Behavior
- Edit → creates draft
- Save → persists + returns to view
- Cancel → discards (with dirty check)

### Key insight
View and edit are:
- **two modes of the same page**
not two separate screens

---

## 8. View Mode Refinement

### Problem
View mode flattened structure and lost grouping

### Improvements
- Preserved logical grouping from edit mode
- Introduced light 2-column layout in dense sections
- Ensured all editable fields exist in view (even empty)

### Pattern
- Edit → control surface
- View → decision surface

---

## 9. System-Level Insights

### 1. Optical vs real alignment
Something can be mathematically aligned but visually wrong  
→ design must correct perception, not just grid

### 2. Layout vs density
Density should come from:
- spacing
- sizing
- grouping  
not structural hacks

### 3. Mode separation
Mixing view/edit leads to:
- broken mental model
- unclear actions

### 4. Scaling reveals truth
Simple layouts hide problems  
Dense, realistic data exposes them

---

## 10. Outcome

At the end of this session:

- Built a **coherent edit system**
- Connected it to a **real view workflow**
- Established **field density strategy**
- Introduced **validation + dependencies**
- Created a **scalable case model**

This is no longer a component exercise — it behaves like a real product surface.

---

## Next Steps

- Suggested actions (AI grounded in workflow)
- Timeline / activity feed
- State transitions (status-driven constraints)
- Navigation + dirty state protection

---

## Reflection

The most important shift in this session:

From:
> designing screens

To:
> designing a system with state, behavior, and structure

This is where the work starts to resemble real product design, especially in complex environments like ERP and case management.

---