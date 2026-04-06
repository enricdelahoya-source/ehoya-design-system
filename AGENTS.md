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

## Core rules
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

## Execution Rules (CRITICAL)

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

### Output requirements
After making changes:
- list modified files
- briefly describe what changed
- highlight any risks or potential inconsistencies

---

## When unsure
- Follow existing patterns
- Choose the most conservative solution
- Prioritize consistency over improvement

---

## Mental model
You are implementing within an existing system.

Do NOT redesign.
Do NOT invent.
Do NOT optimize beyond the task.

Act like a careful engineer maintaining a production system.

---

## Commands
- run dev: npm run dev