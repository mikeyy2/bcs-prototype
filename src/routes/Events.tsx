import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import check from '../assets/icons/check.svg'
import chevronLeft from '../assets/icons/chevron-left.svg'
import chevronRight from '../assets/icons/chevron-right.svg'
import info from '../assets/icons/info.svg'
import { Container } from '../components/layout/Container'
import { EventDivider, EventRow } from '../components/content/EventRow'
import { BCS_TIMEZONE } from '../data/format'
import { useData } from '../data/dataContext'
import { publishedEvents } from '../data/selectors'
import type { ResolvedEvent } from '../data/selectors'
import type { EventCategory } from '../data/types'
import styles from './Events.module.css'

/** REQ-EVT-1 names these five; Figma's chips predate the SRS (DEVIATION EVT-1). */
const CATEGORIES: EventCategory[] = [
  'community meeting',
  'celebration',
  'memorial service',
  'fundraiser',
  'partner event',
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Day number in BCS local time, so the grid never slips across the timezone. */
function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BCS_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { year: get('year'), month: get('month'), day: get('day') }
}

/** Figma: E-01 Events Calendar (16:111). REQ-EVT-1, REQ-EVT-13. */
export function Events() {
  const { state } = useData()
  const [offset, setOffset] = useState(0)
  const [category, setCategory] = useState<EventCategory | 'all'>('all')

  const events = useMemo(() => publishedEvents(state), [state])

  const filtered = useMemo(
    () => (category === 'all' ? events : events.filter((e) => e.category === category)),
    [events, category],
  )

  const [today] = useState(() => new Date())
  const viewed = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const year = viewed.getFullYear()
  const month = viewed.getMonth()

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    viewed,
  )

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: { day: number | null; events: ResolvedEvent[] }[] = []
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, events: [] })
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      events: filtered.filter((event) => {
        const parts = localParts(event.start)
        return parts.year === year && parts.month === month + 1 && parts.day === day
      }),
    })
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, events: [] })

  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

  const monthEvents = filtered.filter((event) => {
    const parts = localParts(event.start)
    return parts.year === year && parts.month === month + 1
  })

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Events</span>
      </nav>

      <div>
        <h1 className={styles.title}>Community events</h1>
        <p className={styles.lede}>
          Dinners, drives, workshops and family days hosted by BCS and our partners.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.monthButton}
            onClick={() => setOffset(offset - 1)}
            aria-label="Previous month"
          >
            <img className={styles.monthIcon} src={chevronLeft} alt="" />
          </button>
          <span className={styles.monthLabel} role="status">
            {monthLabel}
          </span>
          <button
            type="button"
            className={styles.monthButton}
            onClick={() => setOffset(offset + 1)}
            aria-label="Next month"
          >
            <img className={styles.monthIcon} src={chevronRight} alt="" />
          </button>
        </div>

        <div className={styles.chips} role="group" aria-label="Filter by category">
          <button
            type="button"
            className={[styles.chip, category === 'all' ? styles.chipActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
          >
            {category === 'all' ? <img className={styles.chipIcon} src={check} alt="" /> : null}
            All categories
          </button>
          {CATEGORIES.map((option) => (
            <button
              key={option}
              type="button"
              className={[styles.chip, category === option ? styles.chipActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setCategory(option)}
              aria-pressed={category === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.weekdays}>
          {WEEKDAYS.map((weekday) => (
            <span className={styles.weekday} key={weekday}>
              {weekday}
            </span>
          ))}
        </div>
        {weeks.map((week, index) => (
          <div className={styles.week} key={index}>
            {week.map((cell, cellIndex) => (
              <div
                className={[styles.day, cell.day ? '' : styles.dayOutside].filter(Boolean).join(' ')}
                key={cellIndex}
              >
                {cell.day ? <span className={styles.dayNumber}>{cell.day}</span> : null}
                {cell.events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className={[styles.pill, event.isFull ? styles.pillFull : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {event.title}
                    {event.isFull ? ' · Full' : ''}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.listFallback}>
        {monthEvents.length === 0 ? (
          <p className={styles.meta} style={{ padding: '24px 0' }}>
            No events this month in this category.
          </p>
        ) : (
          monthEvents.map((event, index) => (
            <div key={event.id}>
              {index > 0 ? <EventDivider /> : null}
              <EventRow event={event} />
            </div>
          ))
        )}
      </div>

      <p className={styles.meta}>
        <img className={styles.metaIcon} src={info} alt="" />
        Select an event to see details and RSVP. Events marked Full no longer accept sign-ups.
      </p>
    </Container>
  )
}
