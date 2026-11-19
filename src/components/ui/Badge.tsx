import type { ReactNode } from 'react'
import type { BadgeTone } from './badgeTones'
import { toneForLabel } from './badgeTones'
import styles from './Badge.module.css'

type BadgeProps = {
  children: ReactNode
  /** Omit to derive the tone from the label text via BADGE_TONES. */
  tone?: BadgeTone
  className?: string
}

/** Figma: Badge / Green (3:57), Badge / Yellow (3:60), Badge / Red (4:64). */
export function Badge({ children, tone, className }: BadgeProps) {
  const resolved = tone ?? (typeof children === 'string' ? toneForLabel(children) : 'yellow')

  return (
    <span className={[styles.badge, styles[resolved], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
