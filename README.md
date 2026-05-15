# ERP Design System Lab

Exploration of an AI-assisted operational system for complex enterprise workflows.

Built with React, TypeScript, and Tailwind v4, the project explores how structured workflows, schema-driven UI, semantic tokens, and AI-assisted decision support can work together inside complex operational software.

The goal is not to build a component library.

The goal is to explore how enterprise software can become more structured, scalable, and AI-compatible.

---

## Problem

Enterprise systems often break down in predictable ways:

- ownership becomes unclear
- workflows drift over time
- timelines become hard to parse
- next steps stay implicit
- backend structure leaks into UX
- AI gets layered on top of inconsistent workflows

This project explores the opposite approach:

- structure first
- AI second

The idea is that AI becomes significantly more useful when workflows, states, ownership, and operational context are explicit.

The project is based on the idea that enterprise software quality is largely determined by how clearly systems expose state, ownership, and next actions.

---

## Principles

- **Structure over decoration**  
  Visual decisions should reinforce hierarchy, state, and usability.

- **Semantic tokens**  
  No raw values. Everything maps to meaning:
  surface, text, action, feedback, emphasis.

- **Explicit operational state**  
  Workflows should expose ownership, urgency, blockers, and next steps clearly.

- **Interaction clarity**  
  Hover, focus, transitions, and feedback are part of the system itself.

- **Scalable primitives**  
  Components encode structure and behavior, not only appearance.

- **AI grounded in context**  
  AI should operate on structured operational data, not detached prompts.

- **Consistency as governance**  
  The system should make inconsistent patterns harder to introduce over time.

---

## System Architecture

### Design system foundation

- semantic token architecture
- shared primitives
- schema-driven fields
- reusable layouts and templates
- standardized interaction states

### Workflow model

- explicit ownership and state
- operational signals and prioritization
- timeline-driven records
- collection → record triage flow
- structured next-step modeling

### AI-assisted decision support

- case summarization
- workflow-aware recommendations
- grounded references
- traceable next-step suggestions
- operational decision support

---

## Stack

- React
- TypeScript
- Vite
- Tailwind v4 (`@theme`)
- CSS variables
- Schema-driven rendering patterns

---

## Current Capabilities

### Design system

- semantic token system
- spacing and layout scales
- control sizing
- typography primitives
- interaction states

### Components

- Button
- Input
- Field wrapper
- StatusBadge
- Drawer
- Tabs
- Timeline patterns

### Workflow surfaces

- case list triage
- record templates
- operational state modeling
- activity timelines
- ownership and escalation flows

### AI-assisted interactions

- case summaries
- suggested next actions
- grounded reasoning references
- workflow-aware support patterns

---

## Repository Structure

~~~txt
src/
  cases/
    list/
    record/

  design-system/
    components/
    templates/
    tokens/

  prototype/

playbook/
tests/
worklog/
public/
~~~

### Structure overview

#### `cases/`

Contains the operational product layer.

This includes:
- collection/list workflows
- record views
- triage patterns
- operational state modeling
- timeline-driven interactions
- AI-assisted workflow exploration

#### `design-system/`

Core system foundation.

Includes:
- semantic tokens
- reusable primitives
- layout templates
- interaction patterns
- scalable UI structure

#### `prototype/`

Experimental surfaces used to validate workflows, interaction patterns, and AI-assisted operational behaviors under realistic scenarios.

It acts as both:
- a design system testing surface
- and a lightweight operational simulation environment

#### `playbook/`

Internal system guidance and implementation patterns.

Used to document:
- system principles
- prompting structure
- implementation constraints
- governance patterns
- execution/debugging workflows

#### `tests/`

Validation and testing surfaces for system behavior and workflow consistency.

#### `worklog/`

Iterative development notes, architectural decisions, and ongoing exploration tracking.

---

## Governance and prompting

The repository includes internal system contracts and prompting structures used to reduce implementation drift and maintain consistency.

Key concepts include:

- constrained execution modes
- scoped implementation patterns
- system contracts
- debugging workflows
- minimal-surface changes

The goal is to treat system behavior and AI behavior with the same level of structural rigor.

---

## AI Evaluation Direction

The AI-assisted layer is being developed with an evaluation-first approach.

Focus areas include:

- structured datasets
- prompt iteration
- grounded recommendations
- visible reasoning context
- workflow-aware evaluation
- operational reliability

The goal is to avoid generic AI interactions and instead build systems that support real operational decision-making.

---

## Next Steps

- richer workflow scenarios
- escalation and reassignment logic
- realistic multi-actor datasets
- AI evaluation pipeline
- workflow simulation
- improved grounding and traceability
- larger schema-driven surfaces
- operational analytics patterns

---

## Goal

The goal is to explore what enterprise software could look like if:

- workflows were structurally explicit
- UI systems encoded operational behavior
- AI operated on grounded context instead of loose prompts
- decision support became part of the interface itself
- consistency scaled through system constraints rather than manual enforcement

---

## Notes

This is an evolving system.

Decisions are intentionally iterative:

define → test → evaluate → adjust → scale

The focus is not visual novelty.

The focus is operational clarity, structural consistency, and AI-compatible workflows.