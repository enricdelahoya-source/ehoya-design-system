# Case State Model

## Goal

Define a canonical operational state model for the case system.

This model ensures that:
- the list, record, drawer, and actions all express the same logic
- the system supports decision-making, not just documentation

The model should help answer:

- What kind of case is this right now?
- How urgent is it?
- Who is responsible?
- What should happen next?
- When does it need attention again?
- Why is it in this state?

---

## Canonical fields

### Situation
The current operational condition of the case.

This is the primary state used for prioritization and decision-making.

Examples:
- New
- Needs owner
- In progress
- Waiting on customer
- Waiting on internal team
- Escalated
- Ready to close
- Closed

---

### Urgency
The current level of time pressure or attention required.

This is a computed signal, not a manual status.

Examples:
- Breached
- 2h left
- Today
- This week
- Low
- No action needed

---

### Owner
Who is accountable for progressing the case.

Examples:
- Named assignee
- Queue
- Escalation owner
- Unassigned

---

### Next step
The next expected action or outcome.

This defines the operational direction of the case.

Examples:
- Assign case owner
- Review issue with billing team
- Wait for customer confirmation
- Send follow-up on Apr 14
- Escalate to specialist
- Close if no reply after checkpoint

---

### Checkpoint
The next meaningful review date or deadline.

This is the moment when the case should be reconsidered or acted on.

Examples:
- Apr 14, 09:00
- Response due in 2h
- Follow up in 3 days
- No checkpoint set

---

### Reason
A short explanation for the current situation.

Examples:
- Awaiting confirmation on corrected invoice branding
- No owner assigned after triage
- Internal refund approval pending
- Escalation requested due to repeated SLA misses

---

## Lifecycle vs operational state

### Lifecycle status
System-level state used for audit:

- Open
- Closed

Optional:
- Open
- Resolved
- Closed

---

### Operational situation
Primary working state used for prioritization:

- New
- Needs owner
- In progress
- Waiting on customer
- Waiting on internal team
- Escalated
- Ready to close
- Closed

Operational situation is primary in the UI.  
Lifecycle status is secondary metadata.

---

## Situations

### New

Definition:
Case has been created but not yet triaged or assigned.

Typical next steps:
- Assign owner
- Review issue
- Send first response

Allowed actions:
- Assign to me
- Assign owner
- Add note
- Escalate
- Start work

---

### Needs owner

Definition:
Case cannot progress because no one is responsible.

Typical next steps:
- Assign case owner
- Route to correct queue

Allowed actions:
- Assign to me
- Assign to someone
- Route to queue
- Escalate

---

### In progress

Definition:
Case is actively being handled and not blocked.

Typical next steps:
- Investigate issue
- Prepare response
- Coordinate internally

Allowed actions:
- Add note
- Reassign
- Escalate
- Mark waiting on customer
- Mark waiting on internal team
- Resolve

---

### Waiting on customer

Definition:
Case is paused until customer provides input.

Typical next steps:
- Wait for customer confirmation
- Follow up on checkpoint
- Close after no response

Allowed actions:
- Add note
- Send follow-up
- Override hold
- Escalate
- Close case
- Mark customer replied

---

### Waiting on internal team

Definition:
Case depends on another internal group.

Typical next steps:
- Wait for internal validation
- Review specialist response
- Follow up internally

Allowed actions:
- Add note
- Follow up internally
- Escalate
- Reassign
- Mark returned to owner

---

### Escalated

Definition:
Case requires higher priority or specialized handling.

Typical next steps:
- Assign escalation owner
- Review escalated issue
- Coordinate specialist response

Allowed actions:
- Assign escalation owner
- Add note
- De-escalate
- Follow up
- Resolve

---

### Ready to close

Definition:
Work is complete but case not yet formally closed.

Typical next steps:
- Confirm outcome
- Close case

Allowed actions:
- Close case
- Reopen
- Add note

---

### Closed

Definition:
Case is completed.

Allowed actions:
- Reopen
- View history

---

## Urgency model

### Urgency levels

- Breached
- 2h left
- Today
- This week
- Low
- No action needed

---

### Inputs

Urgency is derived from:

- SLA deadlines
- Checkpoint timing
- Ownership gaps
- Escalation
- Waiting states

---

### Example rules

Breached:
- SLA deadline passed
- or critical checkpoint passed without action

2h left:
- deadline within 2 hours

Today:
- action required today

This week:
- action expected soon

Low:
- stable, no immediate pressure

No action needed:
- waiting on customer or internal team
- checkpoint not yet reached

---

## Record structure

### Primary section: Case state

Fields:
- Situation
- Urgency
- Owner
- Next step
- Checkpoint
- Reason

This section should explain:
- why the case appears as it does in the list
- what should happen next

---

### Secondary sections

- Classification
- Timing and SLA
- Customer and context
- Handling and routing
- Description
- Internal notes

---

## Drawer role

The drawer uses the same model but compresses it.

Structure:
- Situation
- Why
- What to do
- Options

The drawer accelerates understanding.  
It does not introduce a separate truth.

---

## Action model

Actions are state transitions based on Situation.

Examples:

New:
- Assign to me
- Assign owner
- Escalate

Needs owner:
- Assign to me
- Assign owner
- Route

In progress:
- Add note
- Reassign
- Escalate
- Mark waiting

Waiting on customer:
- Send follow-up
- Override hold
- Close

Waiting on internal team:
- Follow up internally
- Escalate

Escalated:
- Assign escalation owner
- De-escalate

Ready to close:
- Close case
- Reopen

Closed:
- Reopen

---

## Design intent

Shift the case record from a metadata-heavy administrative screen into a decision-support surface.

The case state model becomes the single source of truth across:
- list (prioritization)
- record (understanding)
- drawer (acceleration)
- actions (execution)