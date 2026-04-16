import type { CaseRecord } from "./types"

export type CaseState =
  | "triage"
  | "investigating"
  | "waiting_on_customer"
  | "escalated"
  | "pending_approval"
  | "ready_to_resolve"
  | "closed"

export type CaseAction =
  | "assign_owner"
  | "reply_to_customer"
  | "send_follow_up"
  | "add_internal_note"
  | "escalate_case"
  | "route_to_specialist"
  | "route_to_approval"
  | "notify_stakeholder"
  | "resolve_case"
  | "reopen_case"

export type CaseSignal = {
  slaRisk: "low" | "medium" | "high"
  noActionAvailable: boolean
}

export const ACTIONS_BY_STATE: Record<
  CaseState,
  { primary: CaseAction; secondary: CaseAction[] }
> = {
  triage: {
    primary: "assign_owner",
    secondary: ["reply_to_customer", "add_internal_note", "escalate_case"],
  },
  investigating: {
    primary: "add_internal_note",
    secondary: ["reply_to_customer", "route_to_specialist", "escalate_case"],
  },
  waiting_on_customer: {
    primary: "send_follow_up",
    secondary: ["add_internal_note", "escalate_case"],
  },
  escalated: {
    primary: "route_to_specialist",
    secondary: ["notify_stakeholder", "add_internal_note"],
  },
  pending_approval: {
    primary: "route_to_approval",
    secondary: ["notify_stakeholder", "add_internal_note"],
  },
  ready_to_resolve: {
    primary: "resolve_case",
    secondary: ["reply_to_customer", "add_internal_note"],
  },
  closed: {
    primary: "reopen_case",
    secondary: [],
  },
}

export const ACTION_LABELS: Record<CaseAction, string> = {
  assign_owner: "Assign owner",
  reply_to_customer: "Reply to customer",
  send_follow_up: "Send follow-up",
  add_internal_note: "Add internal note",
  escalate_case: "Escalate case",
  route_to_specialist: "Route to specialist team",
  route_to_approval: "Route case to approval workflow",
  notify_stakeholder: "Notify stakeholder",
  resolve_case: "Resolve case",
  reopen_case: "Reopen case",
}

export function getPrimaryAction(state: CaseState, signals: CaseSignal): CaseAction | null {
  if (state === "waiting_on_customer" && signals.noActionAvailable) {
    return null
  }

  if (state === "escalated" && signals.slaRisk === "high") {
    return "notify_stakeholder"
  }

  return ACTIONS_BY_STATE[state].primary
}

export function getSecondaryActions(state: CaseState, primary: CaseAction | null): CaseAction[] {
  return primary === null
    ? ACTIONS_BY_STATE[state].secondary
    : ACTIONS_BY_STATE[state].secondary.filter((action) => action !== primary)
}

export function getActionExplanation(state: CaseState, signals: CaseSignal): string {
  if (state === "waiting_on_customer" && signals.noActionAvailable) {
    return "All planned follow-ups have already been sent, so the team is waiting on customer input before taking another step."
  }

  if (state === "pending_approval" && signals.slaRisk === "high") {
    return "Approval is still required, and the case is now urgent because SLA risk is high."
  }

  if (state === "escalated" && signals.slaRisk === "high") {
    return "The case is at high SLA risk and stakeholders need an immediate update while specialist handling continues."
  }

  switch (state) {
    case "pending_approval":
      return "Approval is required before the team can take the next corrective action."
    case "waiting_on_customer":
      return "Customer input is required before the case can progress."
    case "escalated":
      return "The case requires specialist handling to move forward."
    case "ready_to_resolve":
      return "All required steps are complete and the case can be resolved."
    default:
      return "Continue progressing the case based on the current state."
  }
}

export function resolveCaseState(
  record: Pick<CaseRecord, "blockingReason" | "status" | "signals" | "primarySignal" | "statusReason">,
): CaseState {
  const normalizedStatusReason = record.statusReason.trim().toLowerCase()

  if (record.status === "resolved") {
    return "closed"
  }

  if (record.blockingReason === "awaiting_approval") {
    return "pending_approval"
  }

  if (
    record.signals.waitingOnCustomer ||
    record.blockingReason === "awaiting_customer_reply" ||
    record.blockingReason === "awaiting_customer_validation"
  ) {
    return "waiting_on_customer"
  }

  if (normalizedStatusReason.includes("ready to resolve")) {
    return "ready_to_resolve"
  }

  if (record.primarySignal === "escalated" || record.signals.escalated) {
    return "escalated"
  }

  if (
    record.primarySignal === "needs_assignment" ||
    record.primarySignal === "waiting_for_first_response" ||
    record.status === "new"
  ) {
    return "triage"
  }

  return "investigating"
}
