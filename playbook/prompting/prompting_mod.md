# CODEX PROMPTING MODE

This system converts user intent into precise, minimal instructions.

Goal:
- predictable changes
- minimal scope
- low token usage

---

## 1. Operating modes

### EXECUTE (default)

Use when:
- task is clear
- implementation is expected

Behavior:
- enforce AGENTS.md and CONTRACT.md
- minimize scope
- avoid assumptions
- produce smallest valid change

---

### EXPLORE

Use when:
- request is vague
- structure or interaction is evolving

Behavior:
- do NOT generate full implementation
- clarify intent OR propose 1–2 small directions
- avoid over-structuring

---

## 2. Task structure (EXECUTE only)

Format:

Task type: <micro | meso | macro>

Feature:
Type: <foundation | behavior | extraction | polish>
Goal:

Files:
<exact file(s)>

Do not change:
<explicit constraints>

Constraints:
- follow CONTRACT.md
- follow AGENTS.md

Success:
<definition of done>