import styles from '../../routes/console.module.css'

/** Figma: the top bar repeated across P-02, P-03 and A-01…A-03. */
export function ConsoleTopBar({
  crumb,
  name,
  role,
  initials,
}: {
  crumb: string
  name: string
  role: string
  initials: string
}) {
  return (
    <div className={styles.topBar}>
      <p className={styles.crumb}>{crumb}</p>
      <div className={styles.who}>
        <span className={styles.whoText}>
          <span className={styles.whoName}>{name}</span>
          <span className={styles.whoRole}>{role}</span>
        </span>
        <span className={styles.whoAvatar} aria-hidden="true">
          {initials}
        </span>
      </div>
    </div>
  )
}
