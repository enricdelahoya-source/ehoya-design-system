# Case Action Decision Model

## Context

This system defines how actions are surfaced in a case management interface.

The goal is to move from:
- generic AI recommendations

to:
- structured, state-driven decisions

---

## Core principles

### 1. State defines valid actions

Each case is mapped to a finite state.

The state determines:
- which actions are available
- what the system considers the “next step”

This prevents AI from inventing actions.

---

### 2. One primary action per state

Each state exposes:
- one primary action (the most relevant next step)
- a set of secondary actions (valid alternatives)

This reduces ambiguity and decision fatigue.

---

### 3. AI does not decide actions

The system:
- defines the action set

AI:
- selects the most relevant action
- explains why

> system decides, AI explains

---

### 4. Signals refine priority

Additional signals (e.g. SLA risk) can:
- adjust which action becomes primary
- but do not introduce new actions

Example:
- escalated → route to specialist
- escalated + high SLA risk → notify stakeholder

---

### 5. Constraints override urgency

Some states represent hard dependencies.

Example:
- pending approval

Even under high SLA risk:
- approval remains the primary action

This introduces a priority hierarchy:
- constraints > urgency

---

### 6. The system can surface “no action”

In some states, no meaningful action exists.

Example:
- waiting on customer
- all follow-ups already sent

In this case:
- no primary action is shown
- the system explicitly communicates that no action is required

This avoids fake or redundant actions.

---

## State model (v1)

- triage
- investigating
- waiting_on_customer
- escalated
- pending_approval
- ready_to_resolve
- closed

---

## Action model (v1)

Actions are predefined system operations:

- assign_owner
- reply_to_customer
- send_follow_up
- add_internal_note
- escalate_case
- route_to_specialist
- route_to_approval
- notify_stakeholder
- resolve_case
- reopen_case

---

## Decision layers

### Layer 1 — State

Defines:
- valid actions
- default primary

---

### Layer 2 — Signals

Refines:
- which action becomes primary
- whether action should be suppressed

Examples:
- slaRisk
- noActionAvailable

---

### Layer 3 — UI

Renders:
- one primary action (if exists)
- explanation
- secondary actions

---

## Edge cases handled

### 1. Conflicting signals

State: pending_approval  
Signal: high SLA risk  

Result:
- primary remains approval
- explanation reflects urgency

---

### 2. No available action

State: waiting_on_customer  
Signal: noActionAvailable  

Result:
- no primary action
- explanation communicates waiting state

---

### 3. Priority override

State: escalated  
Signal: high SLA risk  

Result:
- primary switches from specialist routing to stakeholder notification

---

## Outcome

The system produces:

- predictable behavior
- consistent decision hierarchy
- explainable actions
- reduced cognitive load for operators

---

## Design intent

This model prioritizes:
- clarity over flexibility
- structure over AI autonomy
- decision support over suggestion lists