import { useNavigate } from 'react-router-dom'
import clock from '../assets/icons/clock.svg'
import eye from '../assets/icons/eye.svg'
import flag from '../assets/icons/flag.svg'
import info from '../assets/icons/info.svg'
import users from '../assets/icons/users.svg'
import { ConsoleTopBar } from '../components/layout/ConsoleTopBar'
import { Badge, Button } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatDate } from '../data/format'
import { partnerListings, totalVolunteerHours } from '../data/selectors'
import { DEMO_PARTNER_ID, ORGANIZATIONS } from '../data/seed'
import styles from './console.module.css'

const PARTNER = ORGANIZATIONS.find((o) => o.id === DEMO_PARTNER_ID)!

/** Figma: P-02 Partner Dashboard (16:120). REQ-PRT-3, REQ-PRT-4, REQ-VOL-9. */
export function PartnerDashboard() {
  const { state, markAttendance } = useData()
  const navigate = useNavigate()

  const listings = partnerListings(state)
  const published = listings.filter((l) => l.status === 'published').length
  const pending = listings.filter((l) => l.status === 'pending').length

  // Registrations against this partner's listings, for attendance marking.
  const roster = state.registrations
    .map((registration) => {
      const listing = listings.find((l) => l.id === registration.opportunityId)
      return listing ? { registration, listing } : null
    })
    .filter((entry) => entry !== null)

  const stats: [string, string, string, string | null][] = [
    [eye, 'Published listings', String(published), null],
    [flag, 'Pending approval', String(pending), null],
    [users, 'Volunteers registered', String(roster.length), 'across your listings'],
    [clock, 'Hours logged', totalVolunteerHours(state).toFixed(1), 'attended shifts only'],
  ]

  return (
    <div className={styles.page}>
      <ConsoleTopBar
        crumb="Partner console / Dashboard"
        name="Maria Lopez"
        role={PARTNER.name}
        initials="ML"
      />

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Welcome back, {PARTNER.name}</h1>
          <p className={styles.lede}>
            Manage your listings, mark attendance and keep your profile up to date.
          </p>
        </div>
        <Button onClick={() => navigate('/partner/new-listing')}>+ New listing</Button>
      </div>

      {pending > 0 ? (
        <div className={styles.banner}>
          <img className={styles.bannerIcon} src={info} alt="" />
          <span>
            <span className={styles.bannerTitle}>
              {pending} listing{pending === 1 ? '' : 's'} waiting for BCS approval
            </span>
            <br />
            They stay hidden from the public until a BCS staff member approves them.
          </span>
        </div>
      ) : null}

      <section className={styles.stats} aria-label="Partner totals">
        {stats.map(([icon, label, value, note]) => (
          <div className={styles.stat} key={label}>
            <span className={styles.statLabel}>
              <img className={styles.icon} src={icon} alt="" />
              {label}
            </span>
            <span className={styles.statValue}>{value}</span>
            {note ? <span className={styles.statNote}>{note}</span> : null}
          </div>
        ))}
      </section>

      <h2 className={styles.sectionTitle}>My listings</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Listing</th>
              <th>Type</th>
              <th>Next date</th>
              <th>Filled</th>
              <th>Status</th>
              <th>
                <span className="srOnly">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td>
                  <div className={styles.name}>{listing.title}</div>
                  {listing.rejectionReason ? (
                    <div className={styles.sub}>Reason: {listing.rejectionReason}</div>
                  ) : (
                    <div className={styles.sub}>{listing.category}</div>
                  )}
                </td>
                <td style={{ textTransform: 'capitalize' }}>{listing.kind}</td>
                <td className={styles.numeric}>{formatDate(listing.nextStart)}</td>
                <td className={styles.numeric}>
                  {listing.filled} / {listing.capacity}
                </td>
                <td>
                  <Badge>
                    {listing.status === 'published'
                      ? 'Published'
                      : listing.status === 'pending'
                        ? 'Pending approval'
                        : 'Rejected'}
                  </Badge>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => navigate('/partner/new-listing')}
                    >
                      {listing.status === 'rejected' ? 'Fix & resubmit' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => navigate('/partner/roster')}
                    >
                      Roster
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className={styles.sectionTitle}>Volunteer roster</h2>
      <div className={styles.tableWrap}>
        {roster.length === 0 ? (
          <p className={styles.empty}>
            No one has registered for your listings yet. Register as a volunteer first, then
            come back here to mark attendance.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Listing</th>
                <th>Attendance</th>
                <th>
                  <span className="srOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {roster.map(({ registration, listing }) => {
                const attendance = state.attendance[registration.id] ?? registration.attendance
                return (
                  <tr key={registration.id}>
                    <td className={styles.name}>{state.profile.name}</td>
                    <td>{listing.title}</td>
                    <td>
                      <Badge>
                        {attendance === 'attended'
                          ? 'Attended'
                          : attendance === 'no-show'
                            ? 'Not attended'
                            : 'Not marked'}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.link}
                          onClick={() => markAttendance(registration.id, 'attended')}
                        >
                          Mark attended
                        </button>
                        <button
                          type="button"
                          className={[styles.link, styles.linkDanger].join(' ')}
                          onClick={() => markAttendance(registration.id, 'no-show')}
                        >
                          No-show
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className={styles.note}>
        Marking a shift attended creates an hours record equal to the shift length, which shows
        up in the volunteer&rsquo;s own history (REQ-VOL-9).
      </p>
    </div>
  )
}
