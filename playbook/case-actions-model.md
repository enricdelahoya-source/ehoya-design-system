# Case Actions Model

## Goal

Define how case actions work as part of the operational state model.

Actions are not just buttons or shortcuts.  
They are valid operational moves based on the current case situation.

This model ensures that:
- actions feel coherent with the case state
- users see actions that make sense for the current situation
- the drawer, header, and future flows all derive from the same logic
- the system supports decision-making, not random command exposure

---

## Core principle

Actions are derived from **Situation**.

Each action should do one of two things:

### 1. State-changing action
Moves the case from one situation to another.

Examples:
- Assign owner
- Escalate
- Mark customer replied
- Resolve
- Close case

### 2. State-preserving action
Keeps the case in the same situation, but updates or supports progress.

Examples:
- Add internal note
- Send follow-up
- Update checkpoint
- Reassign owner
- Attach evidence

This distinction is important because some actions are core operational decisions, while others are support actions.

---

## Action hierarchy

### Primary actions
The main decisions a user can take from the current situation.

These usually:
- change state
- clarify responsibility
- move the case forward decisively

### Supporting actions
Secondary actions that help the case progress without changing the main situation.

These usually:
- add context
- maintain the case
- support follow-up
- adjust metadata or timing

---

## Situation-based action model

### New

Definition:
Case has been created but not yet meaningfully handled.

#### Primary actions
- Assign to me → In progress
- Assign owner → In progress
- Start work → In progress
- Escalate → Escalated

#### Supporting actions
- Add internal note
- Route to queue
- Update classification

---

### Needs owner

Definition:
The case cannot progress because no one is accountable.

#### Primary actions
- Assign to me → In progress
- Assign to someone → In progress
- Escalate → Escalated

#### Supporting actions
- Route to queue
- Add internal note

Notes:
- This situation should strongly prioritize ownership actions.
- Supporting actions should not distract from assignment.

---

### In progress

Definition:
The case is actively being handled and not blocked by a dominant dependency.

#### Primary actions
- Mark waiting on customer → Waiting on customer
- Mark waiting on internal team → Waiting on internal team
- Resolve → Ready to close
- Escalate → Escalated

#### Supporting actions
- Add internal note
- Reassign owner
- Update checkpoint
- Update classification

Notes:
- This is the broadest active state.
- It should expose only the transitions that are operationally meaningful.

---

### Waiting on customer

Definition:
Progress is paused until the customer provides required input.

#### Primary actions
- Mark customer replied → In progress
- Escalate → Escalated
- Close case → Closed
- Override hold → In progress

#### Supporting actions
- Send follow-up
- Add internal note
- Update checkpoint

Notes:
- Some actions preserve the same state, like Send follow-up.
- Others transition the case out of waiting, like Mark customer replied.

---

### Waiting on internal team

Definition:
Progress depends on another internal group or specialist.

#### Primary actions
- Mark returned to owner → In progress
- Escalate → Escalated
- Resolve → Ready to close

#### Supporting actions
- Follow up internally
- Add internal note
- Reassign owner
- Update checkpoint

Notes:
- This state should support visibility and internal coordination.
- It should not behave the same as Waiting on customer.

---

### Escalated

Definition:
The case requires higher-priority or higher-skill handling.

#### Primary actions
- Assign escalation owner
- De-escalate → In progress
- Resolve → Ready to close

#### Supporting actions
- Add internal note
- Follow up
- Update checkpoint

Notes:
- Escalated cases should emphasize ownership and next movement.
- Generic support actions should remain secondary.

---

### Ready to close

Definition:
Operational work is complete, but closure has not been formally completed.

#### Primary actions
- Close case → Closed
- Reopen → In progress

#### Supporting actions
- Add internal note
- Send final update
- Update closure context

Notes:
- This state should reduce ambiguity between "work is done" and "case is closed."

---

### Closed

Definition:
Case is complete and inactive.

#### Primary actions
- Reopen → In progress

#### Supporting actions
- View history
- Add follow-up note if allowed

Notes:
- Closed cases should expose very few actions.
- Reopen is the only meaningful operational transition.

---

## Transition examples

### Waiting on customer
- Mark customer replied → In progress
- Send follow-up → Waiting on customer
- Override hold → In progress
- Escalate → Escalated
- Close case → Closed

### Needs owner
- Assign to me → In progress
- Assign to someone → In progress
- Escalate → Escalated

### In progress
- Mark waiting on customer → Waiting on customer
- Mark waiting on internal team → Waiting on internal team
- Resolve → Ready to close
- Escalate → Escalated

### Escalated
- Assign escalation owner → Escalated
- De-escalate → In progress
- Resolve → Ready to close

---

## UI intent

This file defines action logic, not final visual design.

The intended UI behavior is:

### Header
Expose only a small number of contextually strong primary actions.

### Drawer
Use the same action model to support:
- recommendation
- acceleration
- decision support

### Secondary menus
Contain supporting actions that do not need to dominate the interface.

---

## Exposure principles

### Show only valid actions
Users should not see actions that do not make sense for the current situation.

### Prioritize movement
Primary actions should help the case progress clearly.

### Keep support actions secondary
Actions like Add internal note or Send follow-up are useful, but should not overpower the main decision.

### Match system language
Action labels should reflect the same operational vocabulary used in:
- Situation
- Next step
- Checkpoint
- Reason

---

## Relationship to case state model

The case state model defines:
- what the case is
- why it is prioritized
- what should happen next

The case actions model defines:
- what moves are valid from that state
- which actions change the state
- which actions support the current state

Together, they create coherence across:
- list
- record
- drawer
- future workflow behavior

---

## Prototype scope

For the prototype, the action system should stay intentionally small.

Focus on:
- clear transitions
- strong contextual relevance
- minimal action clutter

The goal is not to model every possible enterprise action.

The goal is to show that actions are:
- state-aware
- coherent
- decision-oriented

---

## Design intent

Shift actions from generic controls into a state-driven operational model.

Instead of:
- showing the same commands everywhere

The system should:
- expose the valid moves for the current situation
- support faster decisions
- make workflow progression feel structured and understandable