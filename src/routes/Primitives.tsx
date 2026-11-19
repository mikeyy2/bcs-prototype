import { Badge, BADGE_TONES, Button, Card, Input, Logo, MockLabel, MockNotice } from '../components/ui'
import building from '../assets/icons/building.svg'
import chart from '../assets/icons/chart.svg'
import check from '../assets/icons/check.svg'
import external from '../assets/icons/external.svg'
import home from '../assets/icons/home.svg'
import logout from '../assets/icons/logout.svg'
import plus from '../assets/icons/plus.svg'
import users from '../assets/icons/users.svg'
import styles from './Primitives.module.css'

const TOKENS = [
  ['--bcs-primary', '#0F5257'],
  ['--bcs-primary-dark', '#0A3B3F'],
  ['--bcs-accent', '#E8833A'],
  ['--bcs-text', '#1C2B2D'],
  ['--bcs-background', '#F7F5F0'],
  ['--bcs-border', '#E2DED6'],
]

const ICONS = [
  ['home', home],
  ['check', check],
  ['users', users],
  ['chart', chart],
  ['plus', plus],
  ['building', building],
  ['external', external],
  ['logout', logout],
]

/**
 * P1 deliverable: every primitive rendered in every variant, so the component
 * library can be checked against Figma without opening a screen.
 */
export function Primitives() {
  return (
    <main className={styles.page}>
      <header className={styles.section}>
        <h1 className={styles.heading}>BCS component library</h1>
        <p className={styles.lede}>
          Work package P1 (WBS 9.4.2). Tokens and primitives built from Figma file
          BCS&nbsp;Prototype&nbsp;Team&nbsp;11. This page is a development reference, not one of
          the 20 prototype screens.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Colour tokens (Figma variables)</h2>
        <div className={styles.swatches}>
          {TOKENS.map(([name, value]) => (
            <div className={styles.swatch} key={name}>
              <div className={styles.chip} style={{ background: `var(${name})` }} />
              <span className={styles.swatchName}>{name.replace('--bcs-', '')}</span>
              <span className={styles.swatchValue}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button — 2:45 / 3:49</h2>
        <div className={styles.row}>
          <Button>Find opportunities</Button>
          <Button variant="secondary">Learn more</Button>
          <Button disabled>Event full</Button>
          <Button variant="secondary" disabled>
            Unavailable
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input — 3:54</h2>
        <div className={styles.row}>
          <Input label="Email" type="email" placeholder="you@email.com" />
          <Input label="Full name" required placeholder="Jordan Diaz" />
          <Input
            label="Donation amount"
            defaultValue="0.50"
            error="Enter an amount of at least $1."
          />
          <Input label="Organization" disabled defaultValue="Ames Food Pantry" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badge — 3:57 / 3:60 / 4:64 (19 labels)</h2>
        <div className={styles.row}>
          {Object.keys(BADGE_TONES).map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Card — 4:67</h2>
        <Card title="Card Title">
          <p className={styles.lede}>
            Cards carry opportunity, event and listing summaries from P4 onward.
          </p>
        </Card>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Logo — 2:40</h2>
        <div className={styles.row}>
          <Logo variant="brand" />
        </div>
        <div className={styles.darkRow}>
          <Logo variant="onDark" />
          <Logo variant="console" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Icons — downloaded from Figma</h2>
        <div className={styles.icons}>
          {ICONS.map(([name, src]) => (
            <span className={styles.icon} key={name}>
              <img src={src} alt="" />
              {name}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Mock marker — not in Figma</h2>
        <div className={styles.row}>
          <MockLabel />
          <MockLabel>payment</MockLabel>
          <MockLabel>email sent</MockLabel>
          <MockLabel>sign-in</MockLabel>
          <MockLabel>upload</MockLabel>
        </div>
        <MockNotice>
          GitHub Pages serves static files only, so every server-backed feature in this
          prototype is simulated in the browser and labelled like this.
        </MockNotice>
      </section>
    </main>
  )
}
