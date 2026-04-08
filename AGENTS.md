# AGENTS.md

## Read first
- Always read `CONTRACT.md` before making changes
- Follow its rules strictly

---

## Purpose

Structured enterprise design system and prototype.

Focus:
- clarity
- consistency
- scalability

Avoid unnecessary complexity.

---

## Modes

### EXECUTE (default)

Use when:
- task is clear
- implementation is expected

Behavior:
- minimize scope
- no assumptions
- no unrelated changes
- follow all rules strictly

---

### EXPLORE

Use when:
- problem is unclear
- layout/interaction is evolving

Behavior:
- allow ambiguity
- suggest small, safe directions
- keep changes local
- avoid large refactors

---

### Mode switching

- default → EXECUTE  
- vague or visual → EXPLORE  

---

## Mental model

You are working inside an existing system.

- Do NOT redesign  
- Do NOT invent  
- Do NOT optimize beyond the task (EXECUTE)  

Act like a careful engineer maintaining a production system.

---

## Core execution constraints

- Always minimize scope  
- Modify only required files  
- Do not refactor or improve unrelated code  
- Reuse existing patterns before introducing new ones  
- Prefer consistency over cleverness  

---

## System rules

### Tokens
- Use semantic tokens only  
- No hardcoded values  

### Components
- Preserve existing APIs  
- Do not create new variants unless asked  
- Do not duplicate components  
- Prefer extending existing components  

### Styling
- Use shared spacing and typography  
- Maintain visual balance  
- No decorative styling  
- Use color for meaning  

### Forms
- Keep label, field, helper aligned  
- Maintain consistent spacing  
- Ensure view/edit consistency  

---

## Execution rules

### Scope control

- Identify exact file(s) before changes  
- Modify only required files  

If more than 2 files are needed:
- EXECUTE → STOP and propose a plan  
- EXPLORE → suggest direction only  

---

### Task size

- Treat tasks as small by default  
- If task spans multiple components/patterns:
  - EXECUTE → STOP  
  - EXPLORE → keep changes partial  

---

### Change behavior

- Make the smallest possible change  
- Do not rewrite full files unless asked  
- Do not rename props/files unnecessarily  

---

### Large or unclear tasks

EXECUTE:
- DO NOT implement  
- propose short plan (3–5 bullets)  
- wait for confirmation  

EXPLORE:
- clarify intent or suggest 1–2 directions  

---

## Planning rule (structural work)

For templates, schema, layout systems:

- DO NOT implement  
- propose a short plan  
- wait for confirmation  

---

## Task control (EXECUTE)

### Lightweight checkpoint (only when needed)

Use this only if:
- task is ambiguous  
- affects more than 1 file  
- involves structure  

Then:
1. Restate task (1 sentence)  
2. Identify file(s)  
3. Confirm type (foundation / behavior / extraction / polish)  

Otherwise:
- proceed directly  

---

### Rules

- Do not mix concerns in one task  
- If task drifts:
  - EXECUTE → STOP  
  - EXPLORE → narrow gradually  

---

### Scope protection

Assume user wants control:

- Do not generalize unnecessarily  
- Do not introduce abstractions during polish  
- Do not expand scope  

If ambiguous:
- EXECUTE → choose smallest solution  
- EXPLORE → clarify  

---

### Stop condition

If the goal is achieved:

- STOP  
- do not continue refining  

---

## When unsure

- Follow existing patterns  
- Choose the most conservative solution  
- Prioritize consistency  

---

## Command

- run dev: npm run dev