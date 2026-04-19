import type { CaseRecord, CaseSituation } from "./types"

export type CaseState =
  | "New"
  | "Needs owner"
  | "In progress"
  | "Waiting on customer"
  | "Waiting on internal team"
  | "Escalated"
  | "Ready to close"
  | "Closed"

export type CaseAction =
  | "assign_owner"
  | "mark_customer_replied"
  | "send_follow_up"
  | "add_internal_note"
  | "escalate_case"
  | "close_case"

export type CaseSignal = {
  slaRisk: "low" | "medium" | "high"
  noActionAvailable: boolean
}

export const ACTIONS_BY_STATE: Record<
  CaseState,
  { primary: CaseAction; secondary: CaseAction[] }
> = {
  New: {
    primary: "assign_owner",
    secondary: ["add_internal_note", "escalate_case"],
  },
  "Needs owner": {
    primary: "assign_owner",
    secondary: ["add_internal_note", "escalate_case"],
  },
  "In progress": {
    primary: "add_internal_note",
    secondary: ["escalate_case"],
  },
  "Waiting on customer": {
    primary: "send_follow_up",
    secondary: ["mark_customer_replied", "close_case", "escalate_case", "add_internal_note"],
  },
  "Waiting on internal team": {
    primary: "add_internal_note",
    secondary: ["escalate_case"],
  },
  Escalated: {
    primary: "add_internal_note",
    secondary: ["close_case"],
  },
  "Ready to close": {
    primary: "close_case",
    secondary: ["add_internal_note"],
  },
  Closed: {
    primary: "add_internal_note",
    secondary: [],
  },
}

export const ACTION_LABELS: Record<CaseAction, string> = {
  assign_owner: "Assign owner",
  mark_customer_replied: "Record customer reply",
  send_follow_up: "Send follow-up",
  add_internal_note: "Add internal note",
  escalate_case: "Escalate case",
  close_case: "Close case",
}

export function getPrimaryAction(state: CaseState, signals: CaseSignal): CaseAction | null {
  if (state === "Waiting on customer" && signals.noActionAvailable) {
    return null
  }

  return ACTIONS_BY_STATE[state].primary
}

export function getSecondaryActions(state: CaseState, primary: CaseAction | null): CaseAction[] {
  return primary === null
    ? ACTIONS_BY_STATE[state].secondary
    : ACTIONS_BY_STATE[state].secondary.filter((action) => action !== primary)
}

export function getActionExplanation(state: CaseState, signals: CaseSignal): string {
  if (state === "Waiting on customer" && signals.noActionAvailable) {
    return "The case is still waiting on customer input. Follow-up is complete, so the remaining valid moves are to wait, close the case, or record that the customer replied."
  }

  if (state === "Escalated" && signals.slaRisk === "high") {
    return "The case is escalated and still under time pressure, so operators should document the latest internal update before taking the next move."
  }

  switch (state) {
    case "New":
      return "The case is new and needs an owner before the next operational step is clear."
    case "Needs owner":
      return "The case cannot move until one accountable owner is assigned."
    case "In progress":
      return "The case is actively being handled, so the next move should keep the work visible and moving."
    case "Waiting on customer":
      return "Customer input is required before the case can progress."
    case "Waiting on internal team":
      return "An internal dependency is holding the case, so the next move should capture progress or escalate if needed."
    case "Escalated":
      return "The case is escalated and should stay tightly coordinated until the next internal decision is clear."
    case "Ready to close":
      return "The work is complete and the case is ready for formal closure."
    case "Closed":
      return "The case is already closed, so no further action is required right now."
    default:
      return "Continue progressing the case based on the current state."
  }
}

export function resolveCaseState(
  record: Pick<CaseRecord, "situation" | "status">,
): CaseState {
  const situation = record.situation.trim() as CaseSituation

  if (situation) {
    return situation === "Closed" && record.status !== "resolved"
      ? "In progress"
      : situation
  }

  return record.status === "resolved" ? "Closed" : "In progress"
}
