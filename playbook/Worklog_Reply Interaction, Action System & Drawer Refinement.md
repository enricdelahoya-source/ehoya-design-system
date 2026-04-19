# Worklog — Reply Interaction, Action System & Drawer Refinement

## Context

This session focused on evolving the prototype from a well-structured UI into a coherent, state-driven interaction system. The goal was to connect:

- case state model  
- action model  
- drawer (decision layer)  
- timeline (execution layer)  
- AI-assisted reply  

The system should not only describe work, but guide it and react to it.

---

## 1. Action System — Final Distribution

Defined a clear separation of action surfaces:

Header (case-level actions)
- Record customer reply  
- Escalate case  
- Close case  

→ Global, state-changing decisions

Timeline (activity-level actions)
- Add internal note  
- Reply (contextual per email)

→ Local, event-driven actions

Drawer (decision layer)
- Next step (guidance)
- Main action (if applicable)
- Other actions

→ Interprets state and suggests the next move

Key insight:
Actions are not features. They are distributed based on intent and context.

---

## 2. Drawer Redesign — From Description to Decision

The drawer evolved from multiple overlapping sections into a single clear structure:

Next step
- Explanation
- Action button (if applicable)
- Other actions

Key changes:
- Removed “Decision” and “Recommended” (they duplicated meaning)
- Unified guidance under “Next step”
- Introduced a single main action button
- Kept “Other actions” flat and secondary

Key insight:
The drawer should answer:
What should I do next — and let me do it.

---

## 3. Next Step → Button Mapping Rules

Defined a deterministic mapping between guidance and action:

- Button = first executable step (not final outcome)
- No button when next step is passive (e.g. waiting)
- Prefer communication before closure when needed
- Use real user actions as labels (e.g. “Reply”, not “Resolve”)

Example:
Next step:
Reply with clarification, then close

Button:
Reply

Key insight:
This prevents the system from skipping steps or exposing system logic instead of user intent.

---

## 4. Reply Interaction — AI Integration

Moved from:
- empty composer
- “Draft with AI” button

To:
- AI-first prefilled draft
- editable textarea
- optional “Rewrite”

Key decisions:
- AI is implicit, not the action
- “Reply” is the action, AI supports it
- Removed “Reply with AI” (too tool-centric)
- Renamed “Regenerate” → “Rewrite”

Key insight:
AI should reduce effort inside the workflow, not introduce a new one.

---

## 5. State Transitions — System Becomes Reactive

Implemented core behavior:

Sending a reply automatically updates the case state.

Example:
In progress → Reply → Waiting on customer

System updates after action:
- New timeline entry
- Drawer updates
- Next step changes
- Main button may disappear

Key insight:
Actions should move the case forward automatically.

This is where the system becomes stateful and reactive.

---

## 6. Feedback & Micro-interactions

Initial issues:
- Toast was disconnected and unnecessary
- Timeline insertion felt slow and card-like
- Highlight was inconsistent

Final solution:
- Removed toast
- Feedback is anchored in the timeline
- New entry appears with:
  - fast timing (~120ms)
  - full-width alignment
  - subtle warm overlay (temporary)

Visual refinements:
- Removed borders, radius, extra spacing
- Reintroduced orange tint as a transparent wash (not a solid block)
- Slightly increased warmth (more red, less yellow)
- Faster fade-out for clarity

Key insight:
Don’t tell the user something happened. Show them where it happened.

---

## 7. System Alignment — Surface State Language

Validated that the system already had a coherent material logic:

- Hover = faint surface tint  
- Selected = stronger persistent tint  
- Feedback = strongest, temporary tint  
- Focus = separate (ring-based, not surface)

No structural changes were needed.

Key insight:
Consistency comes from shared logic, not identical styling.

---

## 8. Interaction Quality Improvements

Removed unnecessary friction:
- Removed highlight on Reply trigger (redundant)
- Removed “Sent” label (duplicate feedback)
- Simplified animation (no movement, only color)

Final feedback loop:
1. User sends reply  
2. Composer closes  
3. Timeline updates (highlight)  
4. Drawer updates  

No extra UI needed.

---

## 9. Outcome

The system now:
- Guides decisions (drawer)
- Enables actions (header / timeline)
- Executes with support (AI reply)
- Reacts to user actions (state transitions)
- Communicates changes clearly (timeline feedback)

---

## Final insight

This work shifted the system from:
UI that displays information

to:
A state-driven system that guides, executes, and reacts.

---

## Personal note

At this stage, the system reached a level of coherence where:
- new changes were incremental, not corrective  
- components behaved consistently without patchwork  

This is a strong signal that the underlying model is solid.

---

## 10. Model Files as a Control Layer (Key Learning)

A major learning from this session was the introduction and use of model `.md` files as a way to define system behavior.

Examples created:
- case-state-model.md
- case-actions-model.md
- reply-interaction.md
- next-step-button-rules.md

---

### What changed

Instead of:
- directly implementing behavior in code
- or relying on implicit logic inside components

Behavior is now:
- explicitly defined in model files
- referenced by Codex during implementation
- used as the source of truth for decisions

---

### Why this is powerful

1. Behavior is controlled without coding  
   - Changes to flows, actions, and logic can be defined in plain language  
   - Codex becomes an executor, not a decision-maker  

2. Reduces iteration cost  
   - No need to “fight the code” to adjust behavior  
   - Faster experimentation with system logic  

3. Improves consistency  
   - Same rules applied across drawer, timeline, and actions  
   - Avoids local, ad-hoc decisions  

4. Makes the system explainable  
   - Anyone can read the model files and understand:
     - how state works
     - how actions map to behavior
     - how AI is integrated  

5. Decouples design from implementation  
   - System design lives outside components  
   - Components become renderers of the model  

---

### Key insight

Model files act as a **behavioral control layer** between design and code.

They allow:
- defining system logic explicitly
- guiding implementation consistently
- documenting the product in a way that is both human-readable and executable

---

### Reflection

If starting again, model files would be introduced from the beginning of the project.

They would:
- shape the system earlier
- reduce rework
- make the evolution of the product more intentional

---

### Impact on the project

The system now has:
- structural layer (components, layout)
- behavioral layer (model `.md` files)

This separation makes the system:
- easier to evolve
- easier to explain
- closer to how real products are designed and maintained