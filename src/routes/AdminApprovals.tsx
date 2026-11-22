import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import check from '../assets/icons/check.svg'
import file from '../assets/icons/file.svg'
import { ConsoleTopBar } from '../components/layout/ConsoleTopBar'
import { Badge, Button, Input } from '../components/ui'
import { useData } from '../data/dataContext'
import { approvalQueue } from '../data/selectors'
import styles from './console.module.css'

type Filter = 'all' | 'partner application' | 'listing' | 'profile edit' | 'in-kind offer'

const FILTERS: [Filter, string][] = [
  ['all', 'All'],
  ['partner application', 'Partner applications'],
  ['listing', 'Listings'],
  ['profile edit', 'Profile edits'],
  ['in-kind offer', 'In-kind offers'],
]

const CHECKLIST = [
  'EIN matches the IRS determination letter',
  'Organization serves our community',
  'Contact email uses the organization domain',
]

/**
 * Figma: A-01 Approval Queue (16:123).
 *
 * REQ-ADM-4 — one queue for every submission type, nothing public until
 * approved, and a reason is required on rejection.
 */
export function AdminApprovals() {
  const { state, decideApproval } = useData()
  const navigate = useNavigate()

  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Seeded queue items, plus anything the partner submitted this session.
  const seeded = approvalQueue(state)
  const submitted = state.partnerListings.map((listing) => ({
    id: listing.id,
    kind: 'listing' as const,
    title: listing.title,
    organizationName: 'Ames Food Pantry',
    submittedDayOffset: 0,
    status: state.approvals[listing.id] ?? ('pending' as const),
    rejectionReason: state.approvalReasons[listing.id] ?? null,
  }))

  const items = [...submitted, ...seeded]
  const pending = items.filter((item) => item.status === 'pending')
  const visible = filter === 'all' ? pending : pending.filter((item) => item.kind === filter)
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? null

  const counts = (kind: Filter) =>
    kind === 'all' ? pending.length : pending.filter((item) => item.kind === kind).length

  const decide = (decision: 'approved' | 'rejected') => {
    if (!selected) return
    setError(null)
    // REQ-ADM-4 — a rejection must carry a reason.
    if (decision === 'rejected' && !reason.trim()) {
      setError('Give a reason before rejecting. It is emailed to the submitter.')
      return
    }
    decideApproval(selected.id, decision, reason.trim() || undefined)
    setReason('')
    setSelectedId(null)
  }

  return (
    <div className={styles.page}>
      <ConsoleTopBar
        crumb="Staff console / Approval queue"
        name="Sam Patel"
        role="BCS Staff · Administrator"
        initials="SP"
      />

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Approval queue</h1>
          <p className={styles.lede}>Nothing goes live until it is approved here.</p>
        </div>
        <Button onClick={() => navigate('/admin/reports')}>Run a report</Button>
      </div>

      <div className={styles.chips} role="group" aria-label="Filter the queue">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            className={[styles.chip, filter === key ? styles.chipActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              setFilter(key)
              setSelectedId(null)
            }}
          >
            {label} ({counts(key)})
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {visible.length === 0 ? (
          <p className={styles.empty}>
            The queue is clear. Submitted applications, listings and in-kind offers appear here.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Organization</th>
                <th>Status</th>
                <th>
                  <span className="srOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id}>
                  <td className={styles.name}>{item.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.kind}</td>
                  <td>{item.organizationName}</td>
                  <td>
                    <Badge>Pending review</Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => {
                        setSelectedId(item.id)
                        setReason('')
                        setError(null)
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected ? (
        <section className={styles.card} aria-labelledby="review-heading">
          <h2 className={styles.sectionTitle} id="review-heading">
            {selected.title}
          </h2>
          <p className={styles.note}>
            {selected.kind} · {selected.organizationName}
          </p>

          {selected.kind === 'partner application' ? (
            <>
              <hr className={styles.divider} />
              <p className={styles.meta}>
                <img className={styles.icon} src={file} alt="" />
                irs-determination-letter.pdf
              </p>
              <h3 className={styles.name}>Verification checklist</h3>
              {CHECKLIST.map((line) => (
                <p className={styles.meta} key={line}>
                  <img className={styles.icon} src={check} alt="" />
                  {line}
                </p>
              ))}
            </>
          ) : null}

          <Input
            label="Reason (required to reject)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            error={error ?? undefined}
          />

          <div className={styles.actions}>
            <Button onClick={() => decide('approved')}>Approve</Button>
            <Button variant="secondary" onClick={() => decide('rejected')}>
              Reject
            </Button>
          </div>

          <p className={styles.note}>
            Approving publishes the item. The reason is emailed on rejection and recorded in
            the mock outbox.
          </p>
        </section>
      ) : null}
    </div>
  )
}
