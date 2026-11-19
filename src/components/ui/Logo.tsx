import styles from './Logo.module.css'

export type LogoVariant = 'brand' | 'onDark' | 'console'

type LogoProps = {
  /** brand = header, onDark = footer, console = partner/admin sidebars. */
  variant?: LogoVariant
  className?: string
}

/** Figma: Logo (2:40). */
export function Logo({ variant = 'brand', className }: LogoProps) {
  return (
    <span className={[styles.logo, styles[variant], className].filter(Boolean).join(' ')}>
      <span className={styles.mark} aria-hidden="true">
        B
      </span>
      <span className={styles.wordmark}>
        <span className={styles.name}>Best Community</span>
        <span className={styles.suffix}>Services</span>
      </span>
    </span>
  )
}
