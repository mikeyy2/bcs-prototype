import type { ElementType, ReactNode } from 'react'
import styles from './Container.module.css'

export function Container({
  as: Tag = 'div',
  className,
  children,
}: {
  as?: ElementType
  className?: string
  children: ReactNode
}) {
  return <Tag className={[styles.container, className].filter(Boolean).join(' ')}>{children}</Tag>
}
