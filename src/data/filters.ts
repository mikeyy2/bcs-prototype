/**
 * Opportunity search and filtering (REQ-VOL-2, REQ-VOL-3, WBS 1.1.1, 1.1.2).
 * Kept out of the component so S-01 can reuse the same matching rules.
 */
import type { ResolvedOpportunity } from './selectors'

export type OpportunityFilters = {
  search: string
  categories: string[]
  location: string
  from: string
  to: string
  organization: string
}

export const EMPTY_FILTERS: OpportunityFilters = {
  search: '',
  categories: [],
  location: '',
  from: '',
  to: '',
  organization: '',
}

export type SortOrder = 'soonest' | 'latest' | 'title'

/** REQ-VOL-2 — keyword matches title, organisation or category. */
export function matchesKeyword(opportunity: ResolvedOpportunity, keyword: string): boolean {
  const term = keyword.trim().toLowerCase()
  if (!term) return true
  return (
    opportunity.title.toLowerCase().includes(term) ||
    opportunity.organizationName.toLowerCase().includes(term) ||
    opportunity.category.toLowerCase().includes(term)
  )
}

function matchesLocation(opportunity: ResolvedOpportunity, location: string): boolean {
  const term = location.trim().toLowerCase()
  if (!term) return true
  return opportunity.city.toLowerCase().includes(term) || opportunity.zip.includes(term)
}

function matchesDateRange(opportunity: ResolvedOpportunity, from: string, to: string): boolean {
  if (!from && !to) return true
  const after = from ? new Date(`${from}T00:00:00`) : null
  const before = to ? new Date(`${to}T23:59:59`) : null
  return opportunity.shifts.some((shift) => {
    if (after && shift.start < after) return false
    if (before && shift.start > before) return false
    return true
  })
}

/** REQ-VOL-3 — filters combine with each other and with the keyword search. */
export function applyFilters(
  opportunities: ResolvedOpportunity[],
  filters: OpportunityFilters,
): ResolvedOpportunity[] {
  return opportunities.filter((opportunity) => {
    if (!matchesKeyword(opportunity, filters.search)) return false
    if (filters.categories.length && !filters.categories.includes(opportunity.category)) return false
    if (!matchesLocation(opportunity, filters.location)) return false
    if (!matchesDateRange(opportunity, filters.from, filters.to)) return false
    if (
      filters.organization.trim() &&
      !opportunity.organizationName.toLowerCase().includes(filters.organization.trim().toLowerCase())
    ) {
      return false
    }
    return true
  })
}

export function sortOpportunities(
  opportunities: ResolvedOpportunity[],
  order: SortOrder,
): ResolvedOpportunity[] {
  const copy = [...opportunities]
  if (order === 'title') return copy.sort((a, b) => a.title.localeCompare(b.title))
  const direction = order === 'latest' ? -1 : 1
  return copy.sort(
    (a, b) => direction * ((a.nextStart?.getTime() ?? 0) - (b.nextStart?.getTime() ?? 0)),
  )
}

export function activeFilterCount(filters: OpportunityFilters): number {
  return (
    filters.categories.length +
    (filters.location.trim() ? 1 : 0) +
    (filters.from || filters.to ? 1 : 0) +
    (filters.organization.trim() ? 1 : 0)
  )
}
