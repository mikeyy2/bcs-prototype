import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import building from '../assets/icons/building.svg'
import calendar from '../assets/icons/calendar.svg'
import check from '../assets/icons/check.svg'
import clock from '../assets/icons/clock.svg'
import pin from '../assets/icons/pin.svg'
import users from '../assets/icons/users.svg'
import x from '../assets/icons/x.svg'
import { useRole } from '../app/roleContext'
import { isSignedIn } from '../app/roles'
import { Container } from '../components/layout/Container'
import { ImagePlaceholder } from '../components/content/ImagePlaceholder'
import { Button, Input, MockLabel } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatLongDate, formatTime, formatTimeRange } from '../data/format'
import { findEvent } from '../data/selectors'
import styles from './EventDetail.module.css'

/**
 * Figma: E-02 Event Detail & RSVP (16:112) with the E-02a confirmation
 * overlay (16:113). The design draws the normal and Full states side by side;
 * here one renders according to live capacity.
 *
 * REQ-EVT-2 detail fields, REQ-EVT-3 RSVP with guests, REQ-EVT-4 capacity.
 */
export function EventDetail() {
  const { id = '' } = useParams()
  const { state, rsvp } = useData()
  const { role } = useRole()
  const navigate = useNavigate()

  const [guests, setGuests] = useState('0')
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const event = findEvent(id, state)

  useEffect(() => {
    if (!confirmed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmed])

  if (!event) return <Navigate to="/events" replace />

  const alreadyRsvped = state.rsvps.some((r) => r.eventId === event.id)
  const taken = Math.min(event.taken, event.capacity)
  const percent = Math.round((taken / event.capacity) * 100)

  const onRsvp = () => {
    setError(null)

    if (!isSignedIn(role)) {
      navigate('/login', { state: { from: `/events/${event.id}`, needs: ['volunteer'] } })
      return
    }

    const count = Number(guests)
    if (!Number.isInteger(count) || count < 0) {
      setError('Enter a whole number of guests, or 0.')
      return
    }
    if (count > event.guestLimit) {
      setError(
        event.guestLimit === 0
          ? 'This event does not allow extra guests.'
          : `This event allows up to ${event.guestLimit} guests.`,
      )
      return
    }

    const result = rsvp(event.id, count)
    if (!result.ok) {
      setError(
        result.reason === 'already-rsvped'
          ? 'You already have a place at this event.'
          : 'There are not enough seats left for that many people.',
      )
      return
    }
    setConfirmed(true)
  }

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/events">Events</Link>
        <span aria-hidden="true">/</span>
        <span>{event.title}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <ImagePlaceholder caption="Neighbors sharing a harvest dinner" height={280} />

          <div className={styles.tags}>
            <span className={styles.tag}>{event.category}</span>
            <span className={styles.tag}>All ages</span>
            <span className={styles.tag}>Free</span>
            {event.shuttle ? <span className={styles.tag}>Shuttle offered</span> : null}
          </div>

          <h1 className={styles.title}>{event.title}</h1>

          <p className={styles.meta}>
            <img className={styles.icon} src={building} alt="" />
            Hosted by {event.organizationName ?? 'BCS Events Team'}
          </p>

          <div className={styles.metaRow}>
            <span className={styles.meta}>
              <img className={styles.icon} src={calendar} alt="" />
              {formatLongDate(event.start)}
            </span>
            <span className={styles.meta}>
              <img className={styles.icon} src={clock} alt="" />
              {formatTimeRange(event.start, event.end)}
            </span>
            <span className={styles.meta}>
              <img className={styles.icon} src={pin} alt="" />
              {event.space}, BCS building
            </span>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>About this event</h2>
          <p className={styles.body}>{event.description}</p>

          <h2 className={styles.sectionTitle}>Accessibility</h2>
          <p className={styles.body}>{event.accessibility}</p>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>{event.isFull ? 'Registration closed' : 'RSVP'}</h2>

          <div className={styles.seats}>
            <span>Seats</span>
            <span
              className={[styles.seatsValue, event.isFull ? styles.seatsFull : '']
                .filter(Boolean)
                .join(' ')}
            >
              {event.isFull
                ? `Full · 0 of ${event.capacity} seats left`
                : `${event.remaining} of ${event.capacity} seats left`}
            </span>
          </div>

          <div
            className={styles.progress}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Seats taken"
          >
            <div
              className={[styles.progressBar, event.isFull ? styles.progressBarFull : '']
                .filter(Boolean)
                .join(' ')}
              style={{ width: `${percent}%` }}
            />
          </div>

          {event.isFull ? (
            <>
              <Button fullWidth disabled>
                Event full
              </Button>
              <p className={styles.hint}>
                Sign-up closes automatically once an event reaches capacity.
              </p>
              <Button variant="secondary" fullWidth onClick={() => navigate('/events')}>
                See other events
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Number of guests"
                type="number"
                min={0}
                max={event.guestLimit}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                hint={
                  event.guestLimit === 0
                    ? 'This event is for one attendee per RSVP.'
                    : `You may bring up to ${event.guestLimit} guests.`
                }
              />

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              {alreadyRsvped ? (
                <p className={styles.hint}>You already have a place at this event.</p>
              ) : null}

              <Button fullWidth onClick={onRsvp} disabled={alreadyRsvped}>
                RSVP to this event
              </Button>
              <p className={styles.hint}>
                You get a confirmation now and a reminder 24 hours before the event.
              </p>
            </>
          )}
        </aside>
      </div>

      {confirmed ? (
        <div className={styles.backdrop}>
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-confirmed"
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setConfirmed(false)}
              aria-label="Close confirmation"
            >
              <img className={styles.closeIcon} src={x} alt="" />
            </button>

            <span className={styles.tick} aria-hidden="true">
              <img className={styles.tickIcon} src={check} alt="" />
            </span>

            <h2 className={styles.overlayTitle} id="rsvp-confirmed">
              You&rsquo;re going!
            </h2>
            <p className={styles.overlayBody}>
              Your seat at the {event.title} is reserved. A confirmation is on its way to{' '}
              {state.profile.email}.
            </p>
            <MockLabel>email sent</MockLabel>

            <div className={styles.overlayMeta}>
              <span className={styles.meta}>
                <img className={styles.icon} src={calendar} alt="" />
                {formatLongDate(event.start)} · {formatTime(event.start)}
              </span>
              <span className={styles.meta}>
                <img className={styles.icon} src={pin} alt="" />
                {event.space}
              </span>
              <span className={styles.meta}>
                <img className={styles.icon} src={users} alt="" />
                {event.remaining} of {event.capacity} seats left after your RSVP
              </span>
            </div>

            <div className={styles.overlayActions}>
              <Button variant="secondary" onClick={() => setConfirmed(false)}>
                Back to event
              </Button>
              <Button onClick={() => navigate('/my-activity')}>My activity</Button>
            </div>
          </div>
        </div>
      ) : null}
    </Container>
  )
}
