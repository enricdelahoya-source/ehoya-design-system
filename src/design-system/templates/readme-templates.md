# Page Templates

This folder defines the main page templates used in the system.

Templates are **layout contracts**.  
They define structure, alignment, and behavior, but they do not contain product-specific logic.

---

## Overview

There are two main templates:

- **CollectionPageTemplate** → for list views
- **RecordPageTemplate** → for detail views

These templates are reused by the product (e.g. cases).

---

## CollectionPageTemplate

Used for pages that display multiple records (lists, tables).

### Structure

- Full-width shellbar (top header)
- Inner content aligned to a consistent grid
- Optional summary section (KPIs)
- Filter / control area
- Main data surface (table or list)

### Behavior

- Layout is fluid but controlled
- Summary is informational (not interactive)
- Filters are lightweight and do not disrupt layout
- Focus is on scanning and efficiency

### Example usage

- Cases list page

---

## RecordPageTemplate

Used for pages that display a single record.

### Structure

- Full-width shellbar
- Breadcrumb + record identity
- Left-aligned content area (details, activity)
- Right-aligned AI panel

### Layout model

- Content stays **left aligned**
- AI panel stays **right aligned**
- The space between them changes depending on state

### AI behavior

#### When AI is closed
- Large space between content and AI
- AI is present but not active
- Content remains the main focus

#### When AI is open
- Smaller space between content and AI
- AI becomes part of the working area
- Content and AI feel connected

### Important rules

- Content width does not change between states
- Layout does not reflow or shift
- Only the space between content and AI changes
- Left and right edges remain stable

---

## Design principles

- Structure over decoration
- Stable layout over dynamic movement
- Clear separation between system and product
- Templates define behavior, not content

---

## How templates are used

Templates are used by product-specific implementations.

Example:

- `CollectionPageTemplate` → `CasesListTemplate` → `CasesListPage`
- `RecordPageTemplate` → `CaseRecordTemplate` → `CaseRecordPage`

---

## System structure

- `design-system/templates/` → page structure
- `design-system/components/` → reusable UI elements
- `cases/` → product implementation

---

## Goal

The goal of these templates is to:

- keep layout consistent across the product
- reduce design and implementation decisions
- support scalable and predictable UI behavior
- enable advanced patterns like AI-assisted workflows