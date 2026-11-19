import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useRole } from '../../app/roleContext'
import { ROLES, isSignedIn } from '../../app/roles'
import { Logo } from '../ui'
import styles from './Header.module.css'

/**
 * Figma: Header 11:30.
 *
 * DEVIATION NAV-1: in Figma the nav items sit inside the component, so they
 * cannot target a frame. They are wired to routes here — without that the
 * prototype cannot navigate at all.
 */
export function Header() {
  const { role, signOut } = useRole()
  const navigate = useNavigate()

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')

  return (
    <header className={styles.header}>
      <Link to="/">
        <span aria-hidden="true">
          <Logo variant="brand" />
        </span>
        <span className="srOnly">Best Community Services — home</span>
      </Link>

      <nav className={styles.nav} aria-label="Main">
        <NavLink to="/volunteer" className={navClass}>
          Volunteer
        </NavLink>
        <NavLink to="/events" className={navClass}>
          Events
        </NavLink>
        <NavLink to="/donate" className={navClass}>
          Donate
        </NavLink>
        <NavLink to="/partner/apply" className={navClass}>
          Partners
        </NavLink>
        <span className={styles.navInert} aria-disabled="true" title="No About page in this prototype">
          About
        </span>
      </nav>

      <div className={styles.right}>
        <Link to="/search" className={styles.search}>
          Search Opportunities and Events
        </Link>

        {isSignedIn(role) ? (
          <div className={styles.account}>
            <span className={styles.roleTag} data-testid="role-tag">{ROLES[role].label}</span>
            <Link to="/profile" className={styles.avatar} aria-label="Profile and notifications">
              {ROLES[role].initials}
            </Link>
            <button
              type="button"
              className={styles.signOut}
              onClick={() => {
                signOut()
                navigate('/login')
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <Link to="/login" className={styles.logIn}>
            Log In
          </Link>
        )}
      </div>
    </header>
  )
}
