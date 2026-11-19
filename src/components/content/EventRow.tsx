import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/arrow-right.svg'
import { BCS_TIMEZONE, formatTime } from '../../data/format'
import type { ResolvedEvent } from '../../data/selectors'
import { Badge } from '../ui'
import styles from './EventRow.module.css'

function monthShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: BCS_TIMEZONE, month: 'short' })
    .format(date)
    .toUpperCase()
}

function dayNumber(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: BCS_TIMEZONE, day: 'numeric' }).format(date)
}

/** Figma: Event Row (17:203), used on C-01 and E-01. */
export function EventRow({ event }: { event: ResolvedEvent }) {
  return (
    <Link className={styles.row} to={`/events/${event.id}`}>
      <div className={styles.date} aria-hidden="true">
        <span className={styles.month}>{monthShort(event.start)}</span>
        <span className={styles.day}>{dayNumber(event.start)}</span>
      </div>

      <div className={styles.stack}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.where}>
          {event.space} · {formatTime(event.start)}
        </p>
      </div>

      <Badge tone={event.isFull ? 'red' : 'green'}>
        {event.isFull ? 'Full' : `${event.remaining} seats left`}
      </Badge>

      <span className={styles.details}>
        Details
        <img className={styles.detailsIcon} src={arrowRight} alt="" />
      </span>
    </Link>
  )
}

export function EventDivider() {
  return <hr className={styles.divider} />
}
