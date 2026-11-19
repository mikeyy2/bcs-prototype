import { Link } from 'react-router-dom'
import { Logo } from '../ui'
import styles from './Footer.module.css'

/** Inert because the target has no Figma frame (decision 6). */
function Inert({ children }: { children: string }) {
  return (
    <span className={styles.inert} aria-disabled="true" title="Not in this prototype">
      {children}
    </span>
  )
}

/** Figma: Footer 11:64. Links wired per DEVIATION NAV-1. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <Link to="/">
            <span aria-hidden="true">
              <Logo variant="onDark" />
            </span>
            <span className="srOnly">Best Community Services — home</span>
          </Link>
          <p className={styles.tagline}>
            Connecting volunteers, donors and nonprofit partners to strengthen our community.
          </p>
        </div>

        <div className={styles.columns}>
          <nav className={styles.column} aria-label="Get involved">
            <p className={styles.columnTitle}>Get Involved</p>
            <Link className={styles.link} to="/volunteer">
              Find Opportunities
            </Link>
            <Link className={styles.link} to="/events">
              Upcoming Events
            </Link>
            <Link className={styles.link} to="/donate">
              Donate
            </Link>
            <Link className={styles.link} to="/give-items">
              Give Items
            </Link>
          </nav>

          <nav className={styles.column} aria-label="Organizations">
            <p className={styles.columnTitle}>Organizations</p>
            <Link className={styles.link} to="/partner/apply">
              Partner With Us
            </Link>
            <Link className={styles.link} to="/login">
              Partner Log in
            </Link>
          </nav>

          <nav className={styles.column} aria-label="About BCS">
            <p className={styles.columnTitle}>BCS</p>
            <Inert>About Us</Inert>
            <Inert>Contact and FAQ</Inert>
            <Link className={styles.link} to="/admin">
              Staff console
            </Link>
          </nav>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 Best Community Services. All rights reserved.</p>
        <p className={styles.legal}>
          <Inert>Accessibility</Inert>
          <span aria-hidden="true">·</span>
          <Inert>Privacy</Inert>
          <span aria-hidden="true">·</span>
          <Inert>Terms</Inert>
        </p>
      </div>
    </footer>
  )
}
