import { Container } from '../components/layout/Container'
import { MockNotice } from '../components/ui'

/**
 * Placeholder for a screen whose work package has not run yet. Keeps the shell
 * navigable from P2 onward; every instance disappears as its package lands.
 */
export function NotBuilt({ screen, pkg }: { screen: string; pkg: string }) {
  return (
    <Container>
      <div style={{ padding: '64px 0 96px', display: 'grid', gap: 16, maxWidth: '60ch' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>{screen}</h1>
        <MockNotice>This screen arrives in work package {pkg}. The shell around it is live.</MockNotice>
      </div>
    </Container>
  )
}
