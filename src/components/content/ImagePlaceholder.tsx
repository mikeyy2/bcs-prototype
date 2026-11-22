import imageIcon from '../../assets/icons/image.svg'
import styles from './ImagePlaceholder.module.css'


/** Figma draws photography as captioned placeholder blocks; kept as drawn. */
export function ImagePlaceholder({
  caption,
  height = 140,
  tint,
  className,
}: {
  caption: string
  height?: number
  /** Figma tints the placeholder by category; see TINT_BY_CATEGORY. */
  tint?: string
  className?: string
}) {
  return (
    <div
      className={[styles.placeholder, className].filter(Boolean).join(' ')}
      style={{ height, background: tint }}
      role="img"
      aria-label={caption}
    >
      <img className={styles.icon} src={imageIcon} alt="" />
      <span aria-hidden="true">{caption}</span>
    </div>
  )
}
