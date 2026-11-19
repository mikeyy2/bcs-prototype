import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  children?: ReactNode
}

/** Figma: Card (4:67). */
export function Card({ title, children, className, ...rest }: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {title ? <p className={styles.title}>{title}</p> : null}
      {children}
    </div>
  )
}
