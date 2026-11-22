import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import arrowRight from '../assets/icons/arrow-right.svg'
import heart from '../assets/icons/heart.svg'
import shield from '../assets/icons/shield.svg'
import { Container } from '../components/layout/Container'
import { Button, Input, MockLabel } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatMoney } from '../data/format'
import styles from './Donate.module.css'

/** REQ-DON-1 — preset amounts, or a custom amount of at least $1. */
const PRESETS = [2500, 5000, 10000, 25000]
const MINIMUM_CENTS = 100

const DESIGNATIONS = [
  'Where needed most',
  'Food security',
  'Youth & education',
  'Community events',
]

/**
 * Figma: D-01 Donate (16:115).
 *
 * DEVIATION PAY-1: the design draws a Stripe card form (number, expiry, CVC,
 * ZIP). No card fields are rendered here. GitHub Pages is static, there is no
 * processor, and REQ-DON-2 with NFR-SEC-2 require that BCS never receives card
 * data. The step is replaced by a labelled mock payment block.
 *
 * REQ-DON-3 and REQ-DON-4 add the anonymous option, which the design predates.
 */
export function Donate() {
  const { donate } = useData()
  const navigate = useNavigate()

  const [preset, setPreset] = useState<number | null>(5000)
  const [custom, setCustom] = useState('')
  const [designation, setDesignation] = useState(DESIGNATIONS[0])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [coverFees, setCoverFees] = useState(false)
  /** Errors are bound to the field they concern so screen readers announce them. */
  const [error, setError] = useState<{ field: 'amount' | 'name' | null; message: string } | null>(
    null,
  )

  const customCents = custom.trim() ? Math.round(Number(custom) * 100) : null
  const baseCents = customCents !== null && !Number.isNaN(customCents) ? customCents : (preset ?? 0)
  const feeCents = coverFees ? 150 : 0
  const totalCents = baseCents + feeCents

  const onDonate = () => {
    setError(null)

    if (custom.trim() && (customCents === null || Number.isNaN(customCents))) {
      setError({ field: 'amount', message: 'Enter a donation amount as a number.' })
      return
    }
    // REQ-DON-1 — a custom amount must be at least $1.
    if (baseCents < MINIMUM_CENTS) {
      setError({ field: 'amount', message: 'Enter an amount of at least $1.' })
      return
    }
    if (!anonymous && !name.trim()) {
      setError({ field: 'name', message: 'Enter your name, or choose to give anonymously.' })
      return
    }

    const { donationId } = donate({ amountCents: totalCents, anonymous, name, email })
    navigate('/donate/thank-you', { state: { donationId, designation } })
  }

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Donate</span>
      </nav>

      <div>
        <h1 className={styles.title}>Make a donation</h1>
        <p className={styles.lede}>
          Your one-time gift funds food, youth and community programs right here at home.
        </p>
      </div>

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <h2 className={styles.step}>1. Choose an amount</h2>
          <div className={styles.amounts}>
            {PRESETS.map((cents) => (
              <button
                key={cents}
                type="button"
                className={[styles.amount, preset === cents && !custom ? styles.amountActive : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={preset === cents && !custom}
                onClick={() => {
                  setPreset(cents)
                  setCustom('')
                }}
              >
                {formatMoney(cents).replace('.00', '')}
              </button>
            ))}
          </div>

          <Input
            label="Other amount"
            type="number"
            min={1}
            step="0.01"
            placeholder="75.00"
            value={custom}
            onChange={(event) => {
              setCustom(event.target.value)
              setPreset(null)
            }}
            hint="Minimum $1."
            error={error?.field === 'amount' ? error.message : undefined}
          />

          <Input
            label="Designation"
            list="designations"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
          />
          <datalist id="designations">
            {DESIGNATIONS.map((option) => (
              <option value={option} key={option} />
            ))}
          </datalist>

          <hr className={styles.divider} />

          <h2 className={styles.step}>2. Your information</h2>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
            />
            Give anonymously — your name shows as &ldquo;Anonymous&rdquo; everywhere, including
            staff reports.
          </label>

          <div className={styles.fieldRow}>
            <Input
              label="Full name"
              placeholder="Jordan Diaz"
              value={anonymous ? '' : name}
              disabled={anonymous}
              onChange={(event) => setName(event.target.value)}
              error={error?.field === 'name' ? error.message : undefined}
            />
            <Input
              label="Email for receipt"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hint={anonymous ? 'Optional. Leave blank and no receipt is sent.' : undefined}
            />
          </div>

          <hr className={styles.divider} />

          <div className={styles.paymentHead}>
            <h2 className={styles.step}>3. Payment</h2>
            <MockLabel>payment</MockLabel>
          </div>

          <div className={styles.payment}>
            <p>
              This prototype takes no payment. In the real platform this step hands off to the
              processor&rsquo;s hosted checkout and returns a transaction reference.
            </p>
            <p className={styles.paymentNote}>
              <img className={styles.icon} src={shield} alt="" />
              No card fields exist anywhere in this prototype. BCS never sees or stores a card
              number.
            </p>
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={coverFees}
              onChange={(event) => setCoverFees(event.target.checked)}
            />
            Add $1.50 to cover processing fees
          </label>

          {error && error.field === null ? (
            <p className={styles.error} role="alert">
              {error.message}
            </p>
          ) : null}

          <Button fullWidth onClick={onDonate}>
            Donate {formatMoney(totalCents)}
          </Button>
        </form>

        <aside className={styles.aside}>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Your gift</h2>
            <p className={styles.kv}>
              <span className={styles.kvKey}>Amount</span>
              <span className={styles.kvValue}>{formatMoney(baseCents)}</span>
            </p>
            {coverFees ? (
              <p className={styles.kv}>
                <span className={styles.kvKey}>Processing fees</span>
                <span className={styles.kvValue}>{formatMoney(feeCents)}</span>
              </p>
            ) : null}
            <p className={styles.kv}>
              <span className={styles.kvKey}>Total</span>
              <span className={styles.kvValue}>{formatMoney(totalCents)}</span>
            </p>
            <p className={styles.kv}>
              <span className={styles.kvKey}>Type</span>
              <span className={styles.kvValue}>One-time donation</span>
            </p>
            <p className={styles.kv}>
              <span className={styles.kvKey}>Designation</span>
              <span className={styles.kvValue}>{designation}</span>
            </p>
            <p className={styles.kv}>
              <span className={styles.kvKey}>Donor</span>
              <span className={styles.kvValue}>{anonymous ? 'Anonymous' : name || '—'}</span>
            </p>
            <hr className={styles.divider} />
            <p className={styles.note}>
              You will get an emailed receipt with our tax ID within 5 minutes.
            </p>
          </div>

          <div className={styles.impact}>
            <p className={styles.impactTitle}>
              <img className={styles.icon} src={heart} alt="" />
              {formatMoney(baseCents).replace('.00', '')} provides about{' '}
              {Math.max(1, Math.round(baseCents / 33))} meals
            </p>
            <p className={styles.note}>through partner pantries in Story County.</p>
          </div>

          <div className={styles.prompt}>
            <p className={styles.promptTitle}>Prefer to give items?</p>
            <p className={styles.note}>Coats, food and school supplies are always welcome.</p>
            <Link className={styles.link} to="/give-items">
              Offer items
              <img className={styles.icon} src={arrowRight} alt="" />
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  )
}
