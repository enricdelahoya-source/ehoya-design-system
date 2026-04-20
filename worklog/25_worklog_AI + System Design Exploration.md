# Worklog — AI + System Design Exploration  
**Date:** 2026-04-20  

## Context

Continued development of a design system + AI case management prototype (“vivalavita”), exploring how structured product systems can support AI-driven workflows.

The project focuses on:
- Schema-driven UI (fields → sections → templates)
- System-first design (structure over screens)
- AI as a product layer (not chat)

Initial principles defined in project:
- structure over decoration  
- semantic tokens (Tailwind v4 @theme)  
- interaction driven by structure, not color :contentReference[oaicite:0]{index=0}  

---

## Key Progress

### 1. System maturity (major milestone)

- Achieved working **list → record flow**
- Implemented:
  - Case list (scan / compare / open)
  - Case record (view + edit modes)
  - Schema-driven sections
- Established:
  - Shared Field system (edit vs read-only)
  - Consistent structure across modes

👉 Shift from “UI screens” → **system that renders them**

---

### 2. Schema-driven architecture

Clarified and implemented:

- Schema = structure (fields, labels, visibility)
- Renderer = UI
- Record = data

Flow:
```
schema + record → UI
```

Then extended to AI:
```
schema + record → AI input → AI output → UI
```

👉 Key realization:
> Don’t send UI to AI. Send structured meaning.

---

### 3. First AI layer (non-chat)

Implemented AI panel in record:

- Summary (structured bullets)
- Suggested actions
- Activity (as evidence)

Important design decisions:
- No chat UI
- No input box
- AI as **decision support layer**
- Positioned in right panel (assistive, not central)

---

### 4. Trust & transparency model

Added lightweight trust cues:

- “Generated from visible case details”
- “Review before action”
- No confidence scores
- No AI theatrics

👉 Designed AI as:
**assistive, not authoritative**

---

### 5. Fake AI → signal-based system

Moved from:
```
caseId → output
```

To:
```
case signals → output
```

Signals introduced:
- status (escalated, waiting)
- priority
- approval required
- keyword detection (migration, auth, visibility)

Structure:
- detect signals
- build summary
- build actions

👉 Fake AI became:
**deterministic reasoning layer over structured data**

---

### 6. Reactive AI behavior

Implemented:
- AI refresh on save
- manual “refresh summary”
- version-based updates

👉 AI behaves as:
**derived state, not live assistant**

---

### 7. Product-level refinement

Improved:
- Summary → structured bullets (scan-first)
- Actions → shorter, operational
- Reduced verbosity
- Removed “AI tone”

👉 Key learning:
> AI output should look like product data, not writing.

---

## Strategic Realization

The project evolved into two distinct case studies:

### Case Study 1 — System Design
- Schema-driven UI
- Scalable templates (list + record)
- View/edit parity
- Design system as product infrastructure

### Case Study 2 — AI Design
- Structured AI input/output
- Trust & transparency
- Evaluation mindset
- AI integrated into workflow (not chat)

👉 Important separation:
- System enables AI  
- AI builds on system  

---

## Portfolio Strategy

Defined final portfolio structure:

### System Design
1. Scalable case system (this project)
2. Legacy case redesign (ERP)
3. Multi-location fulfillment (abstraction)

### AI & Intelligence
4. AI as product layer (this project)
5. Early AI exploration (LLM case work)

👉 Positioning shift:
From “senior UX designer” →  
**system + AI product designer (staff-level signal)**

---

## Career Impact Insight

This work enables targeting:

- Staff / Lead Product Designer roles
- AI Product Designer roles
- 0→1 / early-stage product teams
- Platform / system design roles

Expected compensation band:
- €75k–85k realistic
- €85k–95k possible with strong positioning

---

## Key Learnings

- Structure is the foundation for both UI and AI  
- Schema enables scalability and intelligence  
- AI must be grounded in product data  
- Trust is designed through tone, structure, and control  
- Fake AI is a powerful step to validate product thinking  
- Building prototypes clarifies system decisions faster than abstraction  

---

## Next Steps

- Finalize system case (timeline, polish, create flow)
- Refine AI panel behavior and grounding
- Convert both into portfolio-ready narratives
- Avoid overbuilding — focus on storytelling

---

## Meta

Introduced and reinforced working methods:

- Codex Prompting Mode for controlled implementation :contentReference[oaicite:1]{index=1}  
- Debug Mode for minimal-scope fixes :contentReference[oaicite:2]{index=2}  
- Separation of thinking (ChatGPT) vs execution (Codex)

👉 Reduced iteration noise and token cost while improving precision

---

## Summary

This work represents a shift from designing interfaces to:

> designing systems that define how products behave — and how AI can operate on top of them.