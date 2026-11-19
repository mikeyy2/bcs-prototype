import { Link } from 'react-router-dom'
import { Button, MockNotice } from '../components/ui'
import styles from './Primitives.module.css'

/**
 * Temporary index. The real C-01 Home arrives in work package P4; this exists
 * so P0's acceptance check (app loads, inner route survives refresh) is
 * verifiable before any screen is built.
 */
export function Placeholder() {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Best Community Services — functional prototype</h1>
      <p className={styles.lede}>
        SE 3290 Team 11. Scaffold and component library only: work packages P0 and P1 are
        complete, screens C-01 onward are not built yet.
      </p>
      <MockNotice>
        No screens are wired yet. The component library below is the P1 deliverable.
      </MockNotice>
      <div className={styles.row}>
        <Link to="/primitives">
          <Button>View component library</Button>
        </Link>
      </div>
    </main>
  )
}
