import type { CasePrimarySignal, CaseSignals } from "./types"

export const EMPTY_CASE_SIGNALS: CaseSignals = {
  waitingOnCustomer: false,
  escalated: false,
  needsAssignment: false,
  waitingForFirstResponse: false,
}

export function getPrimarySignal(signals: CaseSignals): CasePrimarySignal {
  if (signals.escalated) {
    return "escalated"
  }

  if (signals.needsAssignment) {
    return "needs_assignment"
  }

  if (signals.waitingForFirstResponse) {
    return "waiting_for_first_response"
  }

  if (signals.waitingOnCustomer) {
    return "waiting_on_customer"
  }

  return null
}
