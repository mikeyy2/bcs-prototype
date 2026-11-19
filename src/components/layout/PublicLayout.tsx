import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { MockPanel } from '../mock/MockPanel'
import styles from './Layouts.module.css'

/** Header + content + footer, the shell every public screen shares (REQ-COM-1). */
export function PublicLayout() {
  return (
    <div className={styles.public}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.publicMain}>
        <Outlet />
      </main>
      <Footer />
      <MockPanel />
    </div>
  )
}
