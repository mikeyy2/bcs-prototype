export type BadgeTone = 'green' | 'yellow' | 'red'

/**
 * The 19 badge labels used across the Figma screens, mapped to the three
 * colour components. Figma implies this mapping through usage but never
 * states it, so it is recorded here as the single source of truth.
 */
export const BADGE_TONES: Record<string, BadgeTone> = {
  Published: 'green',
  Active: 'green',
  Attended: 'green',
  Completed: 'green',
  'Verified partner': 'green',
  'EIN verified': 'green',
  Open: 'green',
  '42 seats left': 'green',
  'Pending approval': 'yellow',
  'Pending review': 'yellow',
  'Awaiting partner': 'yellow',
  New: 'yellow',
  'Not marked': 'yellow',
  'Drop-off Nov 4': 'yellow',
  Full: 'red',
  Rejected: 'red',
  Suspended: 'red',
  Revoked: 'red',
  'Not attended': 'red',
}

export function toneForLabel(label: string): BadgeTone {
  return BADGE_TONES[label] ?? 'yellow'
}
