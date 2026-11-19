import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import chevronLeft from '../assets/icons/chevron-left.svg'
import chevronRight from '../assets/icons/chevron-right.svg'
import filterIcon from '../assets/icons/filter.svg'
import xIcon from '../assets/icons/x.svg'
import { Container } from '../components/layout/Container'
import { OpportunityCard } from '../components/content/OpportunityCard'
import { Button, Input } from '../components/ui'
import { useData } from '../data/dataContext'
import { EMPTY_FILTERS, activeFilterCount, applyFilters, sortOpportunities } from '../data/filters'
import type { OpportunityFilters, SortOrder } from '../data/filters'
import { catalogueSummary, publishedOpportunities } from '../data/selectors'
import type { OpportunityCategory } from '../data/types'
import styles from './Volunteer.module.css'

/** Figma draws five; the sixth exists in the catalogue, so the list is derived. */
const CATEGORIES: OpportunityCategory[] = [
  'Food Security',
  'Youth & Education',
  'Environment',
  'Health & Seniors',
  'Animal Welfare',
  'Community Events',
]

/**
 * REQ-VOL-1 sets 20 per page. Figma's pagination shows four cards per page,
 * which is a layout choice; the requirement governs behaviour.
 */
const PAGE_SIZE = 20

/** Figma: V-01 Volunteer Opportunities (16:108). */
export function Volunteer() {
  const { state } = useData()
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortOrder>('soonest')
  const [page, setPage] = useState(1)

  const all = useMemo(() => publishedOpportunities(state), [state])
  const summary = useMemo(() => catalogueSummary(state), [state])

  const matched = useMemo(
    () => sortOpportunities(applyFilters(all, filters), sort),
    [all, filters, sort],
  )

  const pageCount = Math.max(1, Math.ceil(matched.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * PAGE_SIZE
  const visible = matched.slice(start, start + PAGE_SIZE)

  const update = (patch: Partial<OpportunityFilters>) => {
    setFilters((previous) => ({ ...previous, ...patch }))
    setPage(1)
  }

  const toggleCategory = (category: string) =>
    update({
      categories: filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    })

  const chips: { label: string; clear: () => void }[] = [
    ...filters.categories.map((category) => ({
      label: category,
      clear: () => toggleCategory(category),
    })),
    ...(filters.location.trim()
      ? [{ label: filters.location.trim(), clear: () => update({ location: '' }) }]
      : []),
    ...(filters.from || filters.to
      ? [
          {
            label: `${filters.from || 'any'} – ${filters.to || 'any'}`,
            clear: () => update({ from: '', to: '' }),
          },
        ]
      : []),
    ...(filters.organization.trim()
      ? [{ label: filters.organization.trim(), clear: () => update({ organization: '' }) }]
      : []),
  ]

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Volunteer opportunities</span>
      </nav>

      <div>
        <h1 className={styles.title}>Volunteer opportunities</h1>
        <p className={styles.count}>
          {summary.opportunityCount} active opportunities from {summary.organizationCount} partner
          organizations
        </p>
      </div>

      <div className={styles.layout}>
        <form
          className={styles.filters}
          aria-label="Filter opportunities"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className={styles.filtersHead}>
            <span className={styles.filtersTitle}>
              <img className={styles.filtersIcon} src={filterIcon} alt="" />
              Filters
            </span>
            <button
              type="button"
              className={styles.clearAll}
              onClick={() => {
                setFilters(EMPTY_FILTERS)
                setPage(1)
              }}
            >
              Clear all
            </button>
          </div>

          <hr className={styles.divider} />

          <fieldset className={styles.group} style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className={styles.groupTitle}>Category</legend>
            {CATEGORIES.map((category) => (
              <label className={styles.check} key={category}>
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            ))}
          </fieldset>

          <hr className={styles.divider} />

          <Input
            label="Location (city or ZIP)"
            placeholder="Ames or 50010"
            value={filters.location}
            onChange={(event) => update({ location: event.target.value })}
          />

          <div className={styles.dates}>
            <Input
              label="From"
              type="date"
              value={filters.from}
              onChange={(event) => update({ from: event.target.value })}
            />
            <Input
              label="To"
              type="date"
              value={filters.to}
              onChange={(event) => update({ to: event.target.value })}
            />
          </div>

          <Input
            label="Partner organization"
            placeholder="Any organization"
            value={filters.organization}
            onChange={(event) => update({ organization: event.target.value })}
          />

          <Button type="submit" fullWidth>
            Apply filters
          </Button>
        </form>

        <div className={styles.results}>
          <div className={styles.toolbar}>
            <Input
              className={styles.search}
              label="Search by title, organization, or category"
              type="search"
              placeholder="Food pantry"
              value={filters.search}
              onChange={(event) => update({ search: event.target.value })}
            />
            <label className={styles.sortField}>
              Sort
              <select
                className={styles.sort}
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOrder)}
              >
                <option value="soonest">Soonest first</option>
                <option value="latest">Latest first</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>

          {chips.length ? (
            <div className={styles.chips}>
              <span>Active filters:</span>
              {chips.map((chip) => (
                <button type="button" className={styles.chip} key={chip.label} onClick={chip.clear}>
                  {chip.label}
                  <img className={styles.chipIcon} src={xIcon} alt="" />
                  <span className="srOnly">Remove filter</span>
                </button>
              ))}
            </div>
          ) : null}

          <p className={styles.showing} role="status">
            {matched.length === 0
              ? 'No opportunities match these filters'
              : `Showing ${start + 1}–${start + visible.length} of ${matched.length} opportunities${
                  activeFilterCount(filters) || filters.search ? ' matching all filters' : ''
                }`}
          </p>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Nothing matches yet</p>
              <p className={styles.emptyBody}>
                Try removing a filter or widening the date range. Clearing the category list
                usually brings back the most results.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters(EMPTY_FILTERS)
                  setPage(1)
                }}
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={styles.grid}>
              {visible.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}

          {pageCount > 1 ? (
            <nav className={styles.pagination} aria-label="Pagination">
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label="Previous page"
              >
                <img className={styles.pageIcon} src={chevronLeft} alt="" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
                <button
                  type="button"
                  key={number}
                  className={[styles.pageButton, number === current ? styles.pageCurrent : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setPage(number)}
                  aria-current={number === current ? 'page' : undefined}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage(current + 1)}
                disabled={current === pageCount}
                aria-label="Next page"
              >
                <img className={styles.pageIcon} src={chevronRight} alt="" />
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  )
}
