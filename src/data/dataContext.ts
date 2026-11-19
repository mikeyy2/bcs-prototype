import { createContext, useContext } from 'react'
import type { MutableState, NotificationPrefs, Profile } from './types'

export type RegisterResult =
  | { ok: true; registrationId: string }
  | { ok: false; reason: 'full' | 'already-registered' }

export type RsvpResult = { ok: true; rsvpId: string } | { ok: false; reason: 'full' | 'already-rsvped' }

export type DonateInput = {
  amountCents: number
  anonymous: boolean
  name: string
  email: string
}

export type InKindInput = {
  category: string
  description: string
  quantity: number
  condition: string
  photoName: string | null
  slotId: string | null
}

export type DataContextValue = {
  state: MutableState
  register: (opportunityId: string, shiftId: string) => RegisterResult
  cancelRegistration: (registrationId: string) => void
  rsvp: (eventId: string, guests: number) => RsvpResult
  cancelRsvp: (rsvpId: string) => void
  donate: (input: DonateInput) => { donationId: string; reference: string }
  submitInKind: (input: InKindInput) => { offerId: string }
  markAttendance: (registrationId: string, status: 'attended' | 'no-show') => void
  updateProfile: (profile: Partial<Profile>) => void
  setNotifications: (prefs: Partial<NotificationPrefs>) => void
  deleteAccount: () => void
  resetDemoData: () => void
}

export const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
  const value = useContext(DataContext)
  if (!value) throw new Error('useData must be used inside <DataProvider>')
  return value
}
