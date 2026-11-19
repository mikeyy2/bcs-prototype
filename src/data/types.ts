/** Entity shapes, following the SRS §6.2 data groups for the in-scope services. */

export type Organization = {
  id: string
  name: string
  mission: string
  serviceArea: string
  contactEmail: string
  ein: string
  verified: boolean
}

export type Shift = {
  id: string
  /** Days from today; resolved to a real date at load so the demo never goes stale. */
  dayOffset: number
  startHour: number
  endHour: number
  capacity: number
  /** Seeded take-up before the visitor does anything. */
  taken: number
}

export type Opportunity = {
  id: string
  title: string
  organizationId: string
  category: OpportunityCategory
  city: string
  zip: string
  summary: string
  description: string
  skills: string[]
  shifts: Shift[]
  /** Partner-submitted listings wait for staff approval (REQ-PRT-5). */
  status: ListingStatus
}

export type OpportunityCategory =
  | 'Food Security'
  | 'Youth & Education'
  | 'Environment'
  | 'Seniors'
  | 'Animal Welfare'
  | 'Community Events'

export type ListingStatus = 'published' | 'pending' | 'rejected'

export type EventCategory =
  | 'community meeting'
  | 'celebration'
  | 'memorial service'
  | 'fundraiser'
  | 'partner event'

export type BcsEvent = {
  id: string
  title: string
  category: EventCategory
  organizationId: string | null
  dayOffset: number
  startHour: number
  endHour: number
  space: string
  capacity: number
  taken: number
  guestLimit: number
  summary: string
  description: string
  accessibility: string
  shuttle: boolean
  status: ListingStatus
}

export type Registration = {
  id: string
  opportunityId: string
  shiftId: string
  /** 'not-marked' until a partner or staff member records attendance (REQ-VOL-9). */
  attendance: 'not-marked' | 'attended' | 'no-show'
  createdAt: string
}

export type Rsvp = {
  id: string
  eventId: string
  guests: number
  createdAt: string
}

export type Donation = {
  id: string
  amountCents: number
  anonymous: boolean
  donorName: string
  donorEmail: string | null
  /** Mock processor reference — no real transaction exists. */
  reference: string
  createdAt: string
}

export type InKindOffer = {
  id: string
  category: string
  description: string
  quantity: number
  condition: string
  photoName: string | null
  dropOffSlotId: string | null
  status: 'pending' | 'approved' | 'declined'
  createdAt: string
}

export type DropOffSlot = {
  id: string
  dayOffset: number
  startHour: number
  booked: boolean
}

export type OutboxEmail = {
  id: string
  to: string
  subject: string
  template: string
  body: string
  /** ISO string. Reminders are dated 24h before their booking (REQ-NTF-2). */
  sendAt: string
  scheduled: boolean
}

export type ApprovalItem = {
  id: string
  kind: 'partner application' | 'listing' | 'profile edit' | 'in-kind offer'
  title: string
  organizationName: string
  submittedDayOffset: number
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
}

/** Everything the visitor changes. Merged over the seed and kept in localStorage. */
export type MutableState = {
  registrations: Registration[]
  rsvps: Rsvp[]
  donations: Donation[]
  inKindOffers: InKindOffer[]
  outbox: OutboxEmail[]
  /** Capacity already consumed by this visitor, keyed by shift or event id. */
  extraTaken: Record<string, number>
  bookedSlotIds: string[]
  approvals: Record<string, ApprovalItem['status']>
  attendance: Record<string, Registration['attendance']>
  profile: Profile
  notifications: NotificationPrefs
}

export type Profile = {
  name: string
  email: string
  phone: string
  address: string
  skills: string
  availability: string
  deleted: boolean
}

export type NotificationPrefs = {
  reminders: boolean
  newsletter: boolean
}
