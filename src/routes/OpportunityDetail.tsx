import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import arrowRight from '../assets/icons/arrow-right.svg'
import building from '../assets/icons/building.svg'
import calendar from '../assets/icons/calendar.svg'
import check from '../assets/icons/check.svg'
import clock from '../assets/icons/clock.svg'
import info from '../assets/icons/info.svg'
import pin from '../assets/icons/pin.svg'
import { useRole } from '../app/roleContext'
import { isSignedIn } from '../app/roles'
import { Container } from '../components/layout/Container'
import { ImagePlaceholder } from '../components/content/ImagePlaceholder'
import { Badge, Button, MockLabel } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatDate, formatLongDate, formatTimeRange } from '../data/format'
import { ORGANIZATIONS, TASKS_BY_CATEGORY } from '../data/seed'
import { findOpportunity } from '../data/selectors'
import styles from './OpportunityDetail.module.css'

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/**
 * Figma: V-02 Opportunity Detail (16:109) — the main user journey.
 *
 * REQ-VOL-4 detail fields, REQ-VOL-5 one shift per registration with live
 * capacity, REQ-VOL-6 visitors are sent to sign in and returned here, and
 * REQ-VOL-8 confirmation plus 24-hour reminder in the mock outbox.
 */
export function OpportunityDetail() {
  const { id = '' } = useParams()
  const { state, register } = useData()
  const { role } = useRole()
  const navigate = useNavigate()

  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const opportunity = findOpportunity(id, state)
  if (!opportunity) return <Navigate to="/volunteer" replace />

  const organization = ORGANIZATIONS.find((o) => o.id === opportunity.organizationId)
  const alreadyRegistered = state.registrations.some((r) => r.opportunityId === opportunity.id)
  const tasks = TASKS_BY_CATEGORY[opportunity.category]
  const first = opportunity.shifts[0]

  const onRegister = () => {
    setError(null)

    // REQ-VOL-6 — send a visitor to sign in, then return to this opportunity.
    if (!isSignedIn(role)) {
      navigate('/login', { state: { from: `/volunteer/${opportunity.id}`, needs: ['volunteer'] } })
      return
    }
    if (!selected) {
      setError('Choose a shift before registering.')
      return
    }
    if (!confirmed) {
      setError('Confirm you meet the requirements before registering.')
      return
    }

    const result = register(opportunity.id, selected)
    if (!result.ok) {
      setError(
        result.reason === 'already-registered'
          ? 'You are already registered for that shift.'
          : 'That shift filled up. Pick another one.',
      )
      return
    }
    setDone(true)
  }

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/volunteer">Volunteer</Link>
        <span aria-hidden="true">/</span>
        <span>{opportunity.category}</span>
        <span aria-hidden="true">/</span>
        <span>{opportunity.title}</span>
      </nav>

      <div className={styles.layout}>
        <div className={styles.main}>
          <ImagePlaceholder caption="Volunteers sorting donated food" height={280} />

          <div className={styles.tags}>
            <span className={styles.tag}>{opportunity.category}</span>
            {opportunity.skills.map((skill) => (
              <span className={styles.tag} key={skill}>
                {skill}
              </span>
            ))}
          </div>

          <h1 className={styles.title}>{opportunity.title}</h1>

          <div className={styles.orgRow}>
            <Link className={styles.orgLink} to="/partner">
              <img className={styles.icon} src={building} alt="" />
              {opportunity.organizationName}
            </Link>
            {organization?.verified ? <Badge>Verified partner</Badge> : null}
          </div>

          <div className={styles.metaRow}>
            {first ? (
              <>
                <span className={styles.meta}>
                  <img className={styles.icon} src={calendar} alt="" />
                  {formatLongDate(first.start)}
                </span>
                <span className={styles.meta}>
                  <img className={styles.icon} src={clock} alt="" />
                  {formatTimeRange(first.start, first.end)} ({first.hours} hours)
                </span>
              </>
            ) : null}
            <span className={styles.meta}>
              <img className={styles.icon} src={pin} alt="" />
              {organization?.address}
            </span>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>About this opportunity</h2>
          <p className={styles.body}>{opportunity.description}</p>

          <h2 className={styles.sectionTitle}>What you will do</h2>
          <ul className={styles.list}>
            {tasks.map((task) => (
              <li className={styles.listItem} key={task}>
                <img className={styles.icon} src={check} alt="" />
                {task}
              </li>
            ))}
          </ul>

          <h2 className={styles.sectionTitle}>Requirements</h2>
          <ul className={styles.list}>
            {opportunity.skills.map((skill) => (
              <li className={styles.listItem} key={skill}>
                <img className={styles.icon} src={info} alt="" />
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <aside className={styles.aside}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Choose a shift</h2>
            <p className={styles.rule}>Pick exactly one shift. Full shifts cannot be selected.</p>

            {done ? (
              <div className={styles.success} role="status">
                <strong>You are registered.</strong>
                <span>
                  A confirmation and a 24-hour reminder are waiting in the mock outbox.
                </span>
                <MockLabel>email sent</MockLabel>
                <Button variant="secondary" onClick={() => navigate('/my-activity')}>
                  View my activity
                </Button>
              </div>
            ) : (
              <>
                <fieldset className={styles.shifts}>
                  <legend className="srOnly">Available shifts</legend>
                  {opportunity.shifts.map((shift) => (
                    <label
                      key={shift.id}
                      className={[
                        styles.shift,
                        selected === shift.id ? styles.shiftSelected : '',
                        shift.isFull ? styles.shiftFull : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <input
                        type="radio"
                        name="shift"
                        value={shift.id}
                        disabled={shift.isFull}
                        checked={selected === shift.id}
                        onChange={() => setSelected(shift.id)}
                      />
                      <span className={styles.shiftStack}>
                        <span className={styles.shiftDate}>{formatDate(shift.start)}</span>
                        <span className={styles.shiftTime}>
                          {formatTimeRange(shift.start, shift.end)}
                        </span>
                      </span>
                      {shift.isFull ? (
                        <Badge>Full</Badge>
                      ) : (
                        <span className={styles.shiftLeft}>
                          {shift.remaining} of {shift.capacity} left
                        </span>
                      )}
                    </label>
                  ))}
                </fieldset>

                <label className={styles.confirm}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  I meet the requirements
                </label>

                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}

                {alreadyRegistered ? (
                  <p className={styles.rule}>
                    You already have a shift on this opportunity. You can add another below.
                  </p>
                ) : null}

                <Button fullWidth onClick={onRegister} disabled={opportunity.isFull}>
                  {opportunity.isFull ? 'All shifts full' : 'Register for this shift'}
                </Button>
              </>
            )}
          </div>

          <div className={styles.orgCard}>
            <div className={styles.orgHead}>
              <span className={styles.orgInitials} aria-hidden="true">
                {initials(opportunity.organizationName)}
              </span>
              <span className={styles.orgName}>{opportunity.organizationName}</span>
            </div>
            <p className={styles.orgMission}>{organization?.mission}</p>
            <Link className={styles.orgLinkRow} to="/partner">
              View organization
              <img className={styles.icon} src={arrowRight} alt="" />
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  )
}
