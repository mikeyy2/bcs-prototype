import { useEffect, useState } from 'react'
import { useData } from '../../data/dataContext'
import { formatDateTime } from '../../data/format'
import { Badge } from '../ui'
import styles from './MockPanel.module.css'

/**
 * The Mock outbox (WBS 9.3.1, 9.3.2) and the demo reset.
 *
 * Not a Figma screen — scoped as a slide-over so it does not claim to be one.
 * It is the evidence for REQ-NTF-1 and REQ-NTF-2: every email the prototype
 * would have sent is listed here with its template, recipient and send time.
 */
export function MockPanel() {
  const { state, resetDemoData } = useData()
  const [open, setOpen] = useState(false)
  const outbox = [...state.outbox].reverse()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Mock outbox
        <span className={styles.count}>{outbox.length}</span>
      </button>

      {open ? (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className={styles.panel} role="dialog" aria-modal="true" aria-label="Mock outbox">
            <div className={styles.head}>
              <div>
                <h2 className={styles.title}>Mock outbox</h2>
                <p className={styles.subtitle}>
                  Nothing is actually sent. Every email this prototype would have delivered is
                  listed here.
                </p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Close mock outbox"
              >
                Close
              </button>
            </div>

            <div className={styles.body}>
              {outbox.length === 0 ? (
                <p className={styles.empty}>
                  No emails yet. Register for a shift, RSVP or donate and they appear here.
                </p>
              ) : (
                outbox.map((mail) => (
                  <article className={styles.mail} key={mail.id}>
                    <div className={styles.mailHead}>
                      <p className={styles.subject}>{mail.subject}</p>
                      <Badge tone={mail.scheduled ? 'yellow' : 'green'}>
                        {mail.scheduled ? 'Scheduled' : 'Sent'}
                      </Badge>
                    </div>
                    <p className={styles.meta}>
                      To {mail.to} · {mail.template} · {formatDateTime(new Date(mail.sendAt))}
                    </p>
                    <p className={styles.mailBody}>{mail.body}</p>
                  </article>
                ))
              )}
            </div>

            <div className={styles.foot}>
              <span className={styles.stats}>
                {state.registrations.length} registrations · {state.rsvps.length} RSVPs ·{' '}
                {state.donations.length} donations
              </span>
              <button
                type="button"
                className={styles.reset}
                onClick={() => {
                  resetDemoData()
                  setOpen(false)
                }}
              >
                Reset demo data
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </>
  )
}
