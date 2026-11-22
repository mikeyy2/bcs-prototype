import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import calendar from '../assets/icons/calendar.svg'
import check from '../assets/icons/check.svg'
import chevronRight from '../assets/icons/chevron-right.svg'
import heart from '../assets/icons/heart.svg'
import { Container } from '../components/layout/Container'
import { Button, Input } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatDate, formatTimeRange } from '../data/format'
import { matchesKeyword } from '../data/filters'
import { publishedEvents, publishedOpportunities } from '../data/selectors'
import styles from './Search.module.css'

type ResultType = 'opportunity' | 'event'
type Filter = 'all' | ResultType

type Result = {
  id: string
  type: ResultType
  title: string
  meta: string
  href: string
}

/**
 * Figma: S-01 Search Results (16:105). REQ-SRC-1, REQ-SRC-2, REQ-SRC-3.
 *
 * REQ-SRC-1 also names rental items and shuttle routes. Those services are
 * deferred (SRS TBD-8), so the search covers the two that exist and says so
 * rather than implying full coverage.
 */
export function Search() {
  const { state } = useData()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [draft, setDraft] = useState(query)
  const [filter, setFilter] = useState<Filter>('all')

  const results = useMemo<Result[]>(() => {
    if (!query.trim()) return []

    const opportunities = publishedOpportunities(state)
      .filter((opportunity) => matchesKeyword(opportunity, query))
      .map<Result>((opportunity) => ({
        id: opportunity.id,
        type: 'opportunity',
        title: opportunity.title,
        meta: `${opportunity.organizationName} · ${opportunity.city}, IA ${opportunity.zip}`,
        href: `/volunteer/${opportunity.id}`,
      }))

    const term = query.trim().toLowerCase()
    const events = publishedEvents(state)
      .filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.category.toLowerCase().includes(term) ||
          (event.organizationName ?? '').toLowerCase().includes(term),
      )
      .map<Result>((event) => ({
        id: event.id,
        type: 'event',
        title: event.title,
        meta: `${formatDate(event.start)} · ${formatTimeRange(event.start, event.end)} · ${event.space}`,
        href: `/events/${event.id}`,
      }))

    return [...opportunities, ...events]
  }, [state, query])

  const counts = {
    all: results.length,
    opportunity: results.filter((r) => r.type === 'opportunity').length,
    event: results.filter((r) => r.type === 'event').length,
  }

  const visible = filter === 'all' ? results : results.filter((r) => r.type === filter)

  const chips: [Filter, string][] = [
    ['all', `All (${counts.all})`],
    ['opportunity', `Opportunities (${counts.opportunity})`],
    ['event', `Events (${counts.event})`],
  ]

  return (
    <Container className={styles.page}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          setParams(draft.trim() ? { q: draft.trim() } : {})
          setFilter('all')
        }}
      >
        <Input
          className={styles.field}
          label="Search opportunities and events"
          type="search"
          placeholder="food"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>

      {query.trim() ? (
        <>
          <h1 className={styles.count}>
            {counts.all} result{counts.all === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </h1>

          <div className={styles.chips} role="group" aria-label="Narrow results by type">
            {chips.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={[styles.chip, filter === key ? styles.chipActive : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {filter === key ? <img className={styles.chipIcon} src={check} alt="" /> : null}
                {label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No matches</p>
              <p className={styles.emptyBody}>
                Nothing matched &ldquo;{query}&rdquo;. Try a shorter word, an organisation name,
                or a category such as Food Security.
              </p>
            </div>
          ) : (
            <div className={styles.results}>
              {visible.map((result, index) => (
                <div key={`${result.type}-${result.id}`}>
                  {index > 0 ? <hr className={styles.divider} /> : null}
                  <Link className={styles.result} to={result.href}>
                    <span className={styles.avatar} aria-hidden="true">
                      <img
                        className={styles.avatarIcon}
                        src={result.type === 'event' ? calendar : heart}
                        alt=""
                      />
                    </span>
                    <span className={styles.stack}>
                      <span className={styles.tag}>
                        {result.type === 'event' ? 'Event' : 'Opportunity'}
                      </span>
                      <span className={styles.title}>{result.title}</span>
                      <span className={styles.meta}>{result.meta}</span>
                    </span>
                    <img className={styles.chevron} src={chevronRight} alt="" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <p className={styles.deferred}>
            Search covers volunteer opportunities and public events. Rental items and shuttle
            routes are part of the deferred services and are not in this prototype.
          </p>
        </>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Search BCS</p>
          <p className={styles.emptyBody}>
            One search box covers volunteer opportunities and public events. Try an
            organisation, a category, or a word from a title.
          </p>
        </div>
      )}
    </Container>
  )
}
