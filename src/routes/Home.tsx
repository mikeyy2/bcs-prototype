import { Link, useNavigate } from 'react-router-dom'
import box from '../assets/icons/box.svg'
import building from '../assets/icons/building.svg'
import { Container } from '../components/layout/Container'
import { EventDivider, EventRow } from '../components/content/EventRow'
import { ImagePlaceholder } from '../components/content/ImagePlaceholder'
import { OpportunityCard } from '../components/content/OpportunityCard'
import { Button } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatMoney } from '../data/format'
import { YEAR_TO_DATE } from '../data/seed'
import { catalogueSummary, publishedEvents, publishedOpportunities } from '../data/selectors'
import styles from './Home.module.css'

/**
 * Figma: C-01 Home (1:26). REQ-COM-2 — features opportunities, events and the
 * donate call to action.
 *
 * DEVIATION DATA-1: Figma prints fixed impact figures ("86 partner
 * organizations", "340 open volunteer shifts"). Those two are computed from
 * the seed instead, so the page agrees with the catalogue it links to. The
 * two historical totals have no seed basis and stay as drawn.
 */
export function Home() {
  const { state } = useData()
  const navigate = useNavigate()

  const opportunities = publishedOpportunities(state)
  const events = publishedEvents(state)
  const summary = catalogueSummary(state)
  const openShifts = opportunities.reduce((sum, o) => sum + o.totalRemaining, 0)

  const stats: [string, string][] = [
    [YEAR_TO_DATE.volunteerHours.toLocaleString('en-US'), 'volunteer hours logged this year'],
    [String(summary.organizationCount), 'partner organizations'],
    [formatMoney(YEAR_TO_DATE.donatedCents).replace(/\.00$/, ''), 'donated to local causes'],
    [String(openShifts), 'open volunteer shifts'],
  ]

  return (
    <>
      <section className={styles.hero}>
        <Container className={styles.heroInner}>
          <div className={styles.heroStack}>
            <span className={styles.eyebrow}>Volunteer · Donate · Connect</span>
            <h1 className={styles.headline}>
              Make a difference in your community, one shift at a time.
            </h1>
            <p className={styles.lede}>
              Find volunteer opportunities with local nonprofits, give to causes you care about,
              and join community events, all in one place.
            </p>
            <div className={styles.heroButtons}>
              <Button onClick={() => navigate('/volunteer')}>Find opportunities</Button>
              <Button variant="secondary" onClick={() => navigate('/donate')}>
                Donate today
              </Button>
            </div>
          </div>
          <ImagePlaceholder
            className={styles.heroImage}
            caption="Volunteers sorting food at a local pantry"
            height={346}
          />
        </Container>
      </section>

      <Container className={styles.content}>
        <section className={styles.stats} aria-label="BCS at a glance">
          {stats.map(([value, label]) => (
            <div className={styles.stat} key={label}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Featured volunteer opportunities</h2>
              <p className={styles.sectionLede}>Hand-picked shifts that need help this week.</p>
            </div>
            <Link className={styles.sectionLink} to="/volunteer">
              View all opportunities
            </Link>
          </div>
          <div className={styles.cards}>
            {opportunities.slice(0, 3).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Upcoming community events</h2>
            <Link className={styles.sectionLink} to="/events">
              See the calendar
            </Link>
          </div>
          <div className={styles.eventList}>
            {events.slice(0, 3).map((event, index) => (
              <div key={event.id}>
                {index > 0 ? <EventDivider /> : null}
                <EventRow event={event} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.ctas} aria-label="Other ways to help">
          <div className={styles.cta}>
            <img className={styles.ctaIcon} src={box} alt="" />
            <h2 className={styles.ctaTitle}>Give items your neighbors need</h2>
            <p className={styles.ctaBody}>
              Offer coats, canned goods and school supplies, then pick a drop-off time.
            </p>
            <Button onClick={() => navigate('/give-items')}>Offer items</Button>
          </div>
          <div className={styles.cta}>
            <img className={styles.ctaIcon} src={building} alt="" />
            <h2 className={styles.ctaTitle}>Are you a nonprofit?</h2>
            <p className={styles.ctaBody}>
              Apply to become a BCS partner and post your own volunteer opportunities and events.
            </p>
            <Button variant="secondary" onClick={() => navigate('/partner/apply')}>
              Apply to partner
            </Button>
          </div>
        </section>
      </Container>
    </>
  )
}
