# Next step to button mapping

## Principle
- "Next step" explains what should happen next.
- The drawer button represents the first executable user action that advances that step.

## Rules

1. Map the button to the first executable step, not the final outcome.
2. If the next step is passive (wait, monitor, hold), show no main button.
3. Show a main button only when there is a clear immediate user move.
4. Button labels should describe the user action, not the system outcome.
5. If communication is required before closure, prefer `Reply with AI` over `Close case`.
6. Use `Close case` only when closure is directly executable.
7. Keep all other available actions under `Other actions`.

## Examples

### Waiting on customer
Next step: Wait for customer confirmation  
Button: none

### Waiting on customer with clarification needed
Next step: Reply to clarify the remaining requirement  
Button: Reply with AI

### Needs owner
Next step: Assign the case to an owner  
Button: Assign owner

### Escalated
Next step: Assign escalation owner and coordinate next response  
Button: Assign escalation owner

### Ready to close with communication still needed
Next step: Send closure summary and close the case  
Button: Reply with AI

### Ready to close and closure is directly executable
Next step: Close the case  
Button: Close case