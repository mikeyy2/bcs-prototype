import { NavLink, useNavigate } from 'react-router-dom'
import { useRole } from '../../app/roleContext'
import { Logo } from '../ui'
import building from '../../assets/icons/building.svg'
import chart from '../../assets/icons/chart.svg'
import check from '../../assets/icons/check.svg'
import external from '../../assets/icons/external.svg'
import home from '../../assets/icons/home.svg'
import logout from '../../assets/icons/logout.svg'
import plus from '../../assets/icons/plus.svg'
import users from '../../assets/icons/users.svg'
import styles from './ConsoleSidebar.module.css'

type Item = { to: string; label: string; icon: string }

const ADMIN_ITEMS: Item[] = [
  { to: '/admin', label: 'Dashboard', icon: home },
  { to: '/admin/approvals', label: 'Approvals', icon: check },
  { to: '/admin/accounts', label: 'Accounts', icon: users },
  { to: '/admin/reports', label: 'Reports', icon: chart },
]

const PARTNER_ITEMS: Item[] = [
  { to: '/partner', label: 'Dashboard', icon: home },
  { to: '/partner/new-listing', label: 'New listing', icon: plus },
  { to: '/partner/roster', label: 'Roster', icon: users },
  { to: '/partner/profile', label: 'Profile', icon: building },
]

type ConsoleSidebarProps = {
  variant: 'admin' | 'partner'
}

/**
 * Figma: Sidebar / Admin (16:20) and Sidebar / Partner (16:60). One component
 * with two variants — they differ only in background, menu items and the
 * console caption. Links wired per DEVIATION NAV-1.
 */
export function ConsoleSidebar({ variant }: ConsoleSidebarProps) {
  const { signOut } = useRole()
  const navigate = useNavigate()
  const items = variant === 'admin' ? ADMIN_ITEMS : PARTNER_ITEMS
  const caption = variant === 'admin' ? 'BCS STAFF CONSOLE' : 'PARTNER CONSOLE · Ames Food Pantry'

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    [styles.item, isActive ? styles.itemActive : ''].filter(Boolean).join(' ')

  return (
    <div className={[styles.sidebar, styles[variant]].join(' ')}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Logo variant="console" />
          <p className={styles.consoleName}>{caption}</p>
        </div>

        <nav className={styles.top} aria-label={variant === 'admin' ? 'Staff console' : 'Partner console'}>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={itemClass}>
              <img className={styles.icon} src={item.icon} alt="" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={styles.bottom}>
        <NavLink to="/" className={[styles.item, styles.muted].join(' ')}>
          <img className={styles.icon} src={external} alt="" />
          View public site
        </NavLink>
        <button
          type="button"
          className={[styles.item, styles.muted, styles.signOut].join(' ')}
          onClick={() => {
            signOut()
            navigate('/login')
          }}
        >
          <img className={styles.icon} src={logout} alt="" />
          Log out
        </button>
      </div>
    </div>
  )
}
