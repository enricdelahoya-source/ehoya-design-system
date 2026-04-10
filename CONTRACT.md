# CONTRACT.md

## Purpose

Define the system constraints.

This project is a structured enterprise design system and prototype.

The goal is:
- clarity
- consistency
- scalability

---

## Core principles

- Structure over decoration  
- Semantics over hardcoded styling  
- Consistency over cleverness  
- Reuse over invention  

---

## System behavior

- UI should be predictable and stable  
- Patterns must be reusable across contexts  
- Visual decisions must scale across the system  
- Interaction should be driven by structure, not visual effects  

---

## Tokens

- All styling must use semantic tokens  
- Tokens represent roles, not specific values  
- Do not introduce tokens for one-off adjustments  
- Prefer existing tokens before creating new ones  

---

## Components

- Components are the primary building blocks  
- Do not duplicate components  
- Do not create variants without clear reuse  
- Extend existing components before adding new ones  

---
show
## Layout and hierarchy

- Maintain consistent spacing and rhythm  
- Use hierarchy to guide reading and action  
- Group related elements clearly  
- Avoid visual noise  

---

## Forms and data

- Maintain alignment between label, field, and helper  
- Ensure consistency between view and edit states  
- Preserve clarity in dense information layouts  

---

## Color and styling

- Use color for meaning, not decoration  
- Avoid gradients, shadows, or expressive styling  
- Keep surfaces calm and structured  

---

## AI layer

- AI is assistive, not authoritative  
- Original data is the source of truth  
- AI should not replace or obscure original content  
- AI must reduce cognitive load, not increase noise  
- AI should appear selectively, not by default  

---

## Constraints

- Do not introduce unnecessary complexity  
- Do not optimize beyond the current need  
- Do not redesign existing patterns without explicit reason  
- Favor local, incremental improvements  

---

## Quality bar

Every change should:

- improve clarity  
- preserve consistency  
- respect existing patterns  
- scale beyond the current screen  

If not, it should not be implemented.