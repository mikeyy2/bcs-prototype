import { Link } from 'react-router-dom'
import arrowRight from '../../assets/icons/arrow-right.svg'
import calendar from '../../assets/icons/calendar.svg'
import pin from '../../assets/icons/pin.svg'
import { formatDate, formatTimeRange } from '../../data/format'
import type { ResolvedOpportunity } from '../../data/selectors'
import { ImagePlaceholder } from './ImagePlaceholder'
import styles from './OpportunityCard.module.css'

/**
 * Figma: Opportunity Card (17:101), used on C-01, V-01 and S-01.
 * Capacity text comes from the live availability model, not the seed literal.
 */
export function OpportunityCard({ opportunity }: { opportunity: ResolvedOpportunity }) {
  const next = opportunity.shifts.find((s) => !s.isFull) ?? opportunity.shifts[0]
  const spots = opportunity.isFull
    ? `Full · 0 of ${next?.capacity ?? 0} spots left`
    : `${next?.remaining ?? 0} of ${next?.capacity ?? 0} spots left`

  return (
    <Link className={styles.card} to={`/volunteer/${opportunity.id}`}>
      <ImagePlaceholder caption={`${opportunity.category} photo`} />
      <div className={styles.stack}>
        <span className={styles.tag}>{opportunity.category}</span>
        <h3 className={styles.title}>{opportunity.title}</h3>
        <p className={styles.org}>{opportunity.organizationName}</p>

        {next ? (
          <p className={styles.meta}>
            <img className={styles.metaIcon} src={calendar} alt="" />
            {formatDate(next.start)} · {formatTimeRange(next.start, next.end)}
          </p>
        ) : null}

        <p className={styles.meta}>
          <img className={styles.metaIcon} src={pin} alt="" />
          {opportunity.city}, IA {opportunity.zip}
        </p>

        <div className={styles.row}>
          <span className={[styles.spots, opportunity.isFull ? styles.spotsFull : ''].join(' ')}>
            {spots}
          </span>
          <span className={styles.details}>
            View details
            <img className={styles.detailsIcon} src={arrowRight} alt="" />
          </span>
        </div>
      </div>
    </Link>
  )
}
