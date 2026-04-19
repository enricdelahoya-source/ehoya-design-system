# Reply Interaction Model

## Goal

Define how agents reply to customer messages within the case system, and how AI assists in drafting those replies.

The reply interaction should:
- feel natural and contextual to the timeline
- leverage case state and recent activity
- accelerate writing without removing user control
- remain grounded, predictable, and trustworthy

---

## Core principle

Reply is a **timeline action**, not a case action.

- It is triggered from a specific event (e.g. customer email)
- It creates a new activity (outgoing message)
- It does not directly change the case state

AI is a **drafting assistant inside the reply flow**, not a separate system.

---

## Trigger

Reply is available only on relevant timeline events.

### Primary trigger

On `Email received` entries:

- Reply

### Optional future triggers

- Chat message received
- Ticket comment from customer

---

## Interaction flow

1. User clicks **Reply** on a timeline event
2. A reply composer opens (inline or side panel)
3. The composer is prefilled with:
   - recipient (from the event)
   - subject (thread-aware if applicable)
4. The message body is empty by default
5. User can:
   - write manually
   - use AI to draft a reply
6. User edits the message
7. User sends the reply
8. A new timeline entry is created: `Email sent`

---

## Composer structure (prototype)

Minimal structure:

- Header
  - Reply to {customer}
  - Subject

- Body
  - Textarea

- Actions
  - Send
  - Cancel

- AI assist (inside composer)
  - Draft with AI
  - Regenerate (optional)

---

## AI role

AI assists with drafting the message.

It should:
- generate a first-pass reply
- reflect the current case context
- remain editable by the user
- never send automatically

---

## AI inputs

AI should only use visible and relevant context.

For the prototype:

- latest customer message (trigger event)
- recent timeline activity (short window)
- case summary (from drawer)
- Situation
- Next step

Optional later:
- internal notes (filtered)
- classification or product context

---

## AI output

AI generates a **draft reply**.

The output should:
- be concise and clear
- reflect the operational goal (e.g. request confirmation)
- match a neutral, professional tone
- avoid hallucinated facts
- avoid overpromising

---

## Framing (important for trust)

The draft should be clearly labeled:

- "Draft reply"
- "Based on recent case activity and current situation"

The user must understand:
- this is a suggestion
- they remain responsible for sending

---

## Example (current case)

Situation:
Waiting on customer

Next step:
Wait for customer confirmation

AI draft:

Hi Valeria,

Following up on the corrected invoice branding set we shared. When you have a moment, could you please confirm whether it is approved across all clinics?

Once we receive your confirmation, we can proceed to close the case.

Best,  
Lucia

---

## Relationship to case state

Reply does not directly change the case state.

However:
- it adds a new timeline event
- it may update checkpoint logic (future)
- it supports the current next step

Example:

Situation: Waiting on customer  
Reply sent → still Waiting on customer

---

## Relationship to actions model

- Reply is a **timeline action**
- It is not listed in header actions
- It is not a primary case transition

However, it may appear alongside:

- Record customer reply (bridge action)

---

## Bridge action (optional)

In the same context (customer message), user may see:

- Reply
- Record customer reply

Difference:

- Reply → send message to customer
- Record customer reply → update case state

---

## UI behavior constraints

- Keep the composer lightweight
- Do not introduce complex threading UI
- Do not create a full email client
- Do not auto-expand large panels by default
- Preserve the calm enterprise visual style

---

## Non-goals (for this prototype)

- No auto-send
- No approval workflows
- No tone/style controls
- No template library
- No multi-recipient management
- No deep thread navigation

---

## Success criteria

- Reply feels like a natural extension of the timeline
- AI helps reduce writing effort without taking control
- The interaction is fast and low-friction
- The system remains understandable and predictable
- The reply flow aligns with the case state model

---

## Design intent

Integrate AI at the moment of action, not as a separate layer.

The system should:
- guide decisions (drawer)
- expose controls (header)
- support execution (timeline)

Reply + AI is the first example of **execution support** in the system.
