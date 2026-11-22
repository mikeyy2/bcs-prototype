/**
 * The whole persistence layer (WBS 9.6.1).
 *
 * Seed arrays are immutable; everything the visitor does lands in a mutable
 * overlay held in localStorage and merged on read. "Reset demo data" clears
 * the overlay, which restores the seed exactly.
 */
import { DEMO_PROFILE } from './seed'
import type { MutableState } from './types'

export const STORE_KEY = 'bcs.state.v1'

export function emptyState(): MutableState {
  return {
    registrations: [],
    rsvps: [],
    donations: [],
    inKindOffers: [],
    outbox: [],
    extraTaken: {},
    bookedSlotIds: [],
    approvals: {},
    approvalReasons: {},
    accountStatus: {},
    partnerRevoked: [],
    partnerListings: [],
    staffAccounts: [],
    attendance: {},
    profile: { ...DEMO_PROFILE },
    notifications: { reminders: true, newsletter: false },
  }
}

export function loadState(): MutableState {
  if (typeof localStorage === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return emptyState()
    // Merge so a state saved by an older build still loads.
    return { ...emptyState(), ...(JSON.parse(raw) as Partial<MutableState>) }
  } catch {
    return emptyState()
  }
}

export function saveState(state: MutableState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  } catch {
    // Quota or private-mode failure: the prototype keeps working in memory.
  }
}

export function clearState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORE_KEY)
}

let counter = 0

/** Ids only need to be unique within a session. */
export function newId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

/** Mock processor reference (REQ-DON-2: BCS stores only the reference). */
export function newPaymentReference(): string {
  return `mock_pi_${Math.random().toString(36).slice(2, 12)}`
}
