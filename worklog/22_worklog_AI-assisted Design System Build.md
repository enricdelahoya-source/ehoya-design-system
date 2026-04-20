# Worklog — AI-assisted Design System Build
Date: 2026-04-20

## Context

Continued development of a token-driven design system and ERP-style case management prototype using React + Vite + Tailwind v4. :contentReference[oaicite:0]{index=0}

Focus areas:
- Layout refinement (drawer + record view)
- Codex workflow optimization
- Token efficiency and execution strategy
- AI-assisted development process maturity

---

## What I worked on

### 1. Drawer + Layout Refinement

Iterated on the right-side drawer (AI rail) integration with the case record layout.

Key improvements:
- Identified lack of separation between drawer and main content
- Explored multiple structural options:
  - spacing only
  - divider only
  - hybrid (spacing + divider)
- Selected hybrid approach for better balance between clarity and structure
- Broke down implementation into micro tasks:
  - spacing (padding)
  - divider (border)
  - optional visual alignment (AI stripe)

Key learning:
- Layout decisions are exploratory, not implementation tasks
- Mixing both leads to friction and poor outcomes

---

### 2. Shift from Implicit to Explicit Design Decisions

Noticed a drop in “AI reading my mind” behavior compared to previous session.

Root cause:
- Increased system strictness (AGENTS.md + prompting rules)
- Reduced tolerance for ambiguity
- Forcing execution before design decisions were fully formed

Key realization:
- The system didn’t get worse
- The workflow became more precise, exposing unclear thinking

---

### 3. Introduced Dual-Mode System (EXPLORE vs EXECUTE)

Redefined how AI agents behave:

#### EXPLORE mode
- Used for layout, hierarchy, and interaction decisions
- Allows ambiguity and iteration
- No strict prompt structuring

#### EXECUTE mode
- Used for precise implementation
- Strict scope control
- Minimal changes, predictable outputs

Updated:
- AGENTS.md → now supports both modes
- Codex Prompting Mode → adapted to mode switching :contentReference[oaicite:1]{index=1}

Key impact:
- Reduced friction when designing
- Improved quality of execution prompts
- Better alignment between thinking and coding phases

---

### 4. Codex Prompting System Evolution

Refined prompting strategy:

Before:
- Everything forced into structured prompts
- Over-reduction to micro tasks
- High iteration loops

After:
- Only structure prompts in EXECUTE mode
- EXPLORE mode used to clarify intent first
- Clear separation between:
  - thinking (cheap)
  - execution (expensive)

Also reinforced debug workflow using dedicated pattern: :contentReference[oaicite:2]{index=2}

Key learning:
- Codex performs best with “mini-specs”, not vague intent
- Prompt quality directly impacts token efficiency

---

### 5. Token Usage Analysis

Observed increase in token usage compared to previous day.

Reason:
- Multiple execution loops per task
- Using Codex for exploration instead of implementation

Pattern identified:
- Yesterday: ~1–2 iterations per task
- Today: ~3–6 iterations per task

Conclusion:
- Token cost driven by misalignment, not complexity

Defined ideal usage model:

- €10–15/day → optimal
- €15–25/day → acceptable when pushing
- €25+ → inefficient (too many retries)

Key principle:
- Use ChatGPT for ambiguity
- Use Codex for precision

---

### 6. Defined Personal Workflow Loop

Established repeatable 5-step process:

1. Frame → define the real problem
2. Decide → choose solution type (spacing, layout, etc.)
3. Reduce → smallest possible change
4. Execute → Codex prompt
5. Evaluate → accept or reset

Key impact:
- Reduces unnecessary iterations
- Improves first-pass success rate
- Lowers token cost

---

### 7. Figma Integration Strategy

Explored using Figma for early-stage design.

Conclusion:
- Figma is valuable for EXPLORE phase only
- Useful for:
  - spacing comparisons
  - layout variants
  - density decisions

Not useful for:
- tokens
- components
- system logic

Adopted approach:
- Figma as disposable thinking canvas
- Code remains source of truth

---

## Key Learnings

- AI feels “magical” when ambiguity is high, but that hides system gaps
- Precision requires explicit thinking, not better prompts
- Separating EXPLORE and EXECUTE is critical for efficiency
- Token cost is driven by iteration loops, not task complexity
- Strong systems require adapting workflow, not removing constraints

---

## Outcome

- Improved control over Codex behavior
- Reduced frustration in implementation
- Clearer separation between design thinking and execution
- More scalable and efficient AI-assisted workflow

---

## Next Steps

- Apply Explore → Execute loop consistently
- Refine drawer system into reusable pattern
- Continue building case record with stable layout primitives
- Push AI rail integration further (actions, summaries, recommendations)

---