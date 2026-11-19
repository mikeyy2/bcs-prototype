import type { ReactNode } from 'react'
import styles from './MockLabel.module.css'

type MockLabelProps = {
  /** Short description of what is simulated, e.g. "payment", "email sent". */
  children?: ReactNode
  className?: string
}

/**
 * Visible marker for a simulated feature. Required by CLAUDE.md — GitHub Pages
 * is static, so anything that would need a server is mocked and must say so.
 * Not a Figma component.
 */
export function MockLabel({ children, className }: MockLabelProps) {
  return (
    <span className={[styles.mock, className].filter(Boolean).join(' ')}>
      Mock
      {children ? <span className={styles.detail}>{children}</span> : null}
    </span>
  )
}

/** Block form, for explaining a mocked flow inline on a page. */
export function MockNotice({ children, className }: MockLabelProps) {
  return (
    <div className={[styles.block, className].filter(Boolean).join(' ')} role="note">
      <MockLabel />
      <span>{children}</span>
    </div>
  )
}
