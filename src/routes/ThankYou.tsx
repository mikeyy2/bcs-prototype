import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import arrowLeft from '../assets/icons/arrow-left.svg'
import check from '../assets/icons/check.svg'
import mail from '../assets/icons/mail.svg'
import { Container } from '../components/layout/Container'
import { Button, MockLabel, MockNotice } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatLongDate, formatMoney } from '../data/format'
import styles from './Donate.module.css'

type ThankYouState = { donationId?: string; designation?: string }

/**
 * Figma: D-02 Thank You & Receipt (16:116). REQ-DON-5 — the receipt carries
 * donor name, amount, date, BCS tax ID and the transaction reference.
 *
 * The tax ID is TBD-6 in the SRS and has not been supplied, so it is shown as
 * an unresolved placeholder rather than an invented number.
 */
export function ThankYou() {
  const { state } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const { donationId, designation } = (location.state ?? {}) as ThankYouState

  const donation = donationId
    ? state.donations.find((d) => d.id === donationId)
    : state.donations[state.donations.length - 1]

  if (!donation) return <Navigate to="/donate" replace />

  const firstName = donation.anonymous ? 'friend' : donation.donorName.split(' ')[0]

  return (
    <Container className={styles.page}>
      <div className={styles.thanks}>
        <span className={styles.tick} aria-hidden="true">
          <img className={styles.tickIcon} src={check} alt="" />
        </span>

        <h1 className={styles.thanksTitle}>Thank you, {firstName}!</h1>
        <p className={styles.lede}>
          Your {formatMoney(donation.amountCents)} donation was received.
        </p>

        {donation.donorEmail ? (
          <div className={styles.banner}>
            <img className={styles.icon} src={mail} alt="" />
            <span>
              <strong>Receipt emailed to {donation.donorEmail}</strong>
              <br />
              Recorded in the mock outbox, timestamped at the moment your payment cleared.{' '}
              <MockLabel>email sent</MockLabel>
            </span>
          </div>
        ) : (
          <MockNotice>
            No email address was given, so no receipt was sent and no personal data was stored
            (REQ-DON-4).
          </MockNotice>
        )}

        <div className={styles.receipt}>
          <p className={styles.receiptHead}>
            <span>Donation receipt</span>
            <span>#{donation.id.toUpperCase()}</span>
          </p>
          <hr className={styles.divider} />
          <p className={styles.kv}>
            <span className={styles.kvKey}>Donor name</span>
            <span className={styles.kvValue}>{donation.donorName}</span>
          </p>
          <p className={styles.kv}>
            <span className={styles.kvKey}>Amount</span>
            <span className={styles.kvValue}>{formatMoney(donation.amountCents)}</span>
          </p>
          <p className={styles.kv}>
            <span className={styles.kvKey}>Date</span>
            <span className={styles.kvValue}>
              {formatLongDate(new Date(donation.createdAt))}
            </span>
          </p>
          {designation ? (
            <p className={styles.kv}>
              <span className={styles.kvKey}>Designation</span>
              <span className={styles.kvValue}>{designation}</span>
            </p>
          ) : null}
          <p className={styles.kv}>
            <span className={styles.kvKey}>BCS tax ID (EIN)</span>
            <span className={styles.kvValue}>TBD-6 — not yet supplied</span>
          </p>
          <p className={styles.kv}>
            <span className={styles.kvKey}>Payment reference</span>
            <span className={styles.kvValue}>{donation.reference}</span>
          </p>
          <p className={styles.note}>
            Only the processor reference is stored with your donation, never card details.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            title="Opens your browser's print dialogue — no PDF is generated"
          >
            Download receipt (PDF)
          </Button>
          <Button onClick={() => navigate('/my-activity')}>View my activity</Button>
        </div>

        <Link className={styles.link} to="/">
          <img className={styles.icon} src={arrowLeft} alt="" />
          Back to home
        </Link>
      </div>
    </Container>
  )
}
