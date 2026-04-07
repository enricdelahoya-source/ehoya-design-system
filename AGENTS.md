# AGENTS.md

## Read first
- Always read `CONTRACT.md` before making changes
- Follow its rules strictly

---

## Purpose

This project is a structured enterprise design system and prototype.

Focus on:
- clarity
- consistency
- scalability

Do not introduce unnecessary complexity.

---

## Mental model

You are implementing within an existing system.

- Do NOT redesign
- Do NOT invent
- Do NOT optimize beyond the task

Act like a careful engineer maintaining a production system.

---

## Core principles

- Use semantic tokens (no hardcoded values)
- Preserve existing component APIs
- Edit the smallest possible surface
- Prefer consistency over cleverness
- Never introduce new patterns unless strictly necessary

---

## Components

- Button and Input define control sizing
- Keep alignment consistent across all controls
- Do not create new variants unless explicitly asked
- Do not duplicate components
- Prefer extending existing components over creating new ones

---

## Styling

- Use shared spacing and typography rules
- Maintain visual balance (padding, line-height, font-size)
- Avoid decorative styling (gradients, shadows, random colors)
- Use color for meaning, not decoration

---

## Forms

- Keep label, field, helper aligned
- Maintain consistent spacing rhythm
- Read-only fields should remain legible and structured
- Ensure consistency between view and edit modes

---

## Changes

- Do not modify unrelated files
- Do not rename props, variants, or files unnecessarily
- Prefer adjusting existing logic over adding new logic
- Do not refactor broadly unless explicitly asked

---

## Execution rules (CRITICAL)

### Scope control

- Identify exact file(s) before making changes
- Modify only the file(s) required for the task
- If more than 2 files are needed, STOP and propose a plan first
- Never expand scope beyond the requested task

---

### Task size

- Treat all tasks as small by default
- If the task affects multiple components or patterns, STOP and propose a plan
- Do not perform system-wide changes unless explicitly instructed

---

### Change behavior

- Make the minimum possible change to achieve the goal
- Do not rewrite entire files unless explicitly requested
- Do not refactor, reorganize, or improve unrelated parts
- Reuse existing patterns before introducing anything new

---

### Large or unclear tasks

If the task is:
- unclear
- cross-cutting
- structural

DO NOT implement directly.

Instead:
- propose a short plan (3–5 bullets)
- wait for confirmation before proceeding

---

## Macro planning mode (STRUCTURAL WORK)

Use this mode for:
- templates (e.g. CaseListTemplate, CaseRecordTemplate)
- schema changes
- layout systems
- cross-component structure
- extraction across multiple files

### Rules

- DO NOT generate implementation code
- DO NOT modify files yet
- ALWAYS start with a plan

### Output format

Provide:

1. Goal (1–2 sentences)
2. Proposed structure (components / files / responsibilities)
3. Boundaries (what is included vs not included)
4. Risks or open questions
5. Next step (smallest implementable task)

### Behavior

- Keep plans short (3–5 bullets per section)
- Avoid generic architecture or overengineering
- Stay specific to the current system
- Wait for user confirmation before implementation

---

## Task framing and token-cost control

### Task classification

Before making changes, classify the task as one of:

- foundation
- behavior
- extraction
- polish

Then estimate expected cost:

- low
- medium
- high

Use this format internally:

Feature:
Type: <foundation | behavior | extraction | polish>
Goal:
Expected cost: <low | medium | high>

---

### Pre-execution checkpoint (MANDATORY)

Before making any code changes:

1. Restate the task in one sentence
2. Confirm:
   - type (foundation / behavior / extraction / polish)
   - expected cost (low / medium / high)
3. Identify exact file(s) to modify

If any of these are unclear:
- STOP
- ask for clarification or propose a plan

Do not start implementation until the task is clearly bounded.

---

### Rules

- Do not mix extraction, behavior, and visual polish in the same task unless explicitly requested
- If a task starts drifting, STOP and restate a smaller task
- Prefer finishing one bounded task cleanly over partially advancing several tasks
- Treat polish as potentially expensive if structure is still changing
- For high-cost tasks, favor a short plan before editing

---

### Polish guardrail

- Treat visual polish as a separate task from structure or behavior
- If polish requires structural changes, STOP and split the task
- Avoid multi-pass visual tweaking unless explicitly requested

---

### Cost heuristics

- foundation → usually high
- behavior → usually medium
- extraction → medium if tightly scoped
- polish → low if isolated, high if mixed with structure

---

### Default execution behavior

- Start with the smallest meaningful task
- Keep structural work and visual tuning separate
- When a task crosses boundaries, split it into follow-up tasks

---

### Scope protection

Assume the user prefers control over autonomy.

- Do not generalize when a local solution is enough
- Do not introduce new abstractions while polishing
- Do not expand into broader system refactors unless explicitly requested
- If the task is ambiguous, choose the smallest meaningful interpretation

---

### Stop condition

If the goal is achieved with a minimal change:

- STOP
- do not continue refining unless explicitly requested

Avoid “one more improvement” behavior.

---

## When unsure

- Follow existing patterns
- Choose the most conservative solution
- Prioritize consistency over improvement

---

## Commands

- run dev: npm run dev