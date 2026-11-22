import { useState } from 'react'
import { Link } from 'react-router-dom'
import calendar from '../assets/icons/calendar.svg'
import chart from '../assets/icons/chart.svg'
import check from '../assets/icons/check.svg'
import file from '../assets/icons/file.svg'
import shield from '../assets/icons/shield.svg'
import users from '../assets/icons/users.svg'
import { Container } from '../components/layout/Container'
import { Button, Input, MockLabel, MockNotice } from '../components/ui'
import styles from './Donate.module.css'
import console_ from './console.module.css'

/** Keep the uploaded document within the SRS limit (REQ-PRT-1). */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const BENEFITS: [string, string][] = [
  [users, 'Reach thousands of local volunteers'],
  [calendar, 'Post shifts and events yourself'],
  [chart, 'Track attendance and hours'],
  [shield, 'A verified-partner badge'],
]

/**
 * Figma: P-01 Partner Application (16:119). REQ-PRT-1, REQ-PRT-2.
 *
 * The IRS letter upload is mocked: the file name and size are checked and
 * echoed, the bytes are discarded.
 */
export function PartnerApply() {
  const [form, setForm] = useState({
    organization: '',
    ein: '',
    status: '501(c)(3) public charity',
    website: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    serviceArea: '',
    description: '',
  })
  const [document, setDocument] = useState<{ name: string; size: number } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (patch: Partial<typeof form>) => setForm({ ...form, ...patch })

  const onSubmit = () => {
    setError(null)

    if (!form.organization.trim()) return setError('Enter your organization name.')
    if (!/^\d{2}-?\d{7}$/.test(form.ein.trim())) return setError('Enter an EIN as 12-3456789.')
    if (!form.email.trim()) return setError('Enter a contact email.')
    if (!document) return setError('Attach your IRS determination letter as a PDF.')
    if (!confirmed) return setError('Confirm the information is accurate before applying.')

    setSubmitted(true)
  }

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Partner with us</span>
      </nav>

      <div>
        <h1 className={styles.title}>Partner with BCS</h1>
        <p className={styles.lede}>
          Nonprofits can apply to post volunteer opportunities and events on Best Community
          Services.
        </p>
      </div>

      <div className={styles.layout}>
        {submitted ? (
          <div className={styles.form}>
            <h2 className={styles.step}>Application received</h2>
            <MockNotice>
              Your application is now in the BCS staff approval queue. Sign in as BCS Staff to
              see it, approve it or reject it with a reason.
            </MockNotice>
            <p className={console_.note}>
              In the real platform you would get an emailed decision within one to three
              business days.
            </p>
            <Link to="/login">
              <Button>Go to sign in</Button>
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <h2 className={styles.step}>Organization details</h2>
            <Input
              label="Organization name"
              required
              value={form.organization}
              onChange={(event) => set({ organization: event.target.value })}
            />
            <div className={styles.fieldRow}>
              <Input
                label="EIN (tax ID)"
                required
                placeholder="12-3456789"
                value={form.ein}
                onChange={(event) => set({ ein: event.target.value })}
              />
              <Input
                label="Nonprofit status"
                value={form.status}
                onChange={(event) => set({ status: event.target.value })}
              />
            </div>
            <Input
              label="Website"
              type="url"
              placeholder="https://example.org"
              value={form.website}
              onChange={(event) => set({ website: event.target.value })}
            />

            <hr className={styles.divider} />

            <h2 className={styles.step}>Primary contact</h2>
            <div className={styles.fieldRow}>
              <Input
                label="Full name"
                value={form.contactName}
                onChange={(event) => set({ contactName: event.target.value })}
              />
              <Input
                label="Role"
                value={form.contactRole}
                onChange={(event) => set({ contactRole: event.target.value })}
              />
            </div>
            <div className={styles.fieldRow}>
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(event) => set({ email: event.target.value })}
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(event) => set({ phone: event.target.value })}
              />
            </div>

            <hr className={styles.divider} />

            <h2 className={styles.step}>Services</h2>
            <Input
              label="Primary service area"
              placeholder="Story County"
              value={form.serviceArea}
              onChange={(event) => set({ serviceArea: event.target.value })}
            />
            <Input
              label="Describe your services"
              value={form.description}
              onChange={(event) => set({ description: event.target.value })}
            />

            <label className={styles.payment} style={{ cursor: 'pointer' }}>
              <span className={styles.paymentNote}>
                <img className={styles.icon} src={file} alt="" />
                IRS determination letter (PDF, up to 10 MB)
              </span>
              {document ? (
                <span className={console_.name}>
                  {document.name} · {Math.round(document.size / 1024)} KB attached
                </span>
              ) : (
                <span>Choose a file</span>
              )}
              <MockLabel>upload</MockLabel>
              <input
                type="file"
                accept="application/pdf"
                className="srOnly"
                onChange={(event) => {
                  const chosen = event.target.files?.[0]
                  if (!chosen) return setDocument(null)
                  if (chosen.size > MAX_UPLOAD_BYTES) {
                    setDocument(null)
                    setError('That file is over the 10 MB limit.')
                    return
                  }
                  setError(null)
                  setDocument({ name: chosen.name, size: chosen.size })
                }}
              />
            </label>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              I confirm this information is accurate and I am authorized to apply
            </label>

            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}

            <Button fullWidth onClick={onSubmit}>
              Submit application
            </Button>
          </form>
        )}

        <aside className={styles.aside}>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Why partner with BCS?</h2>
            {BENEFITS.map(([icon, label]) => (
              <p className={console_.meta} key={label}>
                <img className={styles.icon} src={icon} alt="" />
                {label}
              </p>
            ))}
          </div>

          <div className={styles.prompt}>
            <p className={styles.promptTitle}>After you apply</p>
            <p className={console_.meta}>
              <img className={styles.icon} src={check} alt="" />
              BCS staff review your application
            </p>
            <p className={console_.meta}>
              <img className={styles.icon} src={check} alt="" />
              You get an email with the decision
            </p>
            <p className={console_.meta}>
              <img className={styles.icon} src={check} alt="" />
              Once approved, your partner console is unlocked
            </p>
          </div>
        </aside>
      </div>
    </Container>
  )
}
