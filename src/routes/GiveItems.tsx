import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import box from '../assets/icons/box.svg'
import calendar from '../assets/icons/calendar.svg'
import clock from '../assets/icons/clock.svg'
import pin from '../assets/icons/pin.svg'
import upload from '../assets/icons/upload.svg'
import { Container } from '../components/layout/Container'
import { Button, Input, MockLabel } from '../components/ui'
import { useData } from '../data/dataContext'
import { formatLongDate, formatTime } from '../data/format'
import { dropOffSlots } from '../data/selectors'
import styles from './GiveItems.module.css'

const CATEGORIES = [
  'Clothing and coats',
  'Non-perishable food',
  'School supplies',
  'Household goods',
  'Toys and games',
]

const CONDITIONS = ['New', 'Gently used', 'Well used']

/**
 * Figma: D-03 Give Items (16:117). REQ-DON-6 and REQ-DON-7.
 *
 * The photo upload captures the file name only — nothing is stored, since
 * there is no object storage on static hosting.
 */
export function GiveItems() {
  const { state, submitInKind } = useData()
  const navigate = useNavigate()

  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [condition, setCondition] = useState(CONDITIONS[1])
  const [photoName, setPhotoName] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const slots = dropOffSlots(state)
  const chosen = slots.find((slot) => slot.id === slotId) ?? null

  const onSubmit = () => {
    setError(null)

    if (!description.trim()) {
      setError('Describe what you are giving.')
      return
    }
    const count = Number(quantity)
    if (!Number.isInteger(count) || count < 1) {
      setError('Enter a quantity of at least 1.')
      return
    }
    if (!slotId) {
      setError('Pick an open drop-off time.')
      return
    }

    submitInKind({ category, description, quantity: count, condition, photoName, slotId })
    setDone(true)
  }

  return (
    <Container className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/donate">Donate</Link>
        <span aria-hidden="true">/</span>
        <span>Give items</span>
      </nav>

      <div>
        <h1 className={styles.title}>Give items</h1>
        <p className={styles.lede}>
          Tell us what you are donating and pick an open drop-off time. BCS staff review each
          offer before it is confirmed.
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.forms}>
          <form className={styles.card} onSubmit={(event) => event.preventDefault()}>
            <h2 className={styles.cardTitle}>What are you giving?</h2>

            <Input
              label="Category"
              list="item-categories"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <datalist id="item-categories">
              {CATEGORIES.map((option) => (
                <option value={option} key={option} />
              ))}
            </datalist>

            <div className={styles.itemRow}>
              <Input
                label="Description"
                placeholder="Winter coats, adult sizes"
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <Input
                label="Quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <Input
                label="Condition"
                list="item-conditions"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
              />
              <datalist id="item-conditions">
                {CONDITIONS.map((option) => (
                  <option value={option} key={option} />
                ))}
              </datalist>
            </div>

            <label className={styles.upload}>
              <img className={styles.uploadIcon} src={upload} alt="" />
              {photoName ? (
                <span className={styles.uploadName}>{photoName}</span>
              ) : (
                <span>Drag photos here or browse (optional)</span>
              )}
              <MockLabel>upload</MockLabel>
              <span className={styles.note}>
                The file name is recorded; the image itself is not stored.
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="srOnly"
                onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? null)}
              />
            </label>
          </form>

          <section className={styles.card} aria-labelledby="dropoff-heading">
            <h2 className={styles.cardTitle} id="dropoff-heading">
              Pick a drop-off time
            </h2>
            <p className={styles.note}>
              Booked slots cannot be selected. Picking one holds it for you.
            </p>
            <div className={styles.slots}>
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  disabled={slot.booked}
                  aria-pressed={slotId === slot.id}
                  className={[
                    styles.slot,
                    slotId === slot.id ? styles.slotSelected : '',
                    slot.booked ? styles.slotBooked : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSlotId(slot.id)}
                >
                  <span className={styles.slotDay}>{formatLongDate(slot.start).split(',')[0]}</span>
                  <span className={styles.slotTime}>{formatTime(slot.start)}</span>
                  <span
                    className={[styles.slotState, slot.booked ? styles.slotStateBooked : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {slot.booked ? 'Booked' : slotId === slot.id ? 'Selected' : 'Open'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Your drop-off</h2>

          {done ? (
            <div className={styles.success} role="status">
              <strong>Offer submitted.</strong>
              <span>
                BCS staff review it before it is confirmed, and your slot is now unavailable to
                other donors.
              </span>
              <MockLabel>email sent</MockLabel>
              <Button variant="secondary" onClick={() => navigate('/my-activity')}>
                View my activity
              </Button>
            </div>
          ) : (
            <>
              <p className={styles.meta}>
                <img className={styles.icon} src={calendar} alt="" />
                {chosen ? formatLongDate(chosen.start) : 'No time picked yet'}
              </p>
              <p className={styles.meta}>
                <img className={styles.icon} src={clock} alt="" />
                {chosen ? `${formatTime(chosen.start)} (30 minutes)` : '—'}
              </p>
              <p className={styles.meta}>
                <img className={styles.icon} src={pin} alt="" />
                BCS Community Center, 515 Clark Ave
              </p>
              <p className={styles.meta}>
                <img className={styles.icon} src={box} alt="" />
                {description.trim() ? `${quantity} × ${description}` : 'Nothing described yet'}
              </p>

              <hr className={styles.divider} />

              <p className={styles.note}>
                BCS staff review your offer, then this slot is marked unavailable for other
                donors.
              </p>

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <Button fullWidth onClick={onSubmit}>
                Submit offer
              </Button>
            </>
          )}
        </aside>
      </div>
    </Container>
  )
}
