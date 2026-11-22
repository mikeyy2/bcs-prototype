/**
 * Read model. Seed plus overlay, resolved to real dates and live capacities.
 *
 * Capacity is computed in one place so every screen agrees — this is the
 * shared availability check REQ-BKG-1 asks for. There is no real concurrency
 * in a single browser tab, so atomicity is simulated, not guaranteed.
 */
import { resolveDate } from './format'
import {
  APPROVAL_ITEMS,
  DEMO_PARTNER_ID,
  DROP_OFF_SLOTS,
  EVENTS,
  MEMBER_ACCOUNTS,
  OPPORTUNITIES,
  ORGANIZATIONS,
  STAFF_ACCOUNTS,
} from './seed'
import type { BcsEvent, MutableState, Opportunity, Shift } from './types'

export type ResolvedShift = Shift & {
  start: Date
  end: Date
  hours: number
  taken: number
  remaining: number
  isFull: boolean
}

export type ResolvedOpportunity = Omit<Opportunity, 'shifts'> & {
  organizationName: string
  shifts: ResolvedShift[]
  totalRemaining: number
  isFull: boolean
  nextStart: Date | null
}

export type ResolvedEvent = BcsEvent & {
  organizationName: string | null
  start: Date
  end: Date
  taken: number
  remaining: number
  isFull: boolean
}

export function organizationName(id: string | null): string | null {
  if (!id) return null
  return ORGANIZATIONS.find((o) => o.id === id)?.name ?? null
}

function takenFor(state: MutableState, id: string, seeded: number): number {
  return seeded + (state.extraTaken[id] ?? 0)
}

export function resolveOpportunity(
  opportunity: Opportunity,
  state: MutableState,
): ResolvedOpportunity {
  const shifts = opportunity.shifts.map((shift) => {
    const taken = takenFor(state, shift.id, shift.taken)
    const start = resolveDate(shift.dayOffset, shift.startHour)
    return {
      ...shift,
      start,
      end: resolveDate(shift.dayOffset, shift.endHour),
      hours: Math.max(0, shift.endHour - shift.startHour),
      taken,
      remaining: Math.max(0, shift.capacity - taken),
      isFull: taken >= shift.capacity,
    }
  })

  const upcoming = shifts.filter((s) => s.start.getTime() > Date.now())

  return {
    ...opportunity,
    organizationName: organizationName(opportunity.organizationId) ?? 'BCS',
    shifts,
    totalRemaining: shifts.reduce((sum, s) => sum + s.remaining, 0),
    isFull: shifts.every((s) => s.isFull),
    nextStart: upcoming.length ? upcoming[0].start : null,
  }
}

/**
 * Only approved, published listings are publicly visible (REQ-PRT-5, REQ-SRC-2),
 * and revoking a partner immediately unpublishes all of its listings
 * (REQ-ADM-2).
 */
export function publishedOpportunities(state: MutableState): ResolvedOpportunity[] {
  return OPPORTUNITIES.filter(
    (o) => o.status === 'published' && !state.partnerRevoked.includes(o.organizationId),
  )
    .map((o) => resolveOpportunity(o, state))
    .sort((a, b) => (a.nextStart?.getTime() ?? 0) - (b.nextStart?.getTime() ?? 0))
}

export function findOpportunity(id: string, state: MutableState): ResolvedOpportunity | null {
  const match = OPPORTUNITIES.find((o) => o.id === id)
  return match ? resolveOpportunity(match, state) : null
}

export function resolveEvent(event: BcsEvent, state: MutableState): ResolvedEvent {
  const taken = takenFor(state, event.id, event.taken)
  return {
    ...event,
    organizationName: organizationName(event.organizationId),
    start: resolveDate(event.dayOffset, event.startHour),
    end: resolveDate(event.dayOffset, event.endHour),
    taken,
    remaining: Math.max(0, event.capacity - taken),
    isFull: taken >= event.capacity,
  }
}

export function publishedEvents(state: MutableState): ResolvedEvent[] {
  return EVENTS.filter(
    (e) =>
      e.status === 'published' &&
      !(e.organizationId && state.partnerRevoked.includes(e.organizationId)),
  )
    .map((e) => resolveEvent(e, state))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function findEvent(id: string, state: MutableState): ResolvedEvent | null {
  const match = EVENTS.find((e) => e.id === id)
  return match ? resolveEvent(match, state) : null
}

export function dropOffSlots(state: MutableState) {
  return DROP_OFF_SLOTS.map((slot) => ({
    ...slot,
    start: resolveDate(slot.dayOffset, slot.startHour),
    booked: slot.booked || state.bookedSlotIds.includes(slot.id),
  }))
}

/** Logged volunteer hours = sum of attended shifts (REQ-VOL-10). */
export function totalVolunteerHours(state: MutableState): number {
  return state.registrations.reduce((sum, reg) => {
    const status = state.attendance[reg.id] ?? reg.attendance
    if (status !== 'attended') return sum
    const opportunity = OPPORTUNITIES.find((o) => o.id === reg.opportunityId)
    const shift = opportunity?.shifts.find((s) => s.id === reg.shiftId)
    return sum + (shift ? Math.max(0, shift.endHour - shift.startHour) : 0)
  }, 0)
}

export function donationTotalCents(state: MutableState): number {
  return state.donations.reduce((sum, d) => sum + d.amountCents, 0)
}

/** Queue items with staff decisions applied (REQ-ADM-4). */
export function approvalQueue(state: MutableState) {
  return APPROVAL_ITEMS.map((item) => ({
    ...item,
    status: state.approvals[item.id] ?? item.status,
    rejectionReason: state.approvalReasons[item.id] ?? item.rejectionReason,
  }))
}

/** Member accounts with any staff suspension applied (REQ-ADM-1). */
export function memberAccounts(state: MutableState) {
  return MEMBER_ACCOUNTS.map((account) => ({
    ...account,
    status: state.accountStatus[account.id] ?? account.status,
  }))
}

export function staffAccounts(state: MutableState) {
  return [...STAFF_ACCOUNTS, ...state.staffAccounts]
}

/** Partner organisations with live listing counts and revocation applied. */
export function partnerOrganizations(state: MutableState) {
  return ORGANIZATIONS.map((organization) => {
    const revoked = state.partnerRevoked.includes(organization.id)
    const listings = OPPORTUNITIES.filter(
      (o) => o.organizationId === organization.id && o.status === 'published',
    ).length
    return {
      ...organization,
      revoked,
      activeListings: revoked ? 0 : listings,
    }
  })
}

/** Everything the demo partner owns: seeded listings plus anything created. */
export function partnerListings(state: MutableState) {
  const seeded = OPPORTUNITIES.filter((o) => o.organizationId === DEMO_PARTNER_ID).map((o) => ({
    id: o.id,
    title: o.title,
    kind: 'opportunity' as const,
    category: o.category as string,
    status: o.status,
    rejectionReason: null as string | null,
    capacity: o.shifts.reduce((sum, shift) => sum + shift.capacity, 0),
    filled: o.shifts.reduce(
      (sum, shift) => sum + Math.min(shift.capacity, shift.taken + (state.extraTaken[shift.id] ?? 0)),
      0,
    ),
    nextStart: resolveDate(o.shifts[0]?.dayOffset ?? 0, o.shifts[0]?.startHour ?? 0),
  }))

  const created = state.partnerListings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    kind: listing.kind,
    category: listing.category,
    status: listing.status,
    rejectionReason: listing.rejectionReason,
    capacity: listing.capacity,
    filled: 0,
    nextStart: resolveDate(listing.dayOffset, 9),
  }))

  return [...created, ...seeded]
}

/** The counts V-01 prints above the results list. */
export function catalogueSummary(state: MutableState) {
  const opportunities = publishedOpportunities(state)
  const orgs = new Set(opportunities.map((o) => o.organizationId))
  return { opportunityCount: opportunities.length, organizationCount: orgs.size }
}
