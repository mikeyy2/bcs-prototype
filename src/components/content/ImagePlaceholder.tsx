import imageIcon from '../../assets/icons/image.svg'
import styles from './ImagePlaceholder.module.css'

/** Figma draws photography as captioned placeholder blocks; kept as drawn. */
export function ImagePlaceholder({
  caption,
  height = 140,
  className,
}: {
  caption: string
  height?: number
  className?: string
}) {
  return (
    <div
      className={[styles.placeholder, className].filter(Boolean).join(' ')}
      style={{ height }}
      role="img"
      aria-label={caption}
    >
      <img className={styles.icon} src={imageIcon} alt="" />
      <span aria-hidden="true">{caption}</span>
    </div>
  )
}
