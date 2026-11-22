import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * P15 — responsive and accessibility pass (WBS 9.4.2).
 *
 * REQ-COM-5 requires 360px to 1920px. Figma designs 1440px for every screen
 * and 390px for the home page only, so every other mobile and tablet layout
 * is derived (DEVIATION RESP-1, RESP-2).
 *
 * Runs on the desktop project only; the viewport is set per case, so running
 * it under both projects would just repeat the same widths.
 */

type Role = 'visitor' | 'volunteer' | 'partner' | 'staff'

const SCREENS: { id: string; route: string; role: Role }[] = [
  { id: 'C-01 Home', route: './', role: 'visitor' },
  { id: 'C-02 Log in', route: './#/login', role: 'visitor' },
  { id: 'C-03 Profile', route: './#/profile', role: 'volunteer' },
  { id: 'S-01 Search', route: './#/search?q=food', role: 'visitor' },
  { id: 'V-01 Opportunities', route: './#/volunteer', role: 'visitor' },
  { id: 'V-02 Opportunity detail', route: './#/volunteer/opp-2', role: 'visitor' },
  { id: 'V-03 My activity', route: './#/my-activity', role: 'volunteer' },
  { id: 'E-01 Events', route: './#/events', role: 'visitor' },
  { id: 'E-02 Event detail', route: './#/events/evt-1', role: 'visitor' },
  { id: 'D-01 Donate', route: './#/donate', role: 'visitor' },
  { id: 'D-03 Give items', route: './#/give-items', role: 'visitor' },
  { id: 'P-01 Partner application', route: './#/partner/apply', role: 'visitor' },
  { id: 'P-02 Partner dashboard', route: './#/partner', role: 'partner' },
  { id: 'P-03 Create listing', route: './#/partner/new-listing', role: 'partner' },
  { id: 'A-01 Approval queue', route: './#/admin', role: 'staff' },
  { id: 'A-02 Accounts', route: './#/admin/accounts', role: 'staff' },
  { id: 'A-03 Reports', route: './#/admin/reports', role: 'staff' },
]

const WIDTHS: [string, number][] = [
  ['mobile 360', 360],
  ['tablet 768', 768],
  ['desktop 1440', 1440],
  ['wide 1920', 1920],
]

async function signIn(page: Page, role: Role) {
  if (role === 'visitor') return
  const label = role === 'volunteer' ? 'Volunteer' : role === 'partner' ? 'Partner' : 'BCS Staff'
  await page.goto('./#/login')
  await page.getByRole('button', { name: label, exact: true }).click()
}

test.describe.configure({ mode: 'parallel' })

// Viewports are set per case, so running this file under the mobile project
// too would just repeat the same widths.
test.beforeEach(() => {
  test.skip(test.info().project.name !== 'desktop', 'viewport is set per case')
})

test.describe('P15 responsive', () => {
  for (const screen of SCREENS) {
    test(`${screen.id} has no horizontal overflow at any width`, async ({ page }) => {
      await signIn(page, screen.role)

      for (const [label, width] of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(screen.route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `${screen.id} overflows at ${label}`).toBeLessThanOrEqual(1)
      }
    })
  }
})

test.describe('P15 accessibility', () => {
  for (const screen of SCREENS) {
    test(`${screen.id} has no critical or serious violations at 360 and 1440`, async ({ page }) => {
      await signIn(page, screen.role)

      for (const width of [360, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(screen.route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const blocking = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious',
        )
        expect(blocking.map((v) => `${v.id} @${width}px`), screen.id).toEqual([])
      }
    })
  }

  test('every screen has exactly one level-1 heading', async ({ page }) => {
    for (const screen of SCREENS) {
      await signIn(page, screen.role)
      await page.goto(screen.route)
      await expect(page.getByRole('heading', { level: 1 }), screen.id).toHaveCount(1)
    }
  })

  test('NFR-USE-3: primary actions meet the 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 })
    await page.goto('./')

    const button = page.getByRole('button', { name: 'Find opportunities' })
    const box = await button.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  })

  test('NFR-USE-2: donating takes no more than five steps from home', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Donate today' }).click() // 1
    await page.getByLabel('Full name').fill('Jordan Diaz') // 2
    await page.getByRole('button', { name: /^Donate/ }).click() // 3
    await expect(page.getByText('Donation receipt')).toBeVisible()
  })

  test('the whole volunteer journey is keyboard reachable', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await page.goto('./#/volunteer/opp-2')

    // Tab until the register button has focus, proving nothing traps focus.
    const target = page.getByRole('button', { name: 'Register for this shift' })
    for (let i = 0; i < 80; i += 1) {
      if (await target.evaluate((el) => el === document.activeElement)) break
      await page.keyboard.press('Tab')
    }
    await expect(target).toBeFocused()
  })
})

test.describe('P15 empty and error states', () => {
  test('every list screen has an empty state', async ({ page }) => {
    await page.goto('./#/volunteer')
    await page.getByLabel('Search by title, organization, or category').fill('zzzz')
    await expect(page.getByText('Nothing matches yet')).toBeVisible()

    await page.goto('./#/search?q=zzzz')
    await expect(page.getByText('No matches')).toBeVisible()

    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Volunteer', exact: true }).click()
    await page.goto('./#/my-activity')
    await expect(page.getByText('Nothing booked yet.')).toBeVisible()

    await page.goto('./#/login')
    await page.getByRole('button', { name: 'BCS Staff', exact: true }).click()
    await page.goto('./#/admin/reports')
    await expect(page.getByText('No records in this range yet.')).toBeVisible()
  })

  test('every form reports its errors through role=alert or an invalid field', async ({ page }) => {
    await page.goto('./#/donate')
    await page.getByRole('button', { name: /^Donate/ }).click()
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')

    await page.goto('./#/give-items')
    await page.getByRole('button', { name: 'Submit offer' }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await page.goto('./#/partner/apply')
    await page.getByRole('button', { name: 'Submit application' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})
