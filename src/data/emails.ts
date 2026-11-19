/**
 * Mock transactional email (WBS 9.3.1, 9.3.2 — REQ-NTF-1, REQ-NTF-2).
 *
 * Nothing is sent. Each triggering action appends an entry to the outbox,
 * which the visitor can open from any screen. Reminders are written at the
 * same moment but dated 24 hours before the booking, which is how the
 * "24 hours before" rule is demonstrated without a scheduler.
 */
import { formatDateTime, formatMoney } from './format'
import { newId } from './store'
import type { OutboxEmail } from './types'

type Draft = Omit<OutboxEmail, 'id'>

function now(): string {
  return new Date().toISOString()
}

/** 24 hours before the booking (REQ-NTF-2). */
function dayBefore(when: Date): string {
  return new Date(when.getTime() - 24 * 3_600_000).toISOString()
}

export function registrationConfirmation(to: string, title: string, when: Date): Draft {
  return {
    to,
    subject: `You're signed up: ${title}`,
    template: 'volunteer-registration-confirmation',
    body: `Thanks for signing up for ${title} on ${formatDateTime(when)}. Reply to this email if your plans change — you can cancel up to 24 hours beforehand.`,
    sendAt: now(),
    scheduled: false,
  }
}

export function shiftReminder(to: string, title: string, when: Date): Draft {
  return {
    to,
    subject: `Reminder: ${title} tomorrow`,
    template: 'volunteer-shift-reminder',
    body: `This is a reminder that ${title} starts at ${formatDateTime(when)}.`,
    sendAt: dayBefore(when),
    scheduled: true,
  }
}

export function rsvpConfirmation(to: string, title: string, when: Date, guests: number): Draft {
  return {
    to,
    subject: `RSVP confirmed: ${title}`,
    template: 'event-rsvp-confirmation',
    body: `You have a place at ${title} on ${formatDateTime(when)}${
      guests > 0 ? `, plus ${guests} guest${guests === 1 ? '' : 's'}` : ''
    }.`,
    sendAt: now(),
    scheduled: false,
  }
}

export function eventReminder(to: string, title: string, when: Date): Draft {
  return {
    to,
    subject: `Reminder: ${title} tomorrow`,
    template: 'event-reminder',
    body: `${title} starts at ${formatDateTime(when)}. We look forward to seeing you.`,
    sendAt: dayBefore(when),
    scheduled: true,
  }
}

/** REQ-DON-5 — receipt carries donor name, amount, date, tax ID and reference. */
export function donationReceipt(
  to: string,
  donorName: string,
  amountCents: number,
  reference: string,
): Draft {
  return {
    to,
    subject: `Your donation receipt — ${formatMoney(amountCents)}`,
    template: 'donation-receipt',
    body: [
      `Donor: ${donorName}`,
      `Amount: ${formatMoney(amountCents)}`,
      `Date: ${formatDateTime(new Date())}`,
      `BCS tax ID: TBD-6 (not yet supplied by the customer)`,
      `Transaction reference: ${reference}`,
      '',
      'No goods or services were received in exchange for this gift.',
    ].join('\n'),
    sendAt: now(),
    scheduled: false,
  }
}

export function inKindSubmitted(to: string, description: string): Draft {
  return {
    to,
    subject: 'We received your donation offer',
    template: 'in-kind-submitted',
    body: `Thanks for offering ${description}. BCS staff review offers before arranging a drop-off, and you'll hear back shortly.`,
    sendAt: now(),
    scheduled: false,
  }
}

export function dropOffBooked(to: string, when: Date): Draft {
  return {
    to,
    subject: 'Drop-off time confirmed',
    template: 'in-kind-dropoff-confirmed',
    body: `Your drop-off is booked for ${formatDateTime(when)} at the BCS building.`,
    sendAt: now(),
    scheduled: false,
  }
}

export function withId(draft: Draft): OutboxEmail {
  return { ...draft, id: newId('mail') }
}
