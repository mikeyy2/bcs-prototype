import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import info from '../assets/icons/info.svg'
import { ConsoleTopBar } from '../components/layout/ConsoleTopBar'
import { ImagePlaceholder } from '../components/content/ImagePlaceholder'
import { Button, Input, MockNotice } from '../components/ui'
import { useData } from '../data/dataContext'
import { DEMO_PARTNER_ID, ORGANIZATIONS } from '../data/seed'
import type { OpportunityCategory } from '../data/types'
import styles from './console.module.css'

const PARTNER = ORGANIZATIONS.find((o) => o.id === DEMO_PARTNER_ID)!

const CATEGORIES: OpportunityCategory[] = [
  'Food Security',
  'Youth & Education',
  'Environment',
  'Health & Seniors',
  'Animal Welfare',
  'Community Events',
]

/** Figma: P-03 Create a Listing (16:121). REQ-PRT-4, REQ-PRT-5. */
export function PartnerListingForm() {
  const { createListing } = useData()
  const navigate = useNavigate()

  const [kind, setKind] = useState<'opportunity' | 'event'>('opportunity')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [daysAhead, setDaysAhead] = useState('14')
  const [capacity, setCapacity] = useState('20')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = () => {
    setError(null)

    if (!title.trim()) return setError('Give the listing a title.')
    const days = Number(daysAhead)
    if (!Number.isInteger(days) || days < 1) return setError('Set how many days ahead it runs.')
    const seats = Number(capacity)
    if (!Number.isInteger(seats) || seats < 1) return setError('Set a capacity of at least 1.')

    createListing({ title: title.trim(), kind, category, dayOffset: days, capacity: seats })
    navigate('/partner')
  }

  return (
    <div className={styles.page}>
      <ConsoleTopBar
        crumb="Partner console / New listing"
        name="Maria Lopez"
        role={PARTNER.name}
        initials="ML"
      />

      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.title}>Create a listing</h1>
          <p className={styles.lede}>
            New and edited listings are reviewed by BCS staff before they appear publicly.
          </p>
        </div>
      </div>

      <div className={styles.banner}>
        <img className={styles.bannerIcon} src={info} alt="" />
        <span>
          <span className={styles.bannerTitle}>Not public yet</span>
          <br />
          This listing stays hidden until BCS staff approve it. You will get an email with the
          decision.
        </span>
      </div>

      <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
        <h2 className={styles.sectionTitle}>Listing type</h2>
        <div className={styles.chips} role="group" aria-label="Listing type">
          {(['opportunity', 'event'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              className={[styles.chip, kind === option ? styles.chipActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setKind(option)}
            >
              {option === 'opportunity' ? 'Volunteer opportunity' : 'Community event'}
            </button>
          ))}
        </div>

        <Input
          label="Title"
          required
          placeholder="Holiday Grocery Box Drive"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className={styles.fieldRow}>
          <Input
            label="Category"
            list="listing-categories"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <datalist id="listing-categories">
            {CATEGORIES.map((option) => (
              <option value={option} key={option} />
            ))}
          </datalist>
          <Input
            label="Days from today"
            type="number"
            min={1}
            value={daysAhead}
            onChange={(event) => setDaysAhead(event.target.value)}
            hint="Seeded dates are relative, so listings never go stale."
          />
          <Input
            label="Capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
          />
        </div>

        <MockNotice>
          The full shift editor from the design is not built. A listing created here carries one
          date and one capacity, which is enough to show the approval workflow end to end.
        </MockNotice>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <div className={styles.actions}>
          <Button onClick={onSubmit}>Submit for approval</Button>
          <Button variant="secondary" onClick={() => navigate('/partner')}>
            Cancel
          </Button>
        </div>
      </form>

      <section className={styles.card} aria-labelledby="preview-heading">
        <h2 className={styles.sectionTitle} id="preview-heading">
          Public preview
        </h2>
        <ImagePlaceholder caption="Listing photo" height={140} />
        <p className={styles.name}>{title.trim() || 'Your listing title'}</p>
        <p className={styles.note}>
          {PARTNER.name} · {category} · {capacity || 0} spots
        </p>
      </section>
    </div>
  )
}
