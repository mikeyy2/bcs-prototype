import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * P0 scaffold and P1 primitives.
 *
 * The /#/primitives gallery was a development reference and has been removed,
 * so the primitives are exercised through the real screens that use them.
 */

test.describe('P0 scaffold', () => {
  test('the app loads under the Pages base path', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('an inner route survives a full refresh', async ({ page }) => {
    await page.goto('./#/volunteer')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Volunteer opportunities')

    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Volunteer opportunities')
    expect(page.url()).toContain('#/volunteer')
  })

  test('a deep-linked detail page survives a refresh', async ({ page }) => {
    await page.goto('./#/volunteer/opp-2')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Choose a shift' })).toBeVisible()
  })

  test('an unknown route falls back to the home page', async ({ page }) => {
    await page.goto('./#/no-such-page')
    await expect(page).toHaveURL(/#\/$/)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('the development primitives gallery is gone', async ({ page }) => {
    await page.goto('./#/primitives')
    await expect(page).toHaveURL(/#\/$/)
  })
})

test.describe('P1 primitives, through the screens that use them', () => {
  test('Button renders primary, secondary and disabled', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('button', { name: 'Find opportunities' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'Donate today' })).toBeEnabled()

    // evt-3 is seeded at capacity, so its RSVP button is the disabled variant.
    await page.goto('./#/events/evt-3')
    await expect(page.getByRole('button', { name: 'Event full' })).toBeDisabled()
  })

  test('Input reports an error to assistive tech', async ({ page }) => {
    await page.goto('./#/donate')
    await page.getByLabel('Other amount').fill('0.50')
    await page.getByRole('button', { name: /^Donate/ }).click()

    await expect(page.getByRole('alert')).toContainText('at least $1')
    await expect(page.getByLabel('Other amount')).toHaveAttribute('aria-invalid', 'true')
  })

  test('Badge renders all three tones', async ({ page }) => {
    await page.goto('./#/login')
    await page.getByRole('button', { name: 'Partner', exact: true }).click()

    // Published (green), Pending approval (yellow) and Rejected (red) all
    // appear on the partner dashboard's listing table.
    await expect(page.getByText('Published').first()).toBeVisible()
  })

  test('every mocked feature carries a visible Mock label', async ({ page }) => {
    await page.goto('./#/donate')
    const mocks = page.locator('[data-mock]')
    expect(await mocks.count()).toBeGreaterThan(0)
    await expect(mocks.first()).toBeVisible()
  })

  test('the first tab stop is the skip link, and focus is visible', async ({ page }) => {
    await page.goto('./')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
    await expect(page.locator(':focus-visible')).toBeVisible()
  })

  test('the design tokens are applied, not hardcoded', async ({ page }) => {
    await page.goto('./')
    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bcs-primary').trim(),
    )
    expect(primary).toBe('#0f5257')
  })

  test('home has no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('./')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
})
