# Case System — Status, State, and Actions Model

## Context

During the implementation of suggested actions and AI assistance, it became clear that the system needed a clearer distinction between different types of “state”.

Originally, multiple elements were expressing the same idea:
- Status (e.g. "Waiting on customer")
- Blocker (e.g. "awaiting customer reply")
- Summary text
- Suggested actions

This created duplication, confusion, and reduced trust in the system.

This iteration formalizes the separation between **Status**, **State**, and **Actions**.

---

## Why Status ≠ State

### Status

Status represents the **lifecycle stage** of the case.

It answers:
> Where is this case in the workflow?

Examples:
- New
- In progress
- Resolved
- Closed

Characteristics:
- Stable
- Limited set of values
- Used for reporting, filtering, and system-level workflows

---

### State

State represents the **current operational condition** of the case.

It answers:
> What is happening right now?

Examples:
- Waiting for first response
- Waiting for customer response
- Waiting for internal review
- In investigation

Characteristics:
- Derived from timeline activity
- More specific than status
- Changes frequently
- Drives user decisions

---

### Key distinction

```text
Status = lifecycle
State = current condition