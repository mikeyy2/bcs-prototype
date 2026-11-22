import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import arrowRight from '../assets/icons/arrow-right.svg'
import bell from '../assets/icons/bell.svg'
import clock from '../assets/icons/clock.svg'
import logoutIcon from '../assets/icons/logout.svg'
import shield from '../assets/icons/shield.svg'
import user from '../assets/icons/user.svg'
import { useRole } from '../app/roleContext'
import { Container } from '../components/layout/Container'
import { Button, Input, MockLabel, MockNotice } from '../components/ui'
import { useData } from '../data/dataContext'
import styles from './Profile.module.css'

type Panel = 'profile' | 'notifications'

const SKILLS = [
  'Food service',
  'Tutoring',
  'Event setup',
  'Driving',
  'Spanish',
  'Weekday evenings',
  'Weekends',
]

/**
 * Figma: C-03 Profile & Notifications (16:104).
 * REQ-PRF-1, REQ-PRF-2, REQ-PRF-3.
 */
export function Profile() {
  const { state, updateProfile, setNotifications, deleteAccount } = useData()
  const { signOut } = useRole()
  const navigate = useNavigate()

  const [panel, setPanel] = useState<Panel>('profile')
  const [form, setForm] = useState(state.profile)
  const [saved, setSaved] = useState<string | null>(null)

  const skills = form.skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)

  const toggleSkill = (skill: string) => {
    const next = skills.includes(skill)
      ? skills.filter((s) => s !== skill)
      : [...skills, skill]
    setForm({ ...form, skills: next.join(', ') })
  }

  const initials = form.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase()

  const nav: [Panel | 'activity' | 'logout', string, string][] = [
    ['profile', 'Profile', user],
    ['notifications', 'Notifications', bell],
    ['activity', 'My activity', clock],
    ['logout', 'Log out', logoutIcon],
  ]

  return (
    <Container className={styles.page}>
      <div>
        <h1 className={styles.title}>My account</h1>
        <p className={styles.lede}>
          Manage your contact information, interests and the emails BCS sends you.
        </p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Account sections">
          {nav.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={[styles.navItem, panel === key ? styles.navItemActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={panel === key ? 'page' : undefined}
              onClick={() => {
                if (key === 'activity') navigate('/my-activity')
                else if (key === 'logout') {
                  signOut()
                  navigate('/login')
                } else setPanel(key)
              }}
            >
              <img className={styles.navIcon} src={icon} alt="" />
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.panels}>
          {panel === 'profile' ? (
            <>
              <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
                <h2 className={styles.cardTitle}>Personal information</h2>

                <div className={styles.avatarRow}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      window.alert('Mock: profile photos are not stored in this prototype.')
                    }
                  >
                    Change photo
                  </Button>
                  <MockLabel>upload</MockLabel>
                </div>

                <div className={styles.fieldGrid}>
                  <Input
                    label="Full name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                  <Input
                    label="Address"
                    value={form.address}
                    onChange={(event) => setForm({ ...form, address: event.target.value })}
                  />
                </div>

                <hr className={styles.divider} />

                <h3 className={styles.cardTitle}>Volunteer skills &amp; availability</h3>
                <p className={styles.cardLede}>
                  Partners use these to match you with the right shifts.
                </p>
                <div className={styles.chips}>
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      aria-pressed={skills.includes(skill)}
                      className={[styles.chip, skills.includes(skill) ? styles.chipActive : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                <div className={styles.actions}>
                  <Button
                    onClick={() => {
                      updateProfile(form)
                      setSaved('Profile saved.')
                    }}
                  >
                    Save changes
                  </Button>
                  {saved ? (
                    <span className={styles.saved} role="status">
                      {saved}
                    </span>
                  ) : null}
                </div>
              </form>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Security</h2>
                <p className={styles.meta}>
                  <img className={styles.icon} src={shield} alt="" />
                  For your safety, you are signed out after 30 minutes of inactivity.
                </p>
                <MockNotice>
                  There is no password in this prototype — the role switcher on the sign-in
                  screen stands in for authentication, so changing a password does nothing.
                </MockNotice>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    className={styles.danger}
                    onClick={() => {
                      deleteAccount()
                      setSaved(
                        'Account deleted. Donation records are kept for BCS finances with your name replaced.',
                      )
                    }}
                  >
                    Delete my account
                  </Button>
                </div>
                {state.profile.deleted ? (
                  <p className={styles.saved} role="status">
                    This account is marked deleted. Past donations now show as
                    &ldquo;Deleted user&rdquo;.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
              <h2 className={styles.cardTitle}>Email notifications</h2>
              <p className={styles.cardLede}>
                Choose which emails you receive. BCS sends email only (no SMS).
              </p>

              <div className={styles.toggle}>
                <span className={styles.toggleText}>
                  <span className={styles.toggleName}>Registration confirmations</span>
                  <span className={styles.toggleHint}>
                    Sent when you sign up for a shift or RSVP.
                  </span>
                </span>
                <span className={styles.locked}>Always sent</span>
              </div>

              <div className={styles.toggle}>
                <span className={styles.toggleText}>
                  <span className={styles.toggleName}>Donation receipts</span>
                  <span className={styles.toggleHint}>Required for tax purposes.</span>
                </span>
                <span className={styles.locked}>Always sent</span>
              </div>

              <label className={styles.toggle}>
                <span className={styles.toggleText}>
                  <span className={styles.toggleName}>Shift &amp; event reminders</span>
                  <span className={styles.toggleHint}>
                    One reminder 24 hours before each booking.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={state.notifications.reminders}
                  onChange={(event) => setNotifications({ reminders: event.target.checked })}
                />
              </label>

              <label className={styles.toggle}>
                <span className={styles.toggleText}>
                  <span className={styles.toggleName}>Newsletter &amp; new opportunities</span>
                  <span className={styles.toggleHint}>Occasional updates from BCS.</span>
                </span>
                <input
                  type="checkbox"
                  checked={state.notifications.newsletter}
                  onChange={(event) => setNotifications({ newsletter: event.target.checked })}
                />
              </label>

              <MockNotice>
                Turning reminders off genuinely stops them: no reminder is written to the mock
                outbox for bookings made afterwards.
              </MockNotice>

              <div className={styles.actions}>
                <Button onClick={() => setSaved('Preferences saved.')}>Save preferences</Button>
                {saved ? (
                  <span className={styles.saved} role="status">
                    {saved}
                  </span>
                ) : null}
                <a className={styles.meta} href="#/my-activity">
                  See what you have booked
                  <img className={styles.icon} src={arrowRight} alt="" />
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </Container>
  )
}
