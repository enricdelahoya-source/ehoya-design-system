# Next Step to Button Rules

## Goal

Define how the AI drawer maps **Next step** into a single main button consistently across cases.

This model ensures that:
- the drawer gives clear guidance
- the main button reflects the actual next move
- the system does not skip necessary steps
- different cases follow the same logic

---

## Core principle

The drawer should show:

- **Next step** = explanation of what should happen next
- **Main button** = first executable user action that advances that next step

The button should not represent:
- the final outcome
- a future dependent step
- a passive recommendation with no trigger

---

## Rules

### 1. Map the button to the first executable step
If the next step contains multiple parts, the button must represent the first action the user can take now.

Example:

Next step:
- Reply with the audit clarification, then close the case if no issues remain.

Button:
- Reply with AI

Not:
- Close case

---

### 2. If the next step is passive, omit the main button
If the correct next step is to wait, monitor, or hold, do not force a main drawer button.

Example:

Next step:
- Wait for customer confirmation.

Button:
- none

Other actions may still appear:
- Record customer reply
- Escalate case
- Close case

---

### 3. Show a main button only when there is a clear immediate user move
A drawer button should exist only when the system can confidently point to a meaningful next action.

Good candidates:
- Reply with AI
- Close case
- Assign owner
- Escalate case
- Assign escalation owner

Bad candidates:
- No action needed
- Review later
- Await response

---

### 4. Button label should describe the user action
The label should express what the user will do now.

Use:
- Reply with AI
- Close case
- Assign owner
- Escalate case
- Assign escalation owner

Avoid:
- Resolve customer issue
- Progress case
- Complete next step

---

### 5. If communication is required first, prefer communication over closure
When a case is near resolution but still requires a reply, clarification, or closure summary, the button should point to that communication step.

Example:

Next step:
- Send the closure summary and close the case.

Button:
- Reply with AI

Not:
- Close case

Unless closure is already directly executable in the case context.

---

### 6. Use Close case only when closure is directly executable
Use **Close case** as the drawer button only when:
- no required message is missing
- no clarification is pending
- no confirmation is needed
- closing is the real next move

Example:

Next step:
- Close the case.

Button:
- Close case

---

### 7. Keep all other available actions secondary
If a main button exists, it is the strongest guided move.

All other available actions should remain under:
- **Other actions**

Other actions should:
- stay flat
- remain secondary
- not compete visually with the main button

---

## State-based examples

### Waiting on customer

#### Passive wait state
Next step:
- Wait for customer confirmation.

Main button:
- none

Other actions:
- Record customer reply
- Escalate case
- Close case

---

#### Clarification needed from the team
Next step:
- Reply to clarify the remaining requirement.

Main button:
- Reply with AI

Other actions:
- Record customer reply
- Escalate case
- Add internal note

---

### In progress

#### Internal work still ongoing
Next step:
- Continue investigation and prepare customer update.

Main button:
- none

Other actions:
- Escalate case
- Add internal note

---

#### Customer update is the next move
Next step:
- Send the customer an update on the corrected export.

Main button:
- Reply with AI

Other actions:
- Escalate case
- Add internal note

---

### Needs owner

Next step:
- Assign the case to an owner.

Main button:
- Assign owner

Other actions:
- Escalate case
- Add internal note

---

### Escalated

Next step:
- Assign escalation owner and coordinate next response.

Main button:
- Assign escalation owner

Other actions:
- De-escalate case
- Add internal note

---

### Ready to close

#### Closure communication still needed
Next step:
- Send closure summary and close the case.

Main button:
- Reply with AI

Other actions:
- Close case
- Add internal note

---

#### Closure directly executable
Next step:
- Close the case.

Main button:
- Close case

Other actions:
- Add internal note

---

## Design intent

The drawer should help the user answer:

- What should happen next?
- What can I do right now to move this forward?

This model keeps the drawer:
- actionable
- consistent
- aligned with the case state model
- aligned with the reply interaction
- aligned with the action hierarchy