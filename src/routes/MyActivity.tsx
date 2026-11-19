import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import arrowRight from '../assets/icons/arrow-right.svg'
import calendar from '../assets/icons/calendar.svg'
import check from '../assets/icons/check.svg'
import clock from '../assets/icons/clock.svg'
import dollar from '../assets/icons/dollar.svg'
import download from '../assets/icons/download.svg'
import { Container } from '../components/layout/Container'
import { Badge, Button, MockLabel, MockNotice } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatDate, formatMoney, formatTimeRange } from '../data/format'
import { donationTotalCents, findEvent, findOpportunity, totalVolunteerHours } from '../data/selectors'
import styles from './MyActivity.module.css'

type Tab = 'upcoming' | 'hours' | 'donations'

/** REQ-VOL-7 — a shift can be cancelled up to 24 hours before it starts. */
const CANCEL_WINDOW_HOURS = 24

/**
 * Figma: V-03 My Activity (16:110). Also serves REQ-DSH-1 and REQ-DSH-2.
 *
 * DEVIATION ACT-1: Figma draws no cancel control, but REQ-VOL-7, REQ-EVT-5
 * and REQ-DSH-1 all require one. Added to each upcoming row, disabled once
 * the cancellation window has passed.
 */
export function MyActivity() {
  const { state, cancelRegistration, cancelRsvp } = useData()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('upcoming')
  // One timestamp per mount, so "upcoming" and the cancellation window stay
  // stable across re-renders instead of shifting mid-interaction.
  const [now] = useState(() => Date.now())

  const registrations = state.registrations
    .map((registration) => {
      const opportunity = findOpportunity(registration.opportunityId, state)
      const shift = opportunity?.shifts.find((s) => s.id === registration.shiftId)
      const attendance = state.attendance[registration.id] ?? registration.attendance
      return opportunity && shift ? { registration, opportunity, shift, attendance } : null
    })
    .filter((entry) => entry !== null)

  const rsvps = state.rsvps
    .map((entry) => {
      const event = findEvent(entry.eventId, state)
      return event ? { rsvp: entry, event } : null
    })
    .filter((entry) => entry !== null)

  const upcomingShifts = registrations.filter((e) => e.shift.start.getTime() > now)
  const pastShifts = registrations.filter((e) => e.shift.start.getTime() <= now)
  const upcomingEvents = rsvps.filter((e) => e.event.start.getTime() > now)

  const attendedCount = registrations.filter((e) => e.attendance === 'attended').length
  const loggedHours = totalVolunteerHours(state)

  const stats: [string, string, string][] = [
    [clock, 'Total logged hours', loggedHours.toFixed(1)],
    [check, 'Shifts attended', String(attendedCount)],
    [calendar, 'Upcoming shifts', String(upcomingShifts.length + upcomingEvents.length)],
    [dollar, 'Total donated', formatMoney(donationTotalCents(state))],
  ]

  const tabs: [Tab, string][] = [
    ['upcoming', 'Upcoming'],
    ['hours', 'Volunteer hours'],
    ['donations', 'Donations'],
  ]

  return (
    <Container className={styles.page}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>My activity</h1>
          <p className={styles.lede}>
            Your volunteer shifts, logged hours and donations in one place.
          </p>
        </div>
        <Button onClick={() => navigate('/volunteer')}>Find opportunities</Button>
      </div>

      <section className={styles.stats} aria-label="Your totals">
        {stats.map(([icon, label, value]) => (
          <div className={styles.stat} key={label}>
            <span className={styles.statLabel}>
              <img className={styles.statIcon} src={icon} alt="" />
              {label}
            </span>
            <span className={styles.statValue}>{value}</span>
          </div>
        ))}
      </section>

      <div className={styles.tabs} role="tablist" aria-label="Activity sections">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={[styles.tab, tab === key ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'upcoming' ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Upcoming shifts and events</h2>
          <div className={styles.tableWrap}>
            {upcomingShifts.length + upcomingEvents.length === 0 ? (
              <p className={styles.empty}>
                Nothing booked yet. Find an opportunity or an event and it appears here.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>What</th>
                    <th>Organization</th>
                    <th>When</th>
                    <th>Status</th>
                    <th>
                      <span className="srOnly">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingShifts.map(({ registration, opportunity, shift }) => {
                    const locked = (shift.start.getTime() - now) / 3_600_000 < CANCEL_WINDOW_HOURS
                    return (
                      <tr key={registration.id}>
                        <td className={styles.name}>{opportunity.title}</td>
                        <td>{opportunity.organizationName}</td>
                        <td className={styles.numeric}>
                          {formatDate(shift.start)} · {formatTimeRange(shift.start, shift.end)}
                        </td>
                        <td>
                          <span className={styles.tag}>Registered</span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <Link className={styles.link} to={`/volunteer/${opportunity.id}`}>
                              View details
                              <img className={styles.linkIcon} src={arrowRight} alt="" />
                            </Link>
                            <button
                              type="button"
                              className={styles.cancel}
                              disabled={locked}
                              title={
                                locked
                                  ? 'Shifts can only be cancelled more than 24 hours ahead'
                                  : undefined
                              }
                              onClick={() => cancelRegistration(registration.id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {upcomingEvents.map(({ rsvp, event }) => (
                    <tr key={rsvp.id}>
                      <td className={styles.name}>{event.title}</td>
                      <td>{event.organizationName ?? 'BCS'}</td>
                      <td className={styles.numeric}>
                        {formatDate(event.start)} · {formatTimeRange(event.start, event.end)}
                      </td>
                      <td>
                        <span className={styles.tag}>
                          RSVP{rsvp.guests > 0 ? ` +${rsvp.guests}` : ''}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <Link className={styles.link} to={`/events/${event.id}`}>
                            View details
                            <img className={styles.linkIcon} src={arrowRight} alt="" />
                          </Link>
                          <button
                            type="button"
                            className={styles.cancel}
                            onClick={() => cancelRsvp(rsvp.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ) : null}

      {tab === 'hours' ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Past shifts</h2>
          <div className={styles.tableWrap}>
            {pastShifts.length === 0 ? (
              <p className={styles.empty}>
                No past shifts yet. Attendance is marked by the partner after each shift.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Opportunity</th>
                    <th>Organization</th>
                    <th>Attendance</th>
                    <th>Hours logged</th>
                  </tr>
                </thead>
                <tbody>
                  {pastShifts.map(({ registration, opportunity, shift, attendance }) => (
                    <tr key={registration.id}>
                      <td className={styles.numeric}>{formatDate(shift.start)}</td>
                      <td className={styles.name}>{opportunity.title}</td>
                      <td>{opportunity.organizationName}</td>
                      <td>
                        <Badge>
                          {attendance === 'attended'
                            ? 'Attended'
                            : attendance === 'no-show'
                              ? 'Not attended'
                              : 'Not marked'}
                        </Badge>
                      </td>
                      <td className={styles.numeric}>
                        {attendance === 'attended' ? shift.hours.toFixed(1) : '0.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className={styles.totalRow}>
            <span>Total logged hours = sum of attended shift durations</span>
            <span className={styles.totalValue}>{loggedHours.toFixed(1)} hours</span>
          </div>
        </section>
      ) : null}

      {tab === 'donations' ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>My donations</h2>
            <Button onClick={() => navigate('/donate')}>Donate again</Button>
          </div>
          <div className={styles.tableWrap}>
            {state.donations.length + state.inKindOffers.length === 0 ? (
              <p className={styles.empty}>
                No donations yet. Monetary gifts and item offers both appear here.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount / items</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {state.donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className={styles.numeric}>{formatDate(new Date(donation.createdAt))}</td>
                      <td>Money</td>
                      <td className={styles.numeric}>
                        {formatMoney(donation.amountCents)}
                        {donation.anonymous ? ' · Anonymous' : ''}
                      </td>
                      <td>
                        <Badge>Completed</Badge>
                      </td>
                      <td>
                        <span className={styles.link}>
                          <img className={styles.linkIcon} src={download} alt="" />
                          <MockLabel>receipt</MockLabel>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {state.inKindOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td className={styles.numeric}>{formatDate(new Date(offer.createdAt))}</td>
                      <td>Items</td>
                      <td>
                        {offer.quantity} × {offer.description}
                      </td>
                      <td>
                        <Badge>{offer.status === 'pending' ? 'Pending review' : 'Completed'}</Badge>
                      </td>
                      <td>—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <MockNotice>
            Receipts are simulated. The real receipt email is recorded in the mock outbox with
            the donor name, amount, date, tax ID and transaction reference.
          </MockNotice>
        </section>
      ) : null}
    </Container>
  )
}
