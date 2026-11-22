import { useState } from 'react'
import info from '../assets/icons/info.svg'
import { ConsoleTopBar } from '../components/layout/ConsoleTopBar'
import { Badge, Button, Input } from '../components/ui'
import { useData } from '../data/dataContext'
import { memberAccounts, partnerOrganizations, staffAccounts } from '../data/selectors'
import type { StaffAccount } from '../data/types'
import styles from './console.module.css'

const ROLES: StaffAccount['role'][] = ['Staff', 'Driver', 'Administrator']

/**
 * Figma: A-02 Accounts & Partners (16:124).
 * REQ-ADM-1 (suspend/reactivate), REQ-ADM-2 (revoke), REQ-ADM-3 (staff roles).
 */
export function AdminAccounts() {
  const { state, setAccountStatus, setPartnerRevoked, addStaffAccount, setStaffActive } = useData()

  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'Staff' as StaffAccount['role'],
    employment: 'Full-time' as StaffAccount['employment'],
  })
  const [error, setError] = useState<string | null>(null)

  const term = search.trim().toLowerCase()
  const accounts = memberAccounts(state).filter(
    (account) =>
      !term ||
      account.name.toLowerCase().includes(term) ||
      account.email.toLowerCase().includes(term),
  )
  const partners = partnerOrganizations(state)
  const staff = staffAccounts(state)

  return (
    <div className={styles.page}>
      <ConsoleTopBar
        crumb="Staff console / Accounts & partners"
        name="Sam Patel"
        role="BCS Staff · Administrator"
        initials="SP"
      />

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Accounts &amp; partners</h1>
          <p className={styles.lede}>
            Search, suspend and reactivate accounts, and oversee partner organizations.
          </p>
        </div>
      </div>

      {notice ? (
        <div className={styles.banner} role="status">
          <img className={styles.bannerIcon} src={info} alt="" />
          <span>{notice}</span>
        </div>
      ) : null}

      <Input
        label="Search by name or email"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <h2 className={styles.sectionTitle}>Member accounts</h2>
      <div className={styles.tableWrap}>
        {accounts.length === 0 ? (
          <p className={styles.empty}>No accounts match that search.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>
                  <span className="srOnly">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className={styles.name}>{account.name}</td>
                  <td>{account.email}</td>
                  <td>{account.roles}</td>
                  <td>
                    <Badge>{account.status === 'active' ? 'Active' : 'Suspended'}</Badge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={[
                        styles.link,
                        account.status === 'active' ? styles.linkDanger : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        const next = account.status === 'active' ? 'suspended' : 'active'
                        setAccountStatus(account.id, next)
                        setNotice(
                          next === 'suspended'
                            ? `Account suspended: ${account.name}. They can no longer sign in, and you can reactivate at any time.`
                            : `Account reactivated: ${account.name}.`,
                        )
                      }}
                    >
                      {account.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className={styles.sectionTitle}>Partner organizations</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Service area</th>
              <th>Active listings</th>
              <th>Status</th>
              <th>
                <span className="srOnly">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td className={styles.name}>{partner.name}</td>
                <td>{partner.serviceArea}</td>
                <td className={styles.numeric}>{partner.activeListings}</td>
                <td>
                  <Badge>{partner.revoked ? 'Revoked' : 'Verified partner'}</Badge>
                </td>
                <td>
                  <button
                    type="button"
                    className={[styles.link, partner.revoked ? '' : styles.linkDanger]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setPartnerRevoked(partner.id, !partner.revoked)
                      setNotice(
                        partner.revoked
                          ? `${partner.name} reinstated. Its listings are public again.`
                          : `${partner.name} revoked. All of its listings were unpublished immediately.`,
                      )
                    }}
                  >
                    {partner.revoked ? 'Reinstate' : 'Revoke'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.meta}>
        <img className={styles.icon} src={info} alt="" />
        Revoking a partner unpublishes all of its active listings immediately.
      </p>

      <h2 className={styles.sectionTitle}>Staff accounts</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Employment</th>
              <th>
                <span className="srOnly">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td className={styles.name}>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.employment}</td>
                <td>
                  <button
                    type="button"
                    className={[styles.link, member.active ? styles.linkDanger : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setStaffActive(member.id, !member.active)}
                  >
                    {member.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
        <h2 className={styles.sectionTitle}>Create a staff account</h2>
        <div className={styles.fieldRow}>
          <Input
            label="Full name"
            value={staffForm.name}
            onChange={(event) => setStaffForm({ ...staffForm, name: event.target.value })}
          />
          <Input
            label="Work email"
            type="email"
            value={staffForm.email}
            onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })}
          />
          <Input
            label="Role"
            list="staff-roles"
            value={staffForm.role}
            onChange={(event) =>
              setStaffForm({ ...staffForm, role: event.target.value as StaffAccount['role'] })
            }
          />
          <datalist id="staff-roles">
            {ROLES.map((role) => (
              <option value={role} key={role} />
            ))}
          </datalist>
          <Input
            label="Employment"
            list="staff-employment"
            value={staffForm.employment}
            onChange={(event) =>
              setStaffForm({
                ...staffForm,
                employment: event.target.value as StaffAccount['employment'],
              })
            }
          />
          <datalist id="staff-employment">
            <option value="Full-time" />
            <option value="Part-time" />
          </datalist>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button
            onClick={() => {
              setError(null)
              if (!staffForm.name.trim() || !staffForm.email.trim()) {
                setError('Enter a name and a work email.')
                return
              }
              addStaffAccount({ ...staffForm, active: true })
              setNotice(`Staff account created for ${staffForm.name}.`)
              setStaffForm({ name: '', email: '', role: 'Staff', employment: 'Full-time' })
            }}
          >
            Create account
          </Button>
        </div>
      </form>
    </div>
  )
}
