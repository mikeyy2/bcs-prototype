import { Outlet } from 'react-router-dom'
import { ConsoleSidebar } from './ConsoleSidebar'
import styles from './Layouts.module.css'

/** Sidebar + content, used by the partner (P-02, P-03) and staff (A-01…A-03) consoles. */
export function ConsoleLayout({ variant }: { variant: 'admin' | 'partner' }) {
  return (
    <div className={styles.console}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <ConsoleSidebar variant={variant} />
      <main id="main" className={styles.consoleMain}>
        <Outlet />
      </main>
    </div>
  )
}
