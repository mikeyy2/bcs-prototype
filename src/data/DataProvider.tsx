import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DataContext } from './dataContext'
import type { DataContextValue, DonateInput, InKindInput, RegisterResult, RsvpResult } from './dataContext'
import * as mail from './emails'
import { resolveDate } from './format'
import { APPROVAL_ITEMS, DEMO_PARTNER_ID, DROP_OFF_SLOTS } from './seed'
import { clearState, emptyState, loadState, newId, newPaymentReference, saveState } from './store'
import { findEvent, findOpportunity } from './selectors'
import type { MemberAccount, MutableState, NotificationPrefs, Profile, StaffAccount } from './types'

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MutableState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  /** Reminders are suppressed when the visitor turns them off (REQ-PRF-2). */
  const queue = useCallback(
    (current: MutableState, drafts: ReturnType<typeof mail.withId>[]): MutableState => ({
      ...current,
      outbox: [
        ...current.outbox,
        ...drafts.filter((d) => !d.scheduled || current.notifications.reminders),
      ],
    }),
    [],
  )

  const register = useCallback<DataContextValue['register']>(
    (opportunityId, shiftId) => {
      let result: RegisterResult = { ok: false, reason: 'full' }

      setState((current) => {
        if (current.registrations.some((r) => r.shiftId === shiftId)) {
          result = { ok: false, reason: 'already-registered' }
          return current
        }

        const opportunity = findOpportunity(opportunityId, current)
        const shift = opportunity?.shifts.find((s) => s.id === shiftId)
        if (!opportunity || !shift || shift.isFull) {
          result = { ok: false, reason: 'full' }
          return current
        }

        const id = newId('reg')
        result = { ok: true, registrationId: id }

        const next: MutableState = {
          ...current,
          registrations: [
            ...current.registrations,
            { id, opportunityId, shiftId, attendance: 'not-marked', createdAt: new Date().toISOString() },
          ],
          extraTaken: { ...current.extraTaken, [shiftId]: (current.extraTaken[shiftId] ?? 0) + 1 },
        }

        return queue(next, [
          mail.withId(mail.registrationConfirmation(next.profile.email, opportunity.title, shift.start)),
          mail.withId(mail.shiftReminder(next.profile.email, opportunity.title, shift.start)),
        ])
      })

      return result
    },
    [queue],
  )

  const cancelRegistration = useCallback<DataContextValue['cancelRegistration']>((registrationId) => {
    setState((current) => {
      const registration = current.registrations.find((r) => r.id === registrationId)
      if (!registration) return current
      const shiftId = registration.shiftId
      return {
        ...current,
        registrations: current.registrations.filter((r) => r.id !== registrationId),
        extraTaken: {
          ...current.extraTaken,
          [shiftId]: Math.max(0, (current.extraTaken[shiftId] ?? 0) - 1),
        },
      }
    })
  }, [])

  const rsvp = useCallback<DataContextValue['rsvp']>(
    (eventId, guests) => {
      let result: RsvpResult = { ok: false, reason: 'full' }

      setState((current) => {
        if (current.rsvps.some((r) => r.eventId === eventId)) {
          result = { ok: false, reason: 'already-rsvped' }
          return current
        }

        const event = findEvent(eventId, current)
        const seats = 1 + guests
        if (!event || event.remaining < seats) {
          result = { ok: false, reason: 'full' }
          return current
        }

        const id = newId('rsvp')
        result = { ok: true, rsvpId: id }

        const next: MutableState = {
          ...current,
          rsvps: [...current.rsvps, { id, eventId, guests, createdAt: new Date().toISOString() }],
          extraTaken: { ...current.extraTaken, [eventId]: (current.extraTaken[eventId] ?? 0) + seats },
        }

        return queue(next, [
          mail.withId(mail.rsvpConfirmation(next.profile.email, event.title, event.start, guests)),
          mail.withId(mail.eventReminder(next.profile.email, event.title, event.start)),
        ])
      })

      return result
    },
    [queue],
  )

  const cancelRsvp = useCallback<DataContextValue['cancelRsvp']>((rsvpId) => {
    setState((current) => {
      const entry = current.rsvps.find((r) => r.id === rsvpId)
      if (!entry) return current
      const seats = 1 + entry.guests
      return {
        ...current,
        rsvps: current.rsvps.filter((r) => r.id !== rsvpId),
        extraTaken: {
          ...current.extraTaken,
          [entry.eventId]: Math.max(0, (current.extraTaken[entry.eventId] ?? 0) - seats),
        },
      }
    })
  }, [])

  const donate = useCallback<DataContextValue['donate']>(
    (input: DonateInput) => {
      const donationId = newId('don')
      const reference = newPaymentReference()

      setState((current) => {
        // REQ-DON-3: an anonymous gift is stored as "Anonymous" everywhere.
        const donorName = input.anonymous ? 'Anonymous' : input.name.trim() || 'Anonymous'
        // REQ-DON-4: no email means no receipt and no personal data kept.
        const donorEmail = input.email.trim() ? input.email.trim() : null

        const next: MutableState = {
          ...current,
          donations: [
            ...current.donations,
            {
              id: donationId,
              amountCents: input.amountCents,
              anonymous: input.anonymous,
              donorName,
              donorEmail,
              reference,
              createdAt: new Date().toISOString(),
            },
          ],
        }

        if (!donorEmail) return next
        return queue(next, [
          mail.withId(mail.donationReceipt(donorEmail, donorName, input.amountCents, reference)),
        ])
      })

      return { donationId, reference }
    },
    [queue],
  )

  const submitInKind = useCallback<DataContextValue['submitInKind']>(
    (input: InKindInput) => {
      const offerId = newId('ink')

      setState((current) => {
        const next: MutableState = {
          ...current,
          inKindOffers: [
            ...current.inKindOffers,
            {
              id: offerId,
              category: input.category,
              description: input.description,
              quantity: input.quantity,
              condition: input.condition,
              photoName: input.photoName,
              dropOffSlotId: input.slotId,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
          ],
          bookedSlotIds: input.slotId
            ? [...current.bookedSlotIds, input.slotId]
            : current.bookedSlotIds,
        }

        const drafts = [mail.withId(mail.inKindSubmitted(next.profile.email, input.description))]
        const slot = DROP_OFF_SLOTS.find((s) => s.id === input.slotId)
        if (slot) {
          drafts.push(
            mail.withId(mail.dropOffBooked(next.profile.email, resolveDate(slot.dayOffset, slot.startHour))),
          )
        }

        return queue(next, drafts)
      })

      return { offerId }
    },
    [queue],
  )

  const markAttendance = useCallback<DataContextValue['markAttendance']>((registrationId, status) => {
    setState((current) => ({
      ...current,
      attendance: { ...current.attendance, [registrationId]: status },
    }))
  }, [])

  const updateProfile = useCallback((profile: Partial<Profile>) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...profile } }))
  }, [])

  const setNotifications = useCallback((prefs: Partial<NotificationPrefs>) => {
    setState((current) => ({ ...current, notifications: { ...current.notifications, ...prefs } }))
  }, [])

  /** REQ-PRF-3 — donation records survive, with the name replaced. */
  const deleteAccount = useCallback(() => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, deleted: true, name: 'Deleted user' },
      donations: current.donations.map((d) => ({
        ...d,
        donorName: d.anonymous ? 'Anonymous' : 'Deleted user',
      })),
    }))
  }, [])

  /** REQ-ADM-4 — every rejection carries a reason, and the reason is emailed. */
  const decideApproval = useCallback<DataContextValue['decideApproval']>(
    (itemId, decision, reason) => {
      setState((current) => {
        const item = APPROVAL_ITEMS.find((i) => i.id === itemId)
        const next: MutableState = {
          ...current,
          approvals: { ...current.approvals, [itemId]: decision },
          approvalReasons:
            decision === 'rejected' && reason
              ? { ...current.approvalReasons, [itemId]: reason }
              : current.approvalReasons,
        }

        if (!item) return next
        return queue(next, [
          mail.withId({
            to: 'partner@example.org',
            subject:
              decision === 'approved'
                ? `Approved: ${item.title}`
                : `Not approved: ${item.title}`,
            template: `approval-${decision}`,
            body:
              decision === 'approved'
                ? `${item.title} has been approved and is now live.`
                : `${item.title} was not approved. Reason: ${reason ?? 'none given'}`,
            sendAt: new Date().toISOString(),
            scheduled: false,
          }),
        ])
      })
    },
    [queue],
  )

  const setAccountStatus = useCallback(
    (accountId: string, status: MemberAccount['status']) => {
      setState((current) => ({
        ...current,
        accountStatus: { ...current.accountStatus, [accountId]: status },
      }))
    },
    [],
  )

  /** REQ-ADM-2 — revoking unpublishes every listing from that partner. */
  const setPartnerRevoked = useCallback((organizationId: string, revoked: boolean) => {
    setState((current) => ({
      ...current,
      partnerRevoked: revoked
        ? [...new Set([...current.partnerRevoked, organizationId])]
        : current.partnerRevoked.filter((id) => id !== organizationId),
    }))
  }, [])

  const addStaffAccount = useCallback((account: Omit<StaffAccount, 'id'>) => {
    setState((current) => ({
      ...current,
      staffAccounts: [...current.staffAccounts, { ...account, id: newId('staff') }],
    }))
  }, [])

  const setStaffActive = useCallback((staffId: string, active: boolean) => {
    setState((current) => ({
      ...current,
      staffAccounts: current.staffAccounts.map((s) =>
        s.id === staffId ? { ...s, active } : s,
      ),
    }))
  }, [])

  /** REQ-PRT-4 / REQ-PRT-5 — a new listing is pending until staff approve it. */
  const createListing = useCallback<DataContextValue['createListing']>((input) => {
    const listingId = newId('listing')
    setState((current) => ({
      ...current,
      partnerListings: [
        ...current.partnerListings,
        {
          id: listingId,
          title: input.title,
          kind: input.kind,
          category: input.category,
          organizationId: DEMO_PARTNER_ID,
          dayOffset: input.dayOffset,
          capacity: input.capacity,
          status: 'pending',
          rejectionReason: null,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
    return { listingId }
  }, [])

  const resetDemoData = useCallback(() => {
    clearState()
    setState(emptyState())
  }, [])

  const value = useMemo<DataContextValue>(
    () => ({
      state,
      register,
      cancelRegistration,
      rsvp,
      cancelRsvp,
      donate,
      submitInKind,
      markAttendance,
      updateProfile,
      setNotifications,
      deleteAccount,
      resetDemoData,
      decideApproval,
      setAccountStatus,
      setPartnerRevoked,
      addStaffAccount,
      setStaffActive,
      createListing,
    }),
    [
      state,
      register,
      cancelRegistration,
      rsvp,
      cancelRsvp,
      donate,
      submitInKind,
      markAttendance,
      updateProfile,
      setNotifications,
      deleteAccount,
      resetDemoData,
      decideApproval,
      setAccountStatus,
      setPartnerRevoked,
      addStaffAccount,
      setStaffActive,
      createListing,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
