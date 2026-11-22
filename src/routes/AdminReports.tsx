import { useState } from 'react'
import building from '../assets/icons/building.svg'
import check from '../assets/icons/check.svg'
import clock from '../assets/icons/clock.svg'
import dollar from '../assets/icons/dollar.svg'
import users from '../assets/icons/users.svg'
import { ConsoleTopBar } from '../components/layout/ConsoleTopBar'
import { Button, Input, MockNotice } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatDate, formatMoney } from '../data/format'
import { findOpportunity, organizationName } from '../data/selectors'
import styles from './console.module.css'

type ReportKind = 'hours' | 'donations'

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell)
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\n')
}

/**
 * Figma: A-03 Reports (16:125). REQ-ADM-7.
 *
 * Totals are computed from the same records the rest of the app uses, so the
 * report and the underlying data cannot disagree. CSV export is real: the
 * file is generated in the browser and downloaded.
 */
export function AdminReports() {
  const { state } = useData()

  const [kind, setKind] = useState<ReportKind>('hours')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [generated, setGenerated] = useState(false)

  const within = (iso: string) => {
    const when = new Date(iso)
    if (from && when < new Date(`${from}T00:00:00`)) return false
    if (to && when > new Date(`${to}T23:59:59`)) return false
    return true
  }

  // Hours: one row per attended registration (REQ-ADM-7, REQ-VOL-10).
  const hourRows = state.registrations
    .filter((registration) => {
      const status = state.attendance[registration.id] ?? registration.attendance
      return status === 'attended' && within(registration.createdAt)
    })
    .map((registration) => {
      const opportunity = findOpportunity(registration.opportunityId, state)
      const shift = opportunity?.shifts.find((s) => s.id === registration.shiftId)
      return {
        opportunity: opportunity?.title ?? 'Unknown',
        organization: organizationName(opportunity?.organizationId ?? null) ?? 'BCS',
        date: shift ? formatDate(shift.start) : '—',
        hours: shift?.hours ?? 0,
      }
    })

  const totalHours = hourRows.reduce((sum, row) => sum + row.hours, 0)
  const organizations = new Set(hourRows.map((row) => row.organization)).size

  // Donations split into known and anonymous (REQ-ADM-7).
  const donationRows = state.donations
    .filter((donation) => within(donation.createdAt))
    .map((donation) => ({
      date: formatDate(new Date(donation.createdAt)),
      donor: donation.anonymous ? 'Anonymous' : donation.donorName,
      anonymous: donation.anonymous ? 'yes' : 'no',
      amount: donation.amountCents / 100,
      reference: donation.reference,
    }))

  const totalDonated = donationRows.reduce((sum, row) => sum + row.amount, 0)
  const anonymousCount = donationRows.filter((row) => row.anonymous === 'yes').length
  const inKindCount = state.inKindOffers.filter((offer) => within(offer.createdAt)).length

  const download = () => {
    const rows =
      kind === 'hours'
        ? [
            ['Opportunity', 'Organization', 'Date', 'Hours'],
            ...hourRows.map((row) => [row.opportunity, row.organization, row.date, row.hours]),
            ['Total', '', '', totalHours],
          ]
        : [
            ['Date', 'Donor', 'Anonymous', 'Amount (USD)', 'Reference'],
            ...donationRows.map((row) => [
              row.date,
              row.donor,
              row.anonymous,
              row.amount,
              row.reference,
            ]),
            ['Total', '', '', totalDonated, ''],
          ]

    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `bcs-${kind}-report.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const stats: [string, string, string, string][] =
    kind === 'hours'
      ? [
          [clock, 'Total logged hours', totalHours.toFixed(1), `From ${hourRows.length} records`],
          [check, 'Shifts attended', String(hourRows.length), 'Attended only'],
          [users, 'Volunteers', String(hourRows.length ? 1 : 0), 'Demo account'],
          [building, 'Organizations', String(organizations), 'With logged hours'],
        ]
      : [
          [dollar, 'Total donated', formatMoney(Math.round(totalDonated * 100)), `From ${donationRows.length} gifts`],
          [users, 'Known donors', String(donationRows.length - anonymousCount), 'Named gifts'],
          [check, 'Anonymous gifts', String(anonymousCount), 'Donor shown as Anonymous'],
          [building, 'In-kind offers', String(inKindCount), 'Item donations'],
        ]

  return (
    <div className={styles.page}>
      <ConsoleTopBar
        crumb="Staff console / Reports"
        name="Sam Patel"
        role="BCS Staff · Administrator"
        initials="SP"
      />

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.lede}>
            Volunteer-hour and donation summaries for any date range, exportable as CSV.
          </p>
        </div>
      </div>

      <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
        <h2 className={styles.sectionTitle}>Report</h2>
        <div className={styles.chips} role="group" aria-label="Report type">
          {(
            [
              ['hours', 'Volunteer hours'],
              ['donations', 'Donations'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={kind === key}
              className={[styles.chip, kind === key ? styles.chipActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setKind(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.fieldRow}>
          <Input
            label="From"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Input label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          <Button onClick={() => setGenerated(true)}>Generate</Button>
        </div>
      </form>

      <section className={styles.stats} aria-label="Report totals">
        {stats.map(([icon, label, value, note]) => (
          <div className={styles.stat} key={label}>
            <span className={styles.statLabel}>
              <img className={styles.icon} src={icon} alt="" />
              {label}
            </span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statNote}>{note}</span>
          </div>
        ))}
      </section>

      <div className={styles.pageHead}>
        <h2 className={styles.sectionTitle}>
          {kind === 'hours' ? 'Hours by opportunity' : 'Donations'}
        </h2>
        <Button variant="secondary" onClick={download}>
          Export CSV
        </Button>
      </div>

      <div className={styles.tableWrap}>
        {(kind === 'hours' ? hourRows.length : donationRows.length) === 0 ? (
          <p className={styles.empty}>
            No records in this range yet. Register for a shift and mark it attended, or make a
            donation, then generate the report again.
          </p>
        ) : kind === 'hours' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Organization</th>
                <th>Date</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {hourRows.map((row, index) => (
                <tr key={index}>
                  <td className={styles.name}>{row.opportunity}</td>
                  <td>{row.organization}</td>
                  <td className={styles.numeric}>{row.date}</td>
                  <td className={styles.numeric}>{row.hours.toFixed(1)}</td>
                </tr>
              ))}
              <tr>
                <td className={styles.name}>Total</td>
                <td />
                <td />
                <td className={styles.numeric}>{totalHours.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor</th>
                <th>Amount</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {donationRows.map((row, index) => (
                <tr key={index}>
                  <td className={styles.numeric}>{row.date}</td>
                  <td className={styles.name}>{row.donor}</td>
                  <td className={styles.numeric}>
                    {formatMoney(Math.round(row.amount * 100))}
                  </td>
                  <td>{row.reference}</td>
                </tr>
              ))}
              <tr>
                <td className={styles.name}>Total</td>
                <td />
                <td className={styles.numeric}>
                  {formatMoney(Math.round(totalDonated * 100))}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {generated ? (
        <p className={styles.saved} role="status">
          Report generated for {from || 'the beginning'} to {to || 'today'}.
        </p>
      ) : null}

      <MockNotice>
        REQ-ADM-7 also calls for a service-usage and fee-revenue report. Space bookings, rentals
        and rides are deferred services, so there is nothing to report on and that third report
        is not built.
      </MockNotice>
    </div>
  )
}
