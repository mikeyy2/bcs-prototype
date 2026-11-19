import { useNavigate, useLocation } from 'react-router-dom'
import { useRole } from '../app/roleContext'
import { ROLES } from '../app/roles'
import type { Role } from '../app/roles'
import { Button, Input, MockLabel, MockNotice } from '../components/ui'
import styles from './LogIn.module.css'

/** The four shortcuts drawn in Figma, in frame order. */
const SHORTCUTS: Role[] = ['volunteer', 'donor', 'partner', 'staff']

type GateState = { from?: string; needs?: Role[] }

/**
 * Figma: C-02 Log In / Sign Up (16:103).
 *
 * REQ-AUTH-1…3 are mocked. The email and password fields are drawn because
 * the design has them, but they do not authenticate anything — the
 * "Continue as" row is the real mechanism (see src/app/roles.ts).
 */
export function LogIn() {
  const { setRole } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const gate = (location.state ?? {}) as GateState

  const continueAs = (role: Role) => {
    setRole(role)
    navigate(gate.from ?? ROLES[role].landing)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.lede}>Log in to manage your shifts, donations and listings.</p>
        </div>

        {gate.needs ? (
          <MockNotice className={styles.gate}>
            That page is for {gate.needs.map((r) => ROLES[r].label).join(' or ')} accounts. Pick a
            role below to continue.
          </MockNotice>
        ) : null}

        <div className={styles.fields}>
          <Input label="Email" type="email" placeholder="you@email.com" autoComplete="username" />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input type="checkbox" defaultChecked />
            Keep me signed in
          </label>
          <button
            type="button"
            className={styles.link}
            onClick={() => window.alert('Mock: a password reset link would be emailed (REQ-AUTH-3).')}
          >
            Forgot password?
          </button>
        </div>

        <Button
          fullWidth
          onClick={() =>
            window.alert('Mock sign-in: use a "Continue as" button below to pick a role.')
          }
        >
          Log in
        </Button>

        <p className={styles.newHere}>
          New to BCS?
          <button
            type="button"
            className={styles.link}
            onClick={() => window.alert('Mock: registration is not part of this prototype.')}
          >
            Create an account
          </button>
        </p>

        <hr className={styles.divider} />

        <div className={styles.shortcut}>
          <div className={styles.shortcutHead}>
            <p className={styles.shortcutTitle}>PROTOTYPE SHORTCUT · CONTINUE AS</p>
            <MockLabel>sign-in</MockLabel>
          </div>
          <div className={styles.roles}>
            {SHORTCUTS.map((role) => (
              <button
                key={role}
                type="button"
                className={styles.roleButton}
                onClick={() => continueAs(role)}
              >
                {ROLES[role].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
